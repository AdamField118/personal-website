(function() {
    const container = window.currentCodeContainer;
    
    if (!container) {
        console.error('Code container not found');
        return;
    }
    
    // Create HTML structure
    container.innerHTML = `
        <div style="font-family: Arial, sans-serif;">
            <h3>Field Mode Expansion: From Fields to Particles</h3>
            <p>Adjust the occupation numbers for different momentum modes to see how field excitations correspond to particle states. The field configuration shows the real part of φ(x,t).</p>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                <div>
                    <h4>Mode Occupation Numbers</h4>
                    <div id="mode-controls" style="display: flex; flex-direction: column; gap: 10px;">
                        <label style="display: flex; flex-direction: column;">
                            Mode k₁ (low momentum): <span id="n1-val" style="font-weight: bold; color: #00458b;">0</span>
                            <input type="range" id="n1-slider" min="0" max="5" step="1" value="0" style="width: 100%;" />
                        </label>
                        <label style="display: flex; flex-direction: column;">
                            Mode k₂ (medium momentum): <span id="n2-val" style="font-weight: bold; color: #FF6B6B;">0</span>
                            <input type="range" id="n2-slider" min="0" max="5" step="1" value="0" style="width: 100%;" />
                        </label>
                        <label style="display: flex; flex-direction: column;">
                            Mode k₃ (high momentum): <span id="n3-val" style="font-weight: bold; color: #4CAF50;">0</span>
                            <input type="range" id="n3-slider" min="0" max="5" step="1" value="0" style="width: 100%;" />
                        </label>
                    </div>
                </div>
                
                <div>
                    <h4>State Information</h4>
                    <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; color: #000;">
                        <strong>Total particles:</strong> <span id="total-particles">0</span><br>
                        <strong>Total energy:</strong> <span id="total-energy">0.00</span> (in units of m)<br>
                        <strong>State representation:</strong><br>
                        <span id="state-rep" style="font-family: 'Courier New', monospace; font-size: 14px;">|0⟩ (vacuum)</span>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 20px;">
                <label style="display: flex; flex-direction: column; max-width: 300px;">
                    Time: <span id="time-val" style="font-weight: bold;">0.00</span>
                    <input type="range" id="time-slider" min="0" max="10" step="0.1" value="0" style="width: 100%;" />
                </label>
            </div>
            
            <div style="display: flex; gap: 10px; margin: 15px 0;">
                <button id="play-btn" style="padding: 10px 20px; cursor: pointer;">▶ Play</button>
                <button id="pause-btn" style="padding: 10px 20px; cursor: pointer;">⏸ Pause</button>
                <button id="reset-btn" style="padding: 10px 20px; cursor: pointer;">⟲ Reset</button>
            </div>
            
            <canvas id="field-canvas" width="800" height="400" style="border: 1px solid #ddd; width: 100%; max-width: 800px; display: block; margin: 20px auto; background: white;"></canvas>
            
            <div style="margin-top: 15px; padding: 10px; background: #f9f9f9; border-left: 4px solid #00458b; color: #000;">
                <strong>Key insight:</strong> Each particle corresponds to one quantum of excitation in a specific momentum mode. 
                The field φ(x,t) is a superposition of all occupied modes, each oscillating at its characteristic frequency ω_k = √(k² + m²).
            </div>
        </div>
    `;
    
    // Get elements
    const canvas = document.getElementById('field-canvas');
    const ctx = canvas.getContext('2d');
    const n1Slider = document.getElementById('n1-slider');
    const n2Slider = document.getElementById('n2-slider');
    const n3Slider = document.getElementById('n3-slider');
    const n1Val = document.getElementById('n1-val');
    const n2Val = document.getElementById('n2-val');
    const n3Val = document.getElementById('n3-val');
    const timeSlider = document.getElementById('time-slider');
    const timeVal = document.getElementById('time-val');
    const totalParticles = document.getElementById('total-particles');
    const totalEnergy = document.getElementById('total-energy');
    const stateRep = document.getElementById('state-rep');
    const playBtn = document.getElementById('play-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    
    // State variables
    let n1 = 0, n2 = 0, n3 = 0;
    let t = 0;
    let isPlaying = false;
    let animationId = null;
    
    // Physical parameters (natural units, m = 1)
    const m = 1.0;
    const k1 = 0.5;  // low momentum
    const k2 = 1.5;  // medium momentum
    const k3 = 3.0;  // high momentum
    const omega1 = Math.sqrt(k1*k1 + m*m);
    const omega2 = Math.sqrt(k2*k2 + m*m);
    const omega3 = Math.sqrt(k3*k3 + m*m);
    
    // Update functions
    function updateOccupations() {
        n1 = parseInt(n1Slider.value);
        n2 = parseInt(n2Slider.value);
        n3 = parseInt(n3Slider.value);
        
        n1Val.textContent = n1;
        n2Val.textContent = n2;
        n3Val.textContent = n3;
        
        updateStateInfo();
        if (!isPlaying) draw();
    }
    
    function updateTime() {
        t = parseFloat(timeSlider.value);
        timeVal.textContent = t.toFixed(2);
        if (!isPlaying) draw();
    }
    
    function updateStateInfo() {
        const total = n1 + n2 + n3;
        const energy = n1 * omega1 + n2 * omega2 + n3 * omega3;
        
        totalParticles.textContent = total;
        totalEnergy.textContent = energy.toFixed(2);
        
        // Build state representation
        if (total === 0) {
            stateRep.textContent = '|0⟩ (vacuum)';
        } else {
            let parts = [];
            if (n1 > 0) parts.push(`(a†_k₁)^${n1}`);
            if (n2 > 0) parts.push(`(a†_k₂)^${n2}`);
            if (n3 > 0) parts.push(`(a†_k₃)^${n3}`);
            stateRep.textContent = parts.join(' ') + ' |0⟩';
        }
    }
    
    // Field evaluation
    function fieldValue(x, time) {
        // Real part of φ(x,t) = Σ_k [amplitude * cos(kx - ωt)]
        // Amplitude scales with √n for n particles
        const amp1 = Math.sqrt(n1) / Math.sqrt(2 * omega1);
        const amp2 = Math.sqrt(n2) / Math.sqrt(2 * omega2);
        const amp3 = Math.sqrt(n3) / Math.sqrt(2 * omega3);
        
        const phi1 = amp1 * Math.cos(k1 * x - omega1 * time);
        const phi2 = amp2 * Math.cos(k2 * x - omega2 * time);
        const phi3 = amp3 * Math.cos(k3 * x - omega3 * time);
        
        return phi1 + phi2 + phi3;
    }
    
    // Drawing function
    function draw() {
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // Draw axes
        const centerY = height / 2;
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
        
        // Draw field
        const numPoints = 800;
        const xScale = 8 * Math.PI / width;  // spatial scale
        const yScale = 80;  // vertical scale
        
        // Find max for normalization
        let maxVal = 0;
        for (let i = 0; i < numPoints; i++) {
            const x = (i / numPoints) * width * xScale;
            const val = Math.abs(fieldValue(x, t));
            if (val > maxVal) maxVal = val;
        }
        if (maxVal === 0) maxVal = 1;
        
        // Draw individual modes first (lighter)
        if (n1 > 0) {
            ctx.strokeStyle = 'rgba(0, 69, 139, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < numPoints; i++) {
                const x = (i / numPoints) * width * xScale;
                const amp = Math.sqrt(n1) / Math.sqrt(2 * omega1);
                const val = amp * Math.cos(k1 * x - omega1 * t);
                const pixelX = i * (width / numPoints);
                const pixelY = centerY - (val / maxVal) * yScale;
                if (i === 0) ctx.moveTo(pixelX, pixelY);
                else ctx.lineTo(pixelX, pixelY);
            }
            ctx.stroke();
        }
        
        if (n2 > 0) {
            ctx.strokeStyle = 'rgba(255, 107, 107, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < numPoints; i++) {
                const x = (i / numPoints) * width * xScale;
                const amp = Math.sqrt(n2) / Math.sqrt(2 * omega2);
                const val = amp * Math.cos(k2 * x - omega2 * t);
                const pixelX = i * (width / numPoints);
                const pixelY = centerY - (val / maxVal) * yScale;
                if (i === 0) ctx.moveTo(pixelX, pixelY);
                else ctx.lineTo(pixelX, pixelY);
            }
            ctx.stroke();
        }
        
        if (n3 > 0) {
            ctx.strokeStyle = 'rgba(76, 175, 80, 0.3)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < numPoints; i++) {
                const x = (i / numPoints) * width * xScale;
                const amp = Math.sqrt(n3) / Math.sqrt(2 * omega3);
                const val = amp * Math.cos(k3 * x - omega3 * t);
                const pixelX = i * (width / numPoints);
                const pixelY = centerY - (val / maxVal) * yScale;
                if (i === 0) ctx.moveTo(pixelX, pixelY);
                else ctx.lineTo(pixelX, pixelY);
            }
            ctx.stroke();
        }
        
        // Draw total field (bold)
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        for (let i = 0; i < numPoints; i++) {
            const x = (i / numPoints) * width * xScale;
            const val = fieldValue(x, t);
            const pixelX = i * (width / numPoints);
            const pixelY = centerY - (val / maxVal) * yScale;
            if (i === 0) ctx.moveTo(pixelX, pixelY);
            else ctx.lineTo(pixelX, pixelY);
        }
        ctx.stroke();
        
        // Labels
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.fillText('φ(x,t)', 10, 25);
        ctx.fillText('Position x', width - 80, centerY - 10);
        ctx.fillText(`t = ${t.toFixed(2)}`, width - 80, 25);
        
        // Legend
        if (n1 > 0 || n2 > 0 || n3 > 0) {
            let legendY = height - 60;
            ctx.font = '12px Arial';
            
            if (n1 > 0) {
                ctx.strokeStyle = 'rgba(0, 69, 139, 0.5)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(10, legendY);
                ctx.lineTo(30, legendY);
                ctx.stroke();
                ctx.fillStyle = '#00458b';
                ctx.fillText(`k₁ (n=${n1})`, 35, legendY + 4);
                legendY += 15;
            }
            
            if (n2 > 0) {
                ctx.strokeStyle = 'rgba(255, 107, 107, 0.5)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(10, legendY);
                ctx.lineTo(30, legendY);
                ctx.stroke();
                ctx.fillStyle = '#FF6B6B';
                ctx.fillText(`k₂ (n=${n2})`, 35, legendY + 4);
                legendY += 15;
            }
            
            if (n3 > 0) {
                ctx.strokeStyle = 'rgba(76, 175, 80, 0.5)';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(10, legendY);
                ctx.lineTo(30, legendY);
                ctx.stroke();
                ctx.fillStyle = '#4CAF50';
                ctx.fillText(`k₃ (n=${n3})`, 35, legendY + 4);
            }
        }
    }
    
    // Animation
    function animate() {
        if (!isPlaying) return;
        
        t += 0.05;
        if (t > 10) t = 0;
        
        timeSlider.value = t;
        timeVal.textContent = t.toFixed(2);
        
        draw();
        animationId = requestAnimationFrame(animate);
    }
    
    // Event listeners
    n1Slider.addEventListener('input', updateOccupations);
    n2Slider.addEventListener('input', updateOccupations);
    n3Slider.addEventListener('input', updateOccupations);
    timeSlider.addEventListener('input', updateTime);
    
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
        n1 = 0;
        n2 = 0;
        n3 = 0;
        n1Slider.value = 0;
        n2Slider.value = 0;
        n3Slider.value = 0;
        timeSlider.value = 0;
        updateOccupations();
        updateTime();
    });
    
    // Initialize
    pauseBtn.disabled = true;
    updateOccupations();
    draw();
    
    console.log('Field modes demo loaded successfully!');
})();