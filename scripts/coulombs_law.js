const container = document.getElementById('simulation-container');

container.innerHTML = `
    <div class="physics-sim-container">
        <div class="sim-header">
            <h2>Coulomb's Law - Electric Force</h2>
            <p>The force between two point charges is proportional to their charges and inversely proportional to the square of the distance!</p>
        </div>
        
        <div class="sim-layout">
            <div class="controls-panel">
                <h3>Controls</h3>
                
                <div class="control-group">
                    <label>Charge 1 (μC)</label>
                    <input type="range" id="charge1" min="-50" max="50" value="10" step="1">
                    <span id="charge1Value">+10</span>
                </div>
                
                <div class="control-group">
                    <label>Charge 2 (μC)</label>
                    <input type="range" id="charge2" min="-50" max="50" value="-20" step="1">
                    <span id="charge2Value">-20</span>
                </div>
                
                <div class="control-group">
                    <label>Distance (cm)</label>
                    <input type="range" id="distance" min="5" max="100" value="30" step="1">
                    <span id="distanceValue">30</span>
                </div>
                
                <div class="control-group">
                    <label>Show Electric Field Lines</label>
                    <input type="checkbox" id="showField" checked>
                </div>
                
                <div class="button-group">
                    <button id="calculate">Calculate Force</button>
                    <button id="reset">Reset</button>
                </div>
                
                <div class="info-panel">
                    <h4>Electric Force</h4>
                    <div class="info-row">
                        <span>Force Magnitude:</span>
                        <span id="forceDisplay">0.0 N</span>
                    </div>
                    <div class="info-row">
                        <span>Force Type:</span>
                        <span id="forceTypeDisplay">--</span>
                    </div>
                    <div class="info-row">
                        <span>Force on Q₁:</span>
                        <span id="force1Display">0.0 N</span>
                    </div>
                    <div class="info-row">
                        <span>Force on Q₂:</span>
                        <span id="force2Display">0.0 N</span>
                    </div>
                </div>
                
                <div class="info-panel">
                    <h4>Electric Field</h4>
                    <div class="info-row">
                        <span>E-field at Q₂ (due to Q₁):</span>
                        <span id="efield1Display">0.0 N/C</span>
                    </div>
                    <div class="info-row">
                        <span>E-field at Q₁ (due to Q₂):</span>
                        <span id="efield2Display">0.0 N/C</span>
                    </div>
                </div>
                
                <div class="info-panel">
                    <h4>Potential Energy</h4>
                    <div class="info-row">
                        <span>Electric PE:</span>
                        <span id="peDisplay">0.0 J</span>
                    </div>
                </div>
                
                <div class="equation-panel">
                    <h4>Coulomb's Law</h4>
                    <div class="principle" style="font-size: 18px;">
                        F = k|q₁q₂|/r²
                    </div>
                    <div class="principle" style="font-size: 14px;">
                        E = kq/r²
                    </div>
                    <div class="principle" style="font-size: 14px;">
                        U = kq₁q₂/r
                    </div>
                    <p style="font-size: 11px; margin: 5px 0;">
                        k = 8.99 × 10⁹ N·m²/C²<br>
                        Coulomb's constant
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

class CoulombsLaw {
    constructor() {
        this.mainCanvas = document.getElementById('mainCanvas');
        this.plotCanvas = document.getElementById('plotCanvas');
        this.mainCtx = this.mainCanvas.getContext('2d');
        this.plotCtx = this.plotCanvas.getContext('2d');
        
        // Constants
        this.k = 8.99e9; // N·m²/C² (Coulomb's constant)
        
        // Charges in microcoulombs
        this.charge1 = 10; // μC
        this.charge2 = -20; // μC
        
        // Distance in cm
        this.distance = 30; // cm
        
        // Calculated values
        this.force = 0;
        this.efield1 = 0; // E-field at Q2 due to Q1
        this.efield2 = 0; // E-field at Q1 due to Q2
        this.potentialEnergy = 0;
        
        // Visualization
        this.showField = true;
        
        // Data for distance vs force plot
        this.distanceData = [];
        this.forceData = [];
        
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
        document.getElementById('charge1').addEventListener('input', (e) => {
            this.charge1 = parseFloat(e.target.value);
            document.getElementById('charge1Value').textContent = (this.charge1 >= 0 ? '+' : '') + this.charge1;
            this.calculate();
            this.updateDisplays();
            this.draw();
            this.generatePlotData();
            this.drawPlot();
        });
        
        document.getElementById('charge2').addEventListener('input', (e) => {
            this.charge2 = parseFloat(e.target.value);
            document.getElementById('charge2Value').textContent = (this.charge2 >= 0 ? '+' : '') + this.charge2;
            this.calculate();
            this.updateDisplays();
            this.draw();
            this.generatePlotData();
            this.drawPlot();
        });
        
        document.getElementById('distance').addEventListener('input', (e) => {
            this.distance = parseFloat(e.target.value);
            document.getElementById('distanceValue').textContent = this.distance;
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
        
        document.getElementById('reset').addEventListener('click', () => {
            this.reset();
        });
        
        window.addEventListener('resize', () => this.setupCanvas());
    }
    
    calculate() {
        // Convert to SI units
        const q1 = this.charge1 * 1e-6; // μC to C
        const q2 = this.charge2 * 1e-6; // μC to C
        const r = this.distance * 0.01; // cm to m
        
        // Coulomb's Law: F = k|q1*q2|/r²
        this.force = this.k * Math.abs(q1 * q2) / (r * r);
        
        // Electric field: E = kq/r²
        this.efield1 = this.k * Math.abs(q1) / (r * r); // at Q2 due to Q1
        this.efield2 = this.k * Math.abs(q2) / (r * r); // at Q1 due to Q2
        
        // Potential energy: U = kq1q2/r
        this.potentialEnergy = this.k * q1 * q2 / r;
    }
    
    updateDisplays() {
        document.getElementById('forceDisplay').textContent = this.force.toExponential(3) + ' N';
        
        const forceType = (this.charge1 * this.charge2 > 0) ? 'Repulsive' : 
                         (this.charge1 * this.charge2 < 0) ? 'Attractive' : 'Zero';
        document.getElementById('forceTypeDisplay').textContent = forceType;
        document.getElementById('forceTypeDisplay').style.color = 
            forceType === 'Repulsive' ? '#ff0000' : 
            forceType === 'Attractive' ? '#0066ff' : '#666';
        
        const forceDirection1 = (this.charge1 * this.charge2 > 0) ? '→' : '←';
        const forceDirection2 = (this.charge1 * this.charge2 > 0) ? '←' : '→';
        
        document.getElementById('force1Display').textContent = 
            this.force.toExponential(3) + ' N ' + forceDirection1;
        document.getElementById('force2Display').textContent = 
            this.force.toExponential(3) + ' N ' + forceDirection2;
        
        document.getElementById('efield1Display').textContent = this.efield1.toExponential(3) + ' N/C';
        document.getElementById('efield2Display').textContent = this.efield2.toExponential(3) + ' N/C';
        document.getElementById('peDisplay').textContent = this.potentialEnergy.toExponential(3) + ' J';
    }
    
    reset() {
        this.charge1 = 10;
        this.charge2 = -20;
        this.distance = 30;
        document.getElementById('charge1').value = this.charge1;
        document.getElementById('charge2').value = this.charge2;
        document.getElementById('distance').value = this.distance;
        document.getElementById('charge1Value').textContent = '+' + this.charge1;
        document.getElementById('charge2Value').textContent = this.charge2;
        document.getElementById('distanceValue').textContent = this.distance;
        this.calculate();
        this.updateDisplays();
        this.draw();
        this.generatePlotData();
        this.drawPlot();
    }
    
    generatePlotData() {
        this.distanceData = [];
        this.forceData = [];
        
        const q1 = this.charge1 * 1e-6;
        const q2 = this.charge2 * 1e-6;
        
        for (let d = 5; d <= 100; d += 1) {
            const r = d * 0.01; // cm to m
            const F = this.k * Math.abs(q1 * q2) / (r * r);
            this.distanceData.push(d);
            this.forceData.push(F);
        }
    }
    
    draw() {
        const ctx = this.mainCtx;
        const canvas = this.mainCanvas;
        
        ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const scale = 3; // pixels per cm
        
        const charge1X = centerX - this.distance * scale / 2;
        const charge2X = centerX + this.distance * scale / 2;
        
        // Draw electric field lines if enabled
        if (this.showField) {
            this.drawFieldLines(ctx, charge1X, centerY, charge2X, centerY);
        }
        
        // Draw distance line
        ctx.strokeStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#444' : '#ddd';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(charge1X, centerY);
        ctx.lineTo(charge2X, centerY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw distance label
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e4e4e4' : '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('r = ' + this.distance + ' cm', centerX, centerY - 20);
        
        // Draw charges
        this.drawCharge(ctx, charge1X, centerY, this.charge1, 'Q₁');
        this.drawCharge(ctx, charge2X, centerY, this.charge2, 'Q₂');
        
        // Draw force arrows
        const arrowLength = Math.min(Math.log10(this.force + 1) * 40, 100);
        const attractive = this.charge1 * this.charge2 < 0;
        
        // Force on Q1
        const force1Direction = attractive ? 1 : -1;
        const force1StartX = charge1X + 30 * force1Direction;
        const force1EndX = force1StartX + arrowLength * force1Direction;
        
        ctx.strokeStyle = '#ff0000';
        ctx.fillStyle = '#ff0000';
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.moveTo(force1StartX, centerY);
        ctx.lineTo(force1EndX, centerY);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(force1EndX, centerY);
        ctx.lineTo(force1EndX - 10 * force1Direction, centerY - 5);
        ctx.lineTo(force1EndX - 10 * force1Direction, centerY + 5);
        ctx.closePath();
        ctx.fill();
        
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('F₁', force1StartX + arrowLength * force1Direction / 2, centerY - 10);
        
        // Force on Q2
        const force2Direction = attractive ? -1 : 1;
        const force2StartX = charge2X + 30 * force2Direction;
        const force2EndX = force2StartX + arrowLength * force2Direction;
        
        ctx.strokeStyle = '#ff0000';
        ctx.fillStyle = '#ff0000';
        
        ctx.beginPath();
        ctx.moveTo(force2StartX, centerY);
        ctx.lineTo(force2EndX, centerY);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(force2EndX, centerY);
        ctx.lineTo(force2EndX - 10 * force2Direction, centerY - 5);
        ctx.lineTo(force2EndX - 10 * force2Direction, centerY + 5);
        ctx.closePath();
        ctx.fill();
        
        ctx.font = '12px Arial';
        ctx.fillText('F₂', force2StartX + arrowLength * force2Direction / 2, centerY - 10);
        
        // Draw force type label
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        const forceType = attractive ? 'Attractive Force' : 'Repulsive Force';
        ctx.fillStyle = attractive ? '#0066ff' : '#ff0000';
        ctx.fillText(forceType, centerX, canvas.height - 20);
    }
    
    drawFieldLines(ctx, x1, y1, x2, y2) {
        const numLines = 8;
        
        // Field lines from charge 1
        if (this.charge1 !== 0) {
            const color1 = this.charge1 > 0 ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 0, 255, 0.2)';
            ctx.strokeStyle = color1;
            ctx.lineWidth = 1;
            
            for (let i = 0; i < numLines; i++) {
                const angle = (i / numLines) * 2 * Math.PI;
                const sign = this.charge1 > 0 ? 1 : -1;
                
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                const endX = x1 + sign * Math.cos(angle) * 150;
                const endY = y1 + sign * Math.sin(angle) * 150;
                ctx.lineTo(endX, endY);
                ctx.stroke();
                
                // Arrow head
                if (this.charge1 > 0) {
                    ctx.fillStyle = color1;
                    ctx.beginPath();
                    ctx.moveTo(endX, endY);
                    ctx.lineTo(endX - 8 * Math.cos(angle - Math.PI/6), endY - 8 * Math.sin(angle - Math.PI/6));
                    ctx.lineTo(endX - 8 * Math.cos(angle + Math.PI/6), endY - 8 * Math.sin(angle + Math.PI/6));
                    ctx.closePath();
                    ctx.fill();
                }
            }
        }
        
        // Field lines from charge 2
        if (this.charge2 !== 0) {
            const color2 = this.charge2 > 0 ? 'rgba(255, 0, 0, 0.2)' : 'rgba(0, 0, 255, 0.2)';
            ctx.strokeStyle = color2;
            ctx.lineWidth = 1;
            
            for (let i = 0; i < numLines; i++) {
                const angle = (i / numLines) * 2 * Math.PI;
                const sign = this.charge2 > 0 ? 1 : -1;
                
                ctx.beginPath();
                ctx.moveTo(x2, y2);
                const endX = x2 + sign * Math.cos(angle) * 150;
                const endY = y2 + sign * Math.sin(angle) * 150;
                ctx.lineTo(endX, endY);
                ctx.stroke();
                
                // Arrow head
                if (this.charge2 > 0) {
                    ctx.fillStyle = color2;
                    ctx.beginPath();
                    ctx.moveTo(endX, endY);
                    ctx.lineTo(endX - 8 * Math.cos(angle - Math.PI/6), endY - 8 * Math.sin(angle - Math.PI/6));
                    ctx.lineTo(endX - 8 * Math.cos(angle + Math.PI/6), endY - 8 * Math.sin(angle + Math.PI/6));
                    ctx.closePath();
                    ctx.fill();
                }
            }
        }
    }
    
    drawCharge(ctx, x, y, charge, label) {
        const radius = Math.min(Math.abs(charge) * 2 + 20, 50);
        const isPositive = charge > 0;
        
        // Draw charge circle
        const gradient = ctx.createRadialGradient(
            x - radius/3, y - radius/3, radius/10,
            x, y, radius
        );
        
        if (isPositive) {
            gradient.addColorStop(0, '#ff6666');
            gradient.addColorStop(1, '#cc0000');
        } else {
            gradient.addColorStop(0, '#6666ff');
            gradient.addColorStop(1, '#0000cc');
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = isPositive ? '#880000' : '#000088';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw charge sign
        ctx.fillStyle = 'white';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(isPositive ? '+' : '−', x, y);
        
        // Draw label
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e4e4e4' : '#333';
        ctx.font = '14px Arial';
        ctx.fillText(label, x, y + radius + 20);
        ctx.font = '12px Arial';
        ctx.fillText((charge >= 0 ? '+' : '') + charge + ' μC', x, y + radius + 35);
    }
    
    drawPlot() {
        const ctx = this.plotCtx;
        const canvas = this.plotCanvas;
        
        ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (this.distanceData.length < 2) return;
        
        const padding = 50;
        const plotWidth = canvas.width - 2 * padding;
        const plotHeight = canvas.height - 2 * padding;
        
        const maxDistance = Math.max(...this.distanceData);
        const maxForce = Math.max(...this.forceData);
        
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
        ctx.fillText('Distance (cm)', canvas.width / 2, canvas.height - 10);
        
        ctx.save();
        ctx.translate(15, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Force (N)', 0, 0);
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
        
        // Draw force curve (1/r² relationship)
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        for (let i = 0; i < this.distanceData.length; i++) {
            const x = padding + (this.distanceData[i] / maxDistance) * plotWidth;
            const y = canvas.height - padding - (this.forceData[i] / maxForce) * plotHeight * 0.9;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Mark current distance
        const currentX = padding + (this.distance / maxDistance) * plotWidth;
        const currentForceIndex = this.distanceData.indexOf(this.distance);
        if (currentForceIndex !== -1) {
            const currentY = canvas.height - padding - (this.forceData[currentForceIndex] / maxForce) * plotHeight * 0.9;
            
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
        ctx.fillText('Force vs Distance (F ∝ 1/r²)', canvas.width / 2, padding - 10);
    }
}

new CoulombsLaw();
