// Shear pattern demo — unified dark style
// Shows the tangential shear field of a point mass lens.
// Each ellipse indicates the direction and magnitude of shear at that position.

(function () {
    const container = window.currentCodeContainer;
    if (!container) return;

    const SZ = 480;  // canvas size (square)

    container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:12px;">
            <label style="font-size:0.93rem;display:flex;flex-direction:column;gap:4px;">
                Shear strength:&nbsp;<span id="sp-sv"
                    style="font-weight:bold;color:#f5c518;font-size:1.05rem;">1.0</span>
                <input type="range" id="sp-ss" min="0.2" max="3.0" step="0.1" value="1.0"
                       style="width:100%;max-width:440px;" />
            </label>
        </div>

        <canvas id="sp-cv" width="${SZ}" height="${SZ}"
            style="width:100%;max-width:${SZ}px;display:block;
                   border-radius:6px;margin:0 auto;">
        </canvas>
    `;

    const canvas = container.querySelector('#sp-cv');
    const ctx    = canvas.getContext('2d');
    const slider = container.querySelector('#sp-ss');
    const sDisp  = container.querySelector('#sp-sv');

    const CX = SZ / 2, CY = SZ / 2;

    function draw() {
        const strength = parseFloat(slider.value);
        sDisp.textContent = strength.toFixed(1);

        // Background
        ctx.fillStyle = '#060810';
        ctx.fillRect(0, 0, SZ, SZ);

        // ── Shear ellipses ───────────────────────────────────────────────
        const SPACING = 36;
        const BASE_R  = 9;    // base ellipse semi-axis (pixels)
        const EXCLUSION = SPACING * 0.7;  // skip points too close to lens

        for (let gx = SPACING / 2; gx < SZ; gx += SPACING) {
            for (let gy = SPACING / 2; gy < SZ; gy += SPACING) {
                const dx = gx - CX, dy = gy - CY;
                const r2 = dx * dx + dy * dy;
                const r  = Math.sqrt(r2);

                if (r < EXCLUSION) continue;

                // Point-mass shear magnitude: gamma ∝ 1/r²
                // Reference radius chosen so that at r = 2.5 * SPACING, gamma = 0.5 at strength 1.
                const refR    = SPACING * 2.5;
                const gamma   = Math.min(strength * (refR * refR) / r2, 0.88);

                // Tangential direction: radial angle + 90°
                const phi   = Math.atan2(dy, dx);
                const alpha = phi + Math.PI / 2;

                // Semi-axes: stretching in tangential, compressing radially
                const a = BASE_R * (1 + gamma * 0.88);
                const b = Math.max(BASE_R * (1 - gamma * 0.88), 1.2);

                // Brightness: slightly dimmer far from centre
                const fade = Math.max(0.30, 1 - r / (SZ * 0.65));
                ctx.strokeStyle = `rgba(110,175,255,${(0.55 + fade * 0.40).toFixed(2)})`;
                ctx.lineWidth   = 1;

                ctx.save();
                ctx.translate(gx, gy);
                ctx.rotate(alpha);
                ctx.beginPath();
                ctx.ellipse(0, 0, a, b, 0, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.restore();
            }
        }

        // ── Lens at centre (matching light-deflection demo style) ────────
        const lg = ctx.createRadialGradient(CX, CY, 14, CX, CY, 42);
        lg.addColorStop(0,    'rgba(255,118,14,0.0)');
        lg.addColorStop(0.28, 'rgba(255,118,14,0.72)');
        lg.addColorStop(0.65, 'rgba(255,72,5,0.20)');
        lg.addColorStop(1,    'rgba(170,45,0,0)');
        ctx.fillStyle = lg;
        ctx.beginPath();
        ctx.arc(CX, CY, 42, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(CX, CY, 16, 0, 2 * Math.PI);
        ctx.fill();
    }

    slider.addEventListener('input', draw);
    draw();
})();
