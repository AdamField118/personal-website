(function() {
    const container = window.currentCodeContainer;
    if (!container) {
        console.error('Code container not found!');
        return;
    }
    
    // Create the HTML structure
    container.innerHTML = `
        <h3>Conservation of Energy: Correct vs. Incorrect Method</h3>
        <p>Adjust the parameters to see how the two methods give different results.</p>
        
        <div class="controls">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <label style="display: flex; flex-direction: column;">
                    Charge Q (nC): <span id="q-capital-val" style="font-weight: bold;">4.0</span>
                    <input type="range" id="q-capital" min="-4.0" max="4.0" step="0.1" value="4.0" style="width: 100%;" />
                </label>
                <label style="display: flex; flex-direction: column;">
                    Charge q (nC): <span id="q-lower-val" style="font-weight: bold;">-2.0</span>
                    <input type="range" id="q-lower" min="-4.0" max="4.0" step="0.1" value="-2.0" style="width: 100%;" />
                </label>
                <label style="display: flex; flex-direction: column;">
                    Length l (m): <span id="l-val" style="font-weight: bold;">0.40</span>
                    <input type="range" id="l-slider" min="0.01" max="1.0" step="0.01" value="0.40" style="width: 100%;" />
                </label>
                <label style="display: flex; flex-direction: column;">
                    Initial Speed v₀ (m/s): <span id="v0-val" style="font-weight: bold;">1,000</span>
                    <input type="range" id="v0-slider" min="1000" max="10000000" step="1000" value="1000" style="width: 100%;" />
                </label>
            </div>
            <button id="start-btn" style="width: 100%; padding: 12px; font-size: 1.1rem; margin-top: 10px;">Start Animation</button>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
            <div style="border: 2px solid #00458b; border-radius: 8px; padding: 15px;">
                <h4 style="margin-top: 0; color: #00458b; text-align: center;">Correct Method</h4>
                <p style="font-size: 0.9rem; text-align: center; font-style: italic;">
                    Δ(v²) = v²_B - v²_A
                </p>
                <canvas id="canvas-correct" width="350" height="250" style="border: 1px solid #ccc; width: 100%; display: block; background: white;"></canvas>
                <div id="result-correct" style="color: #000; margin-top: 10px; padding: 10px; background: #e6f2ff; border-radius: 5px;">
                    <strong>Final Speed:</strong> <span id="vb-correct">--</span> m/s
                </div>
            </div>
            
            <div style="border: 2px solid #b21f1f; border-radius: 8px; padding: 15px;">
                <h4 style="margin-top: 0; color: #b21f1f; text-align: center;">Incorrect Method</h4>
                <p style="font-size: 0.9rem; text-align: center; font-style: italic;">
                    (Δv)² = (v_B - v_A)²
                </p>
                <canvas id="canvas-incorrect" width="350" height="250" style="border: 1px solid #ccc; width: 100%; display: block; background: white;"></canvas>
                <div id="result-incorrect" style="color: #000; margin-top: 10px; padding: 10px; background: #ffe6e6; border-radius: 5px;">
                    <strong>Final Speed:</strong> <span id="vb-incorrect">--</span> m/s
                </div>
            </div>
        </div>
        
        <div id="comparison" style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 5px; border: 2px solid #ffc107; color: #000;">
            <h4 style="margin-top: 0; color: #000;">Comparison</h4>
            <div id="comparison-text" style="color: #000;">
                Click "Start Animation" to see the difference!
            </div>
        </div>
        
        <div id="calculations" class="output" style="margin-top: 20px; font-family: monospace; font-size: 0.85rem;">
            <strong>Calculation Details:</strong>
            <pre id="calc-details" style="white-space: pre-wrap; word-wrap: break-word;">
Waiting for animation...
            </pre>
        </div>
    `;
    
    // Get DOM elements
    const qCapitalSlider = container.querySelector('#q-capital');
    const qLowerSlider = container.querySelector('#q-lower');
    const lSlider = container.querySelector('#l-slider');
    const v0Slider = container.querySelector('#v0-slider');
    
    const qCapitalVal = container.querySelector('#q-capital-val');
    const qLowerVal = container.querySelector('#q-lower-val');
    const lVal = container.querySelector('#l-val');
    const v0Val = container.querySelector('#v0-val');
    
    const startBtn = container.querySelector('#start-btn');
    const canvasCorrect = container.querySelector('#canvas-correct');
    const canvasIncorrect = container.querySelector('#canvas-incorrect');
    const vbCorrect = container.querySelector('#vb-correct');
    const vbIncorrect = container.querySelector('#vb-incorrect');
    const comparisonText = container.querySelector('#comparison-text');
    const calcDetails = container.querySelector('#calc-details');
    
    const ctxCorrect = canvasCorrect.getContext('2d');
    const ctxIncorrect = canvasIncorrect.getContext('2d');
    
    // Physical constants
    const k = 9.0e9;  // N·m²/C²
    const e = 1.6e-19;  // C
    const m_e = 9.1e-31;  // kg
    
    // Update slider displays
    qCapitalSlider.addEventListener('input', () => qCapitalVal.textContent = qCapitalSlider.value);
    qLowerSlider.addEventListener('input', () => qLowerVal.textContent = qLowerSlider.value);
    lSlider.addEventListener('input', () => lVal.textContent = parseFloat(lSlider.value).toFixed(2));
    v0Slider.addEventListener('input', () => {
        const v = parseFloat(v0Slider.value);
        v0Val.textContent = v >= 1e6 ? v.toExponential(2) : v.toLocaleString();
    });
    
    // Animation state
    let animationId = null;
    
    function drawSetup(ctx, electronX, electronY, showElectron = true, Q = 2.0, q = 1.0) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        
        // Clear canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // Define positions (scaled to canvas)
        const margin = 40;
        const rectWidth = width - 2 * margin;
        const rectHeight = height - 2 * margin;
        
        // Rectangle corners
        const topLeft = { x: margin, y: margin };
        const topRight = { x: margin + rectWidth, y: margin };
        const bottomLeft = { x: margin, y: margin + rectHeight };
        const bottomRight = { x: margin + rectWidth, y: margin + rectHeight };
        
        // Draw rectangle
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(margin, margin, rectWidth, rectHeight);
        ctx.stroke();
        
        // Draw charges
        // Q at top-right (color depends on sign)
        ctx.fillStyle = Q >= 0 ? '#ff0000' : '#0000ff';
        ctx.beginPath();
        ctx.arc(topRight.x, topRight.y, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        const qSign = Q >= 0 ? '+' : '';
        ctx.fillText(`${qSign}Q`, topRight.x, topRight.y - 15);
        
        // q at bottom-left (color depends on sign)
        ctx.fillStyle = q >= 0 ? '#ff0000' : '#0000ff';
        ctx.beginPath();
        ctx.arc(bottomLeft.x, bottomLeft.y, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#000';
        const qLowerSign = q >= 0 ? '+' : '';
        ctx.fillText(`${qLowerSign}q`, bottomLeft.x, bottomLeft.y + 25);
        
        // Mark points A and B
        const pointA = { x: topLeft.x, y: topLeft.y };
        const pointB = { x: bottomRight.x, y: bottomRight.y };
        
        // Point A (top-left)
        ctx.strokeStyle = '#00458b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pointA.x, pointA.y, 8, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.fillText('A', pointA.x - 20, pointA.y);
        
        // Point B (bottom-right)
        ctx.strokeStyle = '#00458b';
        ctx.beginPath();
        ctx.arc(pointB.x, pointB.y, 8, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.fillStyle = '#000';
        ctx.fillText('B', pointB.x + 20, pointB.y);
        
        // Draw dimensions
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        // Vertical dimension (l)
        ctx.beginPath();
        ctx.moveTo(margin - 15, margin);
        ctx.lineTo(margin - 15, margin + rectHeight);
        ctx.stroke();
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.fillText('l', margin - 25, margin + rectHeight / 2);
        
        // Horizontal dimension (2l)
        ctx.beginPath();
        ctx.moveTo(margin, margin + rectHeight + 15);
        ctx.lineTo(margin + rectWidth, margin + rectHeight + 15);
        ctx.stroke();
        ctx.fillText('2l', margin + rectWidth / 2, margin + rectHeight + 30);
        
        ctx.setLineDash([]);
        
        // Draw electron path from A to B
        if (electronX === null && electronY === null) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 2;
            ctx.setLineDash([10, 5]);
            ctx.beginPath();
            ctx.moveTo(pointA.x, pointA.y);
            ctx.lineTo(pointB.x, pointB.y);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // Draw electron if visible
        if (showElectron && electronX !== null && electronY !== null) {
            ctx.fillStyle = '#FFD700';
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(electronX, electronY, 6, 0, 2 * Math.PI);
            ctx.fill();
            ctx.stroke();
            
            // Label
            ctx.fillStyle = '#000';
            ctx.font = 'bold 12px Arial';
            ctx.fillText('e⁻', electronX, electronY - 12);
        }
        
        return { pointA, pointB, margin, rectWidth, rectHeight };
    }
    
    function calculatePhysics() {
        // Get parameters
        const Q = parseFloat(qCapitalSlider.value) * 1e-9;  // Convert nC to C
        const q = parseFloat(qLowerSlider.value) * 1e-9;
        const l = parseFloat(lSlider.value);  // Already in meters
        const v0 = parseFloat(v0Slider.value);  // Already in m/s
        
        // Correct geometry:
        // Point A is at top-left (0, l)
        // Point B is at bottom-right (2l, 0)
        // -q is at bottom-left (0, 0)
        // +Q is at top-right (2l, l)
        
        const dist_A_to_minusq = l;  // vertical distance
        const dist_A_to_plusQ = 2 * l;  // horizontal distance
        
        const dist_B_to_minusq = 2 * l;  // horizontal distance
        const dist_B_to_plusQ = l;  // vertical distance
        
        // Potential energy at A (electron has charge -e)
        const U_A = ((k * (-e) * q) / dist_A_to_minusq) + ((k * (-e) * Q) / dist_A_to_plusQ);
        
        // Potential energy at B
        const U_B = ((k * (-e) * q) / dist_B_to_minusq) + ((k * (-e) * Q) / dist_B_to_plusQ);
        
        // Change in potential energy
        const deltaU = U_B - U_A;
        
        // Correct method: v_B^2 = v_A^2 - 2*deltaU/m
        const vB_correct_squared = ((v0 * v0) - (2 * deltaU / m_e));
        // Respect the exact math: if negative, produce NaN (do not clamp to 0)
        const vB_correct = (Number.isFinite(vB_correct_squared) && vB_correct_squared >= 0)
            ? Math.sqrt(vB_correct_squared)
            : NaN;
        
        // Incorrect method:
        // rad = -2 * deltaU / m_e
        const rad = -2 * deltaU / m_e;
        const sqrtRad = (Number.isFinite(rad) && rad >= 0) ? Math.sqrt(rad) : NaN;
        const vB_incorrect_plus  = Number.isFinite(sqrtRad) ? (v0 + sqrtRad) : NaN;
        const vB_incorrect_minus = Number.isFinite(sqrtRad) ? (v0 - sqrtRad) : NaN;
        
        return {
            Q, q, l, v0,
            U_A, U_B, deltaU,
            vB_correct_squared, vB_correct,
            rad, sqrtRad,
            vB_incorrect_plus, vB_incorrect_minus,
            dist_A_to_minusq, dist_A_to_plusQ,
            dist_B_to_minusq, dist_B_to_plusQ
        };
    }
    
    // small helpers for robust printing and percent calculation
    function safePercentDiff(reference, other) {
        if (!Number.isFinite(reference) || !Number.isFinite(other)) return NaN;
        if (reference === 0) {
            return (other === 0) ? 0 : Infinity;
        }
        return Math.abs(reference - other) / Math.abs(reference) * 100;
    }
    function fmtNumber(x) {
        if (!Number.isFinite(x)) return String(x); // "NaN" or "Infinity"
        if (Math.abs(x) >= 1e6 || Math.abs(x) <= 1e-3) return x.toExponential(3);
        return x.toLocaleString();
    }
    
    function animate() {
        // compute physics once up-front for the chosen params
        const physics = calculatePhysics();
        
        // Get current charge values from sliders (for drawing only)
        const Q_val = parseFloat(qCapitalSlider.value);
        const q_val = parseFloat(qLowerSlider.value);
        
        // Animation parameters
        const duration = 2000;  // ms
        const startTime = Date.now();
        
        // disable button while animating
        startBtn.disabled = true;
        startBtn.textContent = 'Animating...';
        
        // Clean up any previous animation
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        
        function frame() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Linear interpolation for position (top-left to bottom-right diagonally)
            const setup = drawSetup(ctxCorrect, null, null, false, Q_val, q_val);
            const electronX = setup.pointA.x + progress * setup.rectWidth;
            const electronY = setup.pointA.y + progress * setup.rectHeight;
            
            // Draw both canvases
            drawSetup(ctxCorrect, electronX, electronY, true, Q_val, q_val);
            drawSetup(ctxIncorrect, electronX, electronY, true, Q_val, q_val);
            
            if (progress < 1) {
                animationId = requestAnimationFrame(frame);
            } else {
                animationId = null;
                // Animation complete - show results
                finishAnimation(physics);
            }
        }
        
        // Start frames
        frame();
    }
    
    function finishAnimation(physics) {
        try {
            // Safely display final velocities (may be NaN/Infinity)
            vbCorrect.textContent = fmtNumber(physics.vB_correct);
            vbIncorrect.textContent = `+root: ${fmtNumber(physics.vB_incorrect_plus)}  |  -root: ${fmtNumber(physics.vB_incorrect_minus)}`;
            
            // Choose an 'other' root to compare (prefer +root if finite, otherwise -root)
            const other = Number.isFinite(physics.vB_incorrect_plus) ? physics.vB_incorrect_plus
                         : Number.isFinite(physics.vB_incorrect_minus) ? physics.vB_incorrect_minus
                         : NaN;
            
            const pDiff = safePercentDiff(physics.vB_correct, other);
            
            let diffMsg = '';
            if (!Number.isFinite(physics.vB_correct)) {
                // Correct method has no real solution at B
                let vsqTxt = Number.isFinite(physics.vB_correct_squared) ? physics.vB_correct_squared.toExponential(6) : String(physics.vB_correct_squared);
                diffMsg = `<strong style="color:#d32f2f;">Correct method yields no real speed at B (v_B^2 = ${vsqTxt}).</strong>
                           Physically this means the electron cannot reach point B with the current initial speed v₀; it reaches a turning point earlier and reverses direction.`;
            } else if (!Number.isFinite(other)) {
                diffMsg = `<strong style="color:#d32f2f;">Incorrect method produces non-real root for these parameters (sqrt of negative number).</strong>
                           Algebraic roots: +root = ${fmtNumber(physics.vB_incorrect_plus)}, -root = ${fmtNumber(physics.vB_incorrect_minus)}.`;
            } else if (pDiff === Infinity) {
                diffMsg = `Reference v_B = 0 while other method gives ${fmtNumber(other)} → relative difference is infinite.`;
            } else if (Number.isFinite(pDiff)) {
                diffMsg = `Absolute difference: ${Math.abs(physics.vB_correct - other).toExponential(3)} m/s — relative difference: ${pDiff.toFixed(2)}%`;
            } else {
                diffMsg = `Comparison: reference = ${fmtNumber(physics.vB_correct)}, other = ${fmtNumber(other)}.`;
            }
            
            comparisonText.innerHTML = `<strong>Difference:</strong> ${diffMsg}`;
            
            // Put calculation details into the pre area safely (avoid calling .toExponential on non-numbers)
            const makeExp = (x) => (Number.isFinite(x) ? x.toExponential(6) : String(x));
            const makeFmt = (x) => fmtNumber(x);
            
            calcDetails.textContent = `
Parameters: Q = ${(physics.Q * 1e9).toFixed(3)} nC, q = ${(physics.q * 1e9).toFixed(3)} nC, l = ${physics.l.toFixed(3)} m, v₀ = ${physics.v0.toExponential(6)} m/s

Energy:
  U_A = ${makeExp(physics.U_A)} J
  U_B = ${makeExp(physics.U_B)} J
  ΔU  = ${makeExp(physics.deltaU)} J

CORRECT (exact algebra):
  v_B^2 = v_A^2 - 2ΔU/m  -> v_B^2 = ${Number.isFinite(physics.vB_correct_squared) ? physics.vB_correct_squared.toExponential(6) : String(physics.vB_correct_squared)}
  v_B    = ${makeFmt(physics.vB_correct)}
  (If v_B is NaN, the particle cannot reach B: turning point occurs earlier.)

INCORRECT (faulty ΔK):
  rad = -2ΔU/m = ${Number.isFinite(physics.rad) ? physics.rad.toExponential(6) : String(physics.rad)}
  sqrt(rad) = ${Number.isFinite(physics.sqrtRad) ? physics.sqrtRad.toExponential(6) : String(physics.sqrtRad)}
  Algebraic roots: v_B = v_A ± sqrt(rad)
    +root = ${makeFmt(physics.vB_incorrect_plus)}
    -root = ${makeFmt(physics.vB_incorrect_minus)}

Notes:
  - This simulation purposely preserves the exact algebraic signs. It does NOT clamp negative radicands to zero or flip signs silently.
  - NaN or non-finite results are meaningful: they indicate the algebra produces non-real speeds and must be interpreted physically (e.g. turning point).
            `;
        } catch (err) {
            // In the unlikely event of an error, make sure UI is still restored and we log the error.
            console.error('Error in finishAnimation:', err);
            comparisonText.textContent = 'An error occurred while finishing the animation. See console for details.';
            calcDetails.textContent = 'Error printing calculations. See console.';
        } finally {
            // Always re-enable the button regardless of success/failure
            startBtn.disabled = false;
            startBtn.textContent = 'Restart Animation';
        }
    }
    
    // Event listener for start button
    startBtn.addEventListener('click', () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        animate();
    });
    
    // Initial draw (no electron)
    drawSetup(ctxCorrect, null, null, false, 4.0, -2.0);
    drawSetup(ctxIncorrect, null, null, false, 4.0, -2.0);
    
    console.log('Energy conservation simulation loaded successfully!');
})();
