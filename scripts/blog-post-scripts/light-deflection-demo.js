// Gravitational Light Deflection Demo
// Proper GR deflection angle alpha = 4GM/(c^2 b), Einstein ring, animated rays

(function() {
    const container = window.currentCodeContainer;
    if (!container) return;

    container.innerHTML = `
        <h3>Gravitational Light Deflection</h3>
        <p>Light from a distant source bends around a massive lens. The observer traces the arriving ray back in a straight line, inferring a wrong (apparent) source position.</p>

        <div class="controls" style="flex-direction: column; align-items: stretch; gap: 12px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
                <label style="display: flex; flex-direction: column; font-size: 0.9rem;">
                    Lens mass (M/M<sub>&#9737;</sub>):
                    <span id="ld-mass-disp" style="font-weight:bold; color:#7ecfff;">1.0 &times; 10<sup>14</sup></span>
                    <input type="range" id="ld-mass" min="0.1" max="5.0" step="0.1" value="1.0" style="width:100%;" />
                </label>
                <label style="display: flex; flex-direction: column; font-size: 0.9rem;">
                    Impact parameter (b):
                    <span id="ld-b-disp" style="font-weight:bold; color:#7ecfff;">1.00</span>
                    <input type="range" id="ld-b" min="0.3" max="3.5" step="0.05" value="1.5" style="width:100%;" />
                </label>
            </div>
            <div style="display: flex; gap: 10px; flex-wrap: wrap;">
                <label style="display: flex; align-items: center; gap: 6px; font-size: 0.9rem; cursor: pointer;">
                    <input type="checkbox" id="ld-ring" /> Show Einstein ring limit
                </label>
                <label style="display: flex; align-items: center; gap: 6px; font-size: 0.9rem; cursor: pointer;">
                    <input type="checkbox" id="ld-multi" checked /> Multiple rays
                </label>
                <label style="display: flex; align-items: center; gap: 6px; font-size: 0.9rem; cursor: pointer;">
                    <input type="checkbox" id="ld-anim" checked /> Animate
                </label>
            </div>
        </div>

        <canvas id="ld-canvas" width="700" height="420" style="width:100%; max-width:700px; display:block; margin:18px auto 0; border-radius:8px;"></canvas>

        <div style="margin-top: 12px; padding: 10px 14px; background: #0d1117; color: #cdd9e5; border-radius: 6px; font-size: 0.85rem; font-family: monospace; line-height: 1.7;">
            <span id="ld-stats">Loading...</span>
        </div>
        <div style="margin-top: 8px; font-size: 0.82rem; color: #666; padding: 0 4px;">
            Deflection angle: &alpha; = 4GM/(c&sup2;b). For the Sun at its surface, &alpha; &approx; 1.75&Prime;, confirmed by Eddington in 1919.
            The Einstein ring forms when source, lens, and observer are perfectly aligned.
        </div>
    `;

    const canvas = container.querySelector('#ld-canvas');
    const ctx    = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;

    const massSlider = container.querySelector('#ld-mass');
    const bSlider    = container.querySelector('#ld-b');
    const ringChk    = container.querySelector('#ld-ring');
    const multiChk   = container.querySelector('#ld-multi');
    const animChk    = container.querySelector('#ld-anim');
    const massDisp   = container.querySelector('#ld-mass-disp');
    const bDisp      = container.querySelector('#ld-b-disp');
    const stats      = container.querySelector('#ld-stats');

    let animId = null;
    let phase  = 0;

    // --- Physics ---
    // Deflection angle in display units (exaggerated for visibility)
    // Real: alpha = 4GM/(c^2 b). We scale so that at M=1, b=1, alpha_disp = 0.4 rad
    // This is pure visualization scaling.
    const ALPHA_SCALE = 0.35;  // radians at M=1, b=1

    function deflectionAngle(M, b) {
        // alpha proportional to M/b, scaled for display
        return ALPHA_SCALE * M / Math.max(b, 0.1);
    }

    function einsteinRadius(M) {
        // In display units: bE where alpha(M, bE) = 2*bE/D_obs (for source at infinity)
        // Simplified: bE = sqrt(ALPHA_SCALE * M * D / 2), D ~ half canvas width
        const D = (W / 2 - 80);
        return Math.sqrt(ALPHA_SCALE * M * D / 2);
    }

    // --- Draw ---
    function drawStars(rng) {
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 120; i++) {
            const x = rng() * W, y = rng() * H;
            const r = rng() * 1.2 + 0.2;
            const alpha = 0.3 + rng() * 0.7;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, 2 * Math.PI);
            ctx.fill();
        }
        ctx.globalAlpha = 1;
    }

    // Simple LCG for reproducible stars
    function makeLCG(seed) {
        let s = seed >>> 0;
        return function() {
            s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
            return s / 0xffffffff;
        };
    }

    function lerpColor(c1, c2, t) {
        const p = (s) => parseInt(s, 16);
        const r1 = p(c1.slice(1,3)), g1 = p(c1.slice(3,5)), b1 = p(c1.slice(5,7));
        const r2 = p(c2.slice(1,3)), g2 = p(c2.slice(3,5)), b2 = p(c2.slice(5,7));
        const r = Math.round(r1 + (r2-r1)*t);
        const g = Math.round(g1 + (g2-g1)*t);
        const b = Math.round(b1 + (b2-b1)*t);
        return `rgb(${r},${g},${b})`;
    }

    function draw() {
        const M = parseFloat(massSlider.value);
        const bNorm = parseFloat(bSlider.value);   // in display units (fractions of reference)
        const showRing  = ringChk.checked;
        const showMulti = multiChk.checked;

        // Layout
        const lensX = W / 2;
        const lensY = H / 2;
        const sourceX = 60;
        const obsX    = W - 60;
        const bPix    = bNorm * 55;  // convert slider to pixels

        // Alpha in radians (display-exaggerated)
        const alpha = deflectionAngle(M, bNorm);
        const bE_pix = einsteinRadius(M);

        // --- Background ---
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#030509');
        grad.addColorStop(1, '#0a0d1a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        const rng = makeLCG(7);
        drawStars(rng);

        // --- Labels (axis guide lines) ---
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 8]);
        ctx.beginPath();
        ctx.moveTo(0, lensY);
        ctx.lineTo(W, lensY);
        ctx.stroke();
        ctx.setLineDash([]);

        // --- Rays ---
        const rayOffsets = showMulti
            ? [-bPix * 1.6, -bPix * 1.0, bPix * 1.0, bPix * 1.6]
            : [bPix];

        // Animate phase: shift which ray is highlighted
        const animHighlight = showMulti ? (Math.floor(phase / 40) % 4) : 0;

        rayOffsets.forEach((offset, ri) => {
            const isHighlighted = !showMulti || ri === animHighlight;
            const b_this = Math.abs(offset) / 55;
            const alpha_this = deflectionAngle(M, b_this);
            const sign = offset > 0 ? 1 : -1;  // deflection direction
            const deflY = -sign * alpha_this * (W / 2 - 80);  // vertical shift at observer

            // Incoming ray: horizontal from source to near lens
            const incomingEndX = lensX - 60;
            const incomingEndY = lensY + offset;

            // Outgoing ray: bent, from lens to observer
            const outgoingStartX = lensX + 60;
            const outgoingStartY = lensY + offset;
            const outgoingEndX   = obsX;
            const outgoingEndY   = lensY + offset + deflY;

            // Color: cyan for rays
            const rayColor = isHighlighted ? 'rgba(100,210,255,0.90)' : 'rgba(100,210,255,0.28)';
            const rayW = isHighlighted ? 1.8 : 1.0;

            ctx.strokeStyle = rayColor;
            ctx.lineWidth = rayW;
            ctx.shadowColor = isHighlighted ? 'rgba(100,210,255,0.5)' : 'none';
            ctx.shadowBlur  = isHighlighted ? 6 : 0;
            ctx.setLineDash([]);

            // Incoming
            ctx.beginPath();
            ctx.moveTo(sourceX, lensY + offset);
            ctx.lineTo(incomingEndX, incomingEndY);
            ctx.stroke();

            // Smooth bend region
            ctx.beginPath();
            ctx.moveTo(incomingEndX, incomingEndY);
            ctx.quadraticCurveTo(lensX, lensY + offset + deflY * 0.08, outgoingStartX, outgoingStartY + deflY * 0.3);
            ctx.stroke();

            // Outgoing
            ctx.beginPath();
            ctx.moveTo(outgoingStartX, outgoingStartY + deflY * 0.3);
            ctx.lineTo(outgoingEndX, outgoingEndY);
            ctx.stroke();

            ctx.shadowBlur = 0;

            // Apparent direction extension (dotted)
            if (isHighlighted) {
                const extLen = 140;
                const dx = outgoingStartX - outgoingEndX;
                const dy = outgoingStartY + deflY * 0.3 - outgoingEndY;
                const len = Math.sqrt(dx*dx + dy*dy);
                const ux = dx/len, uy = dy/len;

                ctx.strokeStyle = 'rgba(255,220,60,0.55)';
                ctx.lineWidth = 1.4;
                ctx.setLineDash([6, 5]);
                ctx.beginPath();
                ctx.moveTo(outgoingEndX, outgoingEndY);
                ctx.lineTo(outgoingEndX + ux * extLen, outgoingEndY + uy * extLen);
                ctx.stroke();
                ctx.setLineDash([]);

                // Apparent position dot
                const appX = outgoingEndX + ux * extLen;
                const appY = outgoingEndY + uy * extLen;
                ctx.fillStyle = 'rgba(255,220,60,0.9)';
                ctx.beginPath();
                ctx.arc(appX, appY, 4, 0, 2*Math.PI);
                ctx.fill();
            }
        });

        // --- Einstein ring ---
        if (showRing) {
            ctx.strokeStyle = 'rgba(255,150,50,0.5)';
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(lensX, lensY, bE_pix, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.fillStyle = 'rgba(255,150,50,0.6)';
            ctx.font = '11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Einstein radius', lensX, lensY - bE_pix - 8);
        }

        // --- Lens (glowing galaxy cluster) ---
        const lensGrad = ctx.createRadialGradient(lensX, lensY, 0, lensX, lensY, 40);
        lensGrad.addColorStop(0, 'rgba(255,240,180,1.0)');
        lensGrad.addColorStop(0.2, 'rgba(255,210,120,0.8)');
        lensGrad.addColorStop(0.5, 'rgba(200,150,80,0.3)');
        lensGrad.addColorStop(1,   'rgba(180,130,60,0)');
        ctx.fillStyle = lensGrad;
        ctx.beginPath();
        ctx.arc(lensX, lensY, 40, 0, 2*Math.PI);
        ctx.fill();

        // Lens core
        ctx.fillStyle = '#fff8e1';
        ctx.shadowColor = '#ffe08a';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(lensX, lensY, 6, 0, 2*Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;

        // --- True source ---
        ctx.fillStyle = '#ff6b6b';
        ctx.shadowColor = '#ff6b6b';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(sourceX, lensY, 5, 0, 2*Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;

        // --- Observer ---
        ctx.fillStyle = '#69d4ff';
        ctx.shadowColor = '#69d4ff';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(obsX, lensY, 5, 0, 2*Math.PI);
        ctx.fill();
        ctx.shadowBlur = 0;

        // --- Labels ---
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(255,107,107,0.9)';
        ctx.fillText('True source', sourceX, lensY + 20);
        ctx.fillStyle = 'rgba(105,212,255,0.9)';
        ctx.fillText('Observer', obsX, lensY + 20);
        ctx.fillStyle = 'rgba(255,240,180,0.7)';
        ctx.fillText('Lens', lensX, lensY + 50);

        ctx.fillStyle = 'rgba(100,210,255,0.8)';
        ctx.fillText('Light ray', lensX - 60, lensY - bPix - 12);

        ctx.fillStyle = 'rgba(255,220,60,0.8)';
        ctx.textAlign = 'right';
        ctx.fillText('Apparent direction', obsX - 10, lensY - 14);

        // --- Stats panel ---
        const alphaArcsec = alpha * (180/Math.PI) * 3600;
        const bKpc = bNorm.toFixed(2);
        stats.innerHTML =
            `Lens mass: <strong style="color:#ffe08a">${M.toFixed(1)} &times; 10<sup>14</sup> M<sub>&#9737;</sub></strong> &nbsp;|&nbsp; ` +
            `Impact parameter b: <strong style="color:#7ecfff">${bKpc} (normalized)</strong> &nbsp;|&nbsp; ` +
            `Display deflection angle: <strong style="color:#69f0ae">${(alpha * 180/Math.PI).toFixed(2)}&deg;</strong><br>` +
            `(Physical scale exaggerated ~10<sup>5</sup>&times; for visibility. ` +
            `At cluster scales, typical weak-lensing deflection is ~1&Prime; &ndash; 10&Prime;.)`;

        massDisp.innerHTML = `${M.toFixed(1)} &times; 10<sup>14</sup>`;
        bDisp.textContent = bNorm.toFixed(2);
    }

    function animate() {
        phase = (phase + 1) % 10000;
        draw();
        if (animChk.checked) {
            animId = requestAnimationFrame(animate);
        }
    }

    function restart() {
        if (animId) { cancelAnimationFrame(animId); animId = null; }
        if (animChk.checked) animate();
        else draw();
    }

    massSlider.addEventListener('input', restart);
    bSlider.addEventListener('input', restart);
    ringChk.addEventListener('change', () => { if (!animChk.checked) draw(); });
    multiChk.addEventListener('change', restart);
    animChk.addEventListener('change', restart);

    restart();
    console.log('Light deflection demo loaded.');
})();
