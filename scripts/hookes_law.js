const container = document.getElementById('simulation-container');

container.innerHTML = `
    <div class="physics-sim-container">
        <div class="sim-header">
            <h2>Spring Oscillation - Hooke's Law</h2>
            <p>A mass-spring system demonstrates simple harmonic motion. F = -kx</p>
        </div>
        
        <div class="sim-layout">
            <div class="controls-panel">
                <h3>Controls</h3>
                
                <div class="control-group">
                    <label>Mass (kg)</label>
                    <input type="range" id="mass" min="0.5" max="5" value="1" step="0.1">
                    <span id="massValue">1.0</span>
                </div>
                
                <div class="control-group">
                    <label>Spring Constant k (N/m)</label>
                    <input type="range" id="springK" min="5" max="100" value="20" step="5">
                    <span id="springKValue">20</span>
                </div>
                
                <div class="control-group">
                    <label>Initial Displacement (cm)</label>
                    <input type="range" id="displacement" min="5" max="50" value="20" step="5">
                    <span id="displacementValue">20</span>
                </div>
                
                <div class="control-group">
                    <label>Damping Coefficient</label>
                    <input type="range" id="damping" min="0" max="1" value="0.1" step="0.05">
                    <span id="dampingValue">0.10</span>
                </div>
                
                <div class="button-group">
                    <button id="release">Release Mass</button>
                    <button id="reset">Reset</button>
                </div>
                
                <div class="info-panel">
                    <h4>Current State</h4>
                    <div class="info-row">
                        <span>Position (x):</span>
                        <span id="positionDisplay">0.0 cm</span>
                    </div>
                    <div class="info-row">
                        <span>Velocity (v):</span>
                        <span id="velocityDisplay">0.0 m/s</span>
                    </div>
                    <div class="info-row">
                        <span>Spring Force:</span>
                        <span id="forceDisplay">0.0 N</span>
                    </div>
                    <div class="info-row">
                        <span>Period (T):</span>
                        <span id="periodDisplay">0.0 s</span>
                    </div>
                    <div class="info-row">
                        <span>Frequency (f):</span>
                        <span id="frequencyDisplay">0.0 Hz</span>
                    </div>
                </div>
                
                <div class="info-panel">
                    <h4>Energy</h4>
                    <div class="info-row">
                        <span>Spring PE:</span>
                        <span id="peDisplay">0.0 J</span>
                    </div>
                    <div class="info-row">
                        <span>Kinetic Energy:</span>
                        <span id="keDisplay">0.0 J</span>
                    </div>
                    <div class="info-row">
                        <span>Total Energy:</span>
                        <span id="totalDisplay">0.0 J</span>
                    </div>
                </div>
                
                <div class="equation-panel">
                    <h4>Spring Equations</h4>
                    <div class="principle" style="font-size: 18px;">
                        F = -kx
                    </div>
                    <div class="principle" style="font-size: 16px;">
                        T = 2π√(m/k)
                    </div>
                    <div class="principle" style="font-size: 16px;">
                        PE = ½kx²
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

class SpringOscillation {
    constructor() {
        this.mainCanvas = document.getElementById('mainCanvas');
        this.plotCanvas = document.getElementById('plotCanvas');
        this.mainCtx = this.mainCanvas.getContext('2d');
        this.plotCtx = this.plotCanvas.getContext('2d');
        
        // Parameters
        this.mass = 1; // kg
        this.springK = 20; // N/m
        this.initialDisplacement = 0.2; // meters (20 cm)
        this.damping = 0.1;
        
        // State
        this.position = this.initialDisplacement; // meters
        this.velocity = 0;
        this.acceleration = 0;
        this.running = false;
        this.naturalLength = 0.3; // meters
        
        // Energy
        this.pe = 0;
        this.ke = 0;
        this.totalEnergy = 0;
        
        // Time
        this.time = 0;
        this.lastTime = 0;
        
        // Data for plotting
        this.timeData = [];
        this.positionData = [];
        this.velocityData = [];
        this.energyData = [];
        this.maxDataPoints = 300;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.calculateEnergy();
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
        document.getElementById('mass').addEventListener('input', (e) => {
            this.mass = parseFloat(e.target.value);
            document.getElementById('massValue').textContent = this.mass.toFixed(1);
            if (!this.running) {
                this.calculateEnergy();
                this.updateDisplays();
                this.draw();
            }
        });
        
        document.getElementById('springK').addEventListener('input', (e) => {
            this.springK = parseFloat(e.target.value);
            document.getElementById('springKValue').textContent = this.springK;
            if (!this.running) {
                this.calculateEnergy();
                this.updateDisplays();
                this.draw();
            }
        });
        
        document.getElementById('displacement').addEventListener('input', (e) => {
            this.initialDisplacement = parseFloat(e.target.value) / 100; // cm to m
            document.getElementById('displacementValue').textContent = e.target.value;
            if (!this.running) {
                this.position = this.initialDisplacement;
                this.calculateEnergy();
                this.updateDisplays();
                this.draw();
            }
        });
        
        document.getElementById('damping').addEventListener('input', (e) => {
            this.damping = parseFloat(e.target.value);
            document.getElementById('dampingValue').textContent = this.damping.toFixed(2);
        });
        
        document.getElementById('release').addEventListener('click', () => {
            if (!this.running) {
                this.running = true;
                this.lastTime = performance.now();
                this.animate();
            }
        });
        
        document.getElementById('reset').addEventListener('click', () => {
            this.reset();
        });
        
        window.addEventListener('resize', () => this.setupCanvas());
    }
    
    calculatePeriod() {
        // T = 2π√(m/k)
        return 2 * Math.PI * Math.sqrt(this.mass / this.springK);
    }
    
    calculateEnergy() {
        // Spring potential energy: PE = ½kx²
        this.pe = 0.5 * this.springK * this.position * this.position;
        
        // Kinetic energy: KE = ½mv²
        this.ke = 0.5 * this.mass * this.velocity * this.velocity;
        
        this.totalEnergy = this.pe + this.ke;
    }
    
    updateDisplays() {
        document.getElementById('positionDisplay').textContent = (this.position * 100).toFixed(1) + ' cm';
        document.getElementById('velocityDisplay').textContent = this.velocity.toFixed(2) + ' m/s';
        
        const force = -this.springK * this.position;
        document.getElementById('forceDisplay').textContent = force.toFixed(2) + ' N';
        
        const period = this.calculatePeriod();
        document.getElementById('periodDisplay').textContent = period.toFixed(3) + ' s';
        document.getElementById('frequencyDisplay').textContent = (1 / period).toFixed(3) + ' Hz';
        
        document.getElementById('peDisplay').textContent = this.pe.toFixed(3) + ' J';
        document.getElementById('keDisplay').textContent = this.ke.toFixed(3) + ' J';
        document.getElementById('totalDisplay').textContent = this.totalEnergy.toFixed(3) + ' J';
    }
    
    reset() {
        this.running = false;
        this.position = this.initialDisplacement;
        this.velocity = 0;
        this.acceleration = 0;
        this.time = 0;
        this.timeData = [];
        this.positionData = [];
        this.velocityData = [];
        this.energyData = [];
        this.calculateEnergy();
        this.updateDisplays();
        this.draw();
        this.drawPlot();
    }
    
    physics(dt) {
        // Hooke's law: F = -kx
        const springForce = -this.springK * this.position;
        
        // Damping force: F = -bv
        const dampingForce = -this.damping * this.velocity;
        
        // Total force
        const totalForce = springForce + dampingForce;
        
        // F = ma
        this.acceleration = totalForce / this.mass;
        
        // Update velocity and position
        this.velocity += this.acceleration * dt;
        this.position += this.velocity * dt;
        
        this.time += dt;
        
        // Calculate energies
        this.calculateEnergy();
        
        // Store data
        this.timeData.push(this.time);
        this.positionData.push(this.position * 100); // Convert to cm
        this.velocityData.push(this.velocity);
        this.energyData.push(this.totalEnergy);
        
        if (this.timeData.length > this.maxDataPoints) {
            this.timeData.shift();
            this.positionData.shift();
            this.velocityData.shift();
            this.energyData.shift();
        }
    }
    
    draw() {
        const ctx = this.mainCtx;
        const canvas = this.mainCanvas;
        
        ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const topY = 50;
        const scale = 400; // pixels per meter
        
        // Draw ceiling
        ctx.fillStyle = '#8B7355';
        ctx.fillRect(0, 0, canvas.width, topY);
        
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, topY);
        ctx.lineTo(canvas.width, topY);
        ctx.stroke();
        
        // Calculate spring length
        const currentLength = this.naturalLength + this.position;
        const massY = topY + currentLength * scale;
        
        // Draw spring
        const springCoils = 15;
        const springWidth = 30;
        const springTop = topY;
        const springBottom = massY - 30;
        const segmentHeight = (springBottom - springTop) / springCoils;
        
        ctx.strokeStyle = '#666666';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, springTop);
        
        for (let i = 0; i < springCoils; i++) {
            const y1 = springTop + i * segmentHeight;
            const y2 = springTop + (i + 0.5) * segmentHeight;
            const y3 = springTop + (i + 1) * segmentHeight;
            
            const side = (i % 2 === 0) ? 1 : -1;
            ctx.lineTo(centerX + side * springWidth, y2);
            ctx.lineTo(centerX, y3);
        }
        
        ctx.stroke();
        
        // Draw mass
        const massSize = Math.sqrt(this.mass) * 40 + 20;
        
        const gradient = ctx.createLinearGradient(
            centerX - massSize/2, massY - massSize/2,
            centerX + massSize/2, massY + massSize/2
        );
        gradient.addColorStop(0, '#0088ff');
        gradient.addColorStop(1, '#0044aa');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(centerX - massSize/2, massY - massSize/2, massSize, massSize);
        
        ctx.strokeStyle = '#003388';
        ctx.lineWidth = 3;
        ctx.strokeRect(centerX - massSize/2, massY - massSize/2, massSize, massSize);
        
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.mass.toFixed(1) + ' kg', centerX, massY + 5);
        
        // Draw equilibrium line
        const equilibriumY = topY + this.naturalLength * scale;
        ctx.strokeStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#666' : '#999';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(centerX - 100, equilibriumY);
        ctx.lineTo(centerX + 100, equilibriumY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#888' : '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Equilibrium', centerX + 110, equilibriumY + 5);
        
        // Draw displacement arrow
        if (Math.abs(this.position) > 0.01) {
            const arrowStartY = equilibriumY;
            const arrowEndY = massY;
            const arrowX = centerX + 100;
            
            ctx.strokeStyle = '#ff6600';
            ctx.fillStyle = '#ff6600';
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowStartY);
            ctx.lineTo(arrowX, arrowEndY);
            ctx.stroke();
            
            // Arrow heads on both ends
            const headSize = 8;
            ctx.beginPath();
            ctx.moveTo(arrowX, arrowEndY);
            ctx.lineTo(arrowX - headSize, arrowEndY - headSize * Math.sign(this.position));
            ctx.lineTo(arrowX + headSize, arrowEndY - headSize * Math.sign(this.position));
            ctx.closePath();
            ctx.fill();
            
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('x = ' + (this.position * 100).toFixed(1) + ' cm', 
                        arrowX + 15, (arrowStartY + arrowEndY) / 2);
        }
        
        // Draw velocity arrow if moving
        if (Math.abs(this.velocity) > 0.05) {
            const velLength = Math.min(Math.abs(this.velocity) * 80, 100);
            const velX = centerX;
            const velStartY = massY + massSize/2 + 20;
            const velEndY = velStartY + velLength * Math.sign(this.velocity);
            
            ctx.strokeStyle = '#00aa00';
            ctx.fillStyle = '#00aa00';
            ctx.lineWidth = 3;
            
            ctx.beginPath();
            ctx.moveTo(velX, velStartY);
            ctx.lineTo(velX, velEndY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(velX, velEndY);
            ctx.lineTo(velX - 6, velEndY - 8 * Math.sign(this.velocity));
            ctx.lineTo(velX + 6, velEndY - 8 * Math.sign(this.velocity));
            ctx.closePath();
            ctx.fill();
            
            ctx.font = '11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('v', velX, velStartY + velLength * Math.sign(this.velocity) / 2);
        }
        
        // Draw force arrow
        const force = -this.springK * this.position;
        if (Math.abs(force) > 0.5) {
            const forceLength = Math.min(Math.abs(force) * 3, 80);
            const forceX = centerX - 70;
            const forceStartY = massY;
            const forceEndY = massY - forceLength * Math.sign(force);
            
            ctx.strokeStyle = '#cc0000';
            ctx.fillStyle = '#cc0000';
            ctx.lineWidth = 3;
            
            ctx.beginPath();
            ctx.moveTo(forceX, forceStartY);
            ctx.lineTo(forceX, forceEndY);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(forceX, forceEndY);
            ctx.lineTo(forceX - 6, forceEndY + 8 * Math.sign(force));
            ctx.lineTo(forceX + 6, forceEndY + 8 * Math.sign(force));
            ctx.closePath();
            ctx.fill();
            
            ctx.font = '11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('F', forceX, forceStartY - forceLength * Math.sign(force) / 2);
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
            ctx.fillText('Position vs Time (Simple Harmonic Motion)', 
                        canvas.width / 2, canvas.height / 2);
            return;
        }
        
        const padding = 50;
        const plotWidth = canvas.width - 2 * padding;
        const plotHeight = canvas.height - 2 * padding;
        
        const maxTime = Math.max(...this.timeData);
        const maxPos = Math.max(...this.positionData.map(Math.abs), 1);
        
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
        
        ctx.save();
        ctx.translate(15, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Position (cm)', 0, 0);
        ctx.restore();
        
        // Draw position curve
        ctx.strokeStyle = '#0088ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < this.timeData.length; i++) {
            const x = padding + (this.timeData[i] / maxTime) * plotWidth;
            const y = zeroY - (this.positionData[i] / maxPos) * (plotHeight / 2) * 0.9;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    
    animate() {
        if (!this.running) return;
        
        const currentTime = performance.now();
        const dt = Math.min((currentTime - this.lastTime) / 1000, 0.02);
        this.lastTime = currentTime;
        
        this.physics(dt);
        this.updateDisplays();
        this.draw();
        this.drawPlot();
        
        requestAnimationFrame(() => this.animate());
    }
}

new SpringOscillation();
