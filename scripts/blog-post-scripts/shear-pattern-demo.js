// Shear Pattern Demonstration
// Shows characteristic shear patterns from different mass distributions

(function() {
    const container = window.currentCodeContainer;
    if (!container) {
        console.error('Code container not found!');
        return;
    }
    
    container.innerHTML = `
        <h3>Shear Patterns from Different Mass Distributions</h3>
        <p>Observe how the shear field (represented by ellipses) depends on the mass configuration</p>
        
        <div class="controls">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <label style="display: flex; flex-direction: column;">
                    Mass Configuration:
                    <select id="config-select" style="width: 100%; padding: 5px;">
                        <option value="point">Single Point Mass</option>
                        <option value="elliptical">Elliptical Mass</option>
                        <option value="binary">Binary System</option>
                        <option value="cluster">Galaxy Cluster</option>
                    </select>
                </label>
                <label style="display: flex; flex-direction: column;">
                    Shear Strength: <span id="strength-val" style="font-weight: bold;">1.0</span>
                    <input type="range" id="strength-slider" min="0.1" max="3.0" step="0.1" value="1.0" style="width: 100%;" />
                </label>
                <label style="display: flex; flex-direction: column;">
                    Grid Density: <span id="grid-val" style="font-weight: bold;">15</span>
                    <input type="range" id="grid-slider" min="10" max="25" step="1" value="15" style="width: 100%;" />
                </label>
                <label style="display: flex; align-items: center; gap: 10px;">
                    <input type="checkbox" id="show-mass-checkbox" checked />
                    Show Mass Distribution
                </label>
            </div>
        </div>
        
        <canvas id="shear-canvas" width="600" height="600" style="border: 1px solid #ddd; width: 100%; max-width: 600px; display: block; margin: 20px auto; background: white;"></canvas>
        
        <div style="margin-top: 15px; padding: 10px; background: #f0f0f0; color: #000; border-radius: 5px;">
            <strong>Interpretation:</strong> Each ellipse shows the shear at that location<br>
            • <strong>Orientation:</strong> Direction of stretching<br>
            • <strong>Ellipticity:</strong> Magnitude of shear γ<br>
            • <strong>Tangential pattern:</strong> Characteristic of point/spherical mass<br>
            <strong>Note:</strong> In real observations, galaxies are much more elliptical due to intrinsic shapes!
        </div>
    `;
    
    const canvas = container.querySelector('#shear-canvas');
    const ctx = canvas.getContext('2d');
    const configSelect = container.querySelector('#config-select');
    const strengthSlider = container.querySelector('#strength-slider');
    const gridSlider = container.querySelector('#grid-slider');
    const showMassCheckbox = container.querySelector('#show-mass-checkbox');
    const strengthVal = container.querySelector('#strength-val');
    const gridVal = container.querySelector('#grid-val');
    
    let config = 'point';
    let strength = 1.0;
    let gridSize = 15;
    let showMass = true;
    
    configSelect.addEventListener('change', () => {
        config = configSelect.value;
        draw();
    });
    
    strengthSlider.addEventListener('input', () => {
        strength = parseFloat(strengthSlider.value);
        strengthVal.textContent = strength.toFixed(1);
        draw();
    });
    
    gridSlider.addEventListener('input', () => {
        gridSize = parseInt(gridSlider.value);
        gridVal.textContent = gridSize;
        draw();
    });
    
    showMassCheckbox.addEventListener('change', () => {
        showMass = showMassCheckbox.checked;
        draw();
    });
    
    // Mass configurations
    function getMasses() {
        const center = { x: 0, y: 0 };
        
        switch(config) {
            case 'point':
                return [{ x: 0, y: 0, m: 1.0, a: 1.0, b: 1.0, theta: 0 }];
            case 'elliptical':
                return [{ x: 0, y: 0, m: 1.0, a: 1.5, b: 0.7, theta: Math.PI / 6 }];
            case 'binary':
                return [
                    { x: -0.3, y: 0, m: 0.6, a: 1.0, b: 1.0, theta: 0 },
                    { x: 0.3, y: 0, m: 0.4, a: 1.0, b: 1.0, theta: 0 }
                ];
            case 'cluster':
                return [
                    { x: 0, y: 0, m: 1.0, a: 1.2, b: 0.9, theta: 0 },
                    { x: -0.4, y: 0.3, m: 0.3, a: 1.0, b: 1.0, theta: 0 },
                    { x: 0.5, y: -0.2, m: 0.25, a: 1.0, b: 1.0, theta: 0 },
                    { x: -0.3, y: -0.4, m: 0.2, a: 1.0, b: 1.0, theta: 0 }
                ];
            default:
                return [{ x: 0, y: 0, m: 1.0, a: 1.0, b: 1.0, theta: 0 }];
        }
    }
    
    // Calculate shear at position (x, y) from elliptical mass
    function calculateShear(x, y, mass) {
        const dx = x - mass.x;
        const dy = y - mass.y;
        
        // Rotate to mass principal axes
        const cos_t = Math.cos(-mass.theta);
        const sin_t = Math.sin(-mass.theta);
        const dx_rot = dx * cos_t - dy * sin_t;
        const dy_rot = dx * sin_t + dy * cos_t;
        
        // Distance in elliptical coordinates
        const r2 = (dx_rot / mass.a) ** 2 + (dy_rot / mass.b) ** 2;
        const r = Math.sqrt(r2);
        
        if (r < 0.01) return { gamma1: 0, gamma2: 0 };
        
        // Simplified shear (tangential for point mass, modified for elliptical)
        const phi = Math.atan2(dy, dx);
        const gamma_t = mass.m * strength / (r2 + 0.01);  // Tangential shear
        
        // Ellipticity modulation
        const ellipticity = (mass.a - mass.b) / (mass.a + mass.b);
        const gamma_e = gamma_t * ellipticity * Math.cos(2 * (phi - mass.theta));
        
        // Convert to gamma1, gamma2
        const gamma1 = -gamma_t * Math.cos(2 * phi) + gamma_e;
        const gamma2 = -gamma_t * Math.sin(2 * phi);
        
        return { gamma1, gamma2 };
    }
    
    function draw() {
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        const masses = getMasses();
        
        // Draw mass distribution
        if (showMass) {
            masses.forEach(mass => {
                const centerX = width / 2 + mass.x * width / 3;
                const centerY = height / 2 + mass.y * height / 3;
                const radiusX = mass.a * 50;
                const radiusY = mass.b * 50;
                
                ctx.save();
                ctx.translate(centerX, centerY);
                ctx.rotate(mass.theta);
                
                // Draw mass contours
                for (let i = 3; i >= 1; i--) {
                    const alpha = 0.15 * (4 - i);
                    ctx.fillStyle = `rgba(255, 100, 0, ${alpha})`;
                    ctx.beginPath();
                    ctx.ellipse(0, 0, radiusX * i * 0.7, radiusY * i * 0.7, 0, 0, 2 * Math.PI);
                    ctx.fill();
                }
                
                // Core
                ctx.fillStyle = 'rgba(255, 50, 0, 0.5)';
                ctx.beginPath();
                ctx.ellipse(0, 0, radiusX * 0.3, radiusY * 0.3, 0, 0, 2 * Math.PI);
                ctx.fill();
                
                ctx.restore();
            });
        }
        
        // Draw shear field
        const step = width / gridSize;
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const px = (i + 0.5) * step;
                const py = (j + 0.5) * step;
                
                // Convert to physical coordinates
                const x = (px - width / 2) / (width / 3);
                const y = (py - height / 2) / (height / 3);
                
                // Sum shear from all masses
                let gamma1_total = 0;
                let gamma2_total = 0;
                
                masses.forEach(mass => {
                    const shear = calculateShear(x, y, mass);
                    gamma1_total += shear.gamma1;
                    gamma2_total += shear.gamma2;
                });
                
                // Limit shear magnitude for display
                const gamma_mag = Math.sqrt(gamma1_total ** 2 + gamma2_total ** 2);
                if (gamma_mag > 0.5) {
                    gamma1_total *= 0.5 / gamma_mag;
                    gamma2_total *= 0.5 / gamma_mag;
                }
                
                // Draw ellipse representing shear
                drawShearEllipse(ctx, px, py, gamma1_total, gamma2_total, step * 0.4);
            }
        }
        
        // Draw axes
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        ctx.setLineDash([]);
    }
    
    function drawShearEllipse(ctx, x, y, gamma1, gamma2, baseSize) {
        const gamma = Math.sqrt(gamma1 ** 2 + gamma2 ** 2);
        const phi = 0.5 * Math.atan2(gamma2, gamma1);
        
        // Ellipse parameters
        const e = Math.min(gamma * 3, 0.9);  // Ellipticity (scaled for visibility)
        const a = baseSize;
        const b = a * (1 - e) / (1 + e);
        
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(phi);
        
        // Draw ellipse
        ctx.strokeStyle = '#0066cc';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(0, 0, a, b, 0, 0, 2 * Math.PI);
        ctx.stroke();
        
        // Fill lightly
        ctx.fillStyle = 'rgba(0, 102, 204, 0.1)';
        ctx.fill();
        
        ctx.restore();
    }
    
    draw();
    console.log('Shear pattern demo loaded!');
})();