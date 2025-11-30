// Action Wavefronts Visualization
// Shows surfaces of constant action for a particle traveling from A to B

(function() {
    const container = window.currentCodeContainer;
    if (!container) {
        console.error('Code container not found!');
        return;
    }
    
    // Create HTML structure
    container.innerHTML = `
        <h3>Wavefronts of Constant Action</h3>
        <p>Watch how surfaces of constant action S(r,t) propagate outward from point A. The particle trajectory (yellow) is perpendicular to these wavefronts.</p>
        
        <div class="controls">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <label style="display: flex; flex-direction: column;">
                    Particle Mass (m): <span id="mass-val" style="font-weight: bold;">1.0</span>
                    <input type="range" id="mass-slider" min="0.5" max="3.0" step="0.1" value="1.0" style="width: 100%;" />
                </label>
                <label style="display: flex; flex-direction: column;">
                    Potential Strength (V₀): <span id="potential-val" style="font-weight: bold;">0.0</span>
                    <input type="range" id="potential-slider" min="0.0" max="2.0" step="0.1" value="0.0" style="width: 100%;" />
                </label>
                <label style="display: flex; flex-direction: column;">
                    Time: <span id="time-val" style="font-weight: bold;">0.00</span> s
                    <input type="range" id="time-slider" min="0" max="3.0" step="0.05" value="0" style="width: 100%;" />
                </label>
                <label style="display: flex; flex-direction: column;">
                    Number of Wavefronts: <span id="wavefronts-val" style="font-weight: bold;">8</span>
                    <input type="range" id="wavefronts-slider" min="4" max="16" step="1" value="8" style="width: 100%;" />
                </label>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px;">
                <button id="play-btn" style="width: 120px;">▶ Play</button>
                <button id="pause-btn" style="width: 120px;">⏸ Pause</button>
                <button id="reset-btn" style="width: 120px;">⟲ Reset</button>
            </div>
        </div>
        
        <canvas id="action-canvas" width="600" height="600" style="border: 1px solid #ddd; width: 100%; max-width: 600px; display: block; margin: 20px auto; background: white;"></canvas>
        
        <div style="margin-top: 15px; padding: 10px; background: #f0f0f0; color: #000; border-radius: 5px;">
            <strong>Legend:</strong><br>
            <span style="color: #00458b;">━━</span> Wavefronts of constant action S(r,t)<br>
            <span style="color: #FFD700; font-weight: bold;">●</span> Particle position (follows ∇S)<br>
            <span style="color: #FF6B6B;">●</span> Start point A<br>
            <span style="color: #4CAF50;">●</span> End point B<br><br>
            <strong>Note:</strong> The particle trajectory is always perpendicular to the action wavefronts, just as light rays are perpendicular to optical wavefronts.
        </div>
    `;
    
    // Get DOM elements
    const canvas = container.querySelector('#action-canvas');
    const ctx = canvas.getContext('2d');
    const massSlider = container.querySelector('#mass-slider');
    const potentialSlider = container.querySelector('#potential-slider');
    const timeSlider = container.querySelector('#time-slider');
    const wavefrontsSlider = container.querySelector('#wavefronts-slider');
    const massVal = container.querySelector('#mass-val');
    const potentialVal = container.querySelector('#potential-val');
    const timeVal = container.querySelector('#time-val');
    const wavefrontsVal = container.querySelector('#wavefronts-val');
    const playBtn = container.querySelector('#play-btn');
    const pauseBtn = container.querySelector('#pause-btn');
    const resetBtn = container.querySelector('#reset-btn');
    
    // Physics parameters
    let m = 1.0;
    let V0 = 0.0;
    let t = 0.0;
    let numWavefronts = 8;
    let isPlaying = false;
    let animationId = null;
    
    // Points A and B
    const pointA = { x: 150, y: 450 };
    const pointB = { x: 450, y: 150 };
    
    // Update slider displays
    massSlider.addEventListener('input', () => {
        m = parseFloat(massSlider.value);
        massVal.textContent = m.toFixed(1);
        if (!isPlaying) draw();
    });
    
    potentialSlider.addEventListener('input', () => {
        V0 = parseFloat(potentialSlider.value);
        potentialVal.textContent = V0.toFixed(1);
        if (!isPlaying) draw();
    });
    
    timeSlider.addEventListener('input', () => {
        t = parseFloat(timeSlider.value);
        timeVal.textContent = t.toFixed(2);
        if (!isPlaying) draw();
    });
    
    wavefrontsSlider.addEventListener('input', () => {
        numWavefronts = parseInt(wavefrontsSlider.value);
        wavefrontsVal.textContent = numWavefronts;
        if (!isPlaying) draw();
    });
    
    // Potential function (harmonic-like)
    function potential(x, y) {
        const cx = 300;
        const cy = 300;
        const r = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
        return V0 * (r / 200) ** 2;
    }
    
    // Momentum magnitude from energy conservation
    function momentum(x, y, E) {
        const V = potential(x, y);
        const p2 = 2 * m * (E - V);
        return p2 > 0 ? Math.sqrt(p2) : 0;
    }
    
    // Action from point A to (x, y) at time t
    // Simplified: S ≈ ∫ p · ds ≈ <p> · distance
    function actionFromA(x, y, t) {
        const dx = x - pointA.x;
        const dy = y - pointA.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        // Average energy (kinetic + potential)
        const avgV = (potential(pointA.x, pointA.y) + potential(x, y)) / 2;
        const E = 2.0; // Total energy (arbitrary units)
        const avgP = momentum((x + pointA.x) / 2, (y + pointA.y) / 2, E);
        
        // Action ≈ <p> · distance - E · time
        return avgP * dist / 50 - E * t;
    }
    
    // Particle position along classical trajectory
    function particlePosition(time) {
        // Linear interpolation from A to B (for simplicity)
        const frac = Math.min(time / 3.0, 1.0);
        return {
            x: pointA.x + frac * (pointB.x - pointA.x),
            y: pointA.y + frac * (pointB.y - pointA.y)
        };
    }
    
    // Draw function
    function draw() {
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // Draw wavefronts of constant action
        const actionAtA = actionFromA(pointA.x, pointA.y, t);
        const maxAction = actionFromA(pointB.x, pointB.y, t);
        
        for (let i = 1; i <= numWavefronts; i++) {
            const targetAction = actionAtA + i * (maxAction - actionAtA) / (numWavefronts + 1);
            
            ctx.strokeStyle = `hsl(${220 + i * 10}, 80%, ${50 + i * 3}%)`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            // Find contour of constant action
            let firstPoint = true;
            for (let angle = 0; angle < 2 * Math.PI; angle += 0.05) {
                // Search radially from A
                for (let r = 10; r < 500; r += 2) {
                    const x = pointA.x + r * Math.cos(angle);
                    const y = pointA.y + r * Math.sin(angle);
                    
                    if (x < 0 || x > width || y < 0 || y > height) break;
                    
                    const action = actionFromA(x, y, t);
                    
                    if (Math.abs(action - targetAction) < 0.5) {
                        if (firstPoint) {
                            ctx.moveTo(x, y);
                            firstPoint = false;
                        } else {
                            ctx.lineTo(x, y);
                        }
                        break;
                    }
                }
            }
            
            ctx.closePath();
            ctx.stroke();
        }
        
        // Draw particle trajectory
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        ctx.beginPath();
        ctx.moveTo(pointA.x, pointA.y);
        ctx.lineTo(pointB.x, pointB.y);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw points A and B
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath();
        ctx.arc(pointA.x, pointA.y, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.font = 'bold 16px Arial';
        ctx.fillText('A', pointA.x - 20, pointA.y + 5);
        
        ctx.fillStyle = '#4CAF50';
        ctx.beginPath();
        ctx.arc(pointB.x, pointB.y, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.fillText('B', pointB.x + 15, pointB.y + 5);
        
        // Draw particle
        const particle = particlePosition(t);
        ctx.fillStyle = '#FFD700';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, 10, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
    }
    
    // Animation loop
    function animate() {
        if (!isPlaying) return;
        
        t += 0.03;
        if (t > 3.0) t = 0;
        
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
    
    console.log('Action wavefronts visualization loaded successfully!');
})();