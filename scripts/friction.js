const container = document.getElementById('simulation-container');

container.innerHTML = `
    <div class="physics-sim-container">
        <div class="sim-header">
            <h2>Friction Forces</h2>
            <p>Explore static and kinetic friction. Static friction prevents motion, kinetic friction opposes it!</p>
        </div>
        
        <div class="sim-layout">
            <div class="controls-panel">
                <h3>Controls</h3>
                
                <div class="control-group">
                    <label>Object Mass (kg)</label>
                    <input type="range" id="mass" min="1" max="20" value="5" step="0.5">
                    <span id="massValue">5.0</span>
                </div>
                
                <div class="control-group">
                    <label>Applied Force (N)</label>
                    <input type="range" id="force" min="0" max="150" value="0" step="5">
                    <span id="forceValue">0</span>
                </div>
                
                <div class="control-group">
                    <label>Coefficient of Static Friction (μₛ)</label>
                    <input type="range" id="staticFriction" min="0.1" max="1.0" value="0.6" step="0.05">
                    <span id="staticValue">0.60</span>
                </div>
                
                <div class="control-group">
                    <label>Coefficient of Kinetic Friction (μₖ)</label>
                    <input type="range" id="kineticFriction" min="0.05" max="0.8" value="0.4" step="0.05">
                    <span id="kineticValue">0.40</span>
                </div>
                
                <div class="control-group">
                    <label>Surface Angle (degrees)</label>
                    <input type="range" id="angle" min="0" max="45" value="0" step="5">
                    <span id="angleValue">0</span>
                </div>
                
                <div class="button-group">
                    <button id="apply">Apply Force</button>
                    <button id="reset">Reset</button>
                </div>
                
                <div class="info-panel">
                    <h4>Force Analysis</h4>
                    <div class="info-row">
                        <span>Applied Force:</span>
                        <span id="appliedDisplay">0.0 N</span>
                    </div>
                    <div class="info-row">
                        <span>Normal Force:</span>
                        <span id="normalDisplay">0.0 N</span>
                    </div>
                    <div class="info-row">
                        <span>Max Static Friction:</span>
                        <span id="maxStaticDisplay">0.0 N</span>
                    </div>
                    <div class="info-row">
                        <span>Kinetic Friction:</span>
                        <span id="kineticDisplay">0.0 N</span>
                    </div>
                    <div class="info-row">
                        <span>Net Force:</span>
                        <span id="netForceDisplay">0.0 N</span>
                    </div>
                    <div class="info-row">
                        <span>Status:</span>
                        <span id="statusDisplay" style="color: #ff6600;">Stationary</span>
                    </div>
                </div>
                
                <div class="equation-panel">
                    <h4>Friction Equations</h4>
                    <div class="principle" style="font-size: 16px;">
                        f<sub>s,max</sub> = μₛN
                    </div>
                    <div class="principle" style="font-size: 16px;">
                        f<sub>k</sub> = μₖN
                    </div>
                    <p style="font-size: 11px; margin: 5px 0;">
                        N = Normal force perpendicular to surface
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

class FrictionForces {
    constructor() {
        this.mainCanvas = document.getElementById('mainCanvas');
        this.plotCanvas = document.getElementById('plotCanvas');
        this.mainCtx = this.mainCanvas.getContext('2d');
        this.plotCtx = this.plotCanvas.getContext('2d');
        
        // Parameters
        this.mass = 5;
        this.appliedForce = 0;
        this.muStatic = 0.6;
        this.muKinetic = 0.4;
        this.angle = 0; // degrees
        this.g = 9.81;
        
        // State
        this.position = 200;
        this.velocity = 0;
        this.moving = false;
        this.running = false;
        
        // Forces
        this.normalForce = 0;
        this.maxStaticFriction = 0;
        this.kineticFriction = 0;
        this.netForce = 0;
        
        // Time tracking
        this.time = 0;
        this.lastTime = 0;
        
        // Data for plotting
        this.forceHistory = [];
        this.frictionHistory = [];
        this.maxDataPoints = 100;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.calculateForces();
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
            this.calculateForces();
            this.updateDisplays();
            this.draw();
        });
        
        document.getElementById('force').addEventListener('input', (e) => {
            this.appliedForce = parseFloat(e.target.value);
            this.calculateForces();
            this.updateDisplays();
            this.draw();
        });
        
        document.getElementById('staticFriction').addEventListener('input', (e) => {
            this.muStatic = parseFloat(e.target.value);
            this.calculateForces();
            this.updateDisplays();
            this.draw();
        });
        
        document.getElementById('kineticFriction').addEventListener('input', (e) => {
            this.muKinetic = parseFloat(e.target.value);
            this.calculateForces();
            this.updateDisplays();
            this.draw();
        });
        
        document.getElementById('angle').addEventListener('input', (e) => {
            this.angle = parseFloat(e.target.value);
            this.calculateForces();
            this.updateDisplays();
            this.draw();
        });
        
        document.getElementById('apply').addEventListener('click', () => {
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
    
    calculateForces() {
        const angleRad = this.angle * Math.PI / 180;
        
        // Normal force perpendicular to surface
        this.normalForce = this.mass * this.g * Math.cos(angleRad);
        
        // Component of weight along the incline
        const weightComponent = this.mass * this.g * Math.sin(angleRad);
        
        // Maximum static friction
        this.maxStaticFriction = this.muStatic * this.normalForce;
        
        // Kinetic friction
        this.kineticFriction = this.muKinetic * this.normalForce;
        
        // Net force along the surface
        const totalAppliedForce = this.appliedForce - weightComponent;
        
        if (!this.moving) {
            // Check if applied force exceeds max static friction
            if (Math.abs(totalAppliedForce) > this.maxStaticFriction) {
                this.moving = true;
                this.netForce = totalAppliedForce - this.kineticFriction * Math.sign(totalAppliedForce);
            } else {
                this.netForce = 0;
            }
        } else {
            // Object is moving - use kinetic friction
            this.netForce = totalAppliedForce - this.kineticFriction * Math.sign(this.velocity || totalAppliedForce);
            
            // Stop if velocity becomes very small and force is insufficient
            if (Math.abs(this.velocity) < 0.1 && Math.abs(totalAppliedForce) < this.maxStaticFriction) {
                this.velocity = 0;
                this.moving = false;
                this.netForce = 0;
            }
        }
    }
    
    updateDisplays() {
        document.getElementById('massValue').textContent = this.mass.toFixed(1);
        document.getElementById('forceValue').textContent = this.appliedForce.toFixed(0);
        document.getElementById('staticValue').textContent = this.muStatic.toFixed(2);
        document.getElementById('kineticValue').textContent = this.muKinetic.toFixed(2);
        document.getElementById('angleValue').textContent = this.angle.toFixed(0);
        
        document.getElementById('appliedDisplay').textContent = this.appliedForce.toFixed(1) + ' N';
        document.getElementById('normalDisplay').textContent = this.normalForce.toFixed(1) + ' N';
        document.getElementById('maxStaticDisplay').textContent = this.maxStaticFriction.toFixed(1) + ' N';
        document.getElementById('kineticDisplay').textContent = this.kineticFriction.toFixed(1) + ' N';
        document.getElementById('netForceDisplay').textContent = this.netForce.toFixed(1) + ' N';
        
        const statusEl = document.getElementById('statusDisplay');
        if (this.moving) {
            statusEl.textContent = 'Moving';
            statusEl.style.color = '#00aa00';
        } else {
            statusEl.textContent = 'Stationary';
            statusEl.style.color = '#ff6600';
        }
    }
    
    reset() {
        this.running = false;
        this.moving = false;
        this.position = 200;
        this.velocity = 0;
        this.time = 0;
        this.forceHistory = [];
        this.frictionHistory = [];
        this.calculateForces();
        this.updateDisplays();
        this.draw();
        this.drawPlot();
    }
    
    physics(dt) {
        this.calculateForces();
        
        if (this.moving || this.netForce !== 0) {
            // F = ma
            const acceleration = this.netForce / this.mass;
            this.velocity += acceleration * dt;
            this.position += this.velocity * dt * 30; // Scale for visualization
        }
        
        this.time += dt;
        
        // Keep object on screen
        if (this.position < 100) {
            this.position = 100;
            this.velocity = 0;
            this.moving = false;
        }
        if (this.position > this.mainCanvas.width - 100) {
            this.position = this.mainCanvas.width - 100;
            this.velocity = 0;
            this.moving = false;
        }
        
        // Store friction data
        const actualFriction = this.moving ? this.kineticFriction : 
                              (Math.abs(this.appliedForce) < this.maxStaticFriction ? 
                               this.appliedForce : this.maxStaticFriction);
        
        this.forceHistory.push(this.appliedForce);
        this.frictionHistory.push(actualFriction);
        
        if (this.forceHistory.length > this.maxDataPoints) {
            this.forceHistory.shift();
            this.frictionHistory.shift();
        }
    }
    
    draw() {
        const ctx = this.mainCtx;
        const canvas = this.mainCanvas;
        
        ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const angleRad = this.angle * Math.PI / 180;
        
        // Draw surface
        const surfaceY = canvas.height * 0.7;
        const surfaceLength = canvas.width;
        
        ctx.save();
        ctx.translate(0, surfaceY);
        ctx.rotate(-angleRad);
        
        // Surface
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, 0, surfaceLength, 30);
        
        // Surface texture
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 2;
        for (let i = 0; i < surfaceLength; i += 30) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + 15, 15);
            ctx.stroke();
        }
        
        ctx.restore();
        
        // Draw object on surface
        const boxSize = Math.sqrt(this.mass) * 10;
        
        ctx.save();
        ctx.translate(this.position, surfaceY);
        ctx.rotate(-angleRad);
        
        // Box
        ctx.fillStyle = '#00458b';
        ctx.fillRect(-boxSize/2, -boxSize, boxSize, boxSize);
        
        ctx.strokeStyle = '#003366';
        ctx.lineWidth = 2;
        ctx.strokeRect(-boxSize/2, -boxSize, boxSize, boxSize);
        
        // Mass label
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.mass.toFixed(1) + ' kg', 0, -boxSize/2 + 5);
        
        // Draw applied force arrow
        if (this.appliedForce > 0) {
            const arrowLength = Math.min(this.appliedForce * 0.8, 100);
            
            ctx.strokeStyle = '#ff0000';
            ctx.fillStyle = '#ff0000';
            ctx.lineWidth = 3;
            
            ctx.beginPath();
            ctx.moveTo(boxSize/2, -boxSize/2);
            ctx.lineTo(boxSize/2 + arrowLength, -boxSize/2);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(boxSize/2 + arrowLength, -boxSize/2);
            ctx.lineTo(boxSize/2 + arrowLength - 10, -boxSize/2 - 5);
            ctx.lineTo(boxSize/2 + arrowLength - 10, -boxSize/2 + 5);
            ctx.closePath();
            ctx.fill();
            
            ctx.font = '12px Arial';
            ctx.fillText('F = ' + this.appliedForce.toFixed(0) + ' N', 
                        boxSize/2 + arrowLength/2, -boxSize/2 - 10);
        }
        
        // Draw friction force arrow
        const frictionForce = this.moving ? this.kineticFriction : 
                             (Math.abs(this.appliedForce) < this.maxStaticFriction ? 
                              this.appliedForce : this.maxStaticFriction);
        
        if (frictionForce > 0.1) {
            const frictionLength = Math.min(frictionForce * 0.8, 100);
            
            ctx.strokeStyle = '#ff6600';
            ctx.fillStyle = '#ff6600';
            ctx.lineWidth = 3;
            
            ctx.beginPath();
            ctx.moveTo(-boxSize/2, -boxSize/2);
            ctx.lineTo(-boxSize/2 - frictionLength, -boxSize/2);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(-boxSize/2 - frictionLength, -boxSize/2);
            ctx.lineTo(-boxSize/2 - frictionLength + 10, -boxSize/2 - 5);
            ctx.lineTo(-boxSize/2 - frictionLength + 10, -boxSize/2 + 5);
            ctx.closePath();
            ctx.fill();
            
            ctx.font = '12px Arial';
            ctx.fillText('f = ' + frictionForce.toFixed(0) + ' N', 
                        -boxSize/2 - frictionLength/2, -boxSize/2 - 10);
        }
        
        // Draw normal force arrow
        const normalLength = Math.min(this.normalForce * 0.5, 80);
        
        ctx.strokeStyle = '#0000cc';
        ctx.fillStyle = '#0000cc';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(0, -boxSize);
        ctx.lineTo(0, -boxSize - normalLength);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, -boxSize - normalLength);
        ctx.lineTo(-5, -boxSize - normalLength + 10);
        ctx.lineTo(5, -boxSize - normalLength + 10);
        ctx.closePath();
        ctx.fill();
        
        ctx.font = '11px Arial';
        ctx.fillText('N', 10, -boxSize - normalLength/2);
        
        ctx.restore();
        
        // Draw angle indicator
        if (this.angle > 0) {
            ctx.strokeStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#666' : '#999';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(50, surfaceY, 40, -angleRad, 0);
            ctx.stroke();
            
            ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e4e4e4' : '#333';
            ctx.font = '14px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(this.angle.toFixed(0) + '°', 50, surfaceY - 50);
        }
    }
    
    drawPlot() {
        const ctx = this.plotCtx;
        const canvas = this.plotCanvas;
        
        ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (this.forceHistory.length < 2) {
            ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#666' : '#999';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Applied Force vs Friction Force', 
                        canvas.width / 2, canvas.height / 2);
            return;
        }
        
        const padding = 50;
        const plotWidth = canvas.width - 2 * padding;
        const plotHeight = canvas.height - 2 * padding;
        
        const maxForce = Math.max(
            ...this.forceHistory,
            ...this.frictionHistory,
            this.maxStaticFriction,
            10
        );
        
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
        ctx.fillText('Time Steps', canvas.width / 2, canvas.height - 10);
        
        ctx.save();
        ctx.translate(15, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Force (N)', 0, 0);
        ctx.restore();
        
        // Draw max static friction line
        const maxStaticY = canvas.height - padding - (this.maxStaticFriction / maxForce) * plotHeight * 0.9;
        ctx.strokeStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#666' : '#999';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(padding, maxStaticY);
        ctx.lineTo(canvas.width - padding, maxStaticY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#888' : '#666';
        ctx.font = '11px Arial';
        ctx.textAlign = 'right';
        ctx.fillText('f_s,max', padding - 5, maxStaticY);
        
        // Draw force curves
        const drawCurve = (data, color) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let i = 0; i < data.length; i++) {
                const x = padding + (i / this.maxDataPoints) * plotWidth;
                const y = canvas.height - padding - (data[i] / maxForce) * plotHeight * 0.9;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        };
        
        drawCurve(this.forceHistory, '#ff0000');
        drawCurve(this.frictionHistory, '#ff6600');
        
        // Legend
        const legendX = canvas.width - padding - 110;
        const legendY = padding + 20;
        
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(legendX, legendY);
        ctx.lineTo(legendX + 30, legendY);
        ctx.stroke();
        
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e4e4e4' : '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Applied Force', legendX + 35, legendY + 4);
        
        ctx.strokeStyle = '#ff6600';
        ctx.beginPath();
        ctx.moveTo(legendX, legendY + 20);
        ctx.lineTo(legendX + 30, legendY + 20);
        ctx.stroke();
        ctx.fillText('Friction Force', legendX + 35, legendY + 24);
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

new FrictionForces();
