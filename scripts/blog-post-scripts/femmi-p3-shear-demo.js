// FEMMI: Why P3 Elements Demo
// Shows that recovering shear (the second derivative of the lensing potential)
// requires cubic P3 elements: P1 gives zero, P2 gives a piecewise-constant
// staircase, P3 gives a converging piecewise-linear approximation.

(function() {
    const container = window.currentCodeContainer;
    if (!container) {
        console.error('Code container not found!');
        return;
    }

    container.innerHTML = `
        <h3>Why P3 Cubic Elements: Recovering Shear from Curvature</h3>
        <p>The shear is the second derivative of the lensing potential ψ. Approximate a
        smooth ψ slice with piecewise polynomials of a given order, then look at the recovered
        second derivative (the shear). Only cubic P3 elements converge.</p>

        <div class="controls">
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:12px; flex-wrap:wrap;">
                <button id="p1-btn" style="width:130px;">P1 (linear)</button>
                <button id="p2-btn" style="width:130px;">P2 (quadratic)</button>
                <button id="p3-btn" class="active" style="width:130px;">P3 (cubic)</button>
            </div>
            <label style="display:flex; flex-direction:column; max-width:420px; margin:0 auto;">
                Mesh elements: <span id="nel-val" style="font-weight:bold;">5</span>
                <input type="range" id="nel-slider" min="2" max="12" step="1" value="5" style="width:100%;" />
            </label>
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:15px; margin-top:10px;">
            <div>
                <h4 style="margin:0 0 6px; text-align:center;">Potential ψ and its approximation</h4>
                <canvas id="fn-canvas" width="420" height="320" style="border:1px solid #ddd; width:100%; background:white;"></canvas>
            </div>
            <div>
                <h4 style="margin:0 0 6px; text-align:center;">Recovered shear γ ∝ ψ''</h4>
                <canvas id="d2-canvas" width="420" height="320" style="border:1px solid #ddd; width:100%; background:white;"></canvas>
            </div>
        </div>

        <div style="margin-top:12px; padding:10px; background:#f0f0f0; color:#000; border-radius:5px;">
            <strong>Element order:</strong> <span id="order-label">P3 (cubic)</span> &nbsp;|&nbsp;
            <strong>Shear L² error:</strong> <span id="err-label">—</span><br>
            <span id="note-label"></span>
        </div>
    `;

    const fnCanvas = container.querySelector('#fn-canvas');
    const d2Canvas = container.querySelector('#d2-canvas');
    const fnCtx = fnCanvas.getContext('2d');
    const d2Ctx = d2Canvas.getContext('2d');
    const nelSlider = container.querySelector('#nel-slider');
    const nelVal = container.querySelector('#nel-val');
    const orderLabel = container.querySelector('#order-label');
    const errLabel = container.querySelector('#err-label');
    const noteLabel = container.querySelector('#note-label');
    const btns = {
        1: container.querySelector('#p1-btn'),
        2: container.querySelector('#p2-btn'),
        3: container.querySelector('#p3-btn'),
    };

    const XMIN = -3, XMAX = 3, SIG = 0.9;
    let order = 3;
    let nEl = 5;

    // Smooth "potential slice": a Gaussian bump. True second derivative is analytic.
    function f(x)   { return Math.exp(-x * x / (2 * SIG * SIG)); }
    function d2f(x) { return ((x * x - SIG * SIG) / (SIG ** 4)) * f(x); }

    // Solve a small Vandermonde system (degree d) for coefficients in local coord xi in [0,1].
    function fitPoly(ys, d) {
        const n = d + 1;
        const A = [];
        for (let i = 0; i < n; i++) {
            const xi = i / d;
            const row = [];
            for (let k = 0; k < n; k++) row.push(Math.pow(xi, k));
            row.push(ys[i]);
            A.push(row);
        }
        // Gaussian elimination with partial pivoting
        for (let c = 0; c < n; c++) {
            let piv = c;
            for (let r = c + 1; r < n; r++) if (Math.abs(A[r][c]) > Math.abs(A[piv][c])) piv = r;
            [A[c], A[piv]] = [A[piv], A[c]];
            for (let r = 0; r < n; r++) {
                if (r === c) continue;
                const factor = A[r][c] / A[c][c];
                for (let k = c; k <= n; k++) A[r][k] -= factor * A[c][k];
            }
        }
        const coef = [];
        for (let i = 0; i < n; i++) coef.push(A[i][n] / A[i][i]);
        return coef; // p(xi) = sum coef[k] xi^k
    }

    function polyVal(coef, xi) {
        let s = 0;
        for (let k = 0; k < coef.length; k++) s += coef[k] * Math.pow(xi, k);
        return s;
    }
    function polyD2(coef, xi, h) {
        // second derivative in x: (1/h^2) * sum k(k-1) coef[k] xi^{k-2}
        let s = 0;
        for (let k = 2; k < coef.length; k++) s += k * (k - 1) * coef[k] * Math.pow(xi, k - 2);
        return s / (h * h);
    }

    function buildElements() {
        const h = (XMAX - XMIN) / nEl;
        const els = [];
        for (let e = 0; e < nEl; e++) {
            const a = XMIN + e * h;
            const ys = [];
            for (let i = 0; i <= order; i++) ys.push(f(a + (i / order) * h));
            els.push({ a, h, coef: fitPoly(ys, order) });
        }
        return els;
    }

    function draw() {
        const els = buildElements();

        // ---- function canvas ----
        const W = fnCanvas.width, H = fnCanvas.height, pad = 30;
        fnCtx.clearRect(0, 0, W, H);
        fnCtx.fillStyle = 'white'; fnCtx.fillRect(0, 0, W, H);
        const fx = x => pad + ((x - XMIN) / (XMAX - XMIN)) * (W - 2 * pad);
        const fyF = y => H - pad - ((y - (-0.1)) / (1.15)) * (H - 2 * pad);

        // axes
        fnCtx.strokeStyle = '#ccc'; fnCtx.lineWidth = 1;
        fnCtx.beginPath(); fnCtx.moveTo(pad, fyF(0)); fnCtx.lineTo(W - pad, fyF(0)); fnCtx.stroke();

        // true f
        fnCtx.strokeStyle = '#888'; fnCtx.lineWidth = 2; fnCtx.beginPath();
        for (let i = 0; i <= 300; i++) {
            const x = XMIN + (i / 300) * (XMAX - XMIN);
            const X = fx(x), Y = fyF(f(x));
            i === 0 ? fnCtx.moveTo(X, Y) : fnCtx.lineTo(X, Y);
        }
        fnCtx.stroke();

        // approximation per element
        fnCtx.strokeStyle = '#00458b'; fnCtx.lineWidth = 2.5; fnCtx.beginPath();
        let started = false;
        els.forEach(el => {
            for (let i = 0; i <= 40; i++) {
                const xi = i / 40, x = el.a + xi * el.h;
                const X = fx(x), Y = fyF(polyVal(el.coef, xi));
                if (!started) { fnCtx.moveTo(X, Y); started = true; } else fnCtx.lineTo(X, Y);
            }
        });
        fnCtx.stroke();

        // element boundaries + nodes
        fnCtx.fillStyle = '#00458b';
        els.forEach(el => {
            fnCtx.strokeStyle = '#eee'; fnCtx.lineWidth = 1;
            fnCtx.beginPath(); fnCtx.moveTo(fx(el.a), pad); fnCtx.lineTo(fx(el.a), H - pad); fnCtx.stroke();
            for (let i = 0; i <= order; i++) {
                const x = el.a + (i / order) * el.h;
                fnCtx.beginPath(); fnCtx.arc(fx(x), fyF(f(x)), 3, 0, 2 * Math.PI); fnCtx.fill();
            }
        });
        fnCtx.fillStyle = '#888'; fnCtx.font = '12px Arial'; fnCtx.textAlign = 'left';
        fnCtx.fillText('true ψ', pad + 4, pad + 6);
        fnCtx.fillStyle = '#00458b'; fnCtx.fillText('P' + order + ' approx', pad + 4, pad + 22);

        // ---- second-derivative canvas ----
        d2Ctx.clearRect(0, 0, W, H);
        d2Ctx.fillStyle = 'white'; d2Ctx.fillRect(0, 0, W, H);
        const d2min = -1.4, d2max = 0.8;
        const fyD = y => H - pad - ((y - d2min) / (d2max - d2min)) * (H - 2 * pad);
        d2Ctx.strokeStyle = '#ccc'; d2Ctx.lineWidth = 1;
        d2Ctx.beginPath(); d2Ctx.moveTo(pad, fyD(0)); d2Ctx.lineTo(W - pad, fyD(0)); d2Ctx.stroke();

        // true second derivative
        d2Ctx.strokeStyle = '#888'; d2Ctx.lineWidth = 2; d2Ctx.beginPath();
        for (let i = 0; i <= 300; i++) {
            const x = XMIN + (i / 300) * (XMAX - XMIN);
            const X = fx(x), Y = fyD(d2f(x));
            i === 0 ? d2Ctx.moveTo(X, Y) : d2Ctx.lineTo(X, Y);
        }
        d2Ctx.stroke();

        // recovered second derivative (per element; may be discontinuous)
        d2Ctx.strokeStyle = '#b21f1f'; d2Ctx.lineWidth = 2.5;
        let l2err = 0, cnt = 0;
        els.forEach(el => {
            d2Ctx.beginPath();
            for (let i = 0; i <= 40; i++) {
                const xi = i / 40, x = el.a + xi * el.h;
                const val = polyD2(el.coef, xi, el.h);
                const X = fx(x), Y = fyD(val);
                i === 0 ? d2Ctx.moveTo(X, Y) : d2Ctx.lineTo(X, Y);
                const err = val - d2f(x); l2err += err * err; cnt++;
            }
        });
        d2Ctx.stroke();
        d2Ctx.fillStyle = '#888'; d2Ctx.font = '12px Arial'; d2Ctx.textAlign = 'left';
        d2Ctx.fillText('true ψ′′', pad + 4, pad + 6);
        d2Ctx.fillStyle = '#b21f1f'; d2Ctx.fillText('recovered', pad + 4, pad + 22);

        const rms = Math.sqrt(l2err / cnt);
        errLabel.textContent = rms.toFixed(3);
        orderLabel.textContent = 'P' + order + (order === 1 ? ' (linear)' : order === 2 ? ' (quadratic)' : ' (cubic)');
        const notes = {
            1: 'P1 second derivatives are identically zero — no shear signal at all.',
            2: 'P2 second derivatives are piecewise-constant: a staircase that never converges to the smooth curve.',
            3: 'P3 second derivatives are piecewise-linear and converge as O(h²). This is why FEMMI uses 10-node cubic elements.',
        };
        noteLabel.textContent = notes[order];
    }

    function setOrder(o) {
        order = o;
        Object.values(btns).forEach(b => b.classList.remove('active'));
        btns[o].classList.add('active');
        draw();
    }
    btns[1].addEventListener('click', () => setOrder(1));
    btns[2].addEventListener('click', () => setOrder(2));
    btns[3].addEventListener('click', () => setOrder(3));
    nelSlider.addEventListener('input', () => {
        nEl = parseInt(nelSlider.value);
        nelVal.textContent = nEl;
        draw();
    });

    draw();
    console.log('FEMMI P3 shear demo loaded!');
})();
