// Co-addition noise demo — unified dark style
// Fix: instead of accumulating N frames (which had rendering bugs),
// we directly render with sigma_eff = sigma / sqrt(N). This is the exact
// mathematical result of averaging N independent frames.

(function () {
    const container = window.currentCodeContainer;
    if (!container) return;

    const W = 320;  // canvas pixel dimensions

    container.innerHTML = `
        <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:12px;">
            <label style="font-size:0.93rem;display:flex;flex-direction:column;gap:4px;">
                Stacked exposures (N):&nbsp;<span id="ca-nv"
                    style="font-weight:bold;color:#f5c518;font-size:1.05rem;">1</span>
                <input type="range" id="ca-ns" min="1" max="36" step="1" value="1"
                       style="width:100%;max-width:440px;" />
            </label>
            <label style="font-size:0.93rem;display:flex;flex-direction:column;gap:4px;">
                Single-frame noise &sigma;:&nbsp;<span id="ca-sv"
                    style="font-weight:bold;color:#f5c518;font-size:1.05rem;">0.35</span>
                <input type="range" id="ca-ss" min="0.10" max="0.65" step="0.05" value="0.35"
                       style="width:100%;max-width:440px;" />
            </label>
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;max-width:700px;margin:0 auto;">
            <div>
                <div style="font-size:0.85rem;color:#aaa;text-align:center;margin-bottom:6px;">
                    Single exposure</div>
                <canvas id="ca-single" width="${W}" height="${W}"
                    style="width:100%;display:block;border-radius:5px;"></canvas>
            </div>
            <div>
                <div style="font-size:0.85rem;color:#aaa;text-align:center;margin-bottom:6px;">
                    Co-add (<span id="ca-nl">1</span> frames)</div>
                <canvas id="ca-stack" width="${W}" height="${W}"
                    style="width:100%;display:block;border-radius:5px;"></canvas>
            </div>
        </div>

        <div id="ca-stats"
            style="margin-top:12px;padding:9px 13px;background:#0d1117;color:#cdd9e5;
                   border-radius:5px;font-size:0.85rem;font-family:monospace;line-height:1.8;">
        </div>
    `;

    const singleCanvas = container.querySelector('#ca-single');
    const stackCanvas  = container.querySelector('#ca-stack');
    const nSlider  = container.querySelector('#ca-ns');
    const sigSlider= container.querySelector('#ca-ss');
    const nDisp    = container.querySelector('#ca-nv');
    const sigDisp  = container.querySelector('#ca-sv');
    const nLabel   = container.querySelector('#ca-nl');
    const stats    = container.querySelector('#ca-stats');

    // ── LCG random number generator ─────────────────────────────────────
    function makeLCG(seed) {
        let s = seed >>> 0;
        return function () {
            s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
            return s / 0x100000000;
        };
    }

    // Box-Muller Gaussian
    function gauss(rng) {
        const u1 = rng() + 1e-12, u2 = rng();
        return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    }

    // ── Build a fixed noiseless galaxy field (done once) ─────────────────
    function buildField() {
        const rng   = makeLCG(42);
        const field = new Float32Array(W * W);
        field.fill(0.04);  // sky background

        for (let i = 0; i < 14; i++) {
            const cx  = rng() * W,   cy  = rng() * W;
            const amp = 6 + rng() * 30;
            const sx  = 4 + rng() * 10, sy = 4 + rng() * 10;
            const th  = rng() * Math.PI;
            const cos_t = Math.cos(th), sin_t = Math.sin(th);

            for (let gy = 0; gy < W; gy++) {
                for (let gx = 0; gx < W; gx++) {
                    const dx = gx - cx, dy = gy - cy;
                    const u = cos_t * dx + sin_t * dy;
                    const v = -sin_t * dx + cos_t * dy;
                    field[gy * W + gx] += amp * Math.exp(-(u*u)/(2*sx*sx) - (v*v)/(2*sy*sy));
                }
            }
        }
        return field;
    }

    // ── Render: true field + Gaussian noise of given sigma ───────────────
    // seed makes the noise pattern repeatable (stable between renders).
    function renderWithNoise(ctx, field, sigma, seed) {
        const rng = makeLCG(seed);
        const img = ctx.createImageData(W, W);
        const px  = img.data;

        // Dynamic-range scale: map peak signal to ~210, 4-sigma noise fits in 255
        let peak = 0;
        for (let k = 0; k < field.length; k++) if (field[k] > peak) peak = field[k];
        const scale = 210 / (peak + 4 * sigma + 0.001);

        for (let k = 0; k < field.length; k++) {
            const val = field[k] + gauss(rng) * sigma;
            const v   = Math.max(0, Math.min(255, Math.round(val * scale)));
            px[4*k]   = v;
            px[4*k+1] = v;
            px[4*k+2] = Math.min(255, v + 15);   // slight blue tint
            px[4*k+3] = 255;
        }
        ctx.putImageData(img, 0, 0);
    }

    const trueField = buildField();

    function update() {
        const N   = parseInt(nSlider.value);
        const sig = parseFloat(sigSlider.value);

        nDisp.textContent  = N;
        sigDisp.textContent= sig.toFixed(2);
        nLabel.textContent = N;

        const effSig = sig / Math.sqrt(N);

        // Single frame: full noise, fixed seed → stable noisy reference image
        renderWithNoise(singleCanvas.getContext('2d'), trueField, sig, 7777);

        // Co-add: noise reduced by 1/sqrt(N), same underlying field
        renderWithNoise(stackCanvas.getContext('2d'), trueField, effSig, 7778);

        stats.innerHTML =
            `&sigma;<sub>single</sub> = <strong style="color:#f5c518">${sig.toFixed(2)}</strong>`+
            `&emsp;|&emsp;`+
            `&sigma;<sub>coadd</sub> = &sigma;/&radic;N = <strong style="color:#69f0ae">${effSig.toFixed(3)}</strong>`+
            `&emsp;|&emsp;`+
            `SNR improvement: <strong style="color:#69c9ff">&times;${Math.sqrt(N).toFixed(2)}</strong>`;
    }

    nSlider.addEventListener('input', update);
    sigSlider.addEventListener('input', update);
    update();
})();
