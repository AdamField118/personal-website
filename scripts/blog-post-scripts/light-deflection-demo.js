// Gravitational Lensing Demo
//
// Layout: Observer (left) — Lens (centre) — Actual source (right), all on Y = H/2.
//
// Physics:
//   The light passes ABOVE the optical axis. Gravity pulls it DOWN (toward the lens).
//   The arc is a "hill" shape — light curves toward the lens the whole time.
//   This is attractive gravity.
//
// Apparent position:
//   At M=0, CP is on the axis → straight ray → Apparent = Actual.
//   As M increases, CP rises above the axis → arc bends more → the
//   back-projected dashed line from Observer intersects the vertical through
//   Actual at a point DIRECTLY ABOVE Actual (same X, higher Y).
//   This follows exactly from the geometry: APP_Y = AXIS_Y − 2 × B × M.

(function () {
    const container = window.currentCodeContainer;
    if (!container) return;

    container.innerHTML = `
        <div style="margin-bottom:10px;">
            <label style="font-size:0.93rem;display:flex;flex-direction:column;gap:4px;">
                Lens mass:&nbsp;<span id="ld-mv"
                    style="font-weight:bold;color:#f5c518;font-size:1.05rem;">0.00</span>
                <input type="range" id="ld-ms" min="0" max="1" step="0.01" value="0"
                       style="width:100%;max-width:440px;" />
            </label>
        </div>
        <canvas id="ld-cv" width="700" height="380"
            style="width:100%;max-width:700px;display:block;border-radius:6px;">
        </canvas>
    `;

    const canvas = container.querySelector('#ld-cv');
    const ctx    = canvas.getContext('2d');
    const slider = container.querySelector('#ld-ms');
    const mDisp  = container.querySelector('#ld-mv');

    const W = canvas.width, H = canvas.height;

    // ── Fixed positions — all on the optical axis Y = H/2 ──────────────
    const AX  = H / 2;                 // the optical axis
    const OBS = { x: 75,    y: AX };   // Observer: left
    const SRC = { x: W-75,  y: AX };   // Actual source: right
    const LNS = { x: W / 2, y: AX };   // Lens: centre

    // Maximum control-point height above the axis (pixels).
    // At M=1 the arc peaks B_MAX above the axis, and APP is 2×B_MAX above actual.
    const B_MAX = 68;

    // ── As M increases: CP rises → arc bends more (attractive gravity) ──
    function getCP(M) {
        return { x: LNS.x, y: AX - B_MAX * M };
    }

    // Apparent is directly above Actual — derived analytically from the Bezier tangent.
    // For a symmetric layout (lens is equidistant between OBS and SRC):
    //   APP_Y = AX − 2 × B_MAX × M
    function getApparent(M) {
        return { x: SRC.x, y: AX - 2 * B_MAX * M };
    }

    // ── Spacetime grid — warps toward lens with mass ─────────────────────
    function warpPt(gx, gy, M) {
        const dx = gx - LNS.x, dy = gy - LNS.y;
        const r  = Math.sqrt(dx * dx + dy * dy);
        const s  = Math.max(r, 28);
        const p  = M * 2800 / (s * s);
        const f  = p / (1 + p);
        return {
            x: gx + (LNS.x - gx) * f * 0.68,
            y: gy + (LNS.y - gy) * f * 0.68
        };
    }

    function drawGrid(M) {
        const COLS = 22, ROWS = 14;
        const cw = W / COLS, rh = H / ROWS;
        ctx.strokeStyle = 'rgba(70,108,200,0.21)';
        ctx.lineWidth   = 0.85;
        for (let r = 0; r <= ROWS; r++) {
            ctx.beginPath();
            for (let c = 0; c <= COLS; c++) {
                const p = warpPt(c * cw, r * rh, M);
                c === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
        }
        for (let c = 0; c <= COLS; c++) {
            ctx.beginPath();
            for (let r = 0; r <= ROWS; r++) {
                const p = warpPt(c * cw, r * rh, M);
                r === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
            }
            ctx.stroke();
        }
    }

    // ── Glowing sphere ───────────────────────────────────────────────────
    function glowDot(x, y, radius, col1, col2) {
        const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
        g.addColorStop(0,    col1);
        g.addColorStop(0.45, col2);
        g.addColorStop(1,    'rgba(0,0,0,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
    }

    // ── Main draw ────────────────────────────────────────────────────────
    function draw() {
        const M   = parseFloat(slider.value);
        const cp  = getCP(M);
        const APP = getApparent(M);
        mDisp.textContent = M.toFixed(2);

        // Background
        ctx.fillStyle = '#060810';
        ctx.fillRect(0, 0, W, H);

        drawGrid(M);

        // ── Actual light path (arc, bending above the axis toward the lens) ──
        ctx.save();
        ctx.shadowColor = 'rgba(255,250,140,0.50)';
        ctx.shadowBlur  = 18;
        ctx.strokeStyle = '#fffde0';
        ctx.lineWidth   = 2.4;
        ctx.beginPath();
        ctx.moveTo(SRC.x, SRC.y);
        ctx.quadraticCurveTo(cp.x, cp.y, OBS.x, OBS.y);
        ctx.stroke();
        ctx.restore();

        // ── Dashed back-projection: OBS → APP (apparent position) ──
        ctx.strokeStyle = 'rgba(200,215,255,0.72)';
        ctx.lineWidth   = 1.8;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.moveTo(OBS.x, OBS.y);
        ctx.lineTo(APP.x, APP.y);
        ctx.stroke();
        ctx.setLineDash([]);

        // ── Thin vertical guide showing APP is directly above SRC ──
        if (M > 0.02) {
            ctx.strokeStyle = 'rgba(245,220,60,0.18)';
            ctx.lineWidth   = 1;
            ctx.setLineDash([3, 5]);
            ctx.beginPath();
            ctx.moveTo(SRC.x, APP.y);
            ctx.lineTo(SRC.x, SRC.y);
            ctx.stroke();
            ctx.setLineDash([]);
        }

        // ── Lens (black hole with orange glow) ──
        const lg = ctx.createRadialGradient(LNS.x, LNS.y, 18, LNS.x, LNS.y, 52);
        lg.addColorStop(0,    'rgba(255,118,14,0)');
        lg.addColorStop(0.28, 'rgba(255,118,14,0.78)');
        lg.addColorStop(0.65, 'rgba(255,72,5,0.20)');
        lg.addColorStop(1,    'rgba(170,45,0,0)');
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.arc(LNS.x, LNS.y, 52, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(LNS.x, LNS.y, 19, 0, 2 * Math.PI);
        ctx.fill();

        // ── Actual source (gold dot, right, on axis) ──
        glowDot(SRC.x, SRC.y, 20, '#fffbe8', '#f5c518');

        // ── Apparent source (gold dot, directly above actual) ──
        if (M > 0.01) {
            glowDot(APP.x, APP.y, 17, '#fffbe8', '#f5c518');
        }

        // ── Labels ──
        ctx.font         = 'bold 13px Arial, sans-serif';
        ctx.textBaseline = 'middle';

        // Actual: to the left of dot (near right edge)
        ctx.fillStyle = '#f5e060';
        ctx.textAlign = 'right';
        ctx.fillText('Actual', SRC.x - 24, SRC.y);

        // Apparent: only show when there's a visible displacement
        if (M > 0.05) {
            ctx.textAlign = 'right';
            ctx.fillText('Apparent', APP.x - 24, APP.y);
        }

        // Observer
        ctx.fillStyle = 'rgba(255,255,255,0.88)';
        ctx.beginPath();
        ctx.arc(OBS.x, OBS.y, 4.5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.55)';
        ctx.font      = '11px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        ctx.fillText('Observer', OBS.x + 9, OBS.y + 7);
    }

    slider.addEventListener('input', draw);
    draw();
})();