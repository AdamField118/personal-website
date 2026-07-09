const container = document.getElementById('simulation-container');

container.innerHTML = `
    <div class="physics-sim-container">
        <div class="sim-header">
            <h2>Momentum and Collisions</h2>
            <p>Explore elastic and inelastic collisions. Momentum is always conserved!</p>
        </div>
        
        <div class="sim-layout">
            <div class="controls-panel">
                <h3>Controls</h3>
                
                <div class="control-group">
                    <label>Collision Type</label>
                    <select id="collisionType">
                        <option value="elastic">Elastic (e = 1.0)</option>
                        <option value="inelastic">Inelastic (e = 0.5)</option>
                        <option value="perfectly-inelastic">Perfectly Inelastic (e = 0)</option>
                    </select>
                </div>
                
                <div class="control-group">
                    <label>Ball 1 Mass (kg)</label>
                    <input type="range" id="mass1" min="1" max="20" value="5" step="0.5">
                    <span id="mass1Value">5.0</span>
                </div>
                
                <div class="control-group">
                    <label>Ball 1 Velocity (m/s)</label>
                    <input type="range" id="vel1" min="-10" max="10" value="5" step="0.5">
                    <span id="vel1Value">5.0</span>
                </div>
                
                <div class="control-group">
                    <label>Ball 2 Mass (kg)</label>
                    <input type="range" id="mass2" min="1" max="20" value="5" step="0.5">
                    <span id="mass2Value">5.0</span>
                </div>
                
                <div class="control-group">
                    <label>Ball 2 Velocity (m/s)</label>
                    <input type="range" id="vel2" min="-10" max="10" value="-3" step="0.5">
                    <span id="vel2Value">-3.0</span>
                </div>
                
                <div class="button-group">
                    <button id="start">Start Simulation</button>
                    <button id="reset">Reset</button>
                </div>
                
                <div class="info-panel">
                    <h4>Before Collision</h4>
                    <div class="info-row">
                        <span>Total Momentum:</span>
                        <span id="momentumBefore">0.0 kg·m/s</span>
                    </div>
                    <div class="info-row">
                        <span>Total KE:</span>
                        <span id="keBefore">0.0 J</span>
                    </div>
                </div>
                
                <div class="info-panel">
                    <h4>After Collision</h4>
                    <div class="info-row">
                        <span>Total Momentum:</span>
                        <span id="momentumAfter">0.0 kg·m/s</span>
                    </div>
                    <div class="info-row">
                        <span>Total KE:</span>
                        <span id="keAfter">0.0 J</span>
                    </div>
                    <div class="info-row">
                        <span>KE Lost:</span>
                        <span id="keLost">0.0 J</span>
                    </div>
                </div>
                
                <div class="equation-panel">
                    <h4>Conservation Laws</h4>
                    <div class="principle">
                        p<sub>before</sub> = p<sub>after</sub>
                    </div>
                    <p style="font-size: 11px; margin: 5px 0;">
                        Momentum is always conserved!
                    </p>
                    <div class="principle" style="font-size: 16px;">
                        KE conserved only in elastic collisions
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
        padding: 5px;
        border-radius: 5px;
        border: 1px solid #ccc;
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

class MomentumCollisions {
    constructor() {
        this.mainCanvas = document.getElementById('mainCanvas');
        this.plotCanvas = document.getElementById('plotCanvas');
        this.mainCtx = this.mainCanvas.getContext('2d');
        this.plotCtx = this.plotCanvas.getContext('2d');
        
        // Collision parameters
        this.collisionType = 'elastic';
        this.restitution = 1.0; // coefficient of restitution
        
        // Ball properties
        this.ball1 = {
            mass: 5,
            initVel: 5,
            vel: 5,
            pos: 200,
            radius: 25,
            color: '#cc0000'
        };
        
        this.ball2 = {
            mass: 5,
            initVel: -3,
            vel: -3,
            pos: 600,
            radius: 25,
            color: '#0000cc'
        };
        
        // State tracking
        this.time = 0;
        this.lastTime = 0;
        this.running = false;
        this.collided = false;
        
        // Conservation tracking
        this.initialMomentum = 0;
        this.initialKE = 0;
        this.finalMomentum = 0;
        this.finalKE = 0;
        
        // Data for plotting
        this.timeData = [];
        this.momentumData = [];
        this.keData = [];
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
        document.getElementById('collisionType').addEventListener('change', (e) => {
            this.collisionType = e.target.value;
            switch(this.collisionType) {
                case 'elastic':
                    this.restitution = 1.0;
                    break;
                case 'inelastic':
                    this.restitution = 0.5;
                    break;
                case 'perfectly-inelastic':
                    this.restitution = 0.0;
                    break;
            }
        });
        
        document.getElementById('mass1').addEventListener('input', (e) => {
            this.ball1.mass = parseFloat(e.target.value);
            this.ball1.radius = Math.sqrt(this.ball1.mass) * 5 + 15;
            this.updateDisplays();
        });
        
        document.getElementById('vel1').addEventListener('input', (e) => {
            this.ball1.initVel = parseFloat(e.target.value);
            this.ball1.vel = this.ball1.initVel;
            this.updateDisplays();
        });
        
        document.getElementById('mass2').addEventListener('input', (e) => {
            this.ball2.mass = parseFloat(e.target.value);
            this.ball2.radius = Math.sqrt(this.ball2.mass) * 5 + 15;
            this.updateDisplays();
        });
        
        document.getElementById('vel2').addEventListener('input', (e) => {
            this.ball2.initVel = parseFloat(e.target.value);
            this.ball2.vel = this.ball2.initVel;
            this.updateDisplays();
        });
        
        document.getElementById('start').addEventListener('click', () => {
            if (!this.running) {
                this.running = true;
                this.collided = false;
                this.ball1.vel = this.ball1.initVel;
                this.ball2.vel = this.ball2.initVel;
                this.calculateInitialValues();
                this.lastTime = performance.now();
                this.animate();
            }
        });
        
        document.getElementById('reset').addEventListener('click', () => {
            this.reset();
        });
        
        window.addEventListener('resize', () => this.setupCanvas());
    }
    
    calculateInitialValues() {
        this.initialMomentum = this.ball1.mass * this.ball1.vel + this.ball2.mass * this.ball2.vel;
        this.initialKE = 0.5 * this.ball1.mass * this.ball1.vel * this.ball1.vel + 
                         0.5 * this.ball2.mass * this.ball2.vel * this.ball2.vel;
    }
    
    updateDisplays() {
        document.getElementById('mass1Value').textContent = this.ball1.mass.toFixed(1);
        document.getElementById('vel1Value').textContent = this.ball1.initVel.toFixed(1);
        document.getElementById('mass2Value').textContent = this.ball2.mass.toFixed(1);
        document.getElementById('vel2Value').textContent = this.ball2.initVel.toFixed(1);
        
        const momentum = this.ball1.mass * this.ball1.vel + this.ball2.mass * this.ball2.vel;
        const ke = 0.5 * this.ball1.mass * this.ball1.vel * this.ball1.vel + 
                   0.5 * this.ball2.mass * this.ball2.vel * this.ball2.vel;
        
        document.getElementById('momentumBefore').textContent = this.initialMomentum.toFixed(2) + ' kg·m/s';
        document.getElementById('keBefore').textContent = this.initialKE.toFixed(2) + ' J';
        
        if (this.collided) {
            document.getElementById('momentumAfter').textContent = momentum.toFixed(2) + ' kg·m/s';
            document.getElementById('keAfter').textContent = ke.toFixed(2) + ' J';
            const keLost = this.initialKE - ke;
            document.getElementById('keLost').textContent = keLost.toFixed(2) + ' J' + 
                (keLost > 0.01 ? ' (energy dissipated)' : ' (conserved!)');
        }
    }
    
    reset() {
        this.running = false;
        this.collided = false;
        this.ball1.pos = 200;
        this.ball1.vel = this.ball1.initVel;
        this.ball2.pos = 600;
        this.ball2.vel = this.ball2.initVel;
        this.time = 0;
        this.timeData = [];
        this.momentumData = [];
        this.keData = [];
        this.initialMomentum = 0;
        this.initialKE = 0;
        this.updateDisplays();
        this.draw();
        this.drawPlot();
    }
    
    checkCollision() {
        const distance = Math.abs(this.ball1.pos - this.ball2.pos);
        const minDistance = this.ball1.radius + this.ball2.radius;
        
        if (distance <= minDistance && !this.collided) {
            this.handleCollision();
            this.collided = true;
        }
    }
    
    handleCollision() {
        // Calculate velocities after collision using conservation laws
        const m1 = this.ball1.mass;
        const m2 = this.ball2.mass;
        const u1 = this.ball1.vel;
        const u2 = this.ball2.vel;
        const e = this.restitution;
        
        if (e === 0) {
            // Perfectly inelastic - objects stick together
            const vFinal = (m1 * u1 + m2 * u2) / (m1 + m2);
            this.ball1.vel = vFinal;
            this.ball2.vel = vFinal;
        } else {
            // Use coefficient of restitution equation
            // v2 - v1 = -e(u2 - u1)
            // Combined with momentum conservation
            this.ball1.vel = ((m1 - e * m2) * u1 + m2 * (1 + e) * u2) / (m1 + m2);
            this.ball2.vel = ((m2 - e * m1) * u2 + m1 * (1 + e) * u1) / (m1 + m2);
        }
        
        // Store final values
        this.finalMomentum = m1 * this.ball1.vel + m2 * this.ball2.vel;
        this.finalKE = 0.5 * m1 * this.ball1.vel * this.ball1.vel + 
                       0.5 * m2 * this.ball2.vel * this.ball2.vel;
    }
    
    physics(dt) {
        // Update positions
        this.ball1.pos += this.ball1.vel * dt * 50; // Scale for visualization
        this.ball2.pos += this.ball2.vel * dt * 50;
        
        // Check for collision
        this.checkCollision();
        
        this.time += dt;
        
        // Calculate current momentum and KE
        const momentum = this.ball1.mass * this.ball1.vel + this.ball2.mass * this.ball2.vel;
        const ke = 0.5 * this.ball1.mass * this.ball1.vel * this.ball1.vel + 
                   0.5 * this.ball2.mass * this.ball2.vel * this.ball2.vel;
        
        // Store data
        this.timeData.push(this.time);
        this.momentumData.push(momentum);
        this.keData.push(ke);
        
        if (this.timeData.length > this.maxDataPoints) {
            this.timeData.shift();
            this.momentumData.shift();
            this.keData.shift();
        }
        
        // Stop if balls are off screen
        if (this.ball1.pos < -100 || this.ball1.pos > this.mainCanvas.width + 100 ||
            this.ball2.pos < -100 || this.ball2.pos > this.mainCanvas.width + 100) {
            this.running = false;
        }
    }
    
    draw() {
        const ctx = this.mainCtx;
        const canvas = this.mainCanvas;
        
        ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw center line
        ctx.strokeStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#444' : '#ddd';
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, 0);
        ctx.lineTo(canvas.width / 2, canvas.height);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw ball 1
        ctx.fillStyle = this.ball1.color;
        ctx.beginPath();
        ctx.arc(this.ball1.pos, canvas.height / 2, this.ball1.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#880000';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.ball1.mass.toFixed(1) + ' kg', this.ball1.pos, canvas.height / 2 + 5);
        
        // Draw ball 2
        ctx.fillStyle = this.ball2.color;
        ctx.beginPath();
        ctx.arc(this.ball2.pos, canvas.height / 2, this.ball2.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000088';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.ball2.mass.toFixed(1) + ' kg', this.ball2.pos, canvas.height / 2 + 5);
        
        // Draw velocity vectors
        const drawVelocityArrow = (pos, vel, color) => {
            if (Math.abs(vel) < 0.1) return;
            
            const arrowLength = Math.min(Math.abs(vel) * 10, 80);
            const y = canvas.height / 2 - 60;
            
            ctx.strokeStyle = color;
            ctx.fillStyle = color;
            ctx.lineWidth = 3;
            
            ctx.beginPath();
            ctx.moveTo(pos, y);
            ctx.lineTo(pos + arrowLength * Math.sign(vel), y);
            ctx.stroke();
            
            const headX = pos + arrowLength * Math.sign(vel);
            ctx.beginPath();
            ctx.moveTo(headX, y);
            ctx.lineTo(headX - 10 * Math.sign(vel), y - 5);
            ctx.lineTo(headX - 10 * Math.sign(vel), y + 5);
            ctx.closePath();
            ctx.fill();
            
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(vel.toFixed(1) + ' m/s', pos + arrowLength * Math.sign(vel) / 2, y - 10);
        };
        
        drawVelocityArrow(this.ball1.pos, this.ball1.vel, '#00aa00');
        drawVelocityArrow(this.ball2.pos, this.ball2.vel, '#00aa00');
        
        // Draw collision indicator
        if (this.collided) {
            ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e4e4e4' : '#333';
            ctx.font = 'bold 16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('COLLISION!', canvas.width / 2, 30);
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
            ctx.fillText('Conservation of Momentum and Energy', 
                        canvas.width / 2, canvas.height / 2);
            return;
        }
        
        const padding = 50;
        const plotWidth = canvas.width - 2 * padding;
        const plotHeight = canvas.height - 2 * padding;
        
        const maxTime = Math.max(...this.timeData);
        const maxMomentum = Math.max(...this.momentumData.map(Math.abs), 10);
        const maxKE = Math.max(...this.keData, 10);
        
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
        
        // Normalize and draw curves
        const drawCurve = (data, color, max) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let i = 0; i < this.timeData.length; i++) {
                const x = padding + (this.timeData[i] / maxTime) * plotWidth;
                const y = canvas.height - padding - (data[i] / max) * plotHeight * 0.9;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        };
        
        drawCurve(this.momentumData, '#ff6600', maxMomentum);
        drawCurve(this.keData, '#00aa00', maxKE);
        
        // Legend
        const legendX = canvas.width - padding - 100;
        const legendY = padding + 20;
        
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(legendX, legendY);
        ctx.lineTo(legendX + 30, legendY);
        ctx.stroke();
        
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e4e4e4' : '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Momentum', legendX + 35, legendY + 4);
        
        ctx.strokeStyle = '#00aa00';
        ctx.beginPath();
        ctx.moveTo(legendX, legendY + 20);
        ctx.lineTo(legendX + 30, legendY + 20);
        ctx.stroke();
        ctx.fillText('Kinetic Energy', legendX + 35, legendY + 24);
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

new MomentumCollisions();
