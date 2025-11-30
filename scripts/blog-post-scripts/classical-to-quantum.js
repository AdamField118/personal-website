// Classical to Quantum Transition Visualization
// Shows how reducing ℏ transitions from wave behavior to classical particle behavior

(function() {
    const container = window.currentCodeContainer;
    if (!container) {
        console.error('Code container not found!');
        return;
    }
    
    // Create HTML structure
    container.innerHTML = `
        <h3>From Classical Particles to Quantum Waves</h3>
        <p>Adjust ℏ to see the transition from quantum wave packets to classical point particles. Watch how the uncertainty principle emerges!</p>
        
        <div class="controls">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <label style="display: flex; flex-direction: column;">
                    Reduced Planck Constant (ℏ): <span id="hbar-val" style="font-weight: bold;">1.0</span>
                    <input type="range" id="hbar-slider" min="0.1" max="5.0" step="0.1" value="1.0" style="width: 100%;" />
                </label>
                <label style="display: flex; flex-direction: column;">
                    Initial Momentum (p₀): <span id="p0-val" style="font-weight: bold;">3.0</span>
                    <input type="range" id="p0-slider" min="1.0" max="8.0" step="0.5" value="3.0" style="width: 100%;" />
                </label>
                <label style="display: flex; flex-direction: column;">
                    Time: <span id="time-val" style="font-weight: bold;">0.00</span>
                    <input type="range" id="time-slider" min="0" max="5.0" step="0.05" value="0" style="width: 100%;" />
                </label>
                <label style="display: flex; flex-direction: column;">
                    Packet Width (σ₀): <span id="sigma-val" style="font-weight: bold;">1.0</span>
                    <input type="range" id="sigma-slider" min="0.5" max="3.0" step="0.1" value="1.0" style="width: 100%;" />
                </label>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px;">
                <button id="play-btn" style="width: 120px;">▶ Play</button>
                <button id="pause-btn" style="width: 120px;">⏸ Pause</button>
                <button id="reset-btn" style="width: 120px;">⟲ Reset</button>
            </div>
        </div>
        
        <canvas id="quantum-canvas" width="800" height="400" style="border: 1px solid #ddd; width: 100%; max-width: 800px; display: block; margin: 20px auto; background: white;"></canvas>
        
        <div style="margin-top: 15px; padding: 10px; background: #f0f0f0; color: #000; border-radius: 5px;">
            <strong>Probability Distribution:</strong> <span id="prob-type">Quantum wave packet</span><br>
            <strong>Position Uncertainty (Δx):</strong> <span id="delta-x">--</span><br>
            <strong>Momentum Uncertainty (Δp):</strong> <span id="delta-p">--</span><br>
            <strong>Uncertainty Product (ΔxΔp):</strong> <span id="uncertainty-product">--</span><br>
            <strong>Heisenberg Limit (ℏ/2):</strong> <span id="heisenberg-limit">--</span><br><br>
            <span style="color: #00458b; font-weight: bold;">Note:</span> As ℏ → 0, the wave packet approaches a classical point particle (delta function). The uncertainty principle ΔxΔp ≥ ℏ/2 is always satisfied.
        </div>
    `;
    
    // Get DOM elements
    const canvas = container.querySelector('#quantum-canvas');
    const ctx = canvas.getContext('2d');
    const hbarSlider = container.querySelector('#hbar-slider');
    const p0Slider = container.querySelector('#p0-slider');
    const timeSlider = container.querySelector('#time-slider');
    const sigmaSlider = container.querySelector('#sigma-slider');
    const hbarVal = container.querySelector('#hbar-val');
    const p0Val = container.querySelector('#p0-val');
    const timeVal = container.querySelector('#time-val');
    const sigmaVal = container.querySelector('#sigma-val');
    const playBtn = container.querySelector('#play-btn');
    const pauseBtn = container.querySelector('#pause-btn');
    const resetBtn = container.querySelector('#reset-btn');
    const probType = container.querySelector('#prob-type');
    const deltaXDisplay = container.querySelector('#delta-x');
    const deltaPDisplay = container.querySelector('#delta-p');
    const uncertaintyProduct = container.querySelector('#uncertainty-product');
    const heisenbergLimit = container.querySelector('#heisenberg-limit');
    
    // Physics parameters
    let hbar = 1.0;
    let p0 = 3.0;
    let sigma0 = 1.0;
    let t = 0.0;
    let m = 1.0; // mass
    let isPlaying = false;
    let animationId = null;
    
    // Update slider displays
    hbarSlider.addEventListener('input', () => {
        hbar = parseFloat(hbarSlider.value);
        hbarVal.textContent = hbar.toFixed(1);
        updateDescription();
        if (!isPlaying) draw();
    });
    
    p0Slider.addEventListener('input', () => {
        p0 = parseFloat(p0Slider.value);
        p0Val.textContent = p0.toFixed(1);
        if (!isPlaying) draw();
    });
    
    timeSlider.addEventListener('input', () => {
        t = parseFloat(timeSlider.value);
        timeVal.textContent = t.toFixed(2);
        if (!isPlaying) draw();
    });
    
    sigmaSlider.addEventListener('input', () => {
        sigma0 = parseFloat(sigmaSlider.value);
        sigmaVal.textContent = sigma0.toFixed(1);
        if (!isPlaying) draw();
    });
    
    // Update description based on hbar value
    function updateDescription() {
        if (hbar < 0.5) {
            probType.textContent = 'Nearly classical (small ℏ → localized)';
        } else if (hbar < 2.0) {
            probType.textContent = 'Quantum wave packet (moderate ℏ)';
        } else {
            probType.textContent = 'Highly quantum (large ℏ → spread out)';
        }
    }
    
    // Gaussian wave packet probability density
    function probabilityDensity(x, time) {
        // Time evolution of Gaussian wave packet
        // σ(t)² = σ₀² + (ℏt/2mσ₀)²
        const sigmaTerm = (hbar * time) / (2 * m * sigma0);
        const sigmaT = Math.sqrt(sigma0 * sigma0 + sigmaTerm * sigmaTerm);
        
        // Center position: x₀(t) = x₀ + p₀t/m
        const x0T = 100 + (p0 / m) * time * 50; // scaled for display
        
        // Probability density: |ψ|²
        const exponent = -((x - x0T) ** 2) / (2 * sigmaT ** 2);
        const norm = 1 / (sigmaT * Math.sqrt(2 * Math.PI));
        
        return norm * Math.exp(exponent);
    }
    
    // Classical trajectory
    function classicalPosition(time) {
        return 100 + (p0 / m) * time * 50;
    }
    
    // Calculate uncertainties
    function calculateUncertainties(time) {
        const sigmaTerm = (hbar * time) / (2 * m * sigma0);
        const sigmaX = Math.sqrt(sigma0 * sigma0 + sigmaTerm * sigmaTerm);
        const sigmaP = hbar / (2 * sigma0);
        
        return { sigmaX, sigmaP, product: sigmaX * sigmaP };
    }
    
    // Draw function
    function draw() {
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // Draw axes
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        
        const zeroY = height * 0.7;
        ctx.beginPath();
        ctx.moveTo(0, zeroY);
        ctx.lineTo(width, zeroY);
        ctx.stroke();
        
        // Draw probability density
        ctx.fillStyle = 'rgba(0, 69, 139, 0.3)';
        ctx.strokeStyle = '#00458b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const numPoints = 800;
        const scale = 200; // vertical scale factor
        
        // Find max probability for normalization
        let maxProb = 0;
        for (let i = 0; i < numPoints; i++) {
            const x = (i / numPoints) * width;
            const prob = probabilityDensity(x, t);
            if (prob > maxProb) maxProb = prob;
        }
        
        // Draw filled probability distribution
        ctx.moveTo(0, zeroY);
        for (let i = 0; i < numPoints; i++) {
            const x = (i / numPoints) * width;
            const prob = probabilityDensity(x, t);
            const y = zeroY - (prob / maxProb) * scale;
            ctx.lineTo(x, y);
        }
        ctx.lineTo(width, zeroY);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // Draw classical trajectory
        const classicalX = classicalPosition(t);
        if (classicalX >= 0 && classicalX <= width) {
            ctx.strokeStyle = '#FF6B6B';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(classicalX, zeroY - scale - 20);
            ctx.lineTo(classicalX, zeroY + 20);
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.fillStyle = '#FF6B6B';
            ctx.beginPath();
            ctx.arc(classicalX, zeroY, 8, 0, 2 * Math.PI);
            ctx.fill();
            
            ctx.fillStyle = '#000';
            ctx.font = 'bold 12px Arial';
            ctx.fillText('Classical', classicalX - 30, zeroY + 35);
        }
        
        // Draw labels
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.fillText('Position (x)', width - 100, zeroY + 30);
        ctx.fillText('|ψ(x,t)|²', 10, 30);
        ctx.fillText(`t = ${t.toFixed(2)}`, width - 100, 30);
        
        // Update uncertainty displays
        const uncertainties = calculateUncertainties(t);
        deltaXDisplay.textContent = (uncertainties.sigmaX * 50).toFixed(2); // scaled for display
        deltaPDisplay.textContent = uncertainties.sigmaP.toFixed(2);
        uncertaintyProduct.textContent = uncertainties.product.toFixed(2);
        heisenbergLimit.textContent = (hbar / 2).toFixed(2);
        
        // Color code uncertainty product
        const ratio = uncertainties.product / (hbar / 2);
        if (ratio < 1.1) {
            uncertaintyProduct.style.color = '#4CAF50'; // Green - close to limit
        } else if (ratio < 2.0) {
            uncertaintyProduct.style.color = '#FF9800'; // Orange - moderate
        } else {
            uncertaintyProduct.style.color = '#00458b'; // Blue - well above limit
        }
    }
    
    // Animation loop
    function animate() {
        if (!isPlaying) return;
        
        t += 0.05;
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
    updateDescription();
    draw();
    
    console.log('Classical to quantum visualization loaded successfully!');
})();