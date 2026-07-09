const container = document.getElementById('simulation-container');

container.innerHTML = `
    <div class="physics-sim-container">
        <div class="sim-header">
            <h2>Pendulum Motion</h2>
            <p>Explore simple harmonic motion and energy transfer in a pendulum system!</p>
        </div>
        
        <div class="sim-layout">
            <div class="controls-panel">
                <h3>Controls</h3>
                
                <div class="control-group">
                    <label>Length (m)</label>
                    <input type="range" id="length" min="0.5" max="5" value="2" step="0.1">
                    <span id="lengthValue">2.0</span>
                </div>
                
                <div class="control-group">
                    <label>Mass (kg)</label>
                    <input type="range" id="mass" min="0.5" max="5" value="1" step="0.1">
                    <span id="massValue">1.0</span>
                </div>
                
                <div class="control-group">
                    <label>Initial Angle (degrees)</label>
                    <input type="range" id="angle" min="5" max="90" value="45" step="5">
                    <span id="angleValue">45</span>
                </div>
                
                <div class="control-group">
                    <label>Damping Coefficient</label>
                    <input type="range" id="damping" min="0" max="0.5" value="0.05" step="0.01">
                    <span id="dampingValue">0.05</span>
                </div>
                
                <div class="button-group">
                    <button id="start">Release Pendulum</button>
                    <button id="reset">Reset</button>
                </div>
                
                <div class="info-panel">
                    <h4>Current State</h4>
                    <div class="info-row">
                        <span>Angle:</span>
                        <span id="currentAngle">45.0°</span>
                    </div>
                    <div class="info-row">
                        <span>Angular Velocity:</span>
                        <span id="angularVel">0.00 rad/s</span>
                    </div>
                    <div class="info-row">
                        <span>Period (T):</span>
                        <span id="period">0.00 s</span>
                    </div>
                    <div class="info-row">
                        <span>Frequency (f):</span>
                        <span id="frequency">0.00 Hz</span>
                    </div>
                </div>
                
                <div class="info-panel">
                    <h4>Energy</h4>
                    <div class="info-row">
                        <span>Potential:</span>
                        <span id="peDisplay">0.0 J</span>
                    </div>
                    <div class="info-row">
                        <span>Kinetic:</span>
                        <span id="keDisplay">0.0 J</span>
                    </div>
                    <div class="info-row">
                        <span>Total:</span>
                        <span id="totalEnergy">0.0 J</span>
                    </div>
                </div>
                
                <div class="equation-panel">
                    <h4>Pendulum Equations</h4>
                    <div class="principle" style="font-size: 16px;">
                        T = 2π√(L/g)
                    </div>
                    <p style="font-size: 11px; margin: 5px 0;">
                        Period for small angles (independent of mass!)
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

class PendulumMotion {
    constructor() {
        this.mainCanvas = document.getElementById('mainCanvas');
        this.plotCanvas = document.getElementById('plotCanvas');
        this.mainCtx = this.mainCanvas.getContext('2d');
        this.plotCtx = this.plotCanvas.getContext('2d');
        
        // Parameters
        this.length = 2; // meters
        this.mass = 1; // kg
        this.initialAngle = 45 * Math.PI / 180; // radians
        this.damping = 0.05;
        this.g = 9.81;
        
        // State
        this.angle = this.initialAngle;
        this.angularVelocity = 0;
        this.angularAcceleration = 0;
        this.running = false;
        
        // Energy
        this.pe = 0;
        this.ke = 0;
        this.totalEnergy = 0;
        
        // Time tracking
        this.time = 0;
        this.lastTime = 0;
        
        // Period measurement
        this.crossings = [];
        this.measuredPeriod = 0;
        
        // Data for plotting
        this.timeData = [];
        this.angleData = [];
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
        document.getElementById('length').addEventListener('input', (e) => {
            this.length = parseFloat(e.target.value);
            if (!this.running) {
                this.calculateEnergy();
                this.updateDisplays();
                this.draw();
            }
        });
        
        document.getElementById('mass').addEventListener('input', (e) => {
            this.mass = parseFloat(e.target.value);
            if (!this.running) {
                this.calculateEnergy();
                this.updateDisplays();
                this.draw();
            }
        });
        
        document.getElementById('angle').addEventListener('input', (e) => {
            this.initialAngle = parseFloat(e.target.value) * Math.PI / 180;
            if (!this.running) {
                this.angle = this.initialAngle;
                this.calculateEnergy();
                this.updateDisplays();
                this.draw();
            }
        });
        
        document.getElementById('damping').addEventListener('input', (e) => {
            this.damping = parseFloat(e.target.value);
            document.getElementById('dampingValue').textContent = this.damping.toFixed(2);
        });
        
        document.getElementById('start').addEventListener('click', () => {
            if (!this.running) {
                this.running = true;
                this.lastTime = performance.now();
                this.crossings = [];
                this.animate();
            }
        });
        
        document.getElementById('reset').addEventListener('click', () => {
            this.reset();
        });
        
        window.addEventListener('resize', () => this.setupCanvas());
    }
    
    calculateEnergy() {
        // Height of bob relative to lowest point
        const height = this.length * (1 - Math.cos(this.angle));
        this.pe = this.mass * this.g * height;
        
        // Kinetic energy from angular velocity
        const velocity = this.angularVelocity * this.length;
        this.ke = 0.5 * this.mass * velocity * velocity;
        
        this.totalEnergy = this.pe + this.ke;
    }
    
    calculatePeriod() {
        // Theoretical period (small angle approximation)
        return 2 * Math.PI * Math.sqrt(this.length / this.g);
    }
    
    updateDisplays() {
        document.getElementById('lengthValue').textContent = this.length.toFixed(1);
        document.getElementById('massValue').textContent = this.mass.toFixed(1);
        document.getElementById('angleValue').textContent = (this.initialAngle * 180 / Math.PI).toFixed(0);
        
        document.getElementById('currentAngle').textContent = (this.angle * 180 / Math.PI).toFixed(1) + '°';
        document.getElementById('angularVel').textContent = this.angularVelocity.toFixed(2) + ' rad/s';
        
        const theoreticalPeriod = this.calculatePeriod();
        const displayPeriod = this.measuredPeriod > 0 ? this.measuredPeriod : theoreticalPeriod;
        document.getElementById('period').textContent = displayPeriod.toFixed(2) + ' s';
        document.getElementById('frequency').textContent = (1 / displayPeriod).toFixed(2) + ' Hz';
        
        document.getElementById('peDisplay').textContent = this.pe.toFixed(2) + ' J';
        document.getElementById('keDisplay').textContent = this.ke.toFixed(2) + ' J';
        document.getElementById('totalEnergy').textContent = this.totalEnergy.toFixed(2) + ' J';
    }
    
    reset() {
        this.running = false;
        this.angle = this.initialAngle;
        this.angularVelocity = 0;
        this.angularAcceleration = 0;
        this.time = 0;
        this.timeData = [];
        this.angleData = [];
        this.energyData = [];
        this.crossings = [];
        this.measuredPeriod = 0;
        this.calculateEnergy();
        this.updateDisplays();
        this.draw();
        this.drawPlot();
    }
    
    physics(dt) {
        // Angular acceleration from torque
        // τ = -mg L sin(θ) = I α, where I = mL²
        // α = -(g/L) sin(θ) - damping * ω
        this.angularAcceleration = -(this.g / this.length) * Math.sin(this.angle) - 
                                   this.damping * this.angularVelocity;
        
        // Update angular velocity and angle
        this.angularVelocity += this.angularAcceleration * dt;
        this.angle += this.angularVelocity * dt;
        
        // Detect zero crossings for period measurement
        if (this.angleData.length > 0) {
            const prevAngle = this.angleData[this.angleData.length - 1];
            if (prevAngle > 0 && this.angle <= 0) {
                this.crossings.push(this.time);
                if (this.crossings.length >= 3) {
                    // Calculate period from last two crossings
                    const periods = [];
                    for (let i = 1; i < this.crossings.length; i++) {
                        periods.push((this.crossings[i] - this.crossings[i-1]) * 2);
                    }
                    this.measuredPeriod = periods.reduce((a,b) => a + b, 0) / periods.length;
                }
            }
        }
        
        this.time += dt;
        
        // Calculate energies
        this.calculateEnergy();
        
        // Store data
        this.timeData.push(this.time);
        this.angleData.push(this.angle * 180 / Math.PI); // Convert to degrees for plotting
        this.energyData.push(this.totalEnergy);
        
        if (this.timeData.length > this.maxDataPoints) {
            this.timeData.shift();
            this.angleData.shift();
            this.energyData.shift();
        }
    }
    
    draw() {
        const ctx = this.mainCtx;
        const canvas = this.mainCanvas;
        
        ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const pivotX = canvas.width / 2;
        const pivotY = 80;
        const scale = Math.min(canvas.width, canvas.height - 120) / (this.length * 2 + 1);
        const rodLength = this.length * scale;
        
        // Calculate bob position
        const bobX = pivotX + rodLength * Math.sin(this.angle);
        const bobY = pivotY + rodLength * Math.cos(this.angle);
        
        // Draw arc showing motion range
        ctx.strokeStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#333' : '#e0e0e0';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(pivotX, pivotY, rodLength, 0, Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw reference line (vertical)
        ctx.strokeStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#444' : '#ddd';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(pivotX, pivotY + rodLength + 20);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw rod
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(pivotX, pivotY);
        ctx.lineTo(bobX, bobY);
        ctx.stroke();
        
        // Draw pivot point
        ctx.fillStyle = '#333';
        ctx.beginPath();
        ctx.arc(pivotX, pivotY, 8, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw bob
        const bobRadius = Math.sqrt(this.mass) * 12 + 10;
        
        const gradient = ctx.createRadialGradient(
            bobX - bobRadius/3, bobY - bobRadius/3, bobRadius/10,
            bobX, bobY, bobRadius
        );
        gradient.addColorStop(0, '#ff6600');
        gradient.addColorStop(1, '#cc3300');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(bobX, bobY, bobRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#aa2200';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Mass label
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.mass.toFixed(1) + ' kg', bobX, bobY + 5);
        
        // Draw angle arc
        if (Math.abs(this.angle) > 0.05) {
            const arcRadius = 50;
            ctx.strokeStyle = '#0000cc';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(pivotX, pivotY, arcRadius, Math.PI/2 - this.angle, Math.PI/2, this.angle < 0);
            ctx.stroke();
            
            ctx.fillStyle = '#0000cc';
            ctx.font = '14px Arial';
            const labelX = pivotX + arcRadius * 1.3 * Math.sin(this.angle / 2);
            const labelY = pivotY + arcRadius * 1.3 * Math.cos(this.angle / 2);
            ctx.fillText((this.angle * 180 / Math.PI).toFixed(1) + '°', labelX, labelY);
        }
        
        // Draw velocity vector
        if (Math.abs(this.angularVelocity) > 0.1) {
            const velMagnitude = Math.abs(this.angularVelocity * this.length);
            const velLength = Math.min(velMagnitude * 15, 80);
            
            // Velocity is perpendicular to rod
            const velAngle = this.angle + Math.PI / 2 * Math.sign(this.angularVelocity);
            const velEndX = bobX + velLength * Math.sin(velAngle);
            const velEndY = bobY + velLength * Math.cos(velAngle);
            
            ctx.strokeStyle = '#00aa00';
            ctx.fillStyle = '#00aa00';
            ctx.lineWidth = 3;
            
            ctx.beginPath();
            ctx.moveTo(bobX, bobY);
            ctx.lineTo(velEndX, velEndY);
            ctx.stroke();
            
            // Arrow head
            const headAngle = Math.atan2(velEndY - bobY, velEndX - bobX);
            ctx.beginPath();
            ctx.moveTo(velEndX, velEndY);
            ctx.lineTo(velEndX - 10 * Math.cos(headAngle - Math.PI/6), 
                      velEndY - 10 * Math.sin(headAngle - Math.PI/6));
            ctx.lineTo(velEndX - 10 * Math.cos(headAngle + Math.PI/6), 
                      velEndY - 10 * Math.sin(headAngle + Math.PI/6));
            ctx.closePath();
            ctx.fill();
            
            ctx.font = '11px Arial';
            ctx.fillText('v', velEndX + 10, velEndY);
        }
        
        // Draw length label
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e4e4e4' : '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        const midX = pivotX + (bobX - pivotX) / 2;
        const midY = pivotY + (bobY - pivotY) / 2;
        ctx.fillText('L = ' + this.length.toFixed(1) + ' m', midX + 10, midY);
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
            ctx.fillText('Angle vs Time (Simple Harmonic Motion)', 
                        canvas.width / 2, canvas.height / 2);
            return;
        }
        
        const padding = 50;
        const plotWidth = canvas.width - 2 * padding;
        const plotHeight = canvas.height - 2 * padding;
        
        const maxTime = Math.max(...this.timeData);
        const maxAngle = Math.max(...this.angleData.map(Math.abs), 10);
        
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
        ctx.fillText('Angle (degrees)', 0, 0);
        ctx.restore();
        
        // Draw angle curve
        ctx.strokeStyle = '#0000cc';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < this.timeData.length; i++) {
            const x = padding + (this.timeData[i] / maxTime) * plotWidth;
            const y = zeroY - (this.angleData[i] / maxAngle) * (plotHeight / 2) * 0.9;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        
        // Mark zero crossings
        ctx.fillStyle = '#ff0000';
        for (const crossing of this.crossings) {
            const x = padding + (crossing / maxTime) * plotWidth;
            ctx.beginPath();
            ctx.arc(x, zeroY, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Show period if measured
        if (this.measuredPeriod > 0 && this.crossings.length >= 2) {
            const lastCrossing = this.crossings[this.crossings.length - 1];
            const periodX = (lastCrossing / maxTime) * plotWidth;
            
            ctx.strokeStyle = '#ff6600';
            ctx.lineWidth = 2;
            ctx.setLineDash([3, 3]);
            ctx.beginPath();
            ctx.moveTo(padding + periodX, padding);
            ctx.lineTo(padding + periodX, canvas.height - padding);
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.fillStyle = '#ff6600';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText('T = ' + this.measuredPeriod.toFixed(2) + ' s', 
                        canvas.width - padding - 10, padding + 20);
        }
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

new PendulumMotion();
