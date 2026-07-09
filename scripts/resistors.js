const container = document.getElementById('simulation-container');

container.innerHTML = `
    <div class="physics-sim-container">
        <div class="sim-header">
            <h2>Resistors in Series and Parallel</h2>
            <p>Explore Ohm's Law and how resistors combine in different circuit configurations!</p>
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
                    <label>Resistor 1 (Ω)</label>
                    <input type="range" id="res1" min="10" max="200" value="100" step="10">
                    <span id="res1Value">100</span>
                </div>
                
                <div class="control-group">
                    <label>Resistor 2 (Ω)</label>
                    <input type="range" id="res2" min="10" max="200" value="150" step="10">
                    <span id="res2Value">150</span>
                </div>
                
                <div class="control-group">
                    <label>Resistor 3 (Ω)</label>
                    <input type="range" id="res3" min="10" max="200" value="50" step="10">
                    <span id="res3Value">50</span>
                </div>
                
                <div class="control-group">
                    <label>Voltage (V)</label>
                    <input type="range" id="voltage" min="5" max="50" value="12" step="1">
                    <span id="voltageValue">12</span>
                </div>
                
                <div class="button-group">
                    <button id="calculate">Calculate</button>
                    <button id="toggleCurrent">Toggle Current Flow</button>
                </div>
                
                <div class="info-panel">
                    <h4>Equivalent Resistance</h4>
                    <div class="info-row">
                        <span>R<sub>eq</sub>:</span>
                        <span id="reqDisplay">0.0 Ω</span>
                    </div>
                    <div class="info-row">
                        <span>Total Current:</span>
                        <span id="totalCurrentDisplay">0.0 A</span>
                    </div>
                    <div class="info-row">
                        <span>Total Power:</span>
                        <span id="totalPowerDisplay">0.0 W</span>
                    </div>
                </div>
                
                <div class="info-panel">
                    <h4>Individual Resistors</h4>
                    <div class="info-row">
                        <span>R₁ Current:</span>
                        <span id="i1Display">0.0 A</span>
                    </div>
                    <div class="info-row">
                        <span>R₁ Voltage:</span>
                        <span id="v1Display">0.0 V</span>
                    </div>
                    <div class="info-row">
                        <span>R₁ Power:</span>
                        <span id="p1Display">0.0 W</span>
                    </div>
                    <div class="info-row">
                        <span>R₂ Current:</span>
                        <span id="i2Display">0.0 A</span>
                    </div>
                    <div class="info-row">
                        <span>R₂ Voltage:</span>
                        <span id="v2Display">0.0 V</span>
                    </div>
                    <div class="info-row">
                        <span>R₂ Power:</span>
                        <span id="p2Display">0.0 W</span>
                    </div>
                    <div class="info-row">
                        <span>R₃ Current:</span>
                        <span id="i3Display">0.0 A</span>
                    </div>
                    <div class="info-row">
                        <span>R₃ Voltage:</span>
                        <span id="v3Display">0.0 V</span>
                    </div>
                    <div class="info-row">
                        <span>R₃ Power:</span>
                        <span id="p3Display">0.0 W</span>
                    </div>
                </div>
                
                <div class="equation-panel">
                    <h4>Formulas</h4>
                    <div class="principle" style="font-size: 16px;">
                        V = IR (Ohm's Law)
                    </div>
                    <div class="principle" style="font-size: 14px;">
                        Series: R<sub>eq</sub> = R₁ + R₂ + R₃
                    </div>
                    <div class="principle" style="font-size: 14px;">
                        Parallel: 1/R<sub>eq</sub> = 1/R₁ + 1/R₂ + 1/R₃
                    </div>
                    <div class="principle" style="font-size: 14px;">
                        P = IV = I²R = V²/R
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

class ResistorCircuits {
    constructor() {
        this.mainCanvas = document.getElementById('mainCanvas');
        this.plotCanvas = document.getElementById('plotCanvas');
        this.mainCtx = this.mainCanvas.getContext('2d');
        this.plotCtx = this.plotCanvas.getContext('2d');
        
        // Circuit parameters
        this.circuitType = 'series';
        this.res1 = 100; // Ω
        this.res2 = 150; // Ω
        this.res3 = 50; // Ω
        this.voltage = 12; // V
        
        // Calculated values
        this.req = 0;
        this.i1 = 0;
        this.i2 = 0;
        this.i3 = 0;
        this.v1 = 0;
        this.v2 = 0;
        this.v3 = 0;
        this.p1 = 0;
        this.p2 = 0;
        this.p3 = 0;
        this.totalCurrent = 0;
        this.totalPower = 0;
        
        // Animation
        this.showCurrent = true;
        this.currentPhase = 0;
        this.animating = false;
        this.lastTime = 0;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.calculate();
        this.updateDisplays();
        this.draw();
        this.drawPlot();
        this.startAnimation();
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
        
        document.getElementById('res1').addEventListener('input', (e) => {
            this.res1 = parseFloat(e.target.value);
            document.getElementById('res1Value').textContent = this.res1;
            this.calculate();
            this.updateDisplays();
            this.draw();
            this.drawPlot();
        });
        
        document.getElementById('res2').addEventListener('input', (e) => {
            this.res2 = parseFloat(e.target.value);
            document.getElementById('res2Value').textContent = this.res2;
            this.calculate();
            this.updateDisplays();
            this.draw();
            this.drawPlot();
        });
        
        document.getElementById('res3').addEventListener('input', (e) => {
            this.res3 = parseFloat(e.target.value);
            document.getElementById('res3Value').textContent = this.res3;
            this.calculate();
            this.updateDisplays();
            this.draw();
            this.drawPlot();
        });
        
        document.getElementById('voltage').addEventListener('input', (e) => {
            this.voltage = parseFloat(e.target.value);
            document.getElementById('voltageValue').textContent = this.voltage;
            this.calculate();
            this.updateDisplays();
            this.draw();
            this.drawPlot();
        });
        
        document.getElementById('calculate').addEventListener('click', () => {
            this.calculate();
            this.updateDisplays();
            this.draw();
            this.drawPlot();
        });
        
        document.getElementById('toggleCurrent').addEventListener('click', () => {
            this.showCurrent = !this.showCurrent;
        });
        
        window.addEventListener('resize', () => this.setupCanvas());
    }
    
    calculate() {
        if (this.circuitType === 'series') {
            // Series: Req = R1 + R2 + R3
            this.req = this.res1 + this.res2 + this.res3;
            
            // In series, current is same through all resistors
            this.totalCurrent = this.voltage / this.req;
            this.i1 = this.totalCurrent;
            this.i2 = this.totalCurrent;
            this.i3 = this.totalCurrent;
            
            // V = IR for each
            this.v1 = this.i1 * this.res1;
            this.v2 = this.i2 * this.res2;
            this.v3 = this.i3 * this.res3;
        } else {
            // Parallel: 1/Req = 1/R1 + 1/R2 + 1/R3
            this.req = 1 / (1/this.res1 + 1/this.res2 + 1/this.res3);
            
            // In parallel, voltage is same across all resistors
            this.v1 = this.voltage;
            this.v2 = this.voltage;
            this.v3 = this.voltage;
            
            // I = V/R for each
            this.i1 = this.v1 / this.res1;
            this.i2 = this.v2 / this.res2;
            this.i3 = this.v3 / this.res3;
            
            this.totalCurrent = this.i1 + this.i2 + this.i3;
        }
        
        // Power: P = IV = I²R = V²/R
        this.p1 = this.i1 * this.v1;
        this.p2 = this.i2 * this.v2;
        this.p3 = this.i3 * this.v3;
        this.totalPower = this.p1 + this.p2 + this.p3;
    }
    
    updateDisplays() {
        document.getElementById('reqDisplay').textContent = this.req.toFixed(2) + ' Ω';
        document.getElementById('totalCurrentDisplay').textContent = this.totalCurrent.toFixed(3) + ' A';
        document.getElementById('totalPowerDisplay').textContent = this.totalPower.toFixed(2) + ' W';
        
        document.getElementById('i1Display').textContent = this.i1.toFixed(3) + ' A';
        document.getElementById('v1Display').textContent = this.v1.toFixed(2) + ' V';
        document.getElementById('p1Display').textContent = this.p1.toFixed(2) + ' W';
        
        document.getElementById('i2Display').textContent = this.i2.toFixed(3) + ' A';
        document.getElementById('v2Display').textContent = this.v2.toFixed(2) + ' V';
        document.getElementById('p2Display').textContent = this.p2.toFixed(2) + ' W';
        
        document.getElementById('i3Display').textContent = this.i3.toFixed(3) + ' A';
        document.getElementById('v3Display').textContent = this.v3.toFixed(2) + ' V';
        document.getElementById('p3Display').textContent = this.p3.toFixed(2) + ' W';
    }
    
    startAnimation() {
        this.animating = true;
        this.lastTime = performance.now();
        this.animate();
    }
    
    animate() {
        if (!this.animating) return;
        
        const currentTime = performance.now();
        const dt = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;
        
        this.currentPhase += dt * 2; // Speed of animation
        if (this.currentPhase > 1) this.currentPhase = 0;
        
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
        
        // Draw resistors
        const res1X = centerX - spacing * 0.5;
        const res2X = centerX + spacing * 0.5;
        const res3X = centerX + spacing * 1.5;
        
        this.drawResistor(ctx, res1X, centerY, this.res1, this.v1, this.i1, 'R₁');
        this.drawResistor(ctx, res2X, centerY, this.res2, this.v2, this.i2, 'R₂');
        this.drawResistor(ctx, res3X, centerY, this.res3, this.v3, this.i3, 'R₃');
        
        // Draw wires
        ctx.strokeStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#666' : '#000';
        ctx.lineWidth = 3;
        
        // Top wire with current markers
        const topY = centerY - 40;
        this.drawWireWithCurrent(ctx, batteryX + 15, topY, res1X - 40, topY, this.showCurrent);
        this.drawWireWithCurrent(ctx, res1X + 40, topY, res2X - 40, topY, this.showCurrent);
        this.drawWireWithCurrent(ctx, res2X + 40, topY, res3X - 40, topY, this.showCurrent);
        
        // Vertical connections
        ctx.beginPath();
        ctx.moveTo(res1X - 40, topY);
        ctx.lineTo(res1X - 40, centerY);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(res2X - 40, topY);
        ctx.lineTo(res2X - 40, centerY);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(res3X - 40, topY);
        ctx.lineTo(res3X - 40, centerY);
        ctx.stroke();
        
        // Bottom wire
        const bottomY = centerY + 40;
        this.drawWireWithCurrent(ctx, batteryX + 15, bottomY, res3X + 40, bottomY, this.showCurrent);
        
        ctx.beginPath();
        ctx.moveTo(res3X + 40, bottomY);
        ctx.lineTo(res3X + 40, centerY);
        ctx.stroke();
    }
    
    drawParallelCircuit(ctx, centerX, centerY) {
        const spacing = 100;
        
        // Draw battery
        const batteryX = centerX - 200;
        this.drawBattery(ctx, batteryX, centerY, this.voltage);
        
        // Draw junction points
        const junctionX1 = centerX - 80;
        const junctionX2 = centerX + 180;
        
        // Draw resistors at different heights
        const res1Y = centerY - spacing;
        const res2Y = centerY;
        const res3Y = centerY + spacing;
        
        this.drawResistor(ctx, centerX + 50, res1Y, this.res1, this.v1, this.i1, 'R₁');
        this.drawResistor(ctx, centerX + 50, res2Y, this.res2, this.v2, this.i2, 'R₂');
        this.drawResistor(ctx, centerX + 50, res3Y, this.res3, this.v3, this.i3, 'R₃');
        
        // Draw wires
        ctx.strokeStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#666' : '#000';
        ctx.lineWidth = 3;
        
        // Main wire from battery
        this.drawWireWithCurrent(ctx, batteryX + 15, centerY - 40, junctionX1, centerY - 40, this.showCurrent);
        
        ctx.beginPath();
        ctx.moveTo(junctionX1, centerY - 40);
        ctx.lineTo(junctionX1, centerY - spacing);
        ctx.stroke();
        
        // Branch wires
        this.drawWireWithCurrent(ctx, junctionX1, res1Y, centerX + 50 - 40, res1Y, this.showCurrent);
        this.drawWireWithCurrent(ctx, junctionX1, res2Y, centerX + 50 - 40, res2Y, this.showCurrent);
        this.drawWireWithCurrent(ctx, junctionX1, res3Y, centerX + 50 - 40, res3Y, this.showCurrent);
        
        ctx.beginPath();
        ctx.moveTo(junctionX1, centerY - 40);
        ctx.lineTo(junctionX1, res3Y);
        ctx.stroke();
        
        // Return wires
        this.drawWireWithCurrent(ctx, centerX + 50 + 40, res1Y, junctionX2, res1Y, this.showCurrent);
        this.drawWireWithCurrent(ctx, centerX + 50 + 40, res2Y, junctionX2, res2Y, this.showCurrent);
        this.drawWireWithCurrent(ctx, centerX + 50 + 40, res3Y, junctionX2, res3Y, this.showCurrent);
        
        ctx.beginPath();
        ctx.moveTo(junctionX2, res1Y);
        ctx.lineTo(junctionX2, centerY + 40);
        ctx.stroke();
        
        // Back to battery
        this.drawWireWithCurrent(ctx, junctionX2, centerY + 40, batteryX + 15, centerY + 40, this.showCurrent);
    }
    
    drawWireWithCurrent(ctx, x1, y1, x2, y2, showCurrent) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        // Draw current flow indicators
        if (showCurrent) {
            const numDots = 4;
            const dx = x2 - x1;
            const dy = y2 - y1;
            const length = Math.sqrt(dx * dx + dy * dy);
            
            for (let i = 0; i < numDots; i++) {
                const t = (i / numDots + this.currentPhase) % 1;
                const x = x1 + dx * t;
                const y = y1 + dy * t;
                
                ctx.fillStyle = '#ff6600';
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    drawResistor(ctx, x, y, resistance, voltage, current, label) {
        const width = 80;
        const height = 20;
        
        // Draw resistor body (zigzag)
        ctx.strokeStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#888' : '#333';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        const segments = 6;
        const segmentWidth = width / segments;
        const zigHeight = height / 2;
        
        ctx.moveTo(x - width/2 - 40, y);
        ctx.lineTo(x - width/2, y);
        
        for (let i = 0; i < segments; i++) {
            const startX = x - width/2 + i * segmentWidth;
            const midX = startX + segmentWidth / 2;
            const endX = startX + segmentWidth;
            const offsetY = (i % 2 === 0) ? -zigHeight : zigHeight;
            
            ctx.lineTo(midX, y + offsetY);
            ctx.lineTo(endX, y);
        }
        
        ctx.lineTo(x + width/2 + 40, y);
        ctx.stroke();
        
        // Draw heat glow effect based on power dissipation
        const powerRatio = (resistance * current * current) / 5; // Normalize
        if (powerRatio > 0.1) {
            const glowRadius = Math.min(powerRatio * 30, 40);
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
            gradient.addColorStop(0, `rgba(255, 100, 0, ${Math.min(powerRatio * 0.5, 0.6)})`);
            gradient.addColorStop(1, 'rgba(255, 100, 0, 0)');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(x - width/2 - 10, y - height, width + 20, height * 2);
        }
        
        // Labels
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e4e4e4' : '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, y - 30);
        ctx.font = '11px Arial';
        ctx.fillText(resistance + ' Ω', x, y - 15);
        
        // Voltage and current labels
        ctx.font = '10px Arial';
        ctx.fillStyle = '#0066ff';
        ctx.fillText('V=' + voltage.toFixed(1) + 'V', x, y + 25);
        ctx.fillStyle = '#ff6600';
        ctx.fillText('I=' + current.toFixed(3) + 'A', x, y + 37);
    }
    
    drawBattery(ctx, x, y, voltage) {
        const width = 30;
        const height = 50;
        
        ctx.strokeStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#666' : '#000';
        ctx.lineWidth = 4;
        
        ctx.beginPath();
        ctx.moveTo(x - width/2, y - 20);
        ctx.lineTo(x + width/2, y - 20);
        ctx.stroke();
        
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x - width/4, y + 20);
        ctx.lineTo(x + width/4, y + 20);
        ctx.stroke();
        
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - width/3, y - 5);
        ctx.lineTo(x + width/3, y - 5);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x - width/3, y + 5);
        ctx.lineTo(x + width/3, y + 5);
        ctx.stroke();
        
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
        
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e4e4e4' : '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('+', x + width/2 + 5, y - 15);
        ctx.fillText('-', x + width/2 + 5, y + 25);
        
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(voltage + ' V', x, y + height + 20);
    }
    
    drawPlot() {
        const ctx = this.plotCtx;
        const canvas = this.plotCanvas;
        
        ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const padding = 50;
        const plotWidth = canvas.width - 2 * padding;
        const plotHeight = canvas.height - 2 * padding;
        
        // Create bar chart for power dissipation
        const bars = [
            { label: 'R₁', value: this.p1, color: '#ff6666' },
            { label: 'R₂', value: this.p2, color: '#66ff66' },
            { label: 'R₃', value: this.p3, color: '#6666ff' },
            { label: 'Total', value: this.totalPower, color: '#ffaa00' }
        ];
        
        const maxPower = Math.max(...bars.map(b => b.value), 1);
        const barWidth = plotWidth / (bars.length * 2);
        const barSpacing = barWidth / 2;
        
        // Draw axes
        ctx.strokeStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#666' : '#333';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();
        
        // Title
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e4e4e4' : '#333';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Power Dissipation', canvas.width / 2, padding - 10);
        
        // Y-axis label
        ctx.save();
        ctx.translate(15, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.font = '14px Arial';
        ctx.fillText('Power (W)', 0, 0);
        ctx.restore();
        
        // Draw bars
        bars.forEach((bar, i) => {
            const x = padding + (i * 2 + 1) * (barWidth + barSpacing);
            const barHeight = (bar.value / maxPower) * plotHeight * 0.9;
            const y = canvas.height - padding - barHeight;
            
            // Bar
            ctx.fillStyle = bar.color;
            ctx.fillRect(x, y, barWidth, barHeight);
            
            // Border
            ctx.strokeStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#888' : '#333';
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, barWidth, barHeight);
            
            // Label
            ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e4e4e4' : '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(bar.label, x + barWidth/2, canvas.height - padding + 20);
            
            // Value
            ctx.font = '11px Arial';
            ctx.fillText(bar.value.toFixed(2) + ' W', x + barWidth/2, y - 5);
        });
    }
}

new ResistorCircuits();
