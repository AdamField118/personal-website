(function() {
    const container = window.currentCodeContainer;
    
    if (!container) {
        console.error('Code container not found');
        return;
    }
    
    // Create HTML structure
    container.innerHTML = `
        <div style="font-family: Arial, sans-serif;">
            <h3>The Feynman Propagator: Particle Propagation Amplitude</h3>
            <p>Visualize the propagator Δ_F(x-y) in position space and momentum space. The propagator represents the amplitude for a particle to travel from point y to point x.</p>
            
            <div style="margin: 20px 0;">
                <label style="display: flex; flex-direction: column; max-width: 300px;">
                    Particle Mass (m): <span id="mass-val" style="font-weight: bold;">1.0</span>
                    <input type="range" id="mass-slider" min="0.1" max="3.0" step="0.1" value="1.0" style="width: 100%;" />
                </label>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0;">
                <div>
                    <button id="pos-space-btn" style="padding: 10px 20px; cursor: pointer; background: #00458b; color: white; border: none; border-radius: 4px;">Position Space</button>
                </div>
                <div>
                    <button id="mom-space-btn" style="padding: 10px 20px; cursor: pointer; background: #ccc; color: #333; border: none; border-radius: 4px;">Momentum Space</button>
                </div>
            </div>
            
            <canvas id="propagator-canvas" width="800" height="500" style="border: 1px solid #ddd; width: 100%; max-width: 800px; display: block; margin: 20px auto; background: white;"></canvas>
            
            <div id="info-box" style="margin-top: 15px; padding: 15px; background: #f0f0f0; border-radius: 5px; color: #000;">
                <strong>Position Space:</strong> Real part of Δ_F(r, t=0) vs. distance r<br>
                <strong>Key feature:</strong> The propagator oscillates with wavelength λ = 2π/m and decays exponentially at large distances.
                The Compton wavelength λ_C = 1/m sets the characteristic scale.
            </div>
            
            <div style="margin-top: 15px; padding: 10px; background: #f9f9f9; border-left: 4px solid #00458b; color: #000;">
                <strong>Physical interpretation:</strong><br>
                <strong>Position space:</strong> Amplitude decreases exponentially beyond r ∼ 1/m (Compton wavelength). 
                Massive particles have finite-range propagation.<br>
                <strong>Momentum space:</strong> Poles at k⁰ = ±ω_k show particle/antiparticle contributions. 
                The iε prescription (not shown) determines causality.
            </div>
        </div>
    `;
    
    // Get elements
    const canvas = document.getElementById('propagator-canvas');
    const ctx = canvas.getContext('2d');
    const massSlider = document.getElementById('mass-slider');
    const massVal = document.getElementById('mass-val');
    const posSpaceBtn = document.getElementById('pos-space-btn');
    const momSpaceBtn = document.getElementById('mom-space-btn');
    const infoBox = document.getElementById('info-box');
    
    // State
    let m = 1.0;
    let viewMode = 'position'; // 'position' or 'momentum'
    
    // Update mass
    function updateMass() {
        m = parseFloat(massSlider.value);
        massVal.textContent = m.toFixed(1);
        draw();
    }
    
    // Switch view mode
    function switchMode(mode) {
        viewMode = mode;
        
        if (mode === 'position') {
            posSpaceBtn.style.background = '#00458b';
            posSpaceBtn.style.color = 'white';
            momSpaceBtn.style.background = '#ccc';
            momSpaceBtn.style.color = '#333';
            
            infoBox.innerHTML = `
                <strong>Position Space:</strong> Real part of Δ_F(r, t=0) vs. distance r<br>
                <strong>Key feature:</strong> The propagator oscillates with wavelength λ = 2π/m and decays exponentially at large distances.
                The Compton wavelength λ_C = 1/m sets the characteristic scale.
            `;
        } else {
            posSpaceBtn.style.background = '#ccc';
            posSpaceBtn.style.color = '#333';
            momSpaceBtn.style.background = '#00458b';
            momSpaceBtn.style.color = 'white';
            
            infoBox.innerHTML = `
                <strong>Momentum Space:</strong> Magnitude of |Δ̃_F(k)| = 1/|k² - m²| vs. momentum k<br>
                <strong>Key feature:</strong> Poles at k = ±m (on-shell condition). The propagator diverges when k² = m² (particle is on its mass shell).
                Away from poles, propagator falls as 1/k².
            `;
        }
        
        draw();
    }
    
    // Position space propagator (real part, Yukawa potential form at t=0)
    function positionPropagator(r) {
        // At t=0: Δ_F(r, 0) ∝ e^(-mr)/(4πr)
        // We'll plot the real part of the full expression
        if (r < 0.01) return 0; // avoid singularity at r=0
        
        // Modified Bessel function of second kind approximation for large r
        // For small mass or small r, use full expression
        // Simplified version: Yukawa potential
        const yukawa = Math.exp(-m * r) / (4 * Math.PI * r);
        
        // Oscillatory part (from Fourier transform)
        const oscillation = Math.cos(m * r);
        
        return yukawa * oscillation;
    }
    
    // Momentum space propagator
    function momentumPropagator(k) {
        // |Δ̃_F(k)| = 1/|k² - m²|
        const k2 = k * k;
        const m2 = m * m;
        const denom = Math.abs(k2 - m2) + 0.01; // small regularization to avoid infinity
        
        return 1.0 / denom;
    }
    
    // Drawing function
    function draw() {
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        // Margins
        const marginLeft = 60;
        const marginRight = 40;
        const marginTop = 40;
        const marginBottom = 60;
        
        const plotWidth = width - marginLeft - marginRight;
        const plotHeight = height - marginTop - marginBottom;
        
        // Draw axes
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(marginLeft, marginTop);
        ctx.lineTo(marginLeft, marginTop + plotHeight);
        ctx.lineTo(marginLeft + plotWidth, marginTop + plotHeight);
        ctx.stroke();
        
        if (viewMode === 'position') {
            drawPositionSpace(marginLeft, marginTop, plotWidth, plotHeight);
        } else {
            drawMomentumSpace(marginLeft, marginTop, plotWidth, plotHeight);
        }
    }
    
    function drawPositionSpace(marginLeft, marginTop, plotWidth, plotHeight) {
        const rMax = 10 / m; // scale with mass
        const numPoints = 800;
        
        // Find max value for scaling
        let maxVal = 0;
        let values = [];
        for (let i = 1; i < numPoints; i++) {
            const r = (i / numPoints) * rMax;
            const val = Math.abs(positionPropagator(r));
            values.push(val);
            if (val > maxVal && r > 0.1) maxVal = val;
        }
        
        if (maxVal === 0) maxVal = 1;
        
        // Draw zero line
        const zeroY = marginTop + plotHeight / 2;
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(marginLeft, zeroY);
        ctx.lineTo(marginLeft + plotWidth, zeroY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw propagator
        ctx.strokeStyle = '#00458b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        
        for (let i = 1; i < numPoints; i++) {
            const r = (i / numPoints) * rMax;
            const val = positionPropagator(r);
            const x = marginLeft + (i / numPoints) * plotWidth;
            const y = zeroY - (val / maxVal) * (plotHeight * 0.4);
            
            if (i === 1) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Mark Compton wavelength
        const comptonX = marginLeft + (1/m) / rMax * plotWidth;
        if (comptonX < marginLeft + plotWidth) {
            ctx.strokeStyle = '#FF6B6B';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(comptonX, marginTop);
            ctx.lineTo(comptonX, marginTop + plotHeight);
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.fillStyle = '#FF6B6B';
            ctx.font = '12px Arial';
            ctx.fillText('λ_C = 1/m', comptonX + 5, marginTop + 20);
        }
        
        // Labels
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.fillText('Re[Δ_F(r, t=0)]', 10, marginTop - 10);
        ctx.fillText('Distance r', marginLeft + plotWidth / 2 - 30, marginTop + plotHeight + 40);
        
        // Axis ticks
        ctx.font = '12px Arial';
        const numTicks = 5;
        for (let i = 0; i <= numTicks; i++) {
            const r = (i / numTicks) * rMax;
            const x = marginLeft + (i / numTicks) * plotWidth;
            
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, marginTop + plotHeight);
            ctx.lineTo(x, marginTop + plotHeight + 5);
            ctx.stroke();
            
            ctx.fillStyle = '#000';
            ctx.fillText(r.toFixed(1), x - 10, marginTop + plotHeight + 20);
        }
    }
    
    function drawMomentumSpace(marginLeft, marginTop, plotWidth, plotHeight) {
        const kMax = 4 * m; // show around poles
        const numPoints = 1000;
        
        // Find max value for scaling (exclude near poles)
        let maxVal = 0;
        let values = [];
        for (let i = 0; i < numPoints; i++) {
            const k = (i / numPoints) * kMax;
            const val = momentumPropagator(k);
            values.push(val);
            
            // Exclude near poles
            const nearPole = Math.abs(k - m) < 0.1 * m;
            if (val > maxVal && !nearPole) maxVal = val;
        }
        
        if (maxVal === 0) maxVal = 1;
        maxVal *= 2; // scale for better view
        
        // Draw propagator
        ctx.strokeStyle = '#00458b';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        
        let firstPoint = true;
        for (let i = 0; i < numPoints; i++) {
            const k = (i / numPoints) * kMax;
            let val = momentumPropagator(k);
            
            // Clip for display
            if (val > maxVal * 10) val = maxVal * 10;
            
            const x = marginLeft + (i / numPoints) * plotWidth;
            const y = marginTop + plotHeight - (val / maxVal) * plotHeight * 0.9;
            
            if (firstPoint) {
                ctx.moveTo(x, y);
                firstPoint = false;
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        
        // Mark poles at k = m
        const poleX = marginLeft + (m / kMax) * plotWidth;
        ctx.strokeStyle = '#FF6B6B';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(poleX, marginTop);
        ctx.lineTo(poleX, marginTop + plotHeight);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = '#FF6B6B';
        ctx.font = '12px Arial';
        ctx.fillText('k = m (pole)', poleX + 5, marginTop + 20);
        
        // Labels
        ctx.fillStyle = '#000';
        ctx.font = '14px Arial';
        ctx.fillText('|Δ̃_F(k)|', 10, marginTop - 10);
        ctx.fillText('Momentum k', marginLeft + plotWidth / 2 - 40, marginTop + plotHeight + 40);
        
        // Axis ticks
        ctx.font = '12px Arial';
        const numTicks = 4;
        for (let i = 0; i <= numTicks; i++) {
            const k = (i / numTicks) * kMax;
            const x = marginLeft + (i / numTicks) * plotWidth;
            
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, marginTop + plotHeight);
            ctx.lineTo(x, marginTop + plotHeight + 5);
            ctx.stroke();
            
            ctx.fillStyle = '#000';
            ctx.fillText(k.toFixed(1), x - 10, marginTop + plotHeight + 20);
        }
        
        // Y-axis label
        ctx.save();
        ctx.translate(20, marginTop + plotHeight / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Propagator magnitude', 0, 0);
        ctx.restore();
    }
    
    // Event listeners
    massSlider.addEventListener('input', updateMass);
    posSpaceBtn.addEventListener('click', () => switchMode('position'));
    momSpaceBtn.addEventListener('click', () => switchMode('momentum'));
    
    // Initialize
    draw();
    
    console.log('Propagator visualization loaded successfully!');
})();