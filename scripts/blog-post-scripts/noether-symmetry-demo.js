// Noether's Theorem: Symmetries and Conservation Laws Demo
// Interactive visualization showing how symmetries lead to conserved quantities

(function() {
    const container = window.currentCodeContainer;
    if (!container) {
        console.error('Code container not found!');
        return;
    }
    
    // Create HTML structure
    container.innerHTML = `
        <h3>Symmetries and Conservation Laws</h3>
        <p>Watch how different symmetries of the system lead to conserved quantities via Noether's theorem!</p>
        
        <div class="controls">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <div>
                    <h4 style="margin-top: 0;">Select Symmetry</h4>
                    <label style="display: flex; flex-direction: column;">
                        Symmetry Type:
                        <select id="symmetry-select" style="width: 100%; padding: 5px;">
                            <option value="time">Time Translation → Energy Conservation</option>
                            <option value="space">Spatial Translation → Momentum Conservation</option>
                            <option value="rotation">Rotation → Angular Momentum Conservation</option>
                            <option value="none">No Symmetry → No Conservation</option>
                        </select>
                    </label>
                    <label style="display: flex; flex-direction: column; margin-top: 10px;">
                        Potential Type:
                        <select id="potential-select" style="width: 100%; padding: 5px;">
                            <option value="none">None (Free particle)</option>
                            <option value="harmonic">Harmonic Oscillator</option>
                            <option value="central">Central Force</option>
                            <option value="asymmetric">Asymmetric Well</option>
                        </select>
                    </label>
                </div>
                
                <div>
                    <h4 style="margin-top: 0;">Particle Properties</h4>
                    <label style="display: flex; flex-direction: column;">
                        Initial Speed: <span id="speed-val" style="font-weight: bold;">2.0</span>
                        <input type="range" id="speed-slider" min="0.5" max="4.0" step="0.1" value="2.0" style="width: 100%;" />
                    </label>
                    <label style="display: flex; flex-direction: column; margin-top: 10px;">
                        Initial Angle (deg): <span id="angle-val" style="font-weight: bold;">45</span>
                        <input type="range" id="angle-slider" min="0" max="360" step="5" value="45" style="width: 100%;" />
                    </label>
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: center; margin-top: 15px;">
                <button id="start-btn" style="width: 120px;">▶ Start</button>
                <button id="pause-btn" style="width: 120px;">⏸ Pause</button>
                <button id="reset-btn" style="width: 120px;">⟲ Reset</button>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 20px; margin-top: 20px;">
            <div>
                <h4 style="margin-top: 0; text-align: center;">Particle Trajectory</h4>
                <canvas id="trajectory-canvas" width="600" height="600" style="border: 1px solid #ddd; width: 100%; display: block; background: white;"></canvas>
            </div>
            
            <div>
                <h4 style="margin-top: 0; text-align: center;">Conserved Quantities</h4>
                <canvas id="conserved-canvas" width="400" height="600" style="border: 1px solid #ddd; width: 100%; display: block; background: white;"></canvas>
            </div>
        </div>
        
        <div style="margin-top: 15px; padding: 10px; background: #f0f0f0; color: #000; border-radius: 5px;">
            <strong>Current Symmetry:</strong> <span id="symmetry-info">Time translation</span><br>
            <strong>Conserved Quantity:</strong> <span id="conserved-info">Energy E</span><br>
            <strong>Conservation Status:</strong> <span id="conservation-status" style="font-weight: bold; color: #4CAF50;">Conserved ✓</span><br>
            <strong>Relative Change:</strong> <span id="relative-change">0.00%</span>
        </div>
        
        <div style="margin-top: 10px; padding: 10px; background: #e6f2ff; color: #000; border-radius: 5px; font-size: 0.9rem;">
            <strong>Theory:</strong> Noether's theorem states that for each continuous symmetry of the Lagrangian, there exists a conserved quantity.
            The simulation shows this in action: when the selected symmetry is present in the potential, the corresponding quantity remains constant.
        </div>
    `;
    
    // Get DOM elements
    const canvas = container.querySelector('#trajectory-canvas');
    const ctx = canvas.getContext('2d');
    const conservedCanvas = container.querySelector('#conserved-canvas');
    const conservedCtx = conservedCanvas.getContext('2d');
    
    const symmetrySelect = container.querySelector('#symmetry-select');
    const potentialSelect = container.querySelector('#potential-select');
    const speedSlider = container.querySelector('#speed-slider');
    const angleSlider = container.querySelector('#angle-slider');
    const speedVal = container.querySelector('#speed-val');
    const angleVal = container.querySelector('#angle-val');
    const startBtn = container.querySelector('#start-btn');
    const pauseBtn = container.querySelector('#pause-btn');
    const resetBtn = container.querySelector('#reset-btn');
    
    const symmetryInfo = container.querySelector('#symmetry-info');
    const conservedInfo = container.querySelector('#conserved-info');
    const conservationStatus = container.querySelector('#conservation-status');
    const relativeChange = container.querySelector('#relative-change');
    
    // Physics parameters
    const m = 1.0;  // mass
    const dt = 0.005;  // time step (smaller for better accuracy)
    let time = 0;
    let isRunning = false;
    let animationId = null;
    
    // Particle state
    let particle = {
        x: 0,
        y: 0,
        vx: 0,
        vy: 0
    };
    
    let initialState = { ...particle };
    let trajectory = [];
    let conservedHistory = [];
    let initialConservedValue = 0;
    
    // Update slider displays
    speedSlider.addEventListener('input', () => {
        speedVal.textContent = parseFloat(speedSlider.value).toFixed(1);
    });
    
    angleSlider.addEventListener('input', () => {
        angleVal.textContent = angleSlider.value;
    });
    
    // Potential energy functions
    function V(x, y, type) {
        const r = Math.sqrt(x * x + y * y);
        
        switch(type) {
            case 'none':
                return 0;
            case 'harmonic':
                return 0.5 * (x * x + y * y);  // V = 0.5(x² + y²)
            case 'central':
                return r > 0.1 ? -1 / r : -10;  // V = -1/r (attractive central force)
            case 'asymmetric':
                return 0.5 * x * x + 0.2 * y * y + 0.1 * x * y;  // Asymmetric quadratic
            default:
                return 0;
        }
    }
    
    // Force (negative gradient of potential) - ANALYTIC for better accuracy
    function getForce(x, y, type) {
        const r = Math.sqrt(x * x + y * y);
        
        switch(type) {
            case 'none':
                return { fx: 0, fy: 0 };
                
            case 'harmonic':
                // F = -∇V = -∇(0.5(x² + y²)) = -(x, y)
                return { fx: -x, fy: -y };
                
            case 'central':
                // F = -∇V = -∇(-1/r) = -1/r² * r̂
                if (r < 0.1) {
                    // Near origin, use constant strong force to avoid singularity
                    return { fx: 0, fy: 0 };
                }
                const forceMag = -1 / (r * r * r);  // -1/r³ because we multiply by (x,y) not (x/r, y/r)
                return { fx: forceMag * x, fy: forceMag * y };
                
            case 'asymmetric':
                // F = -∇V = -∇(0.5x² + 0.2y² + 0.1xy) = -(x + 0.1y, 0.4y + 0.1x)
                return { fx: -(x + 0.1 * y), fy: -(0.4 * y + 0.1 * x) };
                
            default:
                return { fx: 0, fy: 0 };
        }
    }
    
    // Calculate conserved quantity based on current symmetry
    function calculateConserved(state, symmetryType) {
        const { x, y, vx, vy } = state;
        const potType = potentialSelect.value;
        
        switch(symmetryType) {
            case 'time':
                // Energy: E = (1/2)mv² + V
                const KE = 0.5 * m * (vx * vx + vy * vy);
                const PE = V(x, y, potType);
                return KE + PE;
                
            case 'space':
                // Momentum (x-component): px = mvx
                return m * vx;
                
            case 'rotation':
                // Angular momentum (z-component): Lz = x*vy - y*vx
                return m * (x * vy - y * vx);
                
            case 'none':
                // No conserved quantity
                return 0;
                
            default:
                return 0;
        }
    }
    
    // Time evolution using Velocity Verlet integration
    function evolve() {
        const potType = potentialSelect.value;
        
        // Calculate force at current position
        const force = getForce(particle.x, particle.y, potType);
        
        // Update position: x(t + dt) = x(t) + vx*dt + 0.5*ax*dt²
        particle.x += particle.vx * dt + 0.5 * (force.fx / m) * dt * dt;
        particle.y += particle.vy * dt + 0.5 * (force.fy / m) * dt * dt;
        
        // Calculate force at new position
        const forceNew = getForce(particle.x, particle.y, potType);
        
        // Update velocity: vx(t + dt) = vx(t) + 0.5*(ax(t) + ax(t+dt))*dt
        particle.vx += 0.5 * (force.fx + forceNew.fx) / m * dt;
        particle.vy += 0.5 * (force.fy + forceNew.fy) / m * dt;
        
        time += dt;
        
        // Store trajectory point
        trajectory.push({ x: particle.x, y: particle.y });
        
        // Keep trajectory length manageable
        if (trajectory.length > 1000) {
            trajectory.shift();
        }
        
        // Calculate and store conserved quantity
        const conservedValue = calculateConserved(particle, symmetrySelect.value);
        conservedHistory.push({ t: time, value: conservedValue });
        
        if (conservedHistory.length > 500) {
            conservedHistory.shift();
        }
        
        // Update conservation status
        if (initialConservedValue !== 0) {
            const relChange = Math.abs((conservedValue - initialConservedValue) / initialConservedValue) * 100;
            relativeChange.textContent = relChange.toFixed(2) + '%';
            
            if (relChange < 1) {
                conservationStatus.textContent = 'Conserved ✓';
                conservationStatus.style.color = '#4CAF50';
            } else if (relChange < 5) {
                conservationStatus.textContent = 'Approximately conserved ~';
                conservationStatus.style.color = '#FF9800';
            } else {
                conservationStatus.textContent = 'Not conserved ✗';
                conservationStatus.style.color = '#f44336';
            }
        }
    }
    
    // Drawing functions
    function drawTrajectory() {
        const width = canvas.width;
        const height = canvas.height;
        const scale = 60;  // pixels per unit
        const centerX = width / 2;
        const centerY = height / 2;
        
        // Clear canvas
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // Draw grid
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        for (let i = -5; i <= 5; i++) {
            // Vertical lines
            ctx.beginPath();
            ctx.moveTo(centerX + i * scale, 0);
            ctx.lineTo(centerX + i * scale, height);
            ctx.stroke();
            
            // Horizontal lines
            ctx.beginPath();
            ctx.moveTo(0, centerY + i * scale);
            ctx.lineTo(width, centerY + i * scale);
            ctx.stroke();
        }
        
        // Draw axes
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX, 0);
        ctx.lineTo(centerX, height);
        ctx.stroke();
        
        // Draw potential energy contours
        const potType = potentialSelect.value;
        if (potType !== 'none') {
            ctx.strokeStyle = 'rgba(200, 200, 255, 0.3)';
            ctx.lineWidth = 1;
            
            const levels = [0.5, 1.0, 2.0, 4.0];
            levels.forEach(level => {
                ctx.beginPath();
                let firstPoint = true;
                
                for (let angle = 0; angle < 2 * Math.PI; angle += 0.05) {
                    for (let r = 0.1; r < 8; r += 0.1) {
                        const x = r * Math.cos(angle);
                        const y = r * Math.sin(angle);
                        
                        if (Math.abs(V(x, y, potType) - level) < 0.1) {
                            const px = centerX + x * scale;
                            const py = centerY - y * scale;
                            
                            if (firstPoint) {
                                ctx.moveTo(px, py);
                                firstPoint = false;
                            } else {
                                ctx.lineTo(px, py);
                            }
                            break;
                        }
                    }
                }
                ctx.stroke();
            });
        }
        
        // Draw trajectory
        if (trajectory.length > 1) {
            ctx.strokeStyle = '#00458b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let i = 0; i < trajectory.length; i++) {
                const px = centerX + trajectory[i].x * scale;
                const py = centerY - trajectory[i].y * scale;
                
                if (i === 0) {
                    ctx.moveTo(px, py);
                } else {
                    ctx.lineTo(px, py);
                }
            }
            ctx.stroke();
        }
        
        // Draw current particle
        const px = centerX + particle.x * scale;
        const py = centerY - particle.y * scale;
        
        ctx.fillStyle = '#FF6B6B';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        
        // Draw velocity vector
        ctx.strokeStyle = '#4CAF50';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + particle.vx * 20, py - particle.vy * 20);
        ctx.stroke();
        
        // Arrow head
        const angle = Math.atan2(-particle.vy, particle.vx);
        const arrowLength = 10;
        ctx.beginPath();
        ctx.moveTo(px + particle.vx * 20, py - particle.vy * 20);
        ctx.lineTo(
            px + particle.vx * 20 - arrowLength * Math.cos(angle - Math.PI / 6),
            py - particle.vy * 20 + arrowLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(px + particle.vx * 20, py - particle.vy * 20);
        ctx.lineTo(
            px + particle.vx * 20 - arrowLength * Math.cos(angle + Math.PI / 6),
            py - particle.vy * 20 + arrowLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.stroke();
        
        // Draw labels
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('x', width - 20, centerY - 10);
        ctx.fillText('y', centerX + 15, 20);
        ctx.fillText(`t = ${time.toFixed(1)}s`, width - 50, 30);
    }
    
    function drawConserved() {
        const width = conservedCanvas.width;
        const height = conservedCanvas.height;
        
        // Clear canvas
        conservedCtx.fillStyle = 'white';
        conservedCtx.fillRect(0, 0, width, height);
        
        if (conservedHistory.length < 2) return;
        
        // Find min and max values
        let minVal = Infinity;
        let maxVal = -Infinity;
        conservedHistory.forEach(point => {
            if (point.value < minVal) minVal = point.value;
            if (point.value > maxVal) maxVal = point.value;
        });
        
        // Ensure minimum range for display (avoid all labels showing same value)
        let valueRange = maxVal - minVal;
        if (valueRange < 0.01) {
            // If range is tiny, expand it symmetrically around the mean
            const mean = (maxVal + minVal) / 2;
            const minRange = 0.1;  // Minimum display range
            minVal = mean - minRange / 2;
            maxVal = mean + minRange / 2;
            valueRange = maxVal - minVal;
        } else {
            // Add padding
            const padding = valueRange * 0.1;
            minVal -= padding;
            maxVal += padding;
            valueRange = maxVal - minVal;
        }
        
        // Draw axes
        conservedCtx.strokeStyle = '#888';
        conservedCtx.lineWidth = 1;
        
        const marginLeft = 60;
        const marginRight = 20;
        const marginTop = 20;
        const marginBottom = 40;
        
        const plotWidth = width - marginLeft - marginRight;
        const plotHeight = height - marginTop - marginBottom;
        
        // Y-axis
        conservedCtx.beginPath();
        conservedCtx.moveTo(marginLeft, marginTop);
        conservedCtx.lineTo(marginLeft, height - marginBottom);
        conservedCtx.stroke();
        
        // X-axis
        conservedCtx.beginPath();
        conservedCtx.moveTo(marginLeft, height - marginBottom);
        conservedCtx.lineTo(width - marginRight, height - marginBottom);
        conservedCtx.stroke();
        
        // Y-axis labels
        conservedCtx.fillStyle = '#000';
        conservedCtx.font = '12px Arial';
        conservedCtx.textAlign = 'right';
        conservedCtx.textBaseline = 'middle';
        
        for (let i = 0; i <= 5; i++) {
            const val = minVal + (maxVal - minVal) * i / 5;
            const y = height - marginBottom - plotHeight * i / 5;
            conservedCtx.fillText(val.toFixed(2), marginLeft - 5, y);
            
            conservedCtx.strokeStyle = '#e0e0e0';
            conservedCtx.beginPath();
            conservedCtx.moveTo(marginLeft, y);
            conservedCtx.lineTo(width - marginRight, y);
            conservedCtx.stroke();
        }
        
        // X-axis labels
        conservedCtx.textAlign = 'center';
        conservedCtx.textBaseline = 'top';
        
        const tMin = conservedHistory[0].t;
        const tMax = conservedHistory[conservedHistory.length - 1].t;
        const tRange = tMax - tMin || 1;
        
        for (let i = 0; i <= 4; i++) {
            const t = tMin + tRange * i / 4;
            const x = marginLeft + plotWidth * i / 4;
            conservedCtx.fillText(t.toFixed(1), x, height - marginBottom + 5);
        }
        
        // Draw the conserved quantity line
        conservedCtx.strokeStyle = '#00458b';
        conservedCtx.lineWidth = 2;
        conservedCtx.beginPath();
        
        conservedHistory.forEach((point, i) => {
            const x = marginLeft + (point.t - tMin) / tRange * plotWidth;
            const y = height - marginBottom - (point.value - minVal) / valueRange * plotHeight;
            
            if (i === 0) {
                conservedCtx.moveTo(x, y);
            } else {
                conservedCtx.lineTo(x, y);
            }
        });
        conservedCtx.stroke();
        
        // Draw initial value line
        conservedCtx.strokeStyle = '#4CAF50';
        conservedCtx.lineWidth = 1;
        conservedCtx.setLineDash([5, 5]);
        const y0 = height - marginBottom - (initialConservedValue - minVal) / valueRange * plotHeight;
        conservedCtx.beginPath();
        conservedCtx.moveTo(marginLeft, y0);
        conservedCtx.lineTo(width - marginRight, y0);
        conservedCtx.stroke();
        conservedCtx.setLineDash([]);
        
        // Labels
        conservedCtx.fillStyle = '#000';
        conservedCtx.font = 'bold 14px Arial';
        conservedCtx.textAlign = 'center';
        conservedCtx.textBaseline = 'middle';
        
        // Y-axis label
        conservedCtx.save();
        conservedCtx.translate(15, height / 2);
        conservedCtx.rotate(-Math.PI / 2);
        conservedCtx.fillText(getConservedLabel(), 0, 0);
        conservedCtx.restore();
        
        // X-axis label
        conservedCtx.fillText('Time (s)', width / 2, height - 10);
    }
    
    function getConservedLabel() {
        switch(symmetrySelect.value) {
            case 'time':
                return 'Energy E';
            case 'space':
                return 'Momentum px';
            case 'rotation':
                return 'Angular Momentum Lz';
            case 'none':
                return 'No conserved quantity';
            default:
                return '';
        }
    }
    
    function updateSymmetryInfo() {
        const symmetry = symmetrySelect.value;
        
        switch(symmetry) {
            case 'time':
                symmetryInfo.textContent = 'Time translation invariance';
                conservedInfo.textContent = 'Energy E = ½mv² + V';
                break;
            case 'space':
                symmetryInfo.textContent = 'Spatial translation invariance (x-direction)';
                conservedInfo.textContent = 'Momentum px = mvx';
                break;
            case 'rotation':
                symmetryInfo.textContent = 'Rotational invariance (about z-axis)';
                conservedInfo.textContent = 'Angular momentum Lz = m(xvy - yvx)';
                break;
            case 'none':
                symmetryInfo.textContent = 'No symmetry';
                conservedInfo.textContent = 'None';
                break;
        }
    }
    
    // Control functions
    function initialize() {
        const speed = parseFloat(speedSlider.value);
        const angleDeg = parseFloat(angleSlider.value);
        const angleRad = angleDeg * Math.PI / 180;
        
        particle = {
            x: -3,
            y: 0,
            vx: speed * Math.cos(angleRad),
            vy: speed * Math.sin(angleRad)
        };
        
        initialState = { ...particle };
        trajectory = [{ x: particle.x, y: particle.y }];
        conservedHistory = [];
        time = 0;
        
        initialConservedValue = calculateConserved(particle, symmetrySelect.value);
        conservedHistory.push({ t: time, value: initialConservedValue });
        
        updateSymmetryInfo();
        drawTrajectory();
        drawConserved();
    }
    
    function animate() {
        if (!isRunning) return;
        
        for (let i = 0; i < 5; i++) {  // Multiple steps per frame for smoothness
            evolve();
        }
        
        drawTrajectory();
        drawConserved();
        
        animationId = requestAnimationFrame(animate);
    }
    
    // Event listeners
    startBtn.addEventListener('click', () => {
        if (!isRunning) {
            isRunning = true;
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            animate();
        }
    });
    
    pauseBtn.addEventListener('click', () => {
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    });
    
    resetBtn.addEventListener('click', () => {
        isRunning = false;
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        initialize();
    });
    
    symmetrySelect.addEventListener('change', () => {
        if (!isRunning) {
            initialize();
        }
    });
    
    potentialSelect.addEventListener('change', () => {
        if (!isRunning) {
            initialize();
        }
    });
    
    // Initial state
    pauseBtn.disabled = true;
    initialize();
    
    console.log('Noether symmetry demonstration loaded successfully!');
})();