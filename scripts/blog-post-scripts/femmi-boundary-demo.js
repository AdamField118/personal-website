// FEMMI: The Boundary Truncation Error Demo
// Forcing psi = 0 on a finite box boundary injects a harmonic error field e,
// with e = psi_true on the boundary. By the maximum principle it spreads through
// the whole interior and biases the recovered mass. FEMMI's FEM-BEM coupling
// sets this error to zero exactly.

(function() {
    const container = window.currentCodeContainer;
    if (!container) {
        console.error('Code container not found!');
        return;
    }

    container.innerHTML = `
        <h3>The Boundary Truncation Error</h3>
        <p>The true lensing potential ψ never reaches zero at a finite distance. Clamping
        ψ = 0 on the box boundary injects a harmonic error field that, by the maximum principle,
        contaminates the entire interior — the optimizer then invents spurious mass to fit it.</p>

        <div class="controls">
            <div style="display:flex; gap:10px; justify-content:center; margin-bottom:12px; flex-wrap:wrap;">
                <button id="dirichlet-btn" class="active" style="width:190px;">Dirichlet ψ=0 (truncated)</button>
                <button id="bem-btn" style="width:190px;">FEM–BEM (exact far field)</button>
            </div>
            <label style="display:flex; flex-direction:column; max-width:420px; margin:0 auto;">
                Box half-size L: <span id="box-val" style="font-weight:bold;">2.5</span>
                <input type="range" id="box-slider" min="1.6" max="5" step="0.1" value="2.5" style="width:100%;" />
            </label>
        </div>

        <div style="display:flex; justify-content:center; margin-top:10px;">
            <canvas id="err-canvas" width="360" height="360" style="border:1px solid #ddd; width:100%; max-width:360px; background:white;"></canvas>
        </div>

        <div style="margin-top:12px; padding:10px; background:#f0f0f0; color:#000; border-radius:5px;">
            <strong>Mode:</strong> <span id="mode-label">Dirichlet ψ=0</span> &nbsp;|&nbsp;
            <strong>Interior contamination:</strong> <span id="cont-label">—</span><br>
            <span id="note-label">Blue/red is the boundary-induced error in ψ. The dashed circle marks the lens.</span>
        </div>
    `;

    const canvas = container.querySelector('#err-canvas');
    const ctx = canvas.getContext('2d');
    const boxSlider = container.querySelector('#box-slider');
    const boxVal = container.querySelector('#box-val');
    const modeLabel = container.querySelector('#mode-label');
    const contLabel = container.querySelector('#cont-label');
    const dirBtn = container.querySelector('#dirichlet-btn');
    const bemBtn = container.querySelector('#bem-btn');

    const N = 46;              // solve grid
    const SIG = 0.6;           // lens width (absolute units)
    const CX = 0.45, CY = -0.30; // off-centre lens (breaks symmetry so error is nontrivial)
    let L = 2.5;
    let mode = 'dirichlet';

    function computeErrorField() {
        const h = (2 * L) / (N - 1);
        const coord = i => -L + i * h;

        // coarse source grid for the volume potential psi = (1/pi) * sum ln|x-y| kappa(y) dA
        const Ns = 22, hs = (2 * L) / Ns;
        const src = [];
        for (let a = 0; a < Ns; a++) {
            for (let b = 0; b < Ns; b++) {
                const x = -L + (a + 0.5) * hs, y = -L + (b + 0.5) * hs;
                const k = Math.exp(-((x - CX) ** 2 + (y - CY) ** 2) / (2 * SIG * SIG));
                if (k > 1e-4) src.push({ x, y, w: k * hs * hs });
            }
        }
        const psiAt = (x, y) => {
            let s = 0;
            for (const p of src) {
                const r = Math.hypot(x - p.x, y - p.y) + 1e-6;
                s += Math.log(r) * p.w;
            }
            return s / Math.PI;
        };

        // e defined on the grid; boundary values = psi_true, interior solved from Laplace(e)=0
        const e = new Float64Array(N * N);
        const fixed = new Uint8Array(N * N);
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                if (i === 0 || j === 0 || i === N - 1 || j === N - 1) {
                    e[i * N + j] = psiAt(coord(i), coord(j));
                    fixed[i * N + j] = 1;
                }
            }
        }
        // remove the mean of boundary values (gauge) so the interior "excess" is what we show
        let bmean = 0, bc = 0;
        for (let k = 0; k < N * N; k++) if (fixed[k]) { bmean += e[k]; bc++; }
        bmean /= bc;
        for (let k = 0; k < N * N; k++) if (fixed[k]) e[k] -= bmean;

        // SOR relaxation of Laplace equation on interior
        const omega = 1.9;
        for (let it = 0; it < 400; it++) {
            for (let i = 1; i < N - 1; i++) {
                for (let j = 1; j < N - 1; j++) {
                    const idx = i * N + j;
                    if (fixed[idx]) continue;
                    const avg = 0.25 * (e[idx - N] + e[idx + N] + e[idx - 1] + e[idx + 1]);
                    e[idx] += omega * (avg - e[idx]);
                }
            }
        }
        return { e, coord };
    }

    function draw() {
        const W = canvas.width, H = canvas.height;
        ctx.clearRect(0, 0, W, H);
        ctx.fillStyle = 'white'; ctx.fillRect(0, 0, W, H);

        const field = computeErrorField();
        const e = field.e;

        // in BEM mode the exterior is exact => interior error is zero
        const showZero = (mode === 'bem');

        let amax = 1e-9, interiorMax = 0;
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                const v = e[i * N + j];
                if (Math.abs(v) > amax) amax = Math.abs(v);
                if (i > 0 && j > 0 && i < N - 1 && j < N - 1)
                    interiorMax = Math.max(interiorMax, Math.abs(v));
            }
        }

        const cw = W / N, ch = H / N;
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < N; j++) {
                const v = showZero ? 0 : e[i * N + j] / amax; // -1..1
                let r, g, b;
                if (v >= 0) { r = 255; g = Math.round(255 * (1 - v)); b = Math.round(255 * (1 - v)); }
                else { const t = -v; r = Math.round(255 * (1 - t)); g = Math.round(255 * (1 - t)); b = 255; }
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(i * cw, j * ch, cw + 1, ch + 1);
            }
        }

        // lens marker (dashed circle at 1-sigma)
        const px = x => ((x + L) / (2 * L)) * W;
        const py = y => ((y + L) / (2 * L)) * H;
        ctx.strokeStyle = 'rgba(0,0,0,0.6)'; ctx.lineWidth = 1.5; ctx.setLineDash([5, 4]);
        ctx.beginPath(); ctx.arc(px(CX), py(CY), (SIG / (2 * L)) * W, 0, 2 * Math.PI); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.font = '12px Arial'; ctx.textAlign = 'center';
        ctx.fillText('lens', px(CX), py(CY) - (SIG / (2 * L)) * W - 5);

        // contamination readout = interior error relative to boundary excess amplitude
        const cont = showZero ? 0 : (interiorMax / amax) * 100;
        contLabel.textContent = cont.toFixed(0) + '% of boundary error reaches the interior';
        modeLabel.textContent = showZero ? 'FEM–BEM (exact)' : 'Dirichlet ψ=0';
    }

    dirBtn.addEventListener('click', () => {
        mode = 'dirichlet'; dirBtn.classList.add('active'); bemBtn.classList.remove('active'); draw();
    });
    bemBtn.addEventListener('click', () => {
        mode = 'bem'; bemBtn.classList.add('active'); dirBtn.classList.remove('active'); draw();
    });

    let debounce;
    boxSlider.addEventListener('input', () => {
        L = parseFloat(boxSlider.value);
        boxVal.textContent = L.toFixed(1);
        clearTimeout(debounce);
        debounce = setTimeout(draw, 60);
    });

    draw();
    console.log('FEMMI boundary demo loaded!');
})();
