// Wave Equation Simulation
// Interactive visualization of d'Alembert's solution

(function() {
    const container = window.currentCodeContainer;
    if (!container) {
        console.error('Code container not found!');
        return;
    }
    
    // Create the HTML structure
    container.innerHTML = `
        <h3>1D Wave Equation: Real-Time Simulation</h3>
        <p>Visualizing the solution: u(x,t) = ½[u₀(x-ct) + u₀(x+ct)] + (1/2c)∫ v₀(ξ)dξ</p>
        
        <div class="controls">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <h4 style="margin-top: 0;">Wave Parameters</h4>
                    <label style="display: flex; flex-direction: column;">
                        Wave Speed (c): <span id="c-val" style="font-weight: bold;">1.0</span>
                        <input type="range" id="c-slider" min="0.5" max="3.0" step="0.1" value="1.0" style="width: 100%;" />
                    </label>
                    <label style="display: flex; flex-direction: column; margin-top: 10px;">
                        Time: <span id="time-val" style="font-weight: bold;">0.00</span> s
                        <input type="range" id="time-slider" min="0" max="5.0" step="0.01" value="0" style="width: 100%;" />
                    </label>
                </div>
                
                <div>
                    <h4 style="margin-top: 0;">Initial Conditions</h4>
                    <label style="display: flex; flex-direction: column;">
                        Initial Shape:
                        <select id="shape-select" style="width: 100%; padding: 5px;">
                            <option value="gaussian">Gaussian Pulse</option>
                            <option value="triangle">Triangle (Plucked String)</option>
                            <option value="step">Step Function</option>
                            <option value="sine">Sine Wave</option>
                        </select>
                    </label>
                    <label style="display: flex; flex-direction: column; margin-top: 10px;">
                        Amplitude: <span id="amp-val" style="font-weight: bold;">1.0</span>
                        <input type="range" id="amp-slider" min="0.1" max="2.0" step="0.1" value="1.0" style="width: 100%;" />
                    </label>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px;">
                <button id="play-btn" style="width: 120px;">▶ Play</button>
                <button id="pause-btn" style="width: 120px;">⏸ Pause</button>
                <button id="reset-btn" style="width: 120px;">⟲ Reset</button>
            </div>
        </div>
        
        <canvas id="wave-canvas" width="800" height="400" style="border: 1px solid #ddd; width: 100%; display: block; margin-top: 20px; background: white;"></canvas>
        
        <div style="margin-top: 15px; padding: 10px; background: #f0f0f0; color: #000;border-radius: 5px;">
            <strong>Legend:</strong><br>
            <span style="color: #2563eb;">━━</span> Current Wave u(x,t)<br>
            <span style="color: #dc2626; opacity: 0.5;">- - -</span> Initial Condition u₀(x)<br>
            <span style="color: #16a34a;">━━</span> Right-traveling wave ½u₀(x-ct)<br>
            <span style="color: #ea580c;">━━</span> Left-traveling wave ½u₀(x+ct)
        </div>
    `;
    
    // Get DOM elements
    const canvas = container.querySelector('#wave-canvas');
    const ctx = canvas.getContext('2d');
    const cSlider = container.querySelector('#c-slider');
    const timeSlider = container.querySelector('#time-slider');
    const shapeSelect = container.querySelector('#shape-select');
    const ampSlider = container.querySelector('#amp-slider');
    const cVal = container.querySelector('#c-val');
    const timeVal = container.querySelector('#time-val');
    const ampVal = container.querySelector('#amp-val');
    const playBtn = container.querySelector('#play-btn');
    const pauseBtn = container.querySelector('#pause-btn');
    const resetBtn = container.querySelector('#reset-btn');
    
    // Simulation state
    let c = 1.0;  // wave speed
    let t = 0.0;  // current time
    let amp = 1.0;  // amplitude
    let shape = 'gaussian';
    let isPlaying = false;
    let animationId = null;
    
    // Spatial domain
    const xMin = -10;
    const xMax = 10;
    const numPoints = 400;
    const dx = (xMax - xMin) / numPoints;
    
    // Update slider displays
    cSlider.addEventListener('input', () => {
        c = parseFloat(cSlider.value);
        cVal.textContent = c.toFixed(1);
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
        if (!isPlaying) draw();
    });
    
    shapeSelect.addEventListener('change', () => {
        shape = shapeSelect.value;
        if (!isPlaying) draw();
    });
    
    // Initial displacement functions
    function u0(x) {
        switch(shape) {
            case 'gaussian':
                return amp * Math.exp(-x * x / 2);
            case 'triangle':
                const L = 2;
                return Math.abs(x) <= L ? amp * (1 - Math.abs(x) / L) : 0;
            case 'step':
                return x < 0 ? 0 : amp;
            case 'sine':
                return x >= -Math.PI && x <= Math.PI ? amp * Math.sin(x) : 0;
            default:
                return 0;
        }
    }
    
    // Initial velocity (zero for all cases here)
    function v0(x) {
        return 0;  // For simplicity, v₀ = 0
    }
    
    // d'Alembert's solution for zero initial velocity
    function waveFunction(x, time) {
        // u(x,t) = 0.5 * [u₀(x-ct) + u₀(x+ct)]
        const leftWave = 0.5 * u0(x - c * time);
        const rightWave = 0.5 * u0(x + c * time);
        return leftWave + rightWave;
    }
    
    // Individual traveling waves
    function leftTravelingWave(x, time) {
        return 0.5 * u0(x + c * time);
    }
    
    function rightTravelingWave(x, time) {
        return 0.5 * u0(x - c * time);
    }
    
    // Drawing function
    function draw() {
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // Draw axes
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        
        // Y-axis
        const zeroY = height * 0.5;
        ctx.beginPath();
        ctx.moveTo(0, zeroY);
        ctx.lineTo(width, zeroY);
        ctx.stroke();
        
        // X-axis markers
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        for (let x = -10; x <= 10; x += 2) {
            const pixelX = ((x - xMin) / (xMax - xMin)) * width;
            ctx.fillText(x.toString(), pixelX, zeroY + 15);
        }
        
        // Y-axis markers
        ctx.textAlign = 'right';
        for (let y = -2; y <= 2; y++) {
            if (y === 0) continue;
            const pixelY = zeroY - (y * height * 0.2);
            ctx.fillText(y.toFixed(1), 25, pixelY + 4);
        }
        
        // Scale factor for drawing
        const yScale = height * 0.2;  // 0.2 * height per unit
        
        // Helper function to convert coordinates
        function toPixelX(x) {
            return ((x - xMin) / (xMax - xMin)) * width;
        }
        
        function toPixelY(y) {
            return zeroY - y * yScale;
        }
        
        // Draw initial condition (dashed)
        ctx.strokeStyle = '#dc2626';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 5]);
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        for (let i = 0; i <= numPoints; i++) {
            const x = xMin + i * dx;
            const y = u0(x);
            const px = toPixelX(x);
            const py = toPixelY(y);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 1.0;
        
        // Draw right-traveling wave
        ctx.strokeStyle = '#16a34a';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= numPoints; i++) {
            const x = xMin + i * dx;
            const y = rightTravelingWave(x, t);
            const px = toPixelX(x);
            const py = toPixelY(y);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
        
        // Draw left-traveling wave
        ctx.strokeStyle = '#ea580c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        for (let i = 0; i <= numPoints; i++) {
            const x = xMin + i * dx;
            const y = leftTravelingWave(x, t);
            const px = toPixelX(x);
            const py = toPixelY(y);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
        
        // Draw current wave (sum)
        ctx.strokeStyle = '#2563eb';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let i = 0; i <= numPoints; i++) {
            const x = xMin + i * dx;
            const y = waveFunction(x, t);
            const px = toPixelX(x);
            const py = toPixelY(y);
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        }
        ctx.stroke();
        
        // Draw time indicator
        ctx.fillStyle = '#333';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`t = ${t.toFixed(2)} s`, 10, 25);
    }
    
    // Animation loop
    function animate() {
        if (!isPlaying) return;
        
        t += 0.02;
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
        draw();
    });
    
    // Initial state
    pauseBtn.disabled = true;
    draw();
    
    console.log('Wave equation simulation loaded successfully!');
})();