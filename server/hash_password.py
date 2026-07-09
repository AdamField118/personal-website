#!/usr/bin/env python3
"""
Generate the admin password hash and a session secret for the .env file.

    python3 server/hash_password.py

Prompts for a password (no echo) and prints the two env lines to paste into
your .env / systemd EnvironmentFile. Nothing is written to disk.
"""

import getpass
import secrets

import auth


def main():
    pw1 = getpass.getpass('Admin password: ')
    pw2 = getpass.getpass('Confirm password: ')
    if pw1 != pw2:
        raise SystemExit('Passwords do not match.')
    if len(pw1) < 8:
        raise SystemExit('Use at least 8 characters.')

    print('\n# Add these to your .env / EnvironmentFile (keep them secret):')
    print(f'AF_ADMIN_PASSWORD_HASH={auth.hash_password(pw1)}')
    print(f'AF_SECRET_KEY={secrets.token_urlsafe(48)}')


if __name__ == '__main__':
    main()
