const container = document.getElementById('simulation-container');

container.innerHTML = `
    <div class="physics-sim-container">
        <div class="sim-header">
            <h2>Gauss' Law - Electric Flux</h2>
            <p>The electric flux through a closed surface is proportional to the enclosed charge!</p>
        </div>
        
        <div class="sim-layout">
            <div class="controls-panel">
                <h3>Controls</h3>
                
                <div class="control-group">
                    <label>Surface Type</label>
                    <select id="surfaceType">
                        <option value="sphere">Sphere</option>
                        <option value="cylinder">Cylinder</option>
                        <option value="cube">Cube</option>
                    </select>
                </div>
                
                <div class="control-group">
                    <label>Enclosed Charge (μC)</label>
                    <input type="range" id="charge" min="-50" max="50" value="20" step="5">
                    <span id="chargeValue">+20</span>
                </div>
                
                <div class="control-group">
                    <label>Surface Radius (cm)</label>
                    <input type="range" id="radius" min="10" max="50" value="25" step="5">
                    <span id="radiusValue">25</span>
                </div>
                
                <div class="control-group">
                    <label>Show E-Field Lines</label>
                    <input type="checkbox" id="showField" checked>
                </div>
                
                <div class="button-group">
                    <button id="calculate">Calculate Flux</button>
                    <button id="animate">Animate Field</button>
                    <button id="reset">Reset</button>
                </div>
                
                <div class="info-panel">
                    <h4>Electric Flux</h4>
                    <div class="info-row">
                        <span>Total Flux (Φ):</span>
                        <span id="fluxDisplay">0.0 N·m²/C</span>
                    </div>
                    <div class="info-row">
                        <span>Enclosed Charge:</span>
                        <span id="qencDisplay">0.0 μC</span>
                    </div>
                    <div class="info-row">
                        <span>Surface Area:</span>
                        <span id="areaDisplay">0.0 cm²</span>
                    </div>
                </div>
                
                <div class="info-panel">
                    <h4>Electric Field</h4>
                    <div class="info-row">
                        <span>E at Surface:</span>
                        <span id="efieldDisplay">0.0 N/C</span>
                    </div>
                    <div class="info-row">
                        <span>Flux/Area:</span>
                        <span id="fluxDensityDisplay">0.0 N/C</span>
                    </div>
                </div>
                
                <div class="info-panel">
                    <h4>Gauss' Law Verification</h4>
                    <div class="info-row">
                        <span>Φ = Q/ε₀:</span>
                        <span id="verifyDisplay">✓</span>
                    </div>
                    <div class="info-row">
                        <span>Calculated:</span>
                        <span id="calcFluxDisplay">0.0</span>
                    </div>
                    <div class="info-row">
                        <span>Expected:</span>
                        <span id="expectedFluxDisplay">0.0</span>
                    </div>
                </div>
                
                <div class="equation-panel">
                    <h4>Gauss' Law</h4>
                    <div class="principle" style="font-size: 18px;">
                        Φ = Q<sub>enc</sub>/ε₀
                    </div>
                    <div class="principle" style="font-size: 16px;">
                        ∮E·dA = Q<sub>enc</sub>/ε₀
                    </div>
                    <p style="font-size: 11px; margin: 5px 0;">
                        ε₀ = 8.85 × 10⁻¹² C²/(N·m²)<br>
                        Permittivity of free space
                    </p>
                </div>
            </div>
            
            <div class="visualization-area">
                <canvas id="mainCanvas"></canvas>
                <canvas id="plotCanvas"></canvas>
            </div>
        </div>
    </div>
`;

const style = document.createElement('style');
style.textContent = `
    .physics-sim-container {
        padding: 20px;
        max-width: 1400px;
        margin: 0 auto;
    }
    
    .sim-header {
        text-align: center;
        margin-bottom: 20px;
        padding: 15px;
        background: rgba(0, 69, 139, 0.1);
        border-radius: 8px;
    }
    
    .sim-header h2 {
        color: #00458b;
        margin-bottom: 10px;
    }
    
    .sim-layout {
        display: flex;
        gap: 20px;
    }
    
    .controls-panel {
        min-width: 280px;
        background: #f8f8f8;
        padding: 20px;
        border-radius: 8px;
        height: fit-content;
    }
    
    .controls-panel h3 {
        margin-top: 0;
        color: #00458b;
    }
    
    .control-group {
        margin-bottom: 20px;
    }
    
    .control-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
        font-size: 14px;
    }
    
    .control-group select {
        width: 100%;
        padding: 8px;
        border-radius: 5px;
        border: 1px solid #ccc;
        font-size: 14px;
    }
    
    .control-group input[type="range"] {
        width: 100%;
        margin: 5px 0;
    }
    
    .control-group input[type="checkbox"] {
        width: 20px;
        height: 20px;
        cursor: pointer;
    }
    
    .control-group span {
        display: inline-block;
        min-width: 60px;
        font-family: monospace;
        color: #00458b;
    }
    
    .button-group {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin: 20px 0;
    }
    
    .button-group button {
        padding: 10px;
        background: #00458b;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 14px;
    }
    
    .button-group button:hover {
        background: #003366;
    }
    
    .info-panel, .equation-panel {
        background: white;
        padding: 15px;
        border-radius: 5px;
        margin-top: 20px;
    }
    
    .info-panel h4, .equation-panel h4 {
        margin-top: 0;
        color: #00458b;
    }
    
    .info-row {
        display: flex;
        justify-content: space-between;
        margin: 8px 0;
        font-size: 14px;
    }
    
    .info-row span:last-child {
        font-family: monospace;
        font-weight: bold;
        color: #00458b;
    }
    
    .principle {
        text-align: center;
        font-size: 18px;
        font-weight: bold;
        color: #00458b;
        margin: 10px 0;
        font-family: 'Times New Roman', serif;
        padding: 8px;
        background: #f0f8ff;
        border-radius: 5px;
    }
    
    .visualization-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    #mainCanvas {
        width: 100%;
        height: 400px;
        background: white;
        border: 2px solid #ddd;
        border-radius: 8px;
    }
    
    #plotCanvas {
        width: 100%;
        height: 250px;
        background: white;
        border: 2px solid #ddd;
        border-radius: 8px;
    }
    
    @media (prefers-color-scheme: dark) {
        .sim-header {
            background: rgba(125, 179, 240, 0.1);
        }
        
        .sim-header h2 {
            color: #7db3f0;
        }
        
        .controls-panel {
            background: #2a2a2a;
        }
        
        .controls-panel h3 {
            color: #7db3f0;
        }
        
        .control-group label {
            color: #e4e4e4;
        }
        
        .control-group select {
            background: #1a1a1a;
            color: #e4e4e4;
            border-color: #404040;
        }
        
        .control-group span {
            color: #7db3f0;
        }
        
        .info-panel, .equation-panel {
            background: #1a1a1a;
            color: #e4e4e4;
        }
        
        .info-panel h4, .equation-panel h4 {
            color: #7db3f0;
        }
        
        .info-row span:last-child {
            color: #7db3f0;
        }
        
        .principle {
            color: #7db3f0;
            background: #0a1a2a;
        }
        
        #mainCanvas, #plotCanvas {
            background: #1a1a1a;
            border-color: #404040;
        }
    }
    
    @media (max-width: 768px) {
        .sim-layout {
            flex-direction: column;
        }
        
        .controls-panel {
            width: 100%;
        }
    }
`;
document.head.appendChild(style);

class GaussLaw {
    constructor() {
        this.mainCanvas = document.getElementById('mainCanvas');
        this.plotCanvas = document.getElementById('plotCanvas');
        this.mainCtx = this.mainCanvas.getContext('2d');
        this.plotCtx = this.plotCanvas.getContext('2d');
        
        // Constants
        this.epsilon0 = 8.85e-12; // C²/(N·m²)
        this.k = 8.99e9; // N·m²/C²
        
        // Parameters
        this.surfaceType = 'sphere';
        this.charge = 20; // μC
        this.radius = 25; // cm
        
        // Calculated values
        this.flux = 0;
        this.area = 0;
        this.efield = 0;
        
        // Animation
        this.showField = true;
        this.animating = false;
        this.animationPhase = 0;
        this.lastTime = 0;
        
        // Data for plot
        this.radiusData = [];
        this.efieldData = [];
        
        this.setupCanvas();
        this.setupEventListeners();
        this.calculate();
        this.updateDisplays();
        this.draw();
        this.generatePlotData();
        this.drawPlot();
    }
    
    setupCanvas() {
        this.mainCanvas.width = this.mainCanvas.offsetWidth;
        this.mainCanvas.height = this.mainCanvas.offsetHeight;
        this.plotCanvas.width = this.plotCanvas.offsetWidth;
        this.plotCanvas.height = this.plotCanvas.offsetHeight;
    }
    
    setupEventListeners() {
        document.getElementById('surfaceType').addEventListener('change', (e) => {
            this.surfaceType = e.target.value;
            this.calculate();
            this.updateDisplays();
            this.draw();
        });
        
        document.getElementById('charge').addEventListener('input', (e) => {
            this.charge = parseFloat(e.target.value);
            document.getElementById('chargeValue').textContent = (this.charge >= 0 ? '+' : '') + this.charge;
            this.calculate();
            this.updateDisplays();
            this.draw();
            this.generatePlotData();
            this.drawPlot();
        });
        
        document.getElementById('radius').addEventListener('input', (e) => {
            this.radius = parseFloat(e.target.value);
            document.getElementById('radiusValue').textContent = this.radius;
            this.calculate();
            this.updateDisplays();
            this.draw();
        });
        
        document.getElementById('showField').addEventListener('change', (e) => {
            this.showField = e.target.checked;
            this.draw();
        });
        
        document.getElementById('calculate').addEventListener('click', () => {
            this.calculate();
            this.updateDisplays();
            this.draw();
        });
        
        document.getElementById('animate').addEventListener('click', () => {
            if (!this.animating) {
                this.animating = true;
                this.lastTime = performance.now();
                this.animate();
            } else {
                this.animating = false;
            }
        });
        
        document.getElementById('reset').addEventListener('click', () => {
            this.reset();
        });
        
        window.addEventListener('resize', () => this.setupCanvas());
    }
    
    calculate() {
        // Convert to SI units
        const q = this.charge * 1e-6; // μC to C
        const r = this.radius * 0.01; // cm to m
        
        // Calculate surface area based on type
        switch(this.surfaceType) {
            case 'sphere':
                this.area = 4 * Math.PI * r * r;
                break;
            case 'cylinder':
                // Assume height = 2*radius for visualization
                const h = 2 * r;
                this.area = 2 * Math.PI * r * h + 2 * Math.PI * r * r; // Lateral + ends
                break;
            case 'cube':
                // Cube with "radius" being half the side length
                const side = 2 * r;
                this.area = 6 * side * side;
                break;
        }
        
        // Gauss' Law: Φ = Q_enc / ε₀
        this.flux = q / this.epsilon0;
        
        // Electric field at surface (for sphere with spherical symmetry)
        if (this.surfaceType === 'sphere') {
            this.efield = this.k * Math.abs(q) / (r * r);
        } else {
            // For non-spherical, approximate average field
            this.efield = this.flux / this.area;
        }
    }
    
    updateDisplays() {
        document.getElementById('fluxDisplay').textContent = this.flux.toExponential(3) + ' N·m²/C';
        document.getElementById('qencDisplay').textContent = (this.charge >= 0 ? '+' : '') + this.charge + ' μC';
        document.getElementById('areaDisplay').textContent = (this.area * 1e4).toFixed(2) + ' cm²';
        document.getElementById('efieldDisplay').textContent = this.efield.toExponential(3) + ' N/C';
        document.getElementById('fluxDensityDisplay').textContent = (this.flux / this.area).toExponential(3) + ' N/C';
        
        // Verification
        const q = this.charge * 1e-6;
        const expectedFlux = q / this.epsilon0;
        const ratio = Math.abs(this.flux / expectedFlux);
        const isValid = Math.abs(ratio - 1) < 0.01;
        
        document.getElementById('verifyDisplay').textContent = isValid ? '✓ Valid' : '✗ Error';
        document.getElementById('verifyDisplay').style.color = isValid ? '#00aa00' : '#ff0000';
        document.getElementById('calcFluxDisplay').textContent = this.flux.toExponential(3);
        document.getElementById('expectedFluxDisplay').textContent = expectedFlux.toExponential(3);
    }
    
    reset() {
        this.animating = false;
        this.surfaceType = 'sphere';
        this.charge = 20;
        this.radius = 25;
        document.getElementById('surfaceType').value = this.surfaceType;
        document.getElementById('charge').value = this.charge;
        document.getElementById('radius').value = this.radius;
        document.getElementById('chargeValue').textContent = '+' + this.charge;
        document.getElementById('radiusValue').textContent = this.radius;
        this.calculate();
        this.updateDisplays();
        this.draw();
        this.generatePlotData();
        this.drawPlot();
    }
    
    generatePlotData() {
        this.radiusData = [];
        this.efieldData = [];
        
        const q = this.charge * 1e-6;
        
        for (let r = 5; r <= 50; r += 1) {
            const rMeters = r * 0.01;
            const E = this.k * Math.abs(q) / (rMeters * rMeters);
            this.radiusData.push(r);
            this.efieldData.push(E);
        }
    }
    
    animate() {
        if (!this.animating) return;
        
        const currentTime = performance.now();
        const dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.animationPhase += dt;
        if (this.animationPhase > 2 * Math.PI) this.animationPhase = 0;
        
        this.draw();
        
        requestAnimationFrame(() => this.animate());
    }
    
    draw() {
        const ctx = this.mainCtx;
        const canvas = this.mainCanvas;
        
        ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const scale = 3; // pixels per cm
        const displayRadius = this.radius * scale;
        
        // Draw electric field lines if enabled
        if (this.showField) {
            this.drawFieldLines(ctx, centerX, centerY, displayRadius);
        }
        
        // Draw Gaussian surface
        this.drawGaussianSurface(ctx, centerX, centerY, displayRadius);
        
        // Draw charge at center
        this.drawCharge(ctx, centerX, centerY, this.charge);
        
        // Draw labels
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e4e4e4' : '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Gaussian Surface', centerX, 30);
        ctx.font = '12px Arial';
        ctx.fillText(this.surfaceType.charAt(0).toUpperCase() + this.surfaceType.slice(1), 
                    centerX, 45);
        ctx.fillText('r = ' + this.radius + ' cm', centerX, centerY + displayRadius + 25);
    }
    
    drawFieldLines(ctx, cx, cy, radius) {
        const numLines = 16;
        const isPositive = this.charge > 0;
        const color = isPositive ? 'rgba(255, 0, 0, 0.4)' : 'rgba(0, 0, 255, 0.4)';
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        
        for (let i = 0; i < numLines; i++) {
            const angle = (i / numLines) * 2 * Math.PI + this.animationPhase * 0.1;
            const sign = isPositive ? 1 : -1;
            
            // Start from surface
            const startX = cx + radius * Math.cos(angle);
            const startY = cy + radius * Math.sin(angle);
            
            // Extend outward
            const endX = cx + sign * (radius + 80) * Math.cos(angle);
            const endY = cy + sign * (radius + 80) * Math.sin(angle);
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
            
            // Draw arrow
            if (isPositive) {
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(endX, endY);
                ctx.lineTo(endX - 8 * Math.cos(angle - Math.PI/6), endY - 8 * Math.sin(angle - Math.PI/6));
                ctx.lineTo(endX - 8 * Math.cos(angle + Math.PI/6), endY - 8 * Math.sin(angle + Math.PI/6));
                ctx.closePath();
                ctx.fill();
            } else {
                // For negative, arrows point inward at the charge
                const arrowX = cx + (radius * 0.3) * Math.cos(angle);
                const arrowY = cy + (radius * 0.3) * Math.sin(angle);
                
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.moveTo(arrowX, arrowY);
                ctx.lineTo(arrowX + 8 * Math.cos(angle - Math.PI/6), arrowY + 8 * Math.sin(angle - Math.PI/6));
                ctx.lineTo(arrowX + 8 * Math.cos(angle + Math.PI/6), arrowY + 8 * Math.sin(angle + Math.PI/6));
                ctx.closePath();
                ctx.fill();
            }
        }
    }
    
    drawGaussianSurface(ctx, cx, cy, radius) {
        ctx.strokeStyle = '#00aa00';
        ctx.lineWidth = 3;
        ctx.setLineDash([10, 5]);
        
        switch(this.surfaceType) {
            case 'sphere':
                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.stroke();
                break;
                
            case 'cylinder':
                const height = radius * 1.5;
                // Draw cylinder as ellipse (top), rectangle (side), and ellipse (bottom)
                
                // Top ellipse
                ctx.beginPath();
                ctx.ellipse(cx, cy - height/2, radius, radius * 0.3, 0, 0, Math.PI * 2);
                ctx.stroke();
                
                // Side lines
                ctx.beginPath();
                ctx.moveTo(cx - radius, cy - height/2);
                ctx.lineTo(cx - radius, cy + height/2);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(cx + radius, cy - height/2);
                ctx.lineTo(cx + radius, cy + height/2);
                ctx.stroke();
                
                // Bottom ellipse
                ctx.beginPath();
                ctx.ellipse(cx, cy + height/2, radius, radius * 0.3, 0, 0, Math.PI);
                ctx.stroke();
                break;
                
            case 'cube':
                const side = radius * 1.4;
                // Draw cube in 3D perspective
                ctx.beginPath();
                // Front face
                ctx.rect(cx - side/2, cy - side/2, side, side);
                ctx.stroke();
                
                // Back face (offset)
                const offset = side * 0.3;
                ctx.beginPath();
                ctx.rect(cx - side/2 + offset, cy - side/2 - offset, side, side);
                ctx.stroke();
                
                // Connecting lines
                ctx.beginPath();
                ctx.moveTo(cx - side/2, cy - side/2);
                ctx.lineTo(cx - side/2 + offset, cy - side/2 - offset);
                ctx.moveTo(cx + side/2, cy - side/2);
                ctx.lineTo(cx + side/2 + offset, cy - side/2 - offset);
                ctx.moveTo(cx - side/2, cy + side/2);
                ctx.lineTo(cx - side/2 + offset, cy + side/2 - offset);
                ctx.moveTo(cx + side/2, cy + side/2);
                ctx.lineTo(cx + side/2 + offset, cy + side/2 - offset);
                ctx.stroke();
                break;
        }
        
        ctx.setLineDash([]);
    }
    
    drawCharge(ctx, x, y, charge) {
        const radius = 20;
        const isPositive = charge > 0;
        
        // Draw charge circle
        const gradient = ctx.createRadialGradient(
            x - radius/3, y - radius/3, radius/10,
            x, y, radius
        );
        
        if (isPositive) {
            gradient.addColorStop(0, '#ff6666');
            gradient.addColorStop(1, '#cc0000');
        } else if (charge < 0) {
            gradient.addColorStop(0, '#6666ff');
            gradient.addColorStop(1, '#0000cc');
        } else {
            gradient.addColorStop(0, '#aaaaaa');
            gradient.addColorStop(1, '#666666');
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = isPositive ? '#880000' : charge < 0 ? '#000088' : '#333';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw charge sign
        if (charge !== 0) {
            ctx.fillStyle = 'white';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(isPositive ? '+' : '−', x, y);
        }
        
        // Label
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e4e4e4' : '#333';
        ctx.font = '12px Arial';
        ctx.fillText('Q = ' + (charge >= 0 ? '+' : '') + charge + ' μC', x, y + radius + 15);
    }
    
    drawPlot() {
        const ctx = this.plotCtx;
        const canvas = this.plotCanvas;
        
        ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (this.radiusData.length < 2) return;
        
        const padding = 50;
        const plotWidth = canvas.width - 2 * padding;
        const plotHeight = canvas.height - 2 * padding;
        
        const maxRadius = Math.max(...this.radiusData);
        const maxEfield = Math.max(...this.efieldData);
        
        // Draw axes
        ctx.strokeStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#666' : '#333';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();
        
        // Labels
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e4e4e4' : '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Distance from Charge (cm)', canvas.width / 2, canvas.height - 10);
        
        ctx.save();
        ctx.translate(15, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Electric Field (N/C)', 0, 0);
        ctx.restore();
        
        // Draw grid
        ctx.strokeStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#333' : '#ddd';
        ctx.lineWidth = 1;
        for (let i = 1; i <= 4; i++) {
            const y = padding + (plotHeight * i) / 5;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
        }
        
        // Draw E-field curve (1/r² relationship)
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        for (let i = 0; i < this.radiusData.length; i++) {
            const x = padding + (this.radiusData[i] / maxRadius) * plotWidth;
            const y = canvas.height - padding - (this.efieldData[i] / maxEfield) * plotHeight * 0.9;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Mark current radius
        const currentX = padding + (this.radius / maxRadius) * plotWidth;
        const currentIndex = this.radiusData.indexOf(this.radius);
        if (currentIndex !== -1) {
            const currentY = canvas.height - padding - (this.efieldData[currentIndex] / maxEfield) * plotHeight * 0.9;
            
            ctx.fillStyle = '#0066ff';
            ctx.beginPath();
            ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = '#0066ff';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(currentX, canvas.height - padding);
            ctx.lineTo(currentX, currentY);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        
        // Title
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e4e4e4' : '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Electric Field vs Distance (E ∝ 1/r²)', canvas.width / 2, padding - 10);
    }
}

new GaussLaw();
