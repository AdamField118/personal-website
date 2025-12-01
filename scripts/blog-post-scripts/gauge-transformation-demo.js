// Electromagnetic Gauge Transformation Visualization
// Shows how potentials change under gauge transformations while E and B fields remain invariant

(function() {
    const container = window.currentCodeContainer;
    if (!container) {
        console.error('Code container not found!');
        return;
    }
    
    // Create HTML structure
    container.innerHTML = `
        <h3>Electromagnetic Gauge Transformations</h3>
        <p>Noether's second theorem: Local U(1) gauge symmetry → charge conservation. Watch how potentials φ and A transform while physical fields E and B stay constant!</p>
        
        <div class="controls">
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <h4 style="margin-top: 0;">Physical Configuration</h4>
                    <label style="display: flex; flex-direction: column;">
                        Setup:
                        <select id="config-select" style="width: 100%; padding: 5px;">
                            <option value="uniform">Uniform E-field</option>
                            <option value="point">Point charge</option>
                            <option value="dipole">Electric dipole</option>
                            <option value="wave">EM plane wave</option>
                        </select>
                    </label>
                </div>
                
                <div>
                    <h4 style="margin-top: 0;">Gauge Transformation χ(x,t)</h4>
                    <label style="display: flex; flex-direction: column;">
                        Gauge Function:
                        <select id="gauge-select" style="width: 100%; padding: 5px;">
                            <option value="none">None (χ = 0)</option>
                            <option value="linear">Linear (χ = kx)</option>
                            <option value="quadratic">Quadratic (χ = k(x²+y²))</option>
                            <option value="oscillating">Oscillating (χ = A·sin(kx-ωt))</option>
                        </select>
                    </label>
                    <label style="display: flex; flex-direction: column; margin-top: 10px;">
                        Strength k: <span id="gauge-val" style="font-weight: bold;">1.0</span>
                        <input type="range" id="gauge-slider" min="0.0" max="2.0" step="0.1" value="1.0" style="width: 100%;" />
                    </label>
                </div>
                
                <div>
                    <h4 style="margin-top: 0;">Animation</h4>
                    <label style="display: flex; flex-direction: column;">
                        Time: <span id="time-val" style="font-weight: bold;">0.00</span> s
                        <input type="range" id="time-slider" min="0" max="6.28" step="0.05" value="0" style="width: 100%;" />
                    </label>
                    <div style="display: flex; gap: 10px; margin-top: 10px;">
                        <button id="animate-btn" style="flex: 1; padding: 5px;">▶ Animate</button>
                        <button id="pause-btn" style="flex: 1; padding: 5px;">⏸ Pause</button>
                    </div>
                </div>
            </div>
        </div>
        
        <div style="margin: 15px 0; padding: 12px; background: #e3f2fd; color: #000; border-radius: 5px; border-left: 4px solid #2196F3;">
            <strong>Gauge Transformation Rules:</strong><br>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 8px; font-family: 'Courier New', monospace;">
                <div>
                    <span style="color: #d32f2f;">φ' = φ - ∂χ/∂t</span> (Scalar potential changes)
                </div>
                <div>
                    <span style="color: #d32f2f;">A' = A + ∇χ</span> (Vector potential changes)
                </div>
                <div>
                    <span style="color: #388e3c;">E = -∇φ - ∂A/∂t</span> (E-field invariant!)
                </div>
                <div>
                    <span style="color: #388e3c;">B = ∇×A</span> (B-field invariant!)
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-top: 20px;">
            <div>
                <h4 style="margin: 0 0 10px 0; text-align: center; color: #d32f2f;">Δφ (Change in Scalar Potential)</h4>
                <canvas id="dphi-canvas" width="300" height="300" style="border: 2px solid #d32f2f; width: 100%; display: block; background: white;"></canvas>
                <div style="text-align: center; margin-top: 5px; font-size: 0.85rem; color: #d32f2f; font-weight: bold;">
                    Gauge Dependent ✗
                </div>
            </div>
            
            <div>
                <h4 style="margin: 0 0 10px 0; text-align: center; color: #d32f2f;">ΔA (Change in Vector Potential)</h4>
                <canvas id="dA-canvas" width="300" height="300" style="border: 2px solid #d32f2f; width: 100%; display: block; background: white;"></canvas>
                <div style="text-align: center; margin-top: 5px; font-size: 0.85rem; color: #d32f2f; font-weight: bold;">
                    Gauge Dependent ✗
                </div>
            </div>
            
            <div>
                <h4 style="margin: 0 0 10px 0; text-align: center; color: #000;">Gauge Function χ</h4>
                <canvas id="chi-canvas" width="300" height="300" style="border: 2px solid #666; width: 100%; display: block; background: white;"></canvas>
                <div style="text-align: center; margin-top: 5px; font-size: 0.85rem; color: #666;">
                    Current: <span id="chi-display" style="font-weight: bold;">χ = 0</span>
                </div>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 20px;">
            <div>
                <h4 style="margin: 0 0 10px 0; text-align: center; color: #388e3c;">Electric Field E (Gauge Invariant)</h4>
                <canvas id="E-canvas" width="400" height="400" style="border: 2px solid #388e3c; width: 100%; display: block; background: white;"></canvas>
                <div style="text-align: center; margin-top: 5px; font-size: 0.85rem; color: #388e3c; font-weight: bold;">
                    ✓ UNCHANGED by gauge transformation!
                </div>
            </div>
            
            <div>
                <h4 style="margin: 0 0 10px 0; text-align: center; color: #388e3c;">Magnetic Field B (Gauge Invariant)</h4>
                <canvas id="B-canvas" width="400" height="400" style="border: 2px solid #388e3c; width: 100%; display: block; background: white;"></canvas>
                <div style="text-align: center; margin-top: 5px; font-size: 0.85rem; color: #388e3c; font-weight: bold;">
                    ✓ UNCHANGED by gauge transformation!
                </div>
            </div>
        </div>
        
        <div style="margin-top: 15px; padding: 10px; background: #fff3e0; color: #000; border-radius: 5px; border-left: 4px solid #ff9800;">
            <strong>What you're seeing:</strong> The top panels show how much the potentials <em>change</em> when you apply a gauge transformation. 
            The bottom panels show the physical E and B fields, which remain <strong>completely unchanged</strong> regardless of gauge choice—this is gauge invariance!
            The middle panel shows the gauge function χ you've chosen.
        </div>
    `;
    
    // Get DOM elements
    const dphiCanvas = container.querySelector('#dphi-canvas');
    const dACanvas = container.querySelector('#dA-canvas');
    const chiCanvas = container.querySelector('#chi-canvas');
    const ECanvas = container.querySelector('#E-canvas');
    const BCanvas = container.querySelector('#B-canvas');
    
    const dphiCtx = dphiCanvas.getContext('2d');
    const dACtx = dACanvas.getContext('2d');
    const chiCtx = chiCanvas.getContext('2d');
    const ECtx = ECanvas.getContext('2d');
    const BCtx = BCanvas.getContext('2d');
    
    const gaugeSelect = container.querySelector('#gauge-select');
    const configSelect = container.querySelector('#config-select');
    const gaugeSlider = container.querySelector('#gauge-slider');
    const timeSlider = container.querySelector('#time-slider');
    const gaugeVal = container.querySelector('#gauge-val');
    const timeVal = container.querySelector('#time-val');
    const animateBtn = container.querySelector('#animate-btn');
    const pauseBtn = container.querySelector('#pause-btn');
    const chiDisplay = container.querySelector('#chi-display');
    
    // State
    let k = 1.0;
    let t = 0;
    let isAnimating = false;
    let animationId = null;
    
    // Update slider displays
    gaugeSlider.addEventListener('input', () => {
        k = parseFloat(gaugeSlider.value);
        gaugeVal.textContent = k.toFixed(1);
        updateChiDisplay();
        if (!isAnimating) draw();
    });
    
    timeSlider.addEventListener('input', () => {
        t = parseFloat(timeSlider.value);
        timeVal.textContent = t.toFixed(2);
        if (!isAnimating) draw();
    });
    
    gaugeSelect.addEventListener('change', () => {
        updateChiDisplay();
        if (!isAnimating) draw();
    });
    
    configSelect.addEventListener('change', () => {
        if (!isAnimating) draw();
    });
    
    animateBtn.addEventListener('click', () => {
        if (!isAnimating) {
            isAnimating = true;
            animateBtn.disabled = true;
            pauseBtn.disabled = false;
            animate();
        }
    });
    
    pauseBtn.addEventListener('click', () => {
        isAnimating = false;
        animateBtn.disabled = false;
        pauseBtn.disabled = true;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    });
    
    function updateChiDisplay() {
        const type = gaugeSelect.value;
        switch(type) {
            case 'none':
                chiDisplay.textContent = 'χ = 0';
                break;
            case 'linear':
                chiDisplay.textContent = `χ = ${k.toFixed(1)}x`;
                break;
            case 'quadratic':
                chiDisplay.textContent = `χ = ${k.toFixed(1)}(x² + y²)/4`;
                break;
            case 'oscillating':
                chiDisplay.textContent = `χ = ${k.toFixed(1)}sin(kx - ωt)`;
                break;
        }
    }
    
    function animate() {
        if (!isAnimating) return;
        
        t += 0.05;
        if (t > 6.28) t = 0;
        
        timeSlider.value = t;
        timeVal.textContent = t.toFixed(2);
        
        draw();
        animationId = requestAnimationFrame(animate);
    }
    
    // ====== PHYSICS FUNCTIONS ======
    
    // Gauge function χ(x, y, t)
    function chi(x, y) {
        const type = gaugeSelect.value;
        switch(type) {
            case 'none':
                return 0;
            case 'linear':
                return k * x;
            case 'quadratic':
                return k * (x * x + y * y) / 4;
            case 'oscillating':
                return k * Math.sin(x - t);
            default:
                return 0;
        }
    }
    
    // Analytic derivatives of χ
    function dChi_dx(x, y) {
        const type = gaugeSelect.value;
        switch(type) {
            case 'none':
                return 0;
            case 'linear':
                return k;
            case 'quadratic':
                return k * x / 2;
            case 'oscillating':
                return k * Math.cos(x - t);
            default:
                return 0;
        }
    }
    
    function dChi_dy(x, y) {
        const type = gaugeSelect.value;
        switch(type) {
            case 'none':
                return 0;
            case 'linear':
                return 0;
            case 'quadratic':
                return k * y / 2;
            case 'oscillating':
                return 0;
            default:
                return 0;
        }
    }
    
    function dChi_dt(x, y) {
        const type = gaugeSelect.value;
        switch(type) {
            case 'none':
                return 0;
            case 'linear':
                return 0;
            case 'quadratic':
                return 0;
            case 'oscillating':
                return -k * Math.cos(x - t);
            default:
                return 0;
        }
    }
    
    // Original potentials (before gauge transformation)
    function phi0(x, y) {
        const config = configSelect.value;
        switch(config) {
            case 'uniform':
                return -x;  // E = (1, 0)
            case 'point':
                const r = Math.sqrt(x * x + y * y);
                return r > 0.1 ? 1 / r : 10;
            case 'dipole':
                const r1 = Math.sqrt((x - 1) * (x - 1) + y * y);
                const r2 = Math.sqrt((x + 1) * (x + 1) + y * y);
                return (r1 > 0.1 ? 1 / r1 : 10) - (r2 > 0.1 ? 1 / r2 : 10);
            case 'wave':
                return Math.cos(x - t);  // Plane wave φ = cos(kx - ωt) with k=ω=1
            default:
                return 0;
        }
    }
    
    // Vector potential components (before gauge transformation)
    function A0_x(x, y) {
        const config = configSelect.value;
        return 0;  // Simplified: only non-zero for certain configs
    }
    
    function A0_y(x, y) {
        const config = configSelect.value;
        switch(config) {
            case 'wave':
                // For plane wave: A_y = sin(kx - ωt), gives B_z = k·cos(kx-ωt)
                return Math.sin(x - t);
            default:
                return 0;
        }
    }
    
    // Electric field (gauge invariant): E = -∇φ - ∂A/∂t
    function E_field(x, y) {
        const epsilon = 0.01;
        const config = configSelect.value;
        
        // E_x = -∂φ/∂x - ∂A_x/∂t
        const dPhi_dx = (phi0(x + epsilon, y) - phi0(x - epsilon, y)) / (2 * epsilon);
        
        let dAx_dt = 0;
        if (config === 'wave') {
            // A_x = 0 for our wave, so ∂A_x/∂t = 0
            dAx_dt = 0;
        }
        
        const Ex = -dPhi_dx - dAx_dt;
        
        // E_y = -∂φ/∂y - ∂A_y/∂t
        const dPhi_dy = (phi0(x, y + epsilon) - phi0(x, y - epsilon)) / (2 * epsilon);
        
        let dAy_dt = 0;
        if (config === 'wave') {
            // A_y = sin(x - t), so ∂A_y/∂t = cos(x - t)
            dAy_dt = Math.cos(x - t);
        }
        
        const Ey = -dPhi_dy - dAy_dt;
        
        return { Ex, Ey };
    }
    
    // Magnetic field (gauge invariant): B = ∇×A
    function B_field(x, y) {
        const epsilon = 0.01;
        const config = configSelect.value;
        
        // B_z = ∂A_y/∂x - ∂A_x/∂y
        const dAy_dx = (A0_y(x + epsilon, y) - A0_y(x - epsilon, y)) / (2 * epsilon);
        const dAx_dy = (A0_x(x, y + epsilon) - A0_x(x, y - epsilon)) / (2 * epsilon);
        
        const Bz = dAy_dx - dAx_dy;
        
        return Bz;
    }
    
    // ====== DRAWING FUNCTIONS ======
    
    function drawScalarField(ctx, fieldFunc, colorScale = 1.0) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const gridSize = 50;
        const xmin = -3, xmax = 3;
        const ymin = -3, ymax = 3;
        
        // Clear
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // Draw field as colored grid
        const cellWidth = width / gridSize;
        const cellHeight = height / gridSize;
        
        let maxAbsVal = 0;
        const values = [];
        
        // First pass: compute all values and find max
        for (let i = 0; i < gridSize; i++) {
            values[i] = [];
            for (let j = 0; j < gridSize; j++) {
                const x = xmin + (xmax - xmin) * i / gridSize;
                const y = ymax - (ymax - ymin) * j / gridSize;
                const val = fieldFunc(x, y);
                values[i][j] = val;
                if (Math.abs(val) > maxAbsVal) maxAbsVal = Math.abs(val);
            }
        }
        
        // Prevent division by zero
        if (maxAbsVal < 0.001) maxAbsVal = 1.0;
        
        // Second pass: draw colored cells
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const val = values[i][j];
                const normalized = val / (maxAbsVal * colorScale);
                
                // Color scheme: blue (negative) -> white (zero) -> red (positive)
                let r, g, b;
                if (normalized > 0) {
                    r = 255;
                    g = Math.floor(255 * (1 - normalized));
                    b = Math.floor(255 * (1 - normalized));
                } else {
                    r = Math.floor(255 * (1 + normalized));
                    g = Math.floor(255 * (1 + normalized));
                    b = 255;
                }
                
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
            }
        }
        
        // Draw grid lines
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= gridSize; i++) {
            ctx.beginPath();
            ctx.moveTo(i * cellWidth, 0);
            ctx.lineTo(i * cellWidth, height);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, i * cellHeight);
            ctx.lineTo(width, i * cellHeight);
            ctx.stroke();
        }
        
        // Draw axes
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        
        const centerX = width * (0 - xmin) / (xmax - xmin);
        const centerY = height * (ymax - 0) / (ymax - ymin);
        
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
        
        // Color scale legend
        drawColorLegend(ctx, maxAbsVal * colorScale);
    }
    
    function drawColorLegend(ctx, maxVal) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        
        const legendWidth = 20;
        const legendHeight = 100;
        const legendX = width - legendWidth - 10;
        const legendY = 10;
        
        // Draw color gradient
        for (let i = 0; i < legendHeight; i++) {
            const val = 1 - 2 * i / legendHeight;  // 1 to -1
            
            let r, g, b;
            if (val > 0) {
                r = 255;
                g = Math.floor(255 * (1 - val));
                b = Math.floor(255 * (1 - val));
            } else {
                r = Math.floor(255 * (1 + val));
                g = Math.floor(255 * (1 + val));
                b = 255;
            }
            
            ctx.fillStyle = `rgb(${r},${g},${b})`;
            ctx.fillRect(legendX, legendY + i, legendWidth, 1);
        }
        
        // Border
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeRect(legendX, legendY, legendWidth, legendHeight);
        
        // Labels
        ctx.fillStyle = '#000';
        ctx.font = '10px Arial';
        ctx.textAlign = 'right';
        ctx.fillText(maxVal.toFixed(2), legendX - 3, legendY + 5);
        ctx.fillText('0', legendX - 3, legendY + legendHeight / 2 + 3);
        ctx.fillText((-maxVal).toFixed(2), legendX - 3, legendY + legendHeight);
    }
    
    function drawVectorField(ctx, fieldFunc, scale = 0.3) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const gridSize = 15;
        const xmin = -3, xmax = 3;
        const ymin = -3, ymax = 3;
        
        // Clear
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // Draw axes
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        
        const centerX = width * (0 - xmin) / (xmax - xmin);
        const centerY = height * (ymax - 0) / (ymax - ymin);
        
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
        
        // Find max magnitude for scaling
        let maxMag = 0;
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const x = xmin + (xmax - xmin) * i / (gridSize - 1);
                const y = ymax - (ymax - ymin) * j / (gridSize - 1);
                const field = fieldFunc(x, y);
                const mag = Math.sqrt(field.Ex * field.Ex + field.Ey * field.Ey);
                if (mag > maxMag) maxMag = mag;
            }
        }
        
        if (maxMag < 0.001) maxMag = 1.0;
        
        // Draw vector field
        const arrowScale = scale * width / gridSize / maxMag;
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const x = xmin + (xmax - xmin) * i / (gridSize - 1);
                const y = ymax - (ymax - ymin) * j / (gridSize - 1);
                
                const screenX = width * (x - xmin) / (xmax - xmin);
                const screenY = height * (ymax - y) / (ymax - ymin);
                
                const field = fieldFunc(x, y);
                const mag = Math.sqrt(field.Ex * field.Ex + field.Ey * field.Ey);
                
                if (mag < 0.01) continue;
                
                const dx = field.Ex * arrowScale;
                const dy = -field.Ey * arrowScale;  // Negative because screen y is inverted
                
                // Color by magnitude
                const intensity = Math.min(mag / maxMag, 1);
                const r = Math.floor(255 * intensity);
                const b = Math.floor(255 * (1 - intensity));
                ctx.strokeStyle = `rgb(${r},0,${b})`;
                ctx.fillStyle = ctx.strokeStyle;
                ctx.lineWidth = 1.5;
                
                // Draw arrow
                ctx.beginPath();
                ctx.moveTo(screenX, screenY);
                ctx.lineTo(screenX + dx, screenY + dy);
                ctx.stroke();
                
                // Arrowhead
                const angle = Math.atan2(dy, dx);
                const headlen = 5;
                ctx.beginPath();
                ctx.moveTo(screenX + dx, screenY + dy);
                ctx.lineTo(screenX + dx - headlen * Math.cos(angle - Math.PI / 6),
                          screenY + dy - headlen * Math.sin(angle - Math.PI / 6));
                ctx.lineTo(screenX + dx - headlen * Math.cos(angle + Math.PI / 6),
                          screenY + dy - headlen * Math.sin(angle + Math.PI / 6));
                ctx.closePath();
                ctx.fill();
            }
        }
        
        // Legend
        ctx.fillStyle = '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Max: ${maxMag.toFixed(2)}`, 10, height - 10);
    }
    
    function drawBField(ctx) {
        const width = ctx.canvas.width;
        const height = ctx.canvas.height;
        const gridSize = 50;
        const xmin = -3, xmax = 3;
        const ymin = -3, ymax = 3;
        
        // Clear
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // Draw B field as colored grid (scalar B_z)
        const cellWidth = width / gridSize;
        const cellHeight = height / gridSize;
        
        let maxAbsVal = 0;
        const values = [];
        
        // First pass: compute all values and find max
        for (let i = 0; i < gridSize; i++) {
            values[i] = [];
            for (let j = 0; j < gridSize; j++) {
                const x = xmin + (xmax - xmin) * i / gridSize;
                const y = ymax - (ymax - ymin) * j / gridSize;
                const val = B_field(x, y);
                values[i][j] = val;
                if (Math.abs(val) > maxAbsVal) maxAbsVal = Math.abs(val);
            }
        }
        
        // Prevent division by zero
        if (maxAbsVal < 0.001) {
            maxAbsVal = 1.0;
            // If B is essentially zero everywhere, just draw white
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            
            // Draw axes
            ctx.strokeStyle = '#ddd';
            ctx.lineWidth = 1;
            const centerX = width * (0 - xmin) / (xmax - xmin);
            const centerY = height * (ymax - 0) / (ymax - ymin);
            ctx.beginPath();
            ctx.moveTo(centerX, 0);
            ctx.lineTo(centerX, height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, centerY);
            ctx.lineTo(width, centerY);
            ctx.stroke();
            
            ctx.fillStyle = '#000';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('B ≈ 0 (no magnetic field)', width / 2, height / 2);
            return;
        }
        
        // Second pass: draw colored cells
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const val = values[i][j];
                const normalized = val / maxAbsVal;
                
                // Color scheme: blue (negative) -> white (zero) -> red (positive)
                let r, g, b;
                if (normalized > 0) {
                    r = 255;
                    g = Math.floor(255 * (1 - normalized));
                    b = Math.floor(255 * (1 - normalized));
                } else {
                    r = Math.floor(255 * (1 + normalized));
                    g = Math.floor(255 * (1 + normalized));
                    b = 255;
                }
                
                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.fillRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
            }
        }
        
        // Draw axes
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        const centerX = width * (0 - xmin) / (xmax - xmin);
        const centerY = height * (ymax - 0) / (ymax - ymin);
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
        
        // Color scale legend
        drawColorLegend(ctx, maxAbsVal);
    }
    
    function draw() {
        // Draw change in scalar potential: Δφ = -∂χ/∂t
        drawScalarField(dphiCtx, (x, y) => -dChi_dt(x, y), 0.5);
        
        // Draw change in vector potential: ΔA = ∇χ (showing magnitude)
        drawScalarField(dACtx, (x, y) => {
            const dx = dChi_dx(x, y);
            const dy = dChi_dy(x, y);
            return Math.sqrt(dx * dx + dy * dy);
        }, 0.5);
        
        // Draw gauge function χ
        drawScalarField(chiCtx, chi, 0.3);
        
        // Draw electric field (gauge invariant)
        drawVectorField(ECtx, E_field, 0.4);
        
        // Draw magnetic field (gauge invariant)
        drawBField(BCtx);
    }
    
    // Initial state
    pauseBtn.disabled = true;
    updateChiDisplay();
    draw();
    
    console.log('Gauge transformation demo loaded successfully!');
})();