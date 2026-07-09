"""
Single-admin authentication using only the Python standard library:

- Passwords are hashed with PBKDF2-HMAC-SHA256 (`pbkdf2_sha256$iter$salt$hash`).
- Sessions are stateless, signed cookies: base64url(payload) + "." + HMAC-SHA256,
  where payload = {"u": username, "exp": unix_ts}. No DB session table needed.

Nothing here needs a third-party crypto package, which keeps the Pi install to
just FastAPI + uvicorn.
"""

import base64
import hashlib
import hmac
import json
import secrets
import time

import config

PBKDF2_ITERATIONS = 200_000


# ── Password hashing ─────────────────────────────────────────────────────────
def hash_password(password: str, iterations: int = PBKDF2_ITERATIONS) -> str:
    salt = secrets.token_bytes(16)
    dk = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, iterations)
    return f'pbkdf2_sha256${iterations}${salt.hex()}${dk.hex()}'


def verify_password(password: str, stored: str) -> bool:
    try:
        algo, iters, salt_hex, hash_hex = stored.split('$')
        if algo != 'pbkdf2_sha256':
            return False
        dk = hashlib.pbkdf2_hmac(
            'sha256', password.encode('utf-8'),
            bytes.fromhex(salt_hex), int(iters)
        )
        return hmac.compare_digest(dk.hex(), hash_hex)
    except (ValueError, AttributeError):
        return False


# ── Session cookies ──────────────────────────────────────────────────────────
def _b64e(raw: bytes) -> str:
    return base64.urlsafe_b64encode(raw).rstrip(b'=').decode('ascii')


def _b64d(s: str) -> bytes:
    pad = '=' * (-len(s) % 4)
    return base64.urlsafe_b64decode(s + pad)


def _sign(payload_b64: str) -> str:
    sig = hmac.new(config.SECRET_KEY.encode('utf-8'),
                   payload_b64.encode('ascii'), hashlib.sha256).digest()
    return _b64e(sig)


def make_session_token(username: str, ttl: int = None) -> str:
    ttl = config.SESSION_TTL if ttl is None else ttl
    payload = {'u': username, 'exp': int(time.time()) + ttl}
    payload_b64 = _b64e(json.dumps(payload, separators=(',', ':')).encode('utf-8'))
    return f'{payload_b64}.{_sign(payload_b64)}'


def verify_session_token(token: str):
    """Return the username if the token is valid and unexpired, else None."""
    if not token or '.' not in token:
        return None
    payload_b64, sig = token.rsplit('.', 1)
    if not hmac.compare_digest(sig, _sign(payload_b64)):
        return None
    try:
        payload = json.loads(_b64d(payload_b64))
    except (ValueError, json.JSONDecodeError):
        return None
    if int(payload.get('exp', 0)) < int(time.time()):
        return None
    return payload.get('u')
