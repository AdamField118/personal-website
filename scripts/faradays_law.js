const container = document.getElementById('simulation-container');

container.innerHTML = `
    <div class="physics-sim-container">
        <div class="sim-header">
            <h2>Faraday's Law of Electromagnetic Induction</h2>
            <p>A changing magnetic flux through a coil induces an electromotive force (EMF) and current!</p>
        </div>
        
        <div class="sim-layout">
            <div class="controls-panel">
                <h3>Controls</h3>
                
                <div class="control-group">
                    <label>Number of Coils (N)</label>
                    <input type="range" id="coils" min="1" max="100" value="20" step="1">
                    <span id="coilsValue">20</span>
                </div>
                
                <div class="control-group">
                    <label>Coil Area (m²)</label>
                    <input type="range" id="area" min="0.01" max="0.5" value="0.1" step="0.01">
                    <span id="areaValue">0.10</span>
                </div>
                
                <div class="control-group">
                    <label>Max Magnetic Field (T)</label>
                    <input type="range" id="maxField" min="0.1" max="2.0" value="0.5" step="0.1">
                    <span id="maxFieldValue">0.5</span>
                </div>
                
                <div class="control-group">
                    <label>Change Rate (Hz)</label>
                    <input type="range" id="frequency" min="0.5" max="5" value="1" step="0.5">
                    <span id="frequencyValue">1.0</span>
                </div>
                
                <div class="control-group">
                    <label>Resistance (Ω)</label>
                    <input type="range" id="resistance" min="1" max="100" value="10" step="1">
                    <span id="resistanceValue">10</span>
                </div>
                
                <div class="button-group">
                    <button id="start">Start Changing Field</button>
                    <button id="stop">Stop</button>
                    <button id="reset">Reset</button>
                </div>
                
                <div class="info-panel">
                    <h4>Current Values</h4>
                    <div class="info-row">
                        <span>Magnetic Field (B):</span>
                        <span id="fieldDisplay">0.00 T</span>
                    </div>
                    <div class="info-row">
                        <span>Magnetic Flux (Φ):</span>
                        <span id="fluxDisplay">0.00 Wb</span>
                    </div>
                    <div class="info-row">
                        <span>Induced EMF (ε):</span>
                        <span id="emfDisplay">0.00 V</span>
                    </div>
                    <div class="info-row">
                        <span>Induced Current (I):</span>
                        <span id="currentDisplay">0.00 A</span>
                    </div>
                    <div class="info-row">
                        <span>Power:</span>
                        <span id="powerDisplay">0.00 W</span>
                    </div>
                </div>
                
                <div class="equation-panel">
                    <h4>Faraday's Law</h4>
                    <div class="principle" style="font-size: 18px;">
                        ε = -N dΦ/dt
                    </div>
                    <div class="principle" style="font-size: 16px;">
                        Φ = B·A·cos(θ)
                    </div>
                    <div class="principle" style="font-size: 16px;">
                        I = ε/R
                    </div>
                    <p style="font-size: 11px; margin: 5px 0;">
                        Φ = Magnetic flux (Weber)<br>
                        B = Magnetic field (Tesla)<br>
                        A = Area (m²)<br>
                        N = Number of coils
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

class FaradaysLaw {
    constructor() {
        this.mainCanvas = document.getElementById('mainCanvas');
        this.plotCanvas = document.getElementById('plotCanvas');
        this.mainCtx = this.mainCanvas.getContext('2d');
        this.plotCtx = this.plotCanvas.getContext('2d');
        
        // Parameters
        this.numCoils = 20;
        this.area = 0.1; // m²
        this.maxField = 0.5; // Tesla
        this.frequency = 1; // Hz
        this.resistance = 10; // Ohms
        
        // State
        this.time = 0;
        this.lastTime = 0;
        this.running = false;
        
        // Physical quantities
        this.magneticField = 0;
        this.flux = 0;
        this.emf = 0;
        this.current = 0;
        this.power = 0;
        this.prevFlux = 0;
        
        // Data for plotting
        this.timeData = [];
        this.fieldData = [];
        this.emfData = [];
        this.currentData = [];
        this.maxDataPoints = 200;
        
        this.setupCanvas();
        this.setupEventListeners();
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
        document.getElementById('coils').addEventListener('input', (e) => {
            this.numCoils = parseInt(e.target.value);
            document.getElementById('coilsValue').textContent = this.numCoils;
            this.updateDisplays();
        });
        
        document.getElementById('area').addEventListener('input', (e) => {
            this.area = parseFloat(e.target.value);
            document.getElementById('areaValue').textContent = this.area.toFixed(2);
            this.updateDisplays();
        });
        
        document.getElementById('maxField').addEventListener('input', (e) => {
            this.maxField = parseFloat(e.target.value);
            document.getElementById('maxFieldValue').textContent = this.maxField.toFixed(1);
            this.updateDisplays();
        });
        
        document.getElementById('frequency').addEventListener('input', (e) => {
            this.frequency = parseFloat(e.target.value);
            document.getElementById('frequencyValue').textContent = this.frequency.toFixed(1);
        });
        
        document.getElementById('resistance').addEventListener('input', (e) => {
            this.resistance = parseFloat(e.target.value);
            document.getElementById('resistanceValue').textContent = this.resistance;
            this.updateDisplays();
        });
        
        document.getElementById('start').addEventListener('click', () => {
            if (!this.running) {
                this.running = true;
                this.lastTime = performance.now();
                this.animate();
            }
        });
        
        document.getElementById('stop').addEventListener('click', () => {
            this.running = false;
        });
        
        document.getElementById('reset').addEventListener('click', () => {
            this.reset();
        });
        
        window.addEventListener('resize', () => this.setupCanvas());
    }
    
    updateDisplays() {
        document.getElementById('fieldDisplay').textContent = this.magneticField.toFixed(3) + ' T';
        document.getElementById('fluxDisplay').textContent = this.flux.toFixed(4) + ' Wb';
        document.getElementById('emfDisplay').textContent = this.emf.toFixed(3) + ' V';
        document.getElementById('currentDisplay').textContent = this.current.toFixed(4) + ' A';
        document.getElementById('powerDisplay').textContent = this.power.toFixed(4) + ' W';
    }
    
    reset() {
        this.running = false;
        this.time = 0;
        this.magneticField = 0;
        this.flux = 0;
        this.emf = 0;
        this.current = 0;
        this.power = 0;
        this.prevFlux = 0;
        this.timeData = [];
        this.fieldData = [];
        this.emfData = [];
        this.currentData = [];
        this.updateDisplays();
        this.draw();
        this.drawPlot();
    }
    
    physics(dt) {
        // Sinusoidally varying magnetic field
        this.magneticField = this.maxField * Math.sin(2 * Math.PI * this.frequency * this.time);
        
        // Magnetic flux through one coil (assuming perpendicular field)
        this.flux = this.magneticField * this.area;
        
        // Induced EMF using Faraday's law: ε = -N * dΦ/dt
        // Approximate derivative using finite differences
        const dFlux = this.flux - this.prevFlux;
        this.emf = -this.numCoils * (dFlux / dt);
        this.prevFlux = this.flux;
        
        // Induced current using Ohm's law: I = ε/R
        this.current = this.emf / this.resistance;
        
        // Power dissipated: P = I²R = ε²/R
        this.power = this.current * this.current * this.resistance;
        
        this.time += dt;
        
        // Store data
        this.timeData.push(this.time);
        this.fieldData.push(this.magneticField);
        this.emfData.push(this.emf);
        this.currentData.push(this.current);
        
        if (this.timeData.length > this.maxDataPoints) {
            this.timeData.shift();
            this.fieldData.shift();
            this.emfData.shift();
            this.currentData.shift();
        }
    }
    
    draw() {
        const ctx = this.mainCtx;
        const canvas = this.mainCanvas;
        
        ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        
        // Draw magnetic field lines
        const fieldIntensity = Math.abs(this.magneticField / this.maxField);
        const fieldDirection = Math.sign(this.magneticField);
        
        // Field lines
        const numLines = 20;
        const lineSpacing = (canvas.height - 100) / numLines;
        
        for (let i = 0; i < numLines; i++) {
            const y = 50 + i * lineSpacing;
            const alpha = fieldIntensity * 0.7 + 0.1;
            
            if (fieldDirection > 0) {
                // Field pointing right (into page visualized as arrows)
                ctx.strokeStyle = `rgba(0, 100, 255, ${alpha})`;
                ctx.fillStyle = `rgba(0, 100, 255, ${alpha})`;
            } else {
                // Field pointing left (out of page)
                ctx.strokeStyle = `rgba(255, 0, 100, ${alpha})`;
                ctx.fillStyle = `rgba(255, 0, 100, ${alpha})`;
            }
            
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(50, y);
            ctx.lineTo(canvas.width - 50, y);
            ctx.stroke();
            
            // Draw arrow heads
            const arrowSize = 8;
            const numArrows = 6;
            for (let j = 0; j < numArrows; j++) {
                const x = 50 + (canvas.width - 100) * (j + 0.5) / numArrows;
                
                ctx.beginPath();
                if (fieldDirection > 0) {
                    ctx.moveTo(x, y);
                    ctx.lineTo(x - arrowSize, y - arrowSize/2);
                    ctx.lineTo(x - arrowSize, y + arrowSize/2);
                } else {
                    ctx.moveTo(x, y);
                    ctx.lineTo(x + arrowSize, y - arrowSize/2);
                    ctx.lineTo(x + arrowSize, y + arrowSize/2);
                }
                ctx.closePath();
                ctx.fill();
            }
        }
        
        // Draw coil
        const coilRadius = Math.sqrt(this.area) * 80;
        const coilX = centerX;
        const coilY = centerY;
        
        // Draw multiple coil loops
        const loopsToShow = Math.min(this.numCoils, 10);
        for (let i = 0; i < loopsToShow; i++) {
            const offset = (i - loopsToShow/2) * 3;
            
            ctx.strokeStyle = '#cc6600';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(coilX + offset, coilY, coilRadius, coilRadius * 0.3, 0, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        // Draw coil outline
        ctx.strokeStyle = '#884400';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.ellipse(coilX, coilY, coilRadius, coilRadius * 0.3, 0, 0, Math.PI * 2);
        ctx.stroke();
        
        // Draw circuit connection
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(coilX - coilRadius, coilY);
        ctx.lineTo(coilX - coilRadius - 60, coilY);
        ctx.lineTo(coilX - coilRadius - 60, coilY + 80);
        ctx.lineTo(coilX + coilRadius + 60, coilY + 80);
        ctx.lineTo(coilX + coilRadius + 60, coilY);
        ctx.lineTo(coilX + coilRadius, coilY);
        ctx.stroke();
        
        // Draw resistor
        const resistorX = coilX + coilRadius + 60;
        const resistorY = coilY + 40;
        const resistorWidth = 40;
        const resistorHeight = 15;
        
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(resistorX - resistorWidth/2, resistorY - resistorHeight/2, resistorWidth, resistorHeight);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(resistorX - resistorWidth/2, resistorY - resistorHeight/2, resistorWidth, resistorHeight);
        
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e4e4e4' : '#000';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('R', resistorX, resistorY + 4);
        ctx.fillText(this.resistance + ' Ω', resistorX, resistorY + 25);
        
        // Draw current flow indicators
        if (Math.abs(this.current) > 0.001) {
            const currentDirection = Math.sign(this.current);
            const currentIntensity = Math.min(Math.abs(this.current) * 200, 1);
            
            ctx.fillStyle = `rgba(255, 200, 0, ${currentIntensity})`;
            
            // Animated current indicators
            const numIndicators = 6;
            const animSpeed = 2;
            for (let i = 0; i < numIndicators; i++) {
                const progress = ((this.time * animSpeed + i / numIndicators) % 1);
                
                let x, y;
                if (progress < 0.25) {
                    // Bottom wire
                    const t = progress / 0.25;
                    x = coilX - coilRadius - 60 + (coilRadius * 2 + 120) * t;
                    y = coilY + 80;
                } else if (progress < 0.5) {
                    // Right wire
                    const t = (progress - 0.25) / 0.25;
                    x = coilX + coilRadius + 60;
                    y = coilY + 80 - 80 * t;
                } else if (progress < 0.75) {
                    // Top (through coil)
                    const t = (progress - 0.5) / 0.25;
                    x = coilX + coilRadius - (coilRadius * 2) * t;
                    y = coilY;
                } else {
                    // Left wire
                    const t = (progress - 0.75) / 0.25;
                    x = coilX - coilRadius - 60;
                    y = coilY + 80 * t;
                }
                
                if (currentDirection < 0) {
                    // Reverse direction
                    x = coilX * 2 - x;
                }
                
                ctx.beginPath();
                ctx.arc(x, y, 5, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        // Labels
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e4e4e4' : '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        
        ctx.fillText('N = ' + this.numCoils + ' coils', coilX, coilY - coilRadius * 0.3 - 15);
        ctx.fillText('A = ' + this.area.toFixed(2) + ' m²', coilX, coilY + coilRadius * 0.3 + 25);
        
        // Field label
        ctx.fillText('B = ' + this.magneticField.toFixed(3) + ' T', 
                    canvas.width - 120, 30);
        
        // EMF indicator
        if (Math.abs(this.emf) > 0.01) {
            ctx.fillStyle = '#ff0000';
            ctx.font = 'bold 16px Arial';
            ctx.fillText('ε = ' + this.emf.toFixed(3) + ' V', coilX, canvas.height - 30);
        }
        
        // Current indicator
        if (Math.abs(this.current) > 0.001) {
            ctx.fillStyle = '#ff9900';
            ctx.font = 'bold 14px Arial';
            ctx.fillText('I = ' + this.current.toFixed(4) + ' A', 
                        coilX - coilRadius - 60, coilY + 100);
        }
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
            ctx.fillText('Magnetic Field and Induced EMF vs Time', 
                        canvas.width / 2, canvas.height / 2);
            return;
        }
        
        const padding = 50;
        const plotWidth = canvas.width - 2 * padding;
        const plotHeight = canvas.height - 2 * padding;
        
        const maxTime = Math.max(...this.timeData);
        const maxField = Math.max(...this.fieldData.map(Math.abs), 0.1);
        const maxEMF = Math.max(...this.emfData.map(Math.abs), 0.1);
        
        // Draw axes
        ctx.strokeStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#666' : '#333';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();
        
        // Zero line
        const zeroY = canvas.height - padding - plotHeight / 2;
        ctx.strokeStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#444' : '#999';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(padding, zeroY);
        ctx.lineTo(canvas.width - padding, zeroY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Labels
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e4e4e4' : '#333';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Time (s)', canvas.width / 2, canvas.height - 10);
        
        // Draw magnetic field curve
        ctx.strokeStyle = '#0066ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < this.timeData.length; i++) {
            const x = padding + (this.timeData[i] / maxTime) * plotWidth;
            const y = zeroY - (this.fieldData[i] / maxField) * (plotHeight / 2) * 0.8;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        
        // Draw EMF curve (normalized to same scale)
        const emfScale = maxField / maxEMF;
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < this.timeData.length; i++) {
            const x = padding + (this.timeData[i] / maxTime) * plotWidth;
            const y = zeroY - (this.emfData[i] * emfScale / maxField) * (plotHeight / 2) * 0.8;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        
        // Legend
        const legendX = canvas.width - padding - 150;
        const legendY = padding + 20;
        
        ctx.strokeStyle = '#0066ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(legendX, legendY);
        ctx.lineTo(legendX + 30, legendY);
        ctx.stroke();
        
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e4e4e4' : '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Magnetic Field (B)', legendX + 35, legendY + 4);
        
        ctx.strokeStyle = '#ff0000';
        ctx.beginPath();
        ctx.moveTo(legendX, legendY + 20);
        ctx.lineTo(legendX + 30, legendY + 20);
        ctx.stroke();
        ctx.fillText('Induced EMF (ε)', legendX + 35, legendY + 24);
        
        // Note about phase
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#888' : '#666';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Note: EMF is 90° out of phase with B field', canvas.width / 2, padding + 15);
    }
    
    animate() {
        if (!this.running) return;
        
        const currentTime = performance.now();
        const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05);
        this.lastTime = currentTime;
        
        this.physics(dt);
        this.updateDisplays();
        this.draw();
        this.drawPlot();
        
        requestAnimationFrame(() => this.animate());
    }
}

new FaradaysLaw();
