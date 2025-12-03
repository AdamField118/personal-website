// Light Bending Demonstration
// Shows how light rays are deflected by a massive object

(function() {
    const container = window.currentCodeContainer;
    if (!container) {
        console.error('Code container not found!');
        return;
    }
    
    container.innerHTML = `
        <h3>Light Bending Around a Massive Object</h3>
        <p>Adjust the mass and impact parameter to see how light is deflected according to α = 4GM/(c²b)</p>
        
        <div class="controls">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
                <label style="display: flex; flex-direction: column;">
                    Mass (Solar Masses): <span id="mass-val" style="font-weight: bold;">1.0</span>
                    <input type="range" id="mass-slider" min="0.1" max="10.0" step="0.1" value="1.0" style="width: 100%;" />
                </label>
                <label style="display: flex; flex-direction: column;">
                    Impact Parameter b (R☉): <span id="impact-val" style="font-weight: bold;">1.0</span>
                    <input type="range" id="impact-slider" min="0.5" max="5.0" step="0.1" value="1.0" style="width: 100%;" />
                </label>
                <label style="display: flex; flex-direction: column;">
                    Number of Rays: <span id="rays-val" style="font-weight: bold;">5</span>
                    <input type="range" id="rays-slider" min="1" max="10" step="1" value="5" style="width: 100%;" />
                </label>
            </div>
        </div>
        
        <canvas id="lensing-canvas" width="800" height="400" style="border: 1px solid #ddd; width: 100%; max-width: 800px; display: block; margin: 20px auto; background: #000;"></canvas>
        
        <div style="margin-top: 15px; padding: 10px; background: #f0f0f0; color: #000; border-radius: 5px;">
            <strong>Deflection Angle:</strong> <span id="deflection-angle">--</span> arcseconds<br>
            <strong>Einstein's Prediction (1915):</strong> α = 4GM/(c²b)<br>
            <strong>Note:</strong> Diagram not to scale—deflection angles are greatly exaggerated for visibility!
        </div>
    `;
    
    const canvas = container.querySelector('#lensing-canvas');
    const ctx = canvas.getContext('2d');
    const massSlider = container.querySelector('#mass-slider');
    const impactSlider = container.querySelector('#impact-slider');
    const raysSlider = container.querySelector('#rays-slider');
    const massVal = container.querySelector('#mass-val');
    const impactVal = container.querySelector('#impact-val');
    const raysVal = container.querySelector('#rays-val');
    const deflectionDisplay = container.querySelector('#deflection-angle');
    
    // Physical constants (SI units)
    const G = 6.67430e-11;  // m³ kg⁻¹ s⁻²
    const c = 2.99792458e8;  // m/s
    const M_sun = 1.989e30;  // kg
    const R_sun = 6.96e8;    // m
    const arcsec_per_rad = 206265;
    
    let mass = 1.0;  // Solar masses
    let impactParam = 1.0;  // Solar radii
    let numRays = 5;
    
    massSlider.addEventListener('input', () => {
        mass = parseFloat(massSlider.value);
        massVal.textContent = mass.toFixed(1);
        draw();
    });
    
    impactSlider.addEventListener('input', () => {
        impactParam = parseFloat(impactSlider.value);
        impactVal.textContent = impactParam.toFixed(1);
        draw();
    });
    
    raysSlider.addEventListener('input', () => {
        numRays = parseInt(raysSlider.value);
        raysVal.textContent = numRays;
        draw();
    });
    
    function calculateDeflection(M_solar, b_solar) {
        const M = M_solar * M_sun;
        const b = b_solar * R_sun;
        const alpha_rad = (4 * G * M) / (c * c * b);
        return alpha_rad * arcsec_per_rad;
    }
    
    function draw() {
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
        
        // Draw star field
        ctx.fillStyle = '#fff';
        for (let i = 0; i < 100; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const r = Math.random() * 1.5;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // Lens position (center)
        const lensX = width / 2;
        const lensY = height / 2;
        
        // Draw the massive object
        const lensRadius = 20;
        const grd = ctx.createRadialGradient(lensX, lensY, 0, lensX, lensY, lensRadius * 2);
        grd.addColorStop(0, '#ffff00');
        grd.addColorStop(0.5, '#ffaa00');
        grd.addColorStop(1, 'rgba(255, 100, 0, 0)');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(lensX, lensY, lensRadius * 2, 0, 2 * Math.PI);
        ctx.fill();
        
        ctx.fillStyle = '#ffff00';
        ctx.beginPath();
        ctx.arc(lensX, lensY, lensRadius, 0, 2 * Math.PI);
        ctx.fill();
        
        // Calculate deflection
        const alpha_arcsec = calculateDeflection(mass, impactParam);
        deflectionDisplay.textContent = alpha_arcsec.toFixed(4);
        
        // Exaggeration factor for visualization
        const exaggeration = 50;
        const alpha_display = (alpha_arcsec / 206265) * exaggeration;
        
        // Draw light rays
        const impactScale = impactParam * 30;  // Scale for display
        const raySpacing = impactScale / Math.max(1, numRays - 1);
        
        for (let i = 0; i < numRays; i++) {
            const offset = (i - (numRays - 1) / 2) * raySpacing;
            const b = Math.abs(offset);
            
            // Calculate individual deflection
            const localAlpha = b < 5 ? 0 : (alpha_display * impactScale / b);
            
            // Incoming ray
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, lensY + offset);
            ctx.lineTo(lensX - 100, lensY + offset);
            ctx.stroke();
            
            // Deflected ray
            const deflectionAngle = Math.sign(offset) * localAlpha;
            const endX = width;
            const endY = lensY + offset + (endX - lensX) * Math.tan(deflectionAngle);
            
            ctx.strokeStyle = '#ff00ff';
            ctx.beginPath();
            ctx.moveTo(lensX + 100, lensY + offset);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            
            // Draw smooth curve through deflection region
            ctx.strokeStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(lensX - 100, lensY + offset);
            
            const steps = 20;
            for (let j = 0; j <= steps; j++) {
                const t = j / steps;
                const x = lensX - 100 + 200 * t;
                const dist = Math.abs(x - lensX);
                const smoothFactor = Math.exp(-dist / 50);
                const y = lensY + offset + (x - lensX + 100) * Math.tan(deflectionAngle) * smoothFactor;
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        
        // Labels
        ctx.fillStyle = '#fff';
        ctx.font = '14px Arial';
        ctx.fillText('Incoming light', 10, lensY - 100);
        ctx.fillText('Deflected light', width - 120, lensY - 100);
        ctx.fillText(`Mass: ${mass.toFixed(1)} M☉`, lensX - 50, lensY + lensRadius + 40);
        ctx.fillText(`Impact param: ${impactParam.toFixed(1)} R☉`, lensX - 70, lensY + lensRadius + 60);
        
        // Draw impact parameter indicator
        ctx.strokeStyle = '#00ff00';
        ctx.setLineDash([5, 5]);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(lensX, lensY);
        ctx.lineTo(lensX, lensY + impactScale);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#00ff00';
        ctx.fillText('b', lensX + 5, lensY + impactScale / 2);
    }
    
    draw();
    console.log('Light bending demo loaded!');
})();