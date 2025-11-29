// 2D Wave Equation Simulation
// Interactive visualization of rectangular membrane vibrations

(function() {
    const container = window.currentCodeContainer;
    if (!container) {
        console.error('Code container not found!');
        return;
    }
    
    // Create the HTML structure
    container.innerHTML = `
        <h3>2D Wave Equation: Rectangular Membrane Vibration</h3>
        <p>Visualizing: u(x,y,t) = Σ Σ sin(mπx/a)sin(nπy/b)[A_mn cos(ω_mn t) + B_mn sin(ω_mn t)]</p>
        
        <div class="controls">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <h4 style="margin-top: 0;">Physical Parameters</h4>
                    <label style="display: flex; flex-direction: column;">
                        Wave Speed (c): <span id="c-val" style="font-weight: bold;">1.0</span>
                        <input type="range" id="c-slider" min="0.5" max="3.0" step="0.1" value="1.0" style="width: 100%;" />
                    </label>
                    <label style="display: flex; flex-direction: column; margin-top: 10px;">
                        Membrane Width (a): <span id="a-val" style="font-weight: bold;">2.0</span>
                        <input type="range" id="a-slider" min="1.0" max="3.0" step="0.1" value="2.0" style="width: 100%;" />
                    </label>
                    <label style="display: flex; flex-direction: column; margin-top: 10px;">
                        Membrane Height (b): <span id="b-val" style="font-weight: bold;">2.0</span>
                        <input type="range" id="b-slider" min="1.0" max="3.0" step="0.1" value="2.0" style="width: 100%;" />
                    </label>
                    <label style="display: flex; flex-direction: column; margin-top: 10px;">
                        Time: <span id="time-val" style="font-weight: bold;">0.00</span> s
                        <input type="range" id="time-slider" min="0" max="5.0" step="0.02" value="0" style="width: 100%;" />
                    </label>
                </div>
                
                <div>
                    <h4 style="margin-top: 0;">Initial Condition</h4>
                    <label style="display: flex; flex-direction: column;">
                        Shape:
                        <select id="shape-select" style="width: 100%; padding: 5px;">
                            <option value="gaussian">Gaussian Bump</option>
                            <option value="mode">Single Mode (1,1)</option>
                            <option value="corner">Corner Displacement</option>
                            <option value="ridge">Central Ridge</option>
                            <option value="double">Double Gaussian</option>
                        </select>
                    </label>
                    <label style="display: flex; flex-direction: column; margin-top: 10px;">
                        Amplitude: <span id="amp-val" style="font-weight: bold;">1.0</span>
                        <input type="range" id="amp-slider" min="0.1" max="2.0" step="0.1" value="1.0" style="width: 100%;" />
                    </label>
                    <label style="display: flex; flex-direction: column; margin-top: 10px;">
                        Max Modes (M = N): <span id="modes-val" style="font-weight: bold;">10</span>
                        <input type="range" id="modes-slider" min="3" max="20" step="1" value="10" style="width: 100%;" />
                    </label>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px;">
                <button id="play-btn" style="width: 120px;">▶ Play</button>
                <button id="pause-btn" style="width: 120px;">⏸ Pause</button>
                <button id="reset-btn" style="width: 120px;">⟲ Reset</button>
            </div>
        </div>
        
        <canvas id="wave-canvas" width="600" height="600" style="border: 1px solid #ddd; width: 100%; display: block; margin-top: 20px; background: white;"></canvas>
        
        <div style="margin-top: 15px; padding: 10px; background: #f0f0f0; color: #000; border-radius: 5px;">
            <strong>Visualization:</strong> Color represents displacement (blue = negative, white = zero, red = positive)<br>
            <strong>Current Mode Energy Distribution:</strong> <span id="mode-info">Loading...</span>
        </div>
        
        <div id="frequency-display" style="margin-top: 10px; padding: 10px; background: #e6f2ff; color: #000; border-radius: 5px;">
            <strong>Fundamental Frequency:</strong> <span id="omega-11">--</span> rad/s<br>
            <strong>Active Modes:</strong> <span id="active-modes">--</span>
        </div>
    `;
    
    // Get DOM elements
    const canvas = container.querySelector('#wave-canvas');
    const ctx = canvas.getContext('2d');
    const cSlider = container.querySelector('#c-slider');
    const aSlider = container.querySelector('#a-slider');
    const bSlider = container.querySelector('#b-slider');
    const timeSlider = container.querySelector('#time-slider');
    const shapeSelect = container.querySelector('#shape-select');
    const ampSlider = container.querySelector('#amp-slider');
    const modesSlider = container.querySelector('#modes-slider');
    const cVal = container.querySelector('#c-val');
    const aVal = container.querySelector('#a-val');
    const bVal = container.querySelector('#b-val');
    const timeVal = container.querySelector('#time-val');
    const ampVal = container.querySelector('#amp-val');
    const modesVal = container.querySelector('#modes-val');
    const playBtn = container.querySelector('#play-btn');
    const pauseBtn = container.querySelector('#pause-btn');
    const resetBtn = container.querySelector('#reset-btn');
    const modeInfo = container.querySelector('#mode-info');
    const omega11Display = container.querySelector('#omega-11');
    const activeModesDisplay = container.querySelector('#active-modes');
    
    // Simulation state
    let c = 1.0;
    let a = 2.0;
    let b = 2.0;
    let t = 0.0;
    let amp = 1.0;
    let maxModes = 10;
    let shape = 'gaussian';
    let isPlaying = false;
    let animationId = null;
    let coefficients = null;
    
    // Update slider displays
    cSlider.addEventListener('input', () => {
        c = parseFloat(cSlider.value);
        cVal.textContent = c.toFixed(1);
        computeCoefficients();
        if (!isPlaying) draw();
    });
    
    aSlider.addEventListener('input', () => {
        a = parseFloat(aSlider.value);
        aVal.textContent = a.toFixed(1);
        computeCoefficients();
        if (!isPlaying) draw();
    });
    
    bSlider.addEventListener('input', () => {
        b = parseFloat(bSlider.value);
        bVal.textContent = b.toFixed(1);
        computeCoefficients();
        if (!isPlaying) draw();
    });
    
    timeSlider.addEventListener('input', () => {
        t = parseFloat(timeSlider.value);
        timeVal.textContent = t.toFixed(2);
        if (!isPlaying) draw();
    });
    
    ampSlider.addEventListener('input', () => {
        amp = parseFloat(ampSlider.value);
        ampVal.textContent = amp.toFixed(1);
        computeCoefficients();
        if (!isPlaying) draw();
    });
    
    modesSlider.addEventListener('input', () => {
        maxModes = parseInt(modesSlider.value);
        modesVal.textContent = maxModes;
        computeCoefficients();
        if (!isPlaying) draw();
    });
    
    shapeSelect.addEventListener('change', () => {
        shape = shapeSelect.value;
        computeCoefficients();
        if (!isPlaying) draw();
    });
    
    // Initial displacement functions
    function f(x, y) {
        switch(shape) {
            case 'gaussian': {
                const x0 = a / 2;
                const y0 = b / 2;
                const sigma = Math.min(a, b) / 4;
                const r2 = (x - x0) ** 2 + (y - y0) ** 2;
                return amp * Math.exp(-r2 / (2 * sigma ** 2));
            }
            case 'mode':
                return amp * Math.sin(Math.PI * x / a) * Math.sin(Math.PI * y / b);
            case 'corner': {
                const x0 = a / 4;
                const y0 = b / 4;
                const sigma = Math.min(a, b) / 6;
                const r2 = (x - x0) ** 2 + (y - y0) ** 2;
                return amp * Math.exp(-r2 / (2 * sigma ** 2));
            }
            case 'ridge':
                return (x > a / 4 && x < 3 * a / 4) ? amp * Math.sin(Math.PI * y / b) : 0;
            case 'double': {
                const x1 = a / 3, y1 = b / 2;
                const x2 = 2 * a / 3, y2 = b / 2;
                const sigma = Math.min(a, b) / 6;
                const r1_2 = (x - x1) ** 2 + (y - y1) ** 2;
                const r2_2 = (x - x2) ** 2 + (y - y2) ** 2;
                return amp * (Math.exp(-r1_2 / (2 * sigma ** 2)) + 
                             Math.exp(-r2_2 / (2 * sigma ** 2))) / 2;
            }
            default:
                return 0;
        }
    }
    
    // Initial velocity (zero for all cases)
    function g(x, y) {
        return 0;
    }
    
    // Compute Fourier coefficients
    function computeCoefficients() {
        coefficients = [];
        let totalEnergy = 0;
        let activeModes = 0;
        
        // Integration parameters
        const nx = 50;
        const ny = 50;
        const dx = a / nx;
        const dy = b / ny;
        
        for (let m = 1; m <= maxModes; m++) {
            coefficients[m] = [];
            for (let n = 1; n <= maxModes; n++) {
                // Compute A_mn using double Riemann sum
                let A_mn = 0;
                for (let i = 0; i < nx; i++) {
                    for (let j = 0; j < ny; j++) {
                        const x = (i + 0.5) * dx;
                        const y = (j + 0.5) * dy;
                        A_mn += f(x, y) * Math.sin(m * Math.PI * x / a) * 
                                Math.sin(n * Math.PI * y / b) * dx * dy;
                    }
                }
                A_mn *= 4 / (a * b);
                
                // B_mn = 0 since g(x,y) = 0
                const B_mn = 0;
                
                // Store coefficients
                coefficients[m][n] = { A: A_mn, B: B_mn };
                
                // Track energy
                const omega_mn = c * Math.PI * Math.sqrt((m / a) ** 2 + (n / b) ** 2);
                const energy = (A_mn ** 2 + B_mn ** 2) * omega_mn ** 2;
                totalEnergy += energy;
                
                if (Math.abs(A_mn) > 1e-6 || Math.abs(B_mn) > 1e-6) {
                    activeModes++;
                }
            }
        }
        
        // Update displays
        const omega_11 = c * Math.PI * Math.sqrt(1 / (a ** 2) + 1 / (b ** 2));
        omega11Display.textContent = omega_11.toFixed(3);
        activeModesDisplay.textContent = `${activeModes} modes (out of ${maxModes * maxModes})`;
    }
    
    // Evaluate solution at (x, y, t)
    function u(x, y, time) {
        let sum = 0;
        
        for (let m = 1; m <= maxModes; m++) {
            for (let n = 1; n <= maxModes; n++) {
                const omega_mn = c * Math.PI * Math.sqrt((m / a) ** 2 + (n / b) ** 2);
                const A_mn = coefficients[m][n].A;
                const B_mn = coefficients[m][n].B;
                
                const spatial = Math.sin(m * Math.PI * x / a) * Math.sin(n * Math.PI * y / b);
                const temporal = A_mn * Math.cos(omega_mn * time) + B_mn * Math.sin(omega_mn * time);
                
                sum += spatial * temporal;
            }
        }
        
        return sum;
    }
    
    // Color mapping: blue-white-red for negative-zero-positive
    function valueToColor(value, maxAbs) {
        // Normalize to [-1, 1]
        const normalized = value / maxAbs;
        
        // Create color gradient
        let r, g, b;
        if (normalized < 0) {
            // Blue to white
            const t = normalized + 1; // maps [-1, 0] to [0, 1]
            r = Math.floor(255 * t);
            g = Math.floor(255 * t);
            b = 255;
        } else {
            // White to red
            const t = 1 - normalized; // maps [0, 1] to [1, 0]
            r = 255;
            g = Math.floor(255 * t);
            b = Math.floor(255 * t);
        }
        
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    // Drawing function
    function draw() {
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // Grid resolution
        const gridSize = 80;
        const dx_canvas = width / gridSize;
        const dy_canvas = height / gridSize;
        
        // Compute values and find max for color scaling
        const values = [];
        let maxAbs = 0;
        
        for (let i = 0; i < gridSize; i++) {
            values[i] = [];
            for (let j = 0; j < gridSize; j++) {
                const x = (i / gridSize) * a;
                const y = (j / gridSize) * b;
                const val = u(x, y, t);
                values[i][j] = val;
                maxAbs = Math.max(maxAbs, Math.abs(val));
            }
        }
        
        // Avoid division by zero
        if (maxAbs < 1e-10) maxAbs = 1;
        
        // Draw colored rectangles
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const val = values[i][j];
                ctx.fillStyle = valueToColor(val, maxAbs);
                ctx.fillRect(i * dx_canvas, j * dy_canvas, dx_canvas, dy_canvas);
            }
        }
        
        // Draw grid lines
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i <= gridSize; i++) {
            ctx.beginPath();
            ctx.moveTo(i * dx_canvas, 0);
            ctx.lineTo(i * dx_canvas, height);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(0, i * dy_canvas);
            ctx.lineTo(width, i * dy_canvas);
            ctx.stroke();
        }
        
        // Draw border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, width, height);
        
        // Display max displacement
        modeInfo.textContent = `Max displacement: ${maxAbs.toFixed(4)}`;
    }
    
    // Animation loop
    function animate() {
        if (!isPlaying) return;
        
        t += 0.03;
        if (t > 5.0) t = 0;
        
        timeSlider.value = t;
        timeVal.textContent = t.toFixed(2);
        
        draw();
        animationId = requestAnimationFrame(animate);
    }
    
    // Control buttons
    playBtn.addEventListener('click', () => {
        if (!isPlaying) {
            isPlaying = true;
            playBtn.disabled = true;
            pauseBtn.disabled = false;
            animate();
        }
    });
    
    pauseBtn.addEventListener('click', () => {
        isPlaying = false;
        playBtn.disabled = false;
        pauseBtn.disabled = true;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    });
    
    resetBtn.addEventListener('click', () => {
        isPlaying = false;
        playBtn.disabled = false;
        pauseBtn.disabled = true;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        t = 0;
        timeSlider.value = 0;
        timeVal.textContent = '0.00';
        computeCoefficients();
        draw();
    });
    
    // Initial state
    pauseBtn.disabled = true;
    computeCoefficients();
    draw();
    
    console.log('2D wave equation simulation loaded successfully!');
})();