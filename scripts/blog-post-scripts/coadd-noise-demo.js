// Co-addition noise demo
// Shows how stacking N exposures reduces noise as 1/sqrt(N)

(function() {
    const container = window.currentCodeContainer;
    if (!container) return;

    container.innerHTML = `
        <h3>Co-addition: Stacking Frames Reduces Noise</h3>
        <p>Each individual exposure is noisy. Stacking N frames reduces pixel noise by a factor of &radic;N, revealing faint galaxies hidden in the noise of a single exposure.</p>

        <div class="controls" style="flex-direction: column; align-items: stretch; gap: 12px;">
            <label style="display: flex; flex-direction: column;">
                Number of stacked exposures (N): <span id="coN" style="font-weight: bold; color: #00458b;">1</span>
                <input type="range" id="coN-slider" min="1" max="36" step="1" value="1" style="width: 100%;" />
            </label>
            <label style="display: flex; flex-direction: column;">
                Single-frame noise &sigma;: <span id="coSig" style="font-weight: bold; color: #00458b;">0.30</span>
                <input type="range" id="coSig-slider" min="0.10" max="0.60" step="0.05" value="0.30" style="width: 100%;" />
            </label>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 18px;">
            <div>
                <h4 style="margin: 0 0 8px 0; text-align: center; font-size: 0.95rem;">Single exposure</h4>
                <canvas id="co-single" width="280" height="280" style="width:100%; border:1px solid #ccc; background:#111; image-rendering:pixelated; display:block;"></canvas>
            </div>
            <div>
                <h4 style="margin: 0 0 8px 0; text-align: center; font-size: 0.95rem;">Co-add (N = <span id="co-label">1</span>)</h4>
                <canvas id="co-stack" width="280" height="280" style="width:100%; border:1px solid #ccc; background:#111; image-rendering:pixelated; display:block;"></canvas>
            </div>
        </div>

        <div style="margin-top: 14px; padding: 10px 14px; background: #f0f4ff; color: #000; border-radius: 5px; font-size: 0.9rem;">
            Effective noise after stacking: &sigma;<sub>coadd</sub> = &sigma;/&radic;N =
            <strong id="co-eff" style="color: #00458b;">0.300</strong> &nbsp;|&nbsp;
            Signal-to-noise improvement: <strong id="co-snr" style="color: #00458b;">&times;1.00</strong>
        </div>
    `;

    const singleCanvas = container.querySelector('#co-single');
    const stackCanvas  = container.querySelector('#co-stack');
    const sCtx = singleCanvas.getContext('2d');
    const cCtx = stackCanvas.getContext('2d');
    const nSlider   = container.querySelector('#coN-slider');
    const sigSlider = container.querySelector('#coSig-slider');
    const nDisp     = container.querySelector('#coN');
    const sigDisp   = container.querySelector('#coSig');
    const labelDisp = container.querySelector('#co-label');
    const effDisp   = container.querySelector('#co-eff');
    const snrDisp   = container.querySelector('#co-snr');

    const W = 280;

    // --- Fixed RNG so galaxy positions are reproducible ---
    function seededRand(seed) {
        let s = seed;
        return function() {
            s = (s * 1664525 + 1013904223) & 0xffffffff;
            return (s >>> 0) / 0xffffffff;
        };
    }

    // --- Build noiseless field ---
    function makeTrueField() {
        const rng = seededRand(42);
        const field = new Float32Array(W * W);

        // Sky background
        for (let k = 0; k < field.length; k++) field[k] = 0.03;

        // Galaxy positions and properties (fixed)
        const galaxies = [];
        for (let i = 0; i < 14; i++) {
            galaxies.push({
                x: rng() * W,
                y: rng() * W,
                amp: 6 + rng() * 28,
                sx: 4 + rng() * 10,
                sy: 4 + rng() * 10,
                theta: rng() * Math.PI,
                e: rng() * 0.5
            });
        }

        for (let j = 0; j < W; j++) {
            for (let i = 0; i < W; i++) {
                let val = field[j * W + i];
                for (const g of galaxies) {
                    const dx = i - g.x;
                    const dy = j - g.y;
                    const cos_t = Math.cos(g.theta);
                    const sin_t = Math.sin(g.theta);
                    const u =  cos_t * dx + sin_t * dy;
                    const v = -sin_t * dx + cos_t * dy;
                    const sx = g.sx;
                    const sy = g.sy * (1 + g.e);
                    const r2 = (u * u) / (sx * sx) + (v * v) / (sy * sy);
                    val += g.amp * Math.exp(-r2 / 2);
                }
                field[j * W + i] = val;
            }
        }
        return field;
    }

    // --- Gaussian random (Box-Muller) ---
    function gauss(rng) {
        const u1 = rng() + 1e-12, u2 = rng();
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }

    // --- Render a Float32 field to canvas ---
    function render(ctx, field, sigmaExtra) {
        const rng = seededRand(Math.floor(sigmaExtra * 1000 + performance.now()) | 0);
        const img = ctx.createImageData(W, W);
        const px  = img.data;

        let maxF = 0;
        for (let k = 0; k < field.length; k++) if (field[k] > maxF) maxF = field[k];
        if (maxF < 0.001) maxF = 1;
        const noiseScale = 4 * sigmaExtra;
        const scale = 220 / (maxF + noiseScale);

        for (let k = 0; k < field.length; k++) {
            const noisy = field[k] + gauss(rng) * sigmaExtra;
            const v = Math.min(255, Math.max(0, Math.round(noisy * scale)));
            // Slight blue tint for the dark sky feel
            px[4*k]   = v;
            px[4*k+1] = v;
            px[4*k+2] = Math.min(255, v + 15);
            px[4*k+3] = 255;
        }
        ctx.putImageData(img, 0, 0);
    }

    // --- Render summed field divided by N ---
    function renderSum(ctx, sumField, N, sigma) {
        const rng = seededRand(9999);
        const img = ctx.createImageData(W, W);
        const px  = img.data;

        let maxF = 0;
        for (let k = 0; k < sumField.length; k++) {
            const v = sumField[k] / N;
            if (v > maxF) maxF = v;
        }
        if (maxF < 0.001) maxF = 1;
        const effSigma = sigma / Math.sqrt(N);
        const scale = 220 / (maxF + 4 * effSigma);

        for (let k = 0; k < sumField.length; k++) {
            const v = Math.min(255, Math.max(0, Math.round((sumField[k] / N) * scale)));
            px[4*k]   = v;
            px[4*k+1] = v;
            px[4*k+2] = Math.min(255, v + 15);
            px[4*k+3] = 255;
        }
        ctx.putImageData(img, 0, 0);
    }

    const trueField = makeTrueField();

    function update() {
        const N   = parseInt(nSlider.value);
        const sig = parseFloat(sigSlider.value);

        nDisp.textContent   = N;
        sigDisp.textContent = sig.toFixed(2);
        labelDisp.textContent = N;
        effDisp.textContent = (sig / Math.sqrt(N)).toFixed(3);
        snrDisp.textContent = '\u00d7' + Math.sqrt(N).toFixed(2);

        // Single frame
        render(sCtx, trueField, sig);

        // Co-add: accumulate N noisy frames
        const rngSeed = seededRand(Date.now() & 0xffff);
        const sum = new Float32Array(W * W);
        for (let frame = 0; frame < N; frame++) {
            const frameRng = seededRand(frame * 12345 + 99);
            for (let k = 0; k < trueField.length; k++) {
                sum[k] += trueField[k] + gauss(frameRng) * sig;
            }
        }
        renderSum(cCtx, sum, N, sig);
    }

    nSlider.addEventListener('input', update);
    sigSlider.addEventListener('input', update);

    update();
    console.log('Co-add demo loaded.');
})();
