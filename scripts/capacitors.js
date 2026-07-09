const container = document.getElementById('simulation-container');

container.innerHTML = `
    <div class="physics-sim-container">
        <div class="sim-header">
            <h2>Capacitors in Series and Parallel</h2>
            <p>Explore how capacitors combine in different circuit configurations!</p>
        </div>
        
        <div class="sim-layout">
            <div class="controls-panel">
                <h3>Controls</h3>
                
                <div class="control-group">
                    <label>Circuit Type</label>
                    <select id="circuitType">
                        <option value="series">Series</option>
                        <option value="parallel">Parallel</option>
                    </select>
                </div>
                
                <div class="control-group">
                    <label>Capacitor 1 (μF)</label>
                    <input type="range" id="cap1" min="1" max="100" value="10" step="1">
                    <span id="cap1Value">10</span>
                </div>
                
                <div class="control-group">
                    <label>Capacitor 2 (μF)</label>
                    <input type="range" id="cap2" min="1" max="100" value="20" step="1">
                    <span id="cap2Value">20</span>
                </div>
                
                <div class="control-group">
                    <label>Capacitor 3 (μF)</label>
                    <input type="range" id="cap3" min="1" max="100" value="30" step="1">
                    <span id="cap3Value">30</span>
                </div>
                
                <div class="control-group">
                    <label>Voltage (V)</label>
                    <input type="range" id="voltage" min="5" max="50" value="12" step="1">
                    <span id="voltageValue">12</span>
                </div>
                
                <div class="button-group">
                    <button id="calculate">Calculate</button>
                    <button id="charge">Charge Capacitors</button>
                    <button id="discharge">Discharge</button>
                </div>
                
                <div class="info-panel">
                    <h4>Equivalent Capacitance</h4>
                    <div class="info-row">
                        <span>C<sub>eq</sub>:</span>
                        <span id="ceqDisplay">0.0 μF</span>
                    </div>
                </div>
                
                <div class="info-panel">
                    <h4>Individual Capacitors</h4>
                    <div class="info-row">
                        <span>C₁ Charge:</span>
                        <span id="q1Display">0.0 μC</span>
                    </div>
                    <div class="info-row">
                        <span>C₁ Voltage:</span>
                        <span id="v1Display">0.0 V</span>
                    </div>
                    <div class="info-row">
                        <span>C₂ Charge:</span>
                        <span id="q2Display">0.0 μC</span>
                    </div>
                    <div class="info-row">
                        <span>C₂ Voltage:</span>
                        <span id="v2Display">0.0 V</span>
                    </div>
                    <div class="info-row">
                        <span>C₃ Charge:</span>
                        <span id="q3Display">0.0 μC</span>
                    </div>
                    <div class="info-row">
                        <span>C₃ Voltage:</span>
                        <span id="v3Display">0.0 V</span>
                    </div>
                </div>
                
                <div class="info-panel">
                    <h4>Total Energy</h4>
                    <div class="info-row">
                        <span>Stored Energy:</span>
                        <span id="energyDisplay">0.0 μJ</span>
                    </div>
                </div>
                
                <div class="equation-panel">
                    <h4>Formulas</h4>
                    <div class="principle" style="font-size: 14px;">
                        Series: 1/C<sub>eq</sub> = 1/C₁ + 1/C₂ + 1/C₃
                    </div>
                    <div class="principle" style="font-size: 14px;">
                        Parallel: C<sub>eq</sub> = C₁ + C₂ + C₃
                    </div>
                    <div class="principle" style="font-size: 14px;">
                        Q = CV, E = ½CV²
                    </div>
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

class CapacitorCircuits {
    constructor() {
        this.mainCanvas = document.getElementById('mainCanvas');
        this.plotCanvas = document.getElementById('plotCanvas');
        this.mainCtx = this.mainCanvas.getContext('2d');
        this.plotCtx = this.plotCanvas.getContext('2d');
        
        // Circuit parameters
        this.circuitType = 'series';
        this.cap1 = 10; // μF
        this.cap2 = 20; // μF
        this.cap3 = 30; // μF
        this.voltage = 12; // V
        
        // Calculated values
        this.ceq = 0;
        this.q1 = 0;
        this.q2 = 0;
        this.q3 = 0;
        this.v1 = 0;
        this.v2 = 0;
        this.v3 = 0;
        this.energy = 0;
        
        // Charging animation
        this.charging = false;
        this.chargeLevel = 0;
        this.time = 0;
        this.lastTime = 0;
        
        // Data for plotting
        this.timeData = [];
        this.chargeData = [];
        this.voltageData = [];
        this.maxDataPoints = 200;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.calculate();
        this.updateDisplays();
        this.draw();
        this.drawPlot();
    }
    
    setupCanvas() {
        this.mainCanvas.width = this.mainCanvas.offsetWidth;
        this.mainCanvas.height = this.mainCanvas.offsetHeight;
        this.plotCanvas.width = this.plotCanvas.offsetWidth;
        this.plotCanvas.height = this.plotCanvas.offsetHeight;
    }
    
    setupEventListeners() {
        document.getElementById('circuitType').addEventListener('change', (e) => {
            this.circuitType = e.target.value;
            this.calculate();
            this.updateDisplays();
            this.draw();
        });
        
        document.getElementById('cap1').addEventListener('input', (e) => {
            this.cap1 = parseFloat(e.target.value);
            document.getElementById('cap1Value').textContent = this.cap1;
            this.calculate();
            this.updateDisplays();
            this.draw();
        });
        
        document.getElementById('cap2').addEventListener('input', (e) => {
            this.cap2 = parseFloat(e.target.value);
            document.getElementById('cap2Value').textContent = this.cap2;
            this.calculate();
            this.updateDisplays();
            this.draw();
        });
        
        document.getElementById('cap3').addEventListener('input', (e) => {
            this.cap3 = parseFloat(e.target.value);
            document.getElementById('cap3Value').textContent = this.cap3;
            this.calculate();
            this.updateDisplays();
            this.draw();
        });
        
        document.getElementById('voltage').addEventListener('input', (e) => {
            this.voltage = parseFloat(e.target.value);
            document.getElementById('voltageValue').textContent = this.voltage;
            this.calculate();
            this.updateDisplays();
            this.draw();
        });
        
        document.getElementById('calculate').addEventListener('click', () => {
            this.calculate();
            this.updateDisplays();
            this.draw();
        });
        
        document.getElementById('charge').addEventListener('click', () => {
            if (!this.charging) {
                this.charging = true;
                this.chargeLevel = 0;
                this.time = 0;
                this.timeData = [];
                this.chargeData = [];
                this.voltageData = [];
                this.lastTime = performance.now();
                this.animate();
            }
        });
        
        document.getElementById('discharge').addEventListener('click', () => {
            this.charging = false;
            this.chargeLevel = 0;
            this.time = 0;
            this.timeData = [];
            this.chargeData = [];
            this.voltageData = [];
            this.draw();
            this.drawPlot();
        });
        
        window.addEventListener('resize', () => this.setupCanvas());
    }
    
    calculate() {
        if (this.circuitType === 'series') {
            // Series: 1/Ceq = 1/C1 + 1/C2 + 1/C3
            this.ceq = 1 / (1/this.cap1 + 1/this.cap2 + 1/this.cap3);
            
            // In series, charge is same on all capacitors
            const totalQ = this.ceq * this.voltage;
            this.q1 = totalQ;
            this.q2 = totalQ;
            this.q3 = totalQ;
            
            // V = Q/C for each
            this.v1 = this.q1 / this.cap1;
            this.v2 = this.q2 / this.cap2;
            this.v3 = this.q3 / this.cap3;
        } else {
            // Parallel: Ceq = C1 + C2 + C3
            this.ceq = this.cap1 + this.cap2 + this.cap3;
            
            // In parallel, voltage is same on all capacitors
            this.v1 = this.voltage;
            this.v2 = this.voltage;
            this.v3 = this.voltage;
            
            // Q = CV for each
            this.q1 = this.cap1 * this.v1;
            this.q2 = this.cap2 * this.v2;
            this.q3 = this.cap3 * this.v3;
        }
        
        // Total energy: E = ½CV²
        this.energy = 0.5 * this.ceq * this.voltage * this.voltage;
    }
    
    updateDisplays() {
        document.getElementById('ceqDisplay').textContent = this.ceq.toFixed(2) + ' μF';
        
        document.getElementById('q1Display').textContent = (this.q1 * this.chargeLevel).toFixed(2) + ' μC';
        document.getElementById('v1Display').textContent = (this.v1 * this.chargeLevel).toFixed(2) + ' V';
        
        document.getElementById('q2Display').textContent = (this.q2 * this.chargeLevel).toFixed(2) + ' μC';
        document.getElementById('v2Display').textContent = (this.v2 * this.chargeLevel).toFixed(2) + ' V';
        
        document.getElementById('q3Display').textContent = (this.q3 * this.chargeLevel).toFixed(2) + ' μC';
        document.getElementById('v3Display').textContent = (this.v3 * this.chargeLevel).toFixed(2) + ' V';
        
        document.getElementById('energyDisplay').textContent = (this.energy * this.chargeLevel * this.chargeLevel).toFixed(2) + ' μJ';
    }
    
    draw() {
        const ctx = this.mainCtx;
        const canvas = this.mainCanvas;
        
        ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        if (this.circuitType === 'series') {
            this.drawSeriesCircuit(ctx, centerX, centerY);
        } else {
            this.drawParallelCircuit(ctx, centerX, centerY);
        }
    }
    
    drawSeriesCircuit(ctx, centerX, centerY) {
        const spacing = 150;
        
        // Draw battery
        const batteryX = centerX - spacing * 1.5;
        this.drawBattery(ctx, batteryX, centerY, this.voltage);
        
        // Draw capacitors
        const cap1X = centerX - spacing * 0.5;
        const cap2X = centerX + spacing * 0.5;
        const cap3X = centerX + spacing * 1.5;
        
        this.drawCapacitor(ctx, cap1X, centerY, this.cap1, this.chargeLevel, 'C₁');
        this.drawCapacitor(ctx, cap2X, centerY, this.cap2, this.chargeLevel, 'C₂');
        this.drawCapacitor(ctx, cap3X, centerY, this.cap3, this.chargeLevel, 'C₃');
        
        // Draw wires
        ctx.strokeStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#666' : '#000';
        ctx.lineWidth = 3;
        
        // Top wire
        ctx.beginPath();
        ctx.moveTo(batteryX + 15, centerY - 40);
        ctx.lineTo(cap1X - 30, centerY - 40);
        ctx.lineTo(cap1X - 30, centerY);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(cap1X + 30, centerY);
        ctx.lineTo(cap1X + 30, centerY - 40);
        ctx.lineTo(cap2X - 30, centerY - 40);
        ctx.lineTo(cap2X - 30, centerY);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(cap2X + 30, centerY);
        ctx.lineTo(cap2X + 30, centerY - 40);
        ctx.lineTo(cap3X - 30, centerY - 40);
        ctx.lineTo(cap3X - 30, centerY);
        ctx.stroke();
        
        // Bottom wire
        ctx.beginPath();
        ctx.moveTo(batteryX + 15, centerY + 40);
        ctx.lineTo(cap3X + 30, centerY + 40);
        ctx.lineTo(cap3X + 30, centerY);
        ctx.stroke();
        
        // Current arrows (if charging)
        if (this.charging && this.chargeLevel < 1) {
            this.drawCurrentArrow(ctx, batteryX + 60, centerY - 40, true);
            this.drawCurrentArrow(ctx, cap1X + 60, centerY - 40, true);
            this.drawCurrentArrow(ctx, cap2X + 60, centerY - 40, true);
        }
    }
    
    drawParallelCircuit(ctx, centerX, centerY) {
        const spacing = 100;
        
        // Draw battery
        const batteryX = centerX - 200;
        this.drawBattery(ctx, batteryX, centerY, this.voltage);
        
        // Draw junction points
        const junctionX1 = centerX - 80;
        const junctionX2 = centerX + 180;
        
        // Draw capacitors at different heights
        const cap1Y = centerY - spacing;
        const cap2Y = centerY;
        const cap3Y = centerY + spacing;
        
        this.drawCapacitor(ctx, centerX + 50, cap1Y, this.cap1, this.chargeLevel, 'C₁');
        this.drawCapacitor(ctx, centerX + 50, cap2Y, this.cap2, this.chargeLevel, 'C₂');
        this.drawCapacitor(ctx, centerX + 50, cap3Y, this.cap3, this.chargeLevel, 'C₃');
        
        // Draw wires
        ctx.strokeStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#666' : '#000';
        ctx.lineWidth = 3;
        
        // From battery to first junction
        ctx.beginPath();
        ctx.moveTo(batteryX + 15, centerY - 40);
        ctx.lineTo(junctionX1, centerY - 40);
        ctx.lineTo(junctionX1, centerY - spacing);
        ctx.stroke();
        
        // Junction to capacitors
        ctx.beginPath();
        ctx.moveTo(junctionX1, cap1Y);
        ctx.lineTo(centerX + 50 - 30, cap1Y);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(junctionX1, centerY - 40);
        ctx.lineTo(centerX + 50 - 30, cap2Y);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(junctionX1, centerY - 40);
        ctx.lineTo(junctionX1, cap3Y);
        ctx.lineTo(centerX + 50 - 30, cap3Y);
        ctx.stroke();
        
        // From capacitors to second junction
        ctx.beginPath();
        ctx.moveTo(centerX + 50 + 30, cap1Y);
        ctx.lineTo(junctionX2, cap1Y);
        ctx.lineTo(junctionX2, centerY + 40);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX + 50 + 30, cap2Y);
        ctx.lineTo(junctionX2, cap2Y);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(centerX + 50 + 30, cap3Y);
        ctx.lineTo(junctionX2, cap3Y);
        ctx.stroke();
        
        // Back to battery
        ctx.beginPath();
        ctx.moveTo(junctionX2, centerY + 40);
        ctx.lineTo(batteryX + 15, centerY + 40);
        ctx.stroke();
        
        // Current arrows (if charging)
        if (this.charging && this.chargeLevel < 1) {
            this.drawCurrentArrow(ctx, batteryX + 80, centerY - 40, true);
        }
    }
    
    drawCapacitor(ctx, x, y, capacitance, chargeLevel, label) {
        const plateWidth = 40;
        const plateHeight = 5;
        const plateGap = 20;
        
        // Draw plates
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#888' : '#333';
        ctx.fillRect(x - plateWidth/2, y - plateGap/2 - plateHeight, plateWidth, plateHeight);
        ctx.fillRect(x - plateWidth/2, y + plateGap/2, plateWidth, plateHeight);
        
        // Draw charge indicators
        if (chargeLevel > 0) {
            const numCharges = Math.floor(chargeLevel * 5) + 1;
            
            // Negative charges on top plate
            ctx.fillStyle = '#0066ff';
            for (let i = 0; i < numCharges; i++) {
                const chargeX = x - plateWidth/2 + plateWidth * (i + 0.5) / numCharges;
                ctx.beginPath();
                ctx.arc(chargeX, y - plateGap/2 - plateHeight - 8, 4, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('-', chargeX, y - plateGap/2 - plateHeight - 5);
            }
            
            // Positive charges on bottom plate
            ctx.fillStyle = '#ff0000';
            for (let i = 0; i < numCharges; i++) {
                const chargeX = x - plateWidth/2 + plateWidth * (i + 0.5) / numCharges;
                ctx.beginPath();
                ctx.arc(chargeX, y + plateGap/2 + plateHeight + 8, 4, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.font = '10px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('+', chargeX, y + plateGap/2 + plateHeight + 11);
            }
        }
        
        // Draw connecting wires
        ctx.strokeStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#666' : '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x - 30, y);
        ctx.lineTo(x, y - plateGap/2 - plateHeight);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x, y + plateGap/2 + plateHeight);
        ctx.lineTo(x + 30, y);
        ctx.stroke();
        
        // Label
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e4e4e4' : '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, y - 40);
        ctx.font = '11px Arial';
        ctx.fillText(capacitance + ' μF', x, y - 25);
    }
    
    drawBattery(ctx, x, y, voltage) {
        const width = 30;
        const height = 50;
        
        // Draw battery symbol
        ctx.strokeStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#666' : '#000';
        ctx.lineWidth = 4;
        
        // Positive terminal (longer)
        ctx.beginPath();
        ctx.moveTo(x - width/2, y - 20);
        ctx.lineTo(x + width/2, y - 20);
        ctx.stroke();
        
        // Negative terminal (shorter)
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x - width/4, y + 20);
        ctx.lineTo(x + width/4, y + 20);
        ctx.stroke();
        
        // Middle bars
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - width/3, y - 5);
        ctx.lineTo(x + width/3, y - 5);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x - width/3, y + 5);
        ctx.lineTo(x + width/3, y + 5);
        ctx.stroke();
        
        // Connecting wires
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x, y - 20);
        ctx.lineTo(x, y - 40);
        ctx.lineTo(x + 15, y - 40);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x, y + 20);
        ctx.lineTo(x, y + 40);
        ctx.lineTo(x + 15, y + 40);
        ctx.stroke();
        
        // Labels
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e4e4e4' : '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('+', x + width/2 + 5, y - 15);
        ctx.fillText('-', x + width/2 + 5, y + 25);
        
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(voltage + ' V', x, y + height + 20);
    }
    
    drawCurrentArrow(ctx, x, y, direction) {
        ctx.strokeStyle = '#ff6600';
        ctx.fillStyle = '#ff6600';
        ctx.lineWidth = 2;
        
        const arrowLength = 15;
        const endX = x + (direction ? arrowLength : -arrowLength);
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(endX, y);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(endX, y);
        ctx.lineTo(endX - 5 * (direction ? 1 : -1), y - 4);
        ctx.lineTo(endX - 5 * (direction ? 1 : -1), y + 4);
        ctx.closePath();
        ctx.fill();
    }
    
    drawPlot() {
        const ctx = this.plotCtx;
        const canvas = this.plotCanvas;
        
        ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (this.timeData.length < 2) {
            ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#666' : '#999';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Charging Curve - Voltage vs Time', 
                        canvas.width / 2, canvas.height / 2);
            return;
        }
        
        const padding = 50;
        const plotWidth = canvas.width - 2 * padding;
        const plotHeight = canvas.height - 2 * padding;
        
        const maxTime = Math.max(...this.timeData);
        const maxVoltage = this.voltage;
        
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
        ctx.fillText('Time (s)', canvas.width / 2, canvas.height - 10);
        
        ctx.save();
        ctx.translate(15, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Voltage (V)', 0, 0);
        ctx.restore();
        
        // Draw voltage curve
        ctx.strokeStyle = '#0088ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < this.timeData.length; i++) {
            const x = padding + (this.timeData[i] / maxTime) * plotWidth;
            const y = canvas.height - padding - (this.voltageData[i] / maxVoltage) * plotHeight * 0.9;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    
    animate() {
        if (!this.charging) return;
        
        const currentTime = performance.now();
        const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05);
        this.lastTime = currentTime;
        
        // Exponential charging: Q(t) = Q_max(1 - e^(-t/τ))
        const tau = 1; // Time constant in seconds
        this.time += dt;
        this.chargeLevel = 1 - Math.exp(-this.time / tau);
        
        if (this.chargeLevel >= 0.99) {
            this.chargeLevel = 1;
            this.charging = false;
        }
        
        // Store data
        this.timeData.push(this.time);
        this.voltageData.push(this.voltage * this.chargeLevel);
        
        if (this.timeData.length > this.maxDataPoints) {
            this.timeData.shift();
            this.voltageData.shift();
        }
        
        this.updateDisplays();
        this.draw();
        this.drawPlot();
        
        if (this.charging) {
            requestAnimationFrame(() => this.animate());
        }
    }
}

new CapacitorCircuits();
