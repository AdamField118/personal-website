// FEMMI: Morozov's Discrepancy Principle Demo
// A 1D ill-posed inverse problem (Gaussian smoothing = compact forward operator).
// Tikhonov regularisation is a spectral filter; the regularisation parameter lambda
// is chosen automatically where the residual matches the noise level (Morozov 1966).

(function() {
    const container = window.currentCodeContainer;
    if (!container) {
        console.error('Code container not found!');
        return;
    }

    container.innerHTML = `
        <h3>Choosing λ Automatically: Morozov's Discrepancy Principle</h3>
        <p>Mass inversion is ill-posed: too little regularisation fits the noise, too much
        washes out the mass. Morozov's principle picks the λ where the residual equals the
        known noise level — no hand-tuning. Drag λ, or let FEMMI choose it.</p>

        <div class="controls">
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:12px; flex-wrap:wrap;">
                <button id="auto-btn" style="width:210px;">⚙️ Auto λ (Morozov)</button>
                <button id="noise-btn" style="width:150px;">🎲 New noise</button>
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; max-width:520px; margin:0 auto;">
                <label style="display:flex; flex-direction:column;">
                    log₁₀ λ: <span id="lam-val" style="font-weight:bold;">-3.0</span>
                    <input type="range" id="lam-slider" min="-7" max="1" step="0.1" value="-3" style="width:100%;" />
                </label>
                <label style="display:flex; flex-direction:column;">
                    Noise level: <span id="nse-val" style="font-weight:bold;">8%</span>
                    <input type="range" id="nse-slider" min="1" max="25" step="1" value="8" style="width:100%;" />
                </label>
            </div>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-top:10px;">
            <div>
                <h4 style="margin:0 0 6px; text-align:center;">Reconstruction</h4>
                <canvas id="rec-canvas" width="420" height="300" style="border:1px solid #ddd; width:100%; background:white;"></canvas>
            </div>
            <div>
                <h4 style="margin:0 0 6px; text-align:center;">Discrepancy D(λ)</h4>
                <canvas id="disc-canvas" width="420" height="300" style="border:1px solid #ddd; width:100%; background:white;"></canvas>
            </div>
        </div>

        <div style="margin-top:12px; padding:10px; background:#f0f0f0; color:#000; border-radius:5px;">
            <strong>Status:</strong> <span id="status-label">—</span><br>
            <span id="note-label">Left: true mass (grey), noisy data (light), reconstruction (blue).
            Right: the residual D(λ) crossing the noise floor (dashed) marks the Morozov choice.</span>
        </div>
    `;

    const recCanvas = container.querySelector('#rec-canvas');
    const discCanvas = container.querySelector('#disc-canvas');
    const recCtx = recCanvas.getContext('2d');
    const discCtx = discCanvas.getContext('2d');
    const lamSlider = container.querySelector('#lam-slider');
    const nseSlider = container.querySelector('#nse-slider');
    const lamVal = container.querySelector('#lam-val');
    const nseVal = container.querySelector('#nse-val');
    const autoBtn = container.querySelector('#auto-btn');
    const noiseBtn = container.querySelector('#noise-btn');
    const statusLabel = container.querySelector('#status-label');

    const n = 64;
    // singular values of the (symmetric) Gaussian-blur forward operator in the DCT basis
    const sigmas = [];
    for (let k = 0; k < n; k++) sigmas.push(Math.exp(-((k * 0.16) ** 2) / 2) + 1e-6);

    // DCT-II and its inverse (DCT-III), O(n^2) — plenty fast for n = 64
    function dct(x) {
        const X = new Float64Array(n);
        for (let k = 0; k < n; k++) {
            let s = 0;
            for (let i = 0; i < n; i++) s += x[i] * Math.cos(Math.PI * (i + 0.5) * k / n);
            X[k] = s * (k === 0 ? Math.sqrt(1 / n) : Math.sqrt(2 / n));
        }
        return X;
    }
    function idct(X) {
        const x = new Float64Array(n);
        for (let i = 0; i < n; i++) {
            let s = 0;
            for (let k = 0; k < n; k++) {
                const c = (k === 0 ? Math.sqrt(1 / n) : Math.sqrt(2 / n));
                s += c * X[k] * Math.cos(Math.PI * (i + 0.5) * k / n);
            }
            x[i] = s;
        }
        return x;
    }

    // true "mass profile": two Gaussians
    const kappaTrue = new Float64Array(n);
    for (let i = 0; i < n; i++) {
        const x = i / (n - 1);
        kappaTrue[i] = Math.exp(-((x - 0.38) ** 2) / (2 * 0.05 ** 2))
                     + 0.7 * Math.exp(-((x - 0.66) ** 2) / (2 * 0.03 ** 2));
    }
    const kHat = dct(kappaTrue);
    const cleanHat = new Float64Array(n);
    for (let k = 0; k < n; k++) cleanHat[k] = sigmas[k] * kHat[k];
    const cleanData = idct(cleanHat);

    let noiseFrac = 0.08;
    let noiseVec = new Float64Array(n);
    let dataHat = new Float64Array(n);
    let noiseNorm = 0;

    function regenNoise() {
        const amp = noiseFrac * Math.max(...cleanData.map(Math.abs));
        const data = new Float64Array(n);
        noiseNorm = 0;
        for (let i = 0; i < n; i++) {
            // Box-Muller
            const u = Math.random(), v = Math.random();
            const g = Math.sqrt(-2 * Math.log(u + 1e-12)) * Math.cos(2 * Math.PI * v);
            noiseVec[i] = amp * g;
            data[i] = cleanData[i] + noiseVec[i];
            noiseNorm += noiseVec[i] * noiseVec[i];
        }
        noiseNorm = Math.sqrt(noiseNorm);
        dataHat = dct(data);
    }

    // reconstruction for a given lambda via the Tikhonov spectral filter
    function reconstruct(lam) {
        const rHat = new Float64Array(n);
        for (let k = 0; k < n; k++) {
            const f = sigmas[k] / (sigmas[k] * sigmas[k] + lam);
            rHat[k] = f * dataHat[k];
        }
        return idct(rHat);
    }
    // discrepancy D(lambda) = || F kappa_lambda - data ||, closed form from dataHat
    function discrepancy(lam) {
        let s = 0;
        for (let k = 0; k < n; k++) {
            const res = dataHat[k] * lam / (sigmas[k] * sigmas[k] + lam);
            s += res * res;
        }
        return Math.sqrt(s);
    }
    // Morozov: solve D(lambda) = noiseNorm by bisection (D is monotincreasing)
    function morozovLambda() {
        let lo = 1e-7, hi = 10;
        if (discrepancy(hi) < noiseNorm) return hi;
        if (discrepancy(lo) > noiseNorm) return lo;
        for (let it = 0; it < 60; it++) {
            const mid = Math.sqrt(lo * hi);
            if (discrepancy(mid) < noiseNorm) lo = mid; else hi = mid;
        }
        return Math.sqrt(lo * hi);
    }

    function drawReconstruction(rec) {
        const W = recCanvas.width, H = recCanvas.height, pad = 22;
        recCtx.clearRect(0, 0, W, H); recCtx.fillStyle = 'white'; recCtx.fillRect(0, 0, W, H);
        const fx = i => pad + (i / (n - 1)) * (W - 2 * pad);
        const ymin = -0.4, ymax = 1.5;
        const fy = y => H - pad - ((y - ymin) / (ymax - ymin)) * (H - 2 * pad);
        recCtx.strokeStyle = '#ccc'; recCtx.lineWidth = 1;
        recCtx.beginPath(); recCtx.moveTo(pad, fy(0)); recCtx.lineTo(W - pad, fy(0)); recCtx.stroke();

        // noisy data (light)
        recCtx.strokeStyle = '#e0a0a0'; recCtx.lineWidth = 1.2; recCtx.beginPath();
        for (let i = 0; i < n; i++) {
            const X = fx(i), Y = fy(cleanData[i] + noiseVec[i]);
            i === 0 ? recCtx.moveTo(X, Y) : recCtx.lineTo(X, Y);
        }
        recCtx.stroke();
        // true kappa (grey)
        recCtx.strokeStyle = '#888'; recCtx.lineWidth = 2; recCtx.beginPath();
        for (let i = 0; i < n; i++) {
            const X = fx(i), Y = fy(kappaTrue[i]);
            i === 0 ? recCtx.moveTo(X, Y) : recCtx.lineTo(X, Y);
        }
        recCtx.stroke();
        // reconstruction (blue)
        recCtx.strokeStyle = '#00458b'; recCtx.lineWidth = 2.5; recCtx.beginPath();
        for (let i = 0; i < n; i++) {
            const X = fx(i), Y = fy(rec[i]);
            i === 0 ? recCtx.moveTo(X, Y) : recCtx.lineTo(X, Y);
        }
        recCtx.stroke();
        recCtx.fillStyle = '#888'; recCtx.font = '12px Arial'; recCtx.textAlign = 'left';
        recCtx.fillText('true κ', pad + 4, pad + 4);
        recCtx.fillStyle = '#00458b'; recCtx.fillText('reconstruction', pad + 4, pad + 20);
    }

    function drawDiscrepancy(curLam) {
        const W = discCanvas.width, H = discCanvas.height, pad = 30;
        discCtx.clearRect(0, 0, W, H); discCtx.fillStyle = 'white'; discCtx.fillRect(0, 0, W, H);
        const logs = [];
        for (let e = -7; e <= 1; e += 0.1) logs.push(e);
        const dvals = logs.map(e => discrepancy(Math.pow(10, e)));
        const dmax = Math.max(...dvals, noiseNorm) * 1.1;
        const fx = e => pad + ((e - (-7)) / (1 - (-7))) * (W - 2 * pad);
        const fy = d => H - pad - (d / dmax) * (H - 2 * pad);

        // noise floor
        discCtx.strokeStyle = '#b21f1f'; discCtx.lineWidth = 1.5; discCtx.setLineDash([5, 4]);
        discCtx.beginPath(); discCtx.moveTo(pad, fy(noiseNorm)); discCtx.lineTo(W - pad, fy(noiseNorm)); discCtx.stroke();
        discCtx.setLineDash([]);
        discCtx.fillStyle = '#b21f1f'; discCtx.font = '12px Arial'; discCtx.textAlign = 'left';
        discCtx.fillText('noise level', pad + 4, fy(noiseNorm) - 5);

        // D(lambda) curve
        discCtx.strokeStyle = '#00458b'; discCtx.lineWidth = 2.5; discCtx.beginPath();
        logs.forEach((e, i) => {
            const X = fx(e), Y = fy(dvals[i]);
            i === 0 ? discCtx.moveTo(X, Y) : discCtx.lineTo(X, Y);
        });
        discCtx.stroke();

        // Morozov crossing
        const mLam = morozovLambda();
        const mx = fx(Math.log10(mLam));
        discCtx.strokeStyle = 'rgba(0,150,0,0.8)'; discCtx.lineWidth = 1.5; discCtx.setLineDash([3, 3]);
        discCtx.beginPath(); discCtx.moveTo(mx, pad); discCtx.lineTo(mx, H - pad); discCtx.stroke();
        discCtx.setLineDash([]);
        discCtx.fillStyle = 'rgba(0,120,0,0.9)'; discCtx.fillText('Morozov λ', mx + 4, pad + 12);

        // current lambda marker
        const cx = fx(Math.log10(curLam));
        discCtx.fillStyle = '#000';
        discCtx.beginPath(); discCtx.arc(cx, fy(discrepancy(curLam)), 5, 0, 2 * Math.PI); discCtx.fill();

        discCtx.fillStyle = '#666'; discCtx.textAlign = 'center';
        discCtx.fillText('log₁₀ λ  (under-reg ← → over-reg)', W / 2, H - 8);
    }

    function update() {
        const lam = Math.pow(10, parseFloat(lamSlider.value));
        const rec = reconstruct(lam);
        drawReconstruction(rec);
        drawDiscrepancy(lam);
        // error vs truth
        let err = 0, nrm = 0;
        for (let i = 0; i < n; i++) { err += (rec[i] - kappaTrue[i]) ** 2; nrm += kappaTrue[i] ** 2; }
        const rel = Math.sqrt(err / nrm) * 100;
        const mLam = morozovLambda();
        const near = Math.abs(Math.log10(lam) - Math.log10(mLam)) < 0.2;
        statusLabel.textContent =
            `λ = ${lam.toExponential(1)} · reconstruction error ${rel.toFixed(0)}% · `
            + (near ? 'at the Morozov optimum ✓' : `Morozov λ ≈ ${mLam.toExponential(1)}`);
    }

    lamSlider.addEventListener('input', () => {
        lamVal.textContent = parseFloat(lamSlider.value).toFixed(1);
        update();
    });
    nseSlider.addEventListener('input', () => {
        noiseFrac = parseInt(nseSlider.value) / 100;
        nseVal.textContent = parseInt(nseSlider.value) + '%';
        regenNoise();
        update();
    });
    autoBtn.addEventListener('click', () => {
        const mLam = morozovLambda();
        lamSlider.value = Math.log10(mLam).toFixed(1);
        lamVal.textContent = parseFloat(lamSlider.value).toFixed(1);
        update();
    });
    noiseBtn.addEventListener('click', () => { regenNoise(); update(); });

    regenNoise();
    update();
    console.log('FEMMI Morozov demo loaded!');
})();
