const container = document.getElementById('simulation-container');

container.innerHTML = `
    <div class="physics-sim-container">
        <div class="sim-header">
            <h2>Newton's Third Law: Action and Reaction</h2>
            <p>For every action, there is an equal and opposite reaction. Forces always occur in pairs.</p>
            <div class="scenario-selector">
                <label>Scenario:</label>
                <select id="scenario">
                    <option value="push">Push Apart (Repulsion)</option>
                    <option value="pull">Pull Together (Attraction)</option>
                    <option value="spring">Spring Connection</option>
                </select>
            </div>
        </div>
        
        <div class="sim-layout">
            <div class="controls-panel">
                <h3>Controls</h3>
                
                <div class="control-group">
                    <label>Object A Mass (kg)</label>
                    <input type="range" id="massA" min="1" max="20" value="5" step="0.5">
                    <span id="massAValue">5.0</span>
                </div>
                
                <div class="control-group">
                    <label>Object B Mass (kg)</label>
                    <input type="range" id="massB" min="1" max="20" value="10" step="0.5">
                    <span id="massBValue">10.0</span>
                </div>
                
                <div class="control-group" id="forceGroup">
                    <label>Interaction Force (N)</label>
                    <input type="range" id="force" min="10" max="300" value="100" step="10">
                    <span id="forceValue">100</span>
                </div>
                
                <div class="control-group">
                    <label>
                        <input type="checkbox" id="showTrails" checked>
                        Show Motion Trails
                    </label>
                </div>
                
                <div class="control-group">
                    <label>
                        <input type="checkbox" id="showCOM" checked>
                        Show Center of Mass
                    </label>
                </div>
                
                <div class="control-group">
                    <label>
                        <input type="checkbox" id="showVectors" checked>
                        Show Force Vectors
                    </label>
                </div>
                
                <div class="button-group">
                    <button id="interact">▶ Start Interaction</button>
                    <button id="pause">⏸ Pause</button>
                    <button id="reset">↻ Reset</button>
                    <button id="export">💾 Export Data</button>
                </div>
                
                <div class="info-panel">
                    <h4>Object A (Red)</h4>
                    <div class="info-row">
                        <span>Force on A:</span>
                        <span id="forceADisplay">0.0 N</span>
                    </div>
                    <div class="info-row">
                        <span>Acceleration:</span>
                        <span id="accelADisplay">0.0 m/s²</span>
                    </div>
                    <div class="info-row">
                        <span>Velocity:</span>
                        <span id="velADisplay">0.0 m/s</span>
                    </div>
                    <div class="info-row">
                        <span>Momentum:</span>
                        <span id="momADisplay">0.0 kg·m/s</span>
                    </div>
                </div>
                
                <div class="info-panel">
                    <h4>Object B (Blue)</h4>
                    <div class="info-row">
                        <span>Force on B:</span>
                        <span id="forceBDisplay">0.0 N</span>
                    </div>
                    <div class="info-row">
                        <span>Acceleration:</span>
                        <span id="accelBDisplay">0.0 m/s²</span>
                    </div>
                    <div class="info-row">
                        <span>Velocity:</span>
                        <span id="velBDisplay">0.0 m/s</span>
                    </div>
                    <div class="info-row">
                        <span>Momentum:</span>
                        <span id="momBDisplay">0.0 kg·m/s</span>
                    </div>
                </div>
                
                <div class="info-panel">
                    <h4>System</h4>
                    <div class="info-row">
                        <span>Total Momentum:</span>
                        <span id="totalMomDisplay">0.0 kg·m/s</span>
                    </div>
                    <div class="info-row">
                        <span>Time:</span>
                        <span id="timeDisplay">0.0 s</span>
                    </div>
                </div>
                
                <div class="equation-panel">
                    <h4>Key Principle</h4>
                    <div class="principle">F<sub>A→B</sub> = -F<sub>B→A</sub></div>
                    <p style="font-size: 12px; margin-top: 10px; text-align: center;">
                        Equal magnitude, opposite direction!
                    </p>
                </div>
                
                <div class="help-panel">
                    <h4>💡 Tips</h4>
                    <ul id="helpText">
                        <li>Try different scenarios</li>
                        <li>Watch how momentum is conserved</li>
                        <li>Lighter objects accelerate more</li>
                        <li>Press Space to start/pause</li>
                    </ul>
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
    
    .scenario-selector {
        margin-top: 15px;
    }
    
    .scenario-selector label {
        font-weight: bold;
        margin-right: 10px;
    }
    
    .scenario-selector select {
        padding: 6px 12px;
        border-radius: 5px;
        border: 2px solid #00458b;
        font-size: 14px;
        background: white;
    }
    
    .sim-layout {
        display: flex;
        gap: 20px;
    }
    
    .controls-panel {
        min-width: 300px;
        max-width: 320px;
        background: #f8f8f8;
        padding: 20px;
        border-radius: 8px;
        height: fit-content;
        max-height: 90vh;
        overflow-y: auto;
    }
    
    .controls-panel h3 {
        margin-top: 0;
        color: #00458b;
    }
    
    .control-group {
        margin-bottom: 18px;
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
        width: 18px;
        height: 18px;
        margin-right: 8px;
        cursor: pointer;
        vertical-align: middle;
    }
    
    .control-group span {
        display: inline-block;
        min-width: 60px;
        font-family: monospace;
        color: #00458b;
        font-weight: bold;
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
        font-weight: bold;
        transition: all 0.2s;
    }
    
    .button-group button:hover {
        background: #003366;
        transform: translateY(-1px);
    }
    
    .button-group button:active {
        transform: translateY(0);
    }
    
    .info-panel, .equation-panel, .help-panel {
        background: white;
        padding: 15px;
        border-radius: 5px;
        margin-top: 20px;
    }
    
    .info-panel h4, .equation-panel h4, .help-panel h4 {
        margin-top: 0;
        color: #00458b;
        font-size: 15px;
    }
    
    .info-row {
        display: flex;
        justify-content: space-between;
        margin: 8px 0;
        font-size: 13px;
    }
    
    .info-row span:last-child {
        font-family: monospace;
        font-weight: bold;
        color: #00458b;
    }
    
    .principle {
        text-align: center;
        font-size: 20px;
        font-weight: bold;
        color: #00458b;
        margin: 15px 0;
        font-family: 'Times New Roman', serif;
        padding: 10px;
        background: #f0f8ff;
        border-radius: 5px;
    }
    
    .help-panel ul {
        margin: 10px 0;
        padding-left: 20px;
        font-size: 13px;
        line-height: 1.6;
    }
    
    .help-panel li {
        margin-bottom: 6px;
    }
    
    .visualization-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    #mainCanvas {
        width: 100%;
        height: 450px;
        background: white;
        border: 2px solid #ddd;
        border-radius: 8px;
        cursor: crosshair;
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
        
        .scenario-selector select {
            background: #2a2a2a;
            color: #e4e4e4;
            border-color: #7db3f0;
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
        
        .info-panel, .equation-panel, .help-panel {
            background: #1a1a1a;
            color: #e4e4e4;
        }
        
        .info-panel h4, .equation-panel h4, .help-panel h4 {
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
            background: #0a0a0a;
            border-color: #404040;
        }
    }
    
    @media (max-width: 768px) {
        .sim-layout {
            flex-direction: column;
        }
        
        .controls-panel {
            width: 100%;
            max-width: 100%;
        }
        
        #mainCanvas {
            height: 350px;
        }
    }
`;
document.head.appendChild(style);

class NewtonsThirdLaw {
    constructor() {
        this.mainCanvas = document.getElementById('mainCanvas');
        this.plotCanvas = document.getElementById('plotCanvas');
        this.mainCtx = this.mainCanvas.getContext('2d');
        this.plotCtx = this.plotCanvas.getContext('2d');
        
        // Scenarios
        this.currentScenario = 'push';
        
        // Object properties
        this.massA = 5;
        this.massB = 10;
        this.interactionForce = 100;
        this.initialVelocity = 10;
        this.springRestLength = 200; // For spring scenario (in pixels)
        
        // Visual settings
        this.showTrails = true;
        this.showCOM = true;
        this.showVectors = true;
        
        // Object states
        this.objectA = {
            pos: 200,
            vel: 0,
            accel: 0,
            force: 0,
            trail: []
        };
        
        this.objectB = {
            pos: 600,
            vel: 0,
            accel: 0,
            force: 0,
            trail: []
        };
        
        // Time tracking
        this.time = 0;
        this.lastTime = 0;
        this.running = false;
        this.interacting = false;
        this.interactionTime = 0;
        this.interactionDuration = 0.3;
        
        // Data
        this.timeData = [];
        this.momentumAData = [];
        this.momentumBData = [];
        this.totalMomentumData = [];
        this.maxDataPoints = 300;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.updateScenario();
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
        // Scenario selector
        document.getElementById('scenario').addEventListener('change', (e) => {
            this.currentScenario = e.target.value;
            this.updateScenario();
            this.reset();
        });
        
        // Sliders
        document.getElementById('massA').addEventListener('input', (e) => {
            this.massA = parseFloat(e.target.value);
            document.getElementById('massAValue').textContent = this.massA.toFixed(1);
            this.updateDisplays();
        });
        
        document.getElementById('massB').addEventListener('input', (e) => {
            this.massB = parseFloat(e.target.value);
            document.getElementById('massBValue').textContent = this.massB.toFixed(1);
            this.updateDisplays();
        });
        
        document.getElementById('force').addEventListener('input', (e) => {
            this.interactionForce = parseFloat(e.target.value);
            document.getElementById('forceValue').textContent = this.interactionForce.toFixed(0);
        });
        
        // Checkboxes
        document.getElementById('showTrails').addEventListener('change', (e) => {
            this.showTrails = e.target.checked;
            if (!this.showTrails) {
                this.objectA.trail = [];
                this.objectB.trail = [];
            }
            this.draw();
        });
        
        document.getElementById('showCOM').addEventListener('change', (e) => {
            this.showCOM = e.target.checked;
            this.draw();
        });
        
        document.getElementById('showVectors').addEventListener('change', (e) => {
            this.showVectors = e.target.checked;
            this.draw();
        });
        
        // Buttons
        document.getElementById('interact').addEventListener('click', () => {
            if (!this.running) {
                this.startInteraction();
            }
        });
        
        document.getElementById('pause').addEventListener('click', () => {
            this.running = false;
        });
        
        document.getElementById('reset').addEventListener('click', () => {
            this.reset();
        });
        
        document.getElementById('export').addEventListener('click', () => {
            this.exportData();
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
            
            switch(e.key) {
                case ' ':
                    if (this.running) {
                        this.running = false;
                    } else if (!this.running && this.time === 0) {
                        this.startInteraction();
                    } else {
                        this.running = true;
                        this.lastTime = performance.now();
                        this.animate();
                    }
                    e.preventDefault();
                    break;
                case 'r':
                case 'R':
                    this.reset();
                    break;
            }
        });
        
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.draw();
            this.drawPlot();
        });
    }
    
    updateScenario() {
        const forceGroup = document.getElementById('forceGroup');
        const helpText = document.getElementById('helpText');
        
        forceGroup.style.display = 'block';
        
        switch(this.currentScenario) {
            case 'push':
                document.getElementById('force').max = 300;
                document.getElementById('force').value = 100;
                this.interactionForce = 100;
                document.getElementById('forceValue').textContent = '100';
                forceGroup.querySelector('label').textContent = 'Interaction Force (N)';
                helpText.innerHTML = `
                    <li>Like ice skaters pushing apart</li>
                    <li>Equal forces, opposite directions</li>
                    <li>Lighter object accelerates more (a = F/m)</li>
                    <li>Total momentum stays zero</li>
                `;
                this.interactionDuration = 0.3;
                break;
                
            case 'pull':
                document.getElementById('force').max = 300;
                document.getElementById('force').value = 100;
                this.interactionForce = 100;
                document.getElementById('forceValue').textContent = '100';
                forceGroup.querySelector('label').textContent = 'Interaction Force (N)';
                helpText.innerHTML = `
                    <li>Like magnets attracting each other</li>
                    <li>Both objects pulled with equal force</li>
                    <li>Forces point toward each other</li>
                    <li>Lighter mass moves faster toward center</li>
                `;
                this.interactionDuration = 0.3;
                break;
                
            case 'spring':
                document.getElementById('force').max = 20;
                document.getElementById('force').value = 5;
                this.interactionForce = 5;
                document.getElementById('forceValue').textContent = '5';
                forceGroup.querySelector('label').textContent = 'Spring Constant k (N/m)';
                helpText.innerHTML = `
                    <li>Objects connected by spring</li>
                    <li>Spring force: F = -k·Δx</li>
                    <li>Equal and opposite forces always</li>
                    <li>Objects oscillate around center</li>
                `;
                this.interactionDuration = 999; // Continuous
                break;
        }
    }
    
    startInteraction() {
        this.interacting = true;
        this.interactionTime = 0;
        this.running = true;
        this.lastTime = performance.now();
        
        // Set initial conditions based on scenario
        if (this.currentScenario === 'push') {
            // Start close together
            this.objectA.pos = this.mainCanvas.width / 2 - 50;
            this.objectB.pos = this.mainCanvas.width / 2 + 50;
            this.objectA.vel = 0;
            this.objectB.vel = 0;
        } else if (this.currentScenario === 'pull') {
            // Start far apart
            this.objectA.pos = 150;
            this.objectB.pos = this.mainCanvas.width - 150;
            this.objectA.vel = 0;
            this.objectB.vel = 0;
        } else if (this.currentScenario === 'spring') {
            // Start with spring stretched
            this.objectA.pos = this.mainCanvas.width / 2 - 250;
            this.objectB.pos = this.mainCanvas.width / 2 + 250;
            this.objectA.vel = 0;
            this.objectB.vel = 0;
            this.springRestLength = 200; // Natural length in pixels (so starts with 300 pixels apart = stretched by 100)
        }
        
        this.animate();
    }
    
    updateDisplays() {
        document.getElementById('forceADisplay').textContent = this.objectA.force.toFixed(1) + ' N';
        document.getElementById('forceBDisplay').textContent = this.objectB.force.toFixed(1) + ' N';
        
        document.getElementById('accelADisplay').textContent = this.objectA.accel.toFixed(2) + ' m/s²';
        document.getElementById('accelBDisplay').textContent = this.objectB.accel.toFixed(2) + ' m/s²';
        
        document.getElementById('velADisplay').textContent = this.objectA.vel.toFixed(2) + ' m/s';
        document.getElementById('velBDisplay').textContent = this.objectB.vel.toFixed(2) + ' m/s';
        
        const momA = this.massA * this.objectA.vel;
        const momB = this.massB * this.objectB.vel;
        const totalMom = momA + momB;
        
        document.getElementById('momADisplay').textContent = momA.toFixed(2) + ' kg·m/s';
        document.getElementById('momBDisplay').textContent = momB.toFixed(2) + ' kg·m/s';
        document.getElementById('totalMomDisplay').textContent = totalMom.toFixed(2) + ' kg·m/s';
        document.getElementById('timeDisplay').textContent = this.time.toFixed(2) + ' s';
    }
    
    reset() {
        this.running = false;
        this.interacting = false;
        this.interactionTime = 0;
        
        // Reset positions based on scenario
        if (this.currentScenario === 'push') {
            this.objectA = { pos: this.mainCanvas.width / 2 - 50, vel: 0, accel: 0, force: 0, trail: [] };
            this.objectB = { pos: this.mainCanvas.width / 2 + 50, vel: 0, accel: 0, force: 0, trail: [] };
        } else if (this.currentScenario === 'pull') {
            this.objectA = { pos: 150, vel: 0, accel: 0, force: 0, trail: [] };
            this.objectB = { pos: this.mainCanvas.width - 150, vel: 0, accel: 0, force: 0, trail: [] };
        } else if (this.currentScenario === 'spring') {
            this.objectA = { pos: this.mainCanvas.width / 2 - 250, vel: 0, accel: 0, force: 0, trail: [] };
            this.objectB = { pos: this.mainCanvas.width / 2 + 250, vel: 0, accel: 0, force: 0, trail: [] };
            this.springRestLength = 200;
        }
        
        this.time = 0;
        this.timeData = [];
        this.momentumAData = [];
        this.momentumBData = [];
        this.totalMomentumData = [];
        
        this.updateDisplays();
        this.draw();
        this.drawPlot();
    }
    
    physics(dt) {
        // Apply forces based on scenario
        if (this.currentScenario === 'spring') {
            // Spring force: F = -k * (x - x0)
            const currentLength = this.objectB.pos - this.objectA.pos;
            const displacement = (currentLength - this.springRestLength) / 10; // Scale down displacement
            
            const k = this.interactionForce; // Spring constant
            const springForce = -k * displacement;
            
            // Force on A is to the right if spring compressed (displacement < 0)
            this.objectA.force = springForce;
            // Force on B is equal and opposite
            this.objectB.force = -springForce;
            
            this.interacting = true; // Always active for spring
        } else if (this.interacting && this.interactionTime < this.interactionDuration) {
            // Apply constant force during interaction time
            if (this.currentScenario === 'push') {
                // Push apart
                this.objectA.force = -this.interactionForce; // Left
                this.objectB.force = this.interactionForce;   // Right
            } else if (this.currentScenario === 'pull') {
                // Pull together
                this.objectA.force = this.interactionForce;   // Right
                this.objectB.force = -this.interactionForce; // Left
            }
            
            this.interactionTime += dt;
        } else if (this.currentScenario !== 'spring') {
            this.interacting = false;
            this.objectA.force = 0;
            this.objectB.force = 0;
        }
        
        // Calculate accelerations (F = ma)
        this.objectA.accel = this.objectA.force / this.massA;
        this.objectB.accel = this.objectB.force / this.massB;
        
        // Update velocities
        this.objectA.vel += this.objectA.accel * dt;
        this.objectB.vel += this.objectB.accel * dt;
        
        // Update positions
        this.objectA.pos += this.objectA.vel * dt * 10; // Scale for visualization
        this.objectB.pos += this.objectB.vel * dt * 10;
        
        // Store trails
        if (this.showTrails) {
            this.objectA.trail.push(this.objectA.pos);
            this.objectB.trail.push(this.objectB.pos);
            
            if (this.objectA.trail.length > 100) {
                this.objectA.trail.shift();
                this.objectB.trail.shift();
            }
        }
        
        this.time += dt;
        
        // Calculate momenta
        const momentumA = this.massA * this.objectA.vel;
        const momentumB = this.massB * this.objectB.vel;
        const totalMomentum = momentumA + momentumB;
        
        // Store data
        this.timeData.push(this.time);
        this.momentumAData.push(momentumA);
        this.momentumBData.push(momentumB);
        this.totalMomentumData.push(totalMomentum);
        
        if (this.timeData.length > this.maxDataPoints) {
            this.timeData.shift();
            this.momentumAData.shift();
            this.momentumBData.shift();
            this.totalMomentumData.shift();
        }
        
        // Stop if objects are off screen (except for spring)
        if (this.currentScenario !== 'spring') {
            if (this.objectA.pos < -100 || this.objectA.pos > this.mainCanvas.width + 100 ||
                this.objectB.pos < -100 || this.objectB.pos > this.mainCanvas.width + 100) {
                this.running = false;
            }
        }
    }
    
    draw() {
        const ctx = this.mainCtx;
        const canvas = this.mainCanvas;
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw ground
        ctx.strokeStyle = isDark ? '#555' : '#666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 50);
        ctx.lineTo(canvas.width, canvas.height - 50);
        ctx.stroke();
        
        // Draw trails
        if (this.showTrails) {
            this.drawTrail(ctx, this.objectA.trail, 'rgba(204, 0, 0, 0.3)');
            this.drawTrail(ctx, this.objectB.trail, 'rgba(0, 0, 204, 0.3)');
        }
        
        // Draw center of mass
        if (this.showCOM) {
            const comX = (this.massA * this.objectA.pos + this.massB * this.objectB.pos) / (this.massA + this.massB);
            const comY = canvas.height - 50;
            
            ctx.strokeStyle = '#00aa00';
            ctx.fillStyle = '#00aa00';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(comX, 0);
            ctx.lineTo(comX, canvas.height - 50);
            ctx.stroke();
            ctx.setLineDash([]);
            
            ctx.beginPath();
            ctx.arc(comX, comY - 10, 8, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.fillStyle = '#00aa00';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('COM', comX, comY - 25);
        }
        
        // Draw spring if in spring mode
        if (this.currentScenario === 'spring') {
            this.drawSpring(ctx, canvas);
        }
        
        // Draw objects
        this.drawObject(ctx, canvas, this.objectA, this.massA, '#cc0000', '#880000', 'A');
        this.drawObject(ctx, canvas, this.objectB, this.massB, '#0000cc', '#000088', 'B');
        
        // Draw force arrows
        if (this.showVectors && this.interacting) {
            this.drawForceArrows(ctx, canvas);
        }
    }
    
    drawTrail(ctx, trail, color) {
        if (trail.length < 2) return;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        
        trail.forEach((x, i) => {
            const y = this.mainCanvas.height - 50;
            if (i === 0) ctx.moveTo(x, y - 30);
            else ctx.lineTo(x, y - 30);
        });
        ctx.stroke();
    }
    
    drawSpring(ctx, canvas) {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const sizeA = Math.sqrt(this.massA) * 10;
        const sizeB = Math.sqrt(this.massB) * 10;
        const y = canvas.height - 50 - Math.max(sizeA, sizeB) / 2;
        
        const x1 = this.objectA.pos + sizeA / 2;
        const x2 = this.objectB.pos - sizeB / 2;
        
        const springCoils = 12;
        const amplitude = 15;
        const length = x2 - x1;
        const segmentLength = length / springCoils;
        
        ctx.strokeStyle = isDark ? '#888' : '#666';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(x1, y);
        
        for (let i = 0; i <= springCoils; i++) {
            const x = x1 + i * segmentLength;
            const yOffset = (i % 2 === 0) ? amplitude : -amplitude;
            ctx.lineTo(x, y + yOffset);
        }
        ctx.lineTo(x2, y);
        ctx.stroke();
        
        // Draw endpoints
        ctx.fillStyle = isDark ? '#888' : '#666';
        ctx.beginPath();
        ctx.arc(x1, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x2, y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
    
    drawObject(ctx, canvas, obj, mass, color1, color2, label) {
        const size = Math.sqrt(mass) * 10;
        const y = canvas.height - 50 - size;
        
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(obj.pos - size/2 + 5, y + 5, size, size);
        
        // Box with gradient
        const gradient = ctx.createLinearGradient(obj.pos - size/2, y, obj.pos + size/2, y + size);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(obj.pos - size/2, y, size, size);
        
        ctx.strokeStyle = color2;
        ctx.lineWidth = 2;
        ctx.strokeRect(obj.pos - size/2, y, size, size);
        
        // Label
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label, obj.pos, y + size/2 - 5);
        ctx.font = '11px Arial';
        ctx.fillText(mass.toFixed(1) + ' kg', obj.pos, y + size/2 + 10);
        
        // Velocity vector
        if (this.showVectors && Math.abs(obj.vel) > 0.1) {
            const velLength = Math.min(Math.abs(obj.vel) * 5, 100);
            const velY = y - 20;
            
            this.drawArrow(ctx, obj.pos, velY,
                          obj.pos + velLength * Math.sign(obj.vel), velY,
                          '#00aa00', `v=${obj.vel.toFixed(1)}`);
        }
    }
    
    drawForceArrows(ctx, canvas) {
        const sizeA = Math.sqrt(this.massA) * 10;
        const sizeB = Math.sqrt(this.massB) * 10;
        const yA = canvas.height - 50 - sizeA;
        const yB = canvas.height - 50 - sizeB;
        
        const arrowLength = Math.min(Math.abs(this.interactionForce) * 0.6, 120);
        
        // Force on A
        const dirA = this.objectA.force > 0 ? 1 : -1;
        this.drawArrow(ctx, 
            this.objectA.pos + (sizeA/2) * dirA, yA + sizeA/2,
            this.objectA.pos + (sizeA/2) * dirA + arrowLength * dirA, yA + sizeA/2,
            '#ff0000', `F=${Math.abs(this.objectA.force).toFixed(0)}N`);
        
        // Force on B
        const dirB = this.objectB.force > 0 ? 1 : -1;
        this.drawArrow(ctx,
            this.objectB.pos + (sizeB/2) * dirB, yB + sizeB/2,
            this.objectB.pos + (sizeB/2) * dirB + arrowLength * dirB, yB + sizeB/2,
            '#ff0000', `F=${Math.abs(this.objectB.force).toFixed(0)}N`);
    }
    
    drawArrow(ctx, x1, y1, x2, y2, color, label) {
        const headLen = 10;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        
        ctx.strokeStyle = color;
        ctx.fillStyle = color;
        ctx.lineWidth = 3;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI/6), y2 - headLen * Math.sin(angle - Math.PI/6));
        ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI/6), y2 - headLen * Math.sin(angle + Math.PI/6));
        ctx.closePath();
        ctx.fill();
        
        if (label) {
            ctx.fillStyle = color;
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(label, (x1 + x2) / 2, (y1 + y2) / 2 - 12);
        }
    }
    
    drawPlot() {
        const ctx = this.plotCtx;
        const canvas = this.plotCanvas;
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (this.timeData.length < 2) {
            ctx.fillStyle = isDark ? '#666' : '#999';
            ctx.font = '15px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Momentum Conservation (press Start)', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        const padding = 50;
        const plotWidth = canvas.width - 2 * padding;
        const plotHeight = canvas.height - 2 * padding;
        
        const maxTime = Math.max(...this.timeData);
        const maxMomentum = Math.max(
            ...this.momentumAData.map(Math.abs),
            ...this.momentumBData.map(Math.abs),
            50
        );
        
        // Draw axes
        ctx.strokeStyle = isDark ? '#666' : '#333';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();
        
        // Zero line
        const zeroY = canvas.height - padding - plotHeight / 2;
        ctx.strokeStyle = isDark ? '#444' : '#999';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(padding, zeroY);
        ctx.lineTo(canvas.width - padding, zeroY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Labels
        ctx.fillStyle = isDark ? '#e4e4e4' : '#333';
        ctx.font = '13px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Time (s)', canvas.width / 2, canvas.height - 10);
        
        ctx.save();
        ctx.translate(15, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Momentum (kg·m/s)', 0, 0);
        ctx.restore();
        
        // Grid
        ctx.strokeStyle = isDark ? '#2a2a2a' : '#eee';
        ctx.lineWidth = 1;
        for (let i = 1; i < 5; i++) {
            const y = padding + (plotHeight * i) / 5;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
        }
        
        // Draw curves
        const drawCurve = (data, color) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            for (let i = 0; i < this.timeData.length; i++) {
                const x = padding + (this.timeData[i] / maxTime) * plotWidth;
                const y = zeroY - (data[i] / maxMomentum) * (plotHeight / 2) * 0.9;
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        };
        
        drawCurve(this.momentumAData, '#cc0000');
        drawCurve(this.momentumBData, '#0000cc');
        drawCurve(this.totalMomentumData, '#00aa00');
        
        // Legend
        const legendX = canvas.width - padding - 140;
        const legendY = padding + 15;
        
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        
        ctx.strokeStyle = '#cc0000';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(legendX, legendY);
        ctx.lineTo(legendX + 30, legendY);
        ctx.stroke();
        ctx.fillStyle = isDark ? '#e4e4e4' : '#333';
        ctx.fillText('Object A', legendX + 35, legendY + 4);
        
        ctx.strokeStyle = '#0000cc';
        ctx.beginPath();
        ctx.moveTo(legendX, legendY + 20);
        ctx.lineTo(legendX + 30, legendY + 20);
        ctx.stroke();
        ctx.fillText('Object B', legendX + 35, legendY + 24);
        
        ctx.strokeStyle = '#00aa00';
        ctx.beginPath();
        ctx.moveTo(legendX, legendY + 40);
        ctx.lineTo(legendX + 30, legendY + 40);
        ctx.stroke();
        ctx.fillText('Total (conserved!)', legendX + 35, legendY + 44);
    }
    
    exportData() {
        let csv = 'Time (s),Momentum A (kg·m/s),Momentum B (kg·m/s),Total Momentum (kg·m/s)\n';
        
        for (let i = 0; i < this.timeData.length; i++) {
            csv += `${this.timeData[i].toFixed(3)},${this.momentumAData[i].toFixed(3)},${this.momentumBData[i].toFixed(3)},${this.totalMomentumData[i].toFixed(3)}\n`;
        }
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `newtons_third_law_${this.currentScenario}_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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

new NewtonsThirdLaw();
