const container = document.getElementById('simulation-container');

container.innerHTML = `
    <div class="physics-sim-container">
        <div class="sim-header">
            <h2>Newton's Second Law: F = ma</h2>
            <p>The acceleration of an object is directly proportional to the net force and inversely proportional to its mass.</p>
            <div class="scenario-selector">
                <label>Scenario:</label>
                <select id="scenario">
                    <option value="horizontal">Horizontal Surface</option>
                    <option value="frictionless">Frictionless Surface</option>
                    <option value="falling">Free Fall</option>
                    <option value="incline">Inclined Plane</option>
                    <option value="compare">Compare Two Objects</option>
                </select>
            </div>
        </div>
        
        <div class="sim-layout">
            <div class="controls-panel">
                <h3>Controls</h3>
                
                <div class="control-group">
                    <label>Mass (kg)</label>
                    <input type="range" id="mass" min="1" max="20" value="5" step="0.5">
                    <span id="massValue">5.0</span>
                </div>
                
                <div class="control-group" id="mass2Group" style="display:none;">
                    <label>Mass 2 (kg)</label>
                    <input type="range" id="mass2" min="1" max="20" value="10" step="0.5">
                    <span id="mass2Value">10.0</span>
                </div>
                
                <div class="control-group" id="forceGroup">
                    <label>Applied Force (N)</label>
                    <input type="range" id="force" min="0" max="200" value="50" step="5">
                    <span id="forceValue">50</span>
                </div>
                
                <div class="control-group" id="angleGroup" style="display:none;">
                    <label>Incline Angle (°)</label>
                    <input type="range" id="angle" min="0" max="60" value="30" step="5">
                    <span id="angleValue">30</span>
                </div>
                
                <div class="control-group" id="frictionGroup">
                    <label>
                        <input type="checkbox" id="friction">
                        Include Friction (μ = 0.2)
                    </label>
                </div>
                
                <div class="control-group">
                    <label>
                        <input type="checkbox" id="showVectors" checked>
                        Show Force Vectors
                    </label>
                </div>
                
                <div class="control-group">
                    <label>
                        <input type="checkbox" id="showTrail" checked>
                        Show Motion Trail
                    </label>
                </div>
                
                <div class="control-group" id="showFBDGroup">
                    <label>
                        <input type="checkbox" id="showFBD">
                        Show Free Body Diagram
                    </label>
                </div>
                
                <div class="button-group">
                    <button id="start">▶ Start</button>
                    <button id="pause">⏸ Pause</button>
                    <button id="reset">↻ Reset</button>
                    <button id="export">💾 Export Data</button>
                </div>
                
                <div class="info-panel">
                    <h4>Physics Values</h4>
                    <div class="info-row">
                        <span>Net Force:</span>
                        <span id="netForceDisplay">0.0 N</span>
                    </div>
                    <div class="info-row">
                        <span>Acceleration:</span>
                        <span id="accelDisplay">0.0 m/s²</span>
                    </div>
                    <div class="info-row">
                        <span>Velocity:</span>
                        <span id="velocityDisplay">0.0 m/s</span>
                    </div>
                    <div class="info-row">
                        <span>Distance:</span>
                        <span id="distanceDisplay">0.0 m</span>
                    </div>
                    <div class="info-row">
                        <span>Time:</span>
                        <span id="timeDisplay">0.0 s</span>
                    </div>
                </div>
                
                <div class="info-panel" id="comparisonPanel" style="display:none;">
                    <h4>Object 2 Values</h4>
                    <div class="info-row">
                        <span>Acceleration:</span>
                        <span id="accel2Display">0.0 m/s²</span>
                    </div>
                    <div class="info-row">
                        <span>Velocity:</span>
                        <span id="velocity2Display">0.0 m/s</span>
                    </div>
                </div>
                
                <div class="equation-panel">
                    <h4>Equation</h4>
                    <div class="equation">F = ma</div>
                    <div class="equation">a = F / m</div>
                    <div class="equation-result" id="equationResult">
                        a = 50 / 5 = 10.0 m/s²
                    </div>
                </div>
                
                <div class="help-panel">
                    <h4>💡 Tips</h4>
                    <ul id="helpText">
                        <li>Try different scenarios from dropdown</li>
                        <li>Compare how mass affects acceleration</li>
                        <li>See how friction changes motion</li>
                        <li>Press Space to play/pause</li>
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
    
    .equation {
        text-align: center;
        font-size: 20px;
        font-weight: bold;
        color: #00458b;
        margin: 10px 0;
        font-family: 'Times New Roman', serif;
    }
    
    .equation-result {
        text-align: center;
        font-size: 15px;
        color: #ff6600;
        font-family: monospace;
        background: #fff3e0;
        padding: 10px;
        border-radius: 5px;
        margin-top: 10px;
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
        
        .equation {
            color: #7db3f0;
        }
        
        .equation-result {
            color: #ffaa44;
            background: #2a1a00;
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

class NewtonsSecondLaw {
    constructor() {
        this.mainCanvas = document.getElementById('mainCanvas');
        this.plotCanvas = document.getElementById('plotCanvas');
        this.mainCtx = this.mainCanvas.getContext('2d');
        this.plotCtx = this.plotCanvas.getContext('2d');
        
        // Scenarios
        this.currentScenario = 'horizontal';
        this.g = 9.81;
        
        // Simulation parameters
        this.mass = 5;
        this.mass2 = 10;
        this.force = 50;
        this.angle = 30;
        this.friction = false;
        this.frictionCoeff = 0.2;
        
        // Visual settings
        this.showVectors = true;
        this.showTrail = true;
        this.showFBD = false;
        
        // Object state
        this.objects = [
            { mass: 5, position: 100, velocity: 0, distance: 0, trail: [] }
        ];
        
        // Time tracking
        this.time = 0;
        this.lastTime = 0;
        this.running = false;
        
        // Data
        this.timeData = [];
        this.velocityData = [];
        this.velocity2Data = [];
        this.accelerationData = [];
        this.maxDataPoints = 300;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.updateScenario();
        this.updateCalculations();
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
        document.getElementById('mass').addEventListener('input', (e) => {
            this.mass = parseFloat(e.target.value);
            document.getElementById('massValue').textContent = this.mass.toFixed(1);
            this.objects[0].mass = this.mass;
            this.updateCalculations();
        });
        
        document.getElementById('mass2').addEventListener('input', (e) => {
            this.mass2 = parseFloat(e.target.value);
            document.getElementById('mass2Value').textContent = this.mass2.toFixed(1);
            if (this.objects[1]) {
                this.objects[1].mass = this.mass2;
            }
            this.updateCalculations();
        });
        
        document.getElementById('force').addEventListener('input', (e) => {
            this.force = parseFloat(e.target.value);
            document.getElementById('forceValue').textContent = this.force.toFixed(0);
            this.updateCalculations();
        });
        
        document.getElementById('angle').addEventListener('input', (e) => {
            this.angle = parseFloat(e.target.value);
            document.getElementById('angleValue').textContent = this.angle.toFixed(0);
            this.updateCalculations();
        });
        
        // Checkboxes
        document.getElementById('friction').addEventListener('change', (e) => {
            this.friction = e.target.checked;
            this.updateCalculations();
        });
        
        document.getElementById('showVectors').addEventListener('change', (e) => {
            this.showVectors = e.target.checked;
            this.draw();
        });
        
        document.getElementById('showTrail').addEventListener('change', (e) => {
            this.showTrail = e.target.checked;
            if (!this.showTrail) {
                this.objects.forEach(obj => obj.trail = []);
            }
            this.draw();
        });
        
        document.getElementById('showFBD').addEventListener('change', (e) => {
            this.showFBD = e.target.checked;
            this.draw();
        });
        
        // Buttons
        document.getElementById('start').addEventListener('click', () => {
            if (!this.running) {
                this.running = true;
                this.lastTime = performance.now();
                this.animate();
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
        const angleGroup = document.getElementById('angleGroup');
        const frictionGroup = document.getElementById('frictionGroup');
        const mass2Group = document.getElementById('mass2Group');
        const comparisonPanel = document.getElementById('comparisonPanel');
        const showFBDGroup = document.getElementById('showFBDGroup');
        
        // Reset objects
        this.objects = [
            { mass: this.mass, position: 100, velocity: 0, distance: 0, trail: [] }
        ];
        
        switch(this.currentScenario) {
            case 'horizontal':
                forceGroup.style.display = 'block';
                angleGroup.style.display = 'none';
                frictionGroup.style.display = 'block';
                mass2Group.style.display = 'none';
                comparisonPanel.style.display = 'none';
                showFBDGroup.style.display = 'block';
                break;
                
            case 'frictionless':
                forceGroup.style.display = 'block';
                angleGroup.style.display = 'none';
                frictionGroup.style.display = 'none';
                mass2Group.style.display = 'none';
                comparisonPanel.style.display = 'none';
                showFBDGroup.style.display = 'block';
                this.friction = false;
                break;
                
            case 'falling':
                forceGroup.style.display = 'none';
                angleGroup.style.display = 'none';
                frictionGroup.style.display = 'none';
                mass2Group.style.display = 'none';
                comparisonPanel.style.display = 'none';
                showFBDGroup.style.display = 'block';
                break;
                
            case 'incline':
                forceGroup.style.display = 'none';
                angleGroup.style.display = 'block';
                frictionGroup.style.display = 'block';
                mass2Group.style.display = 'none';
                comparisonPanel.style.display = 'none';
                showFBDGroup.style.display = 'block';
                break;
                
            case 'compare':
                forceGroup.style.display = 'block';
                angleGroup.style.display = 'none';
                frictionGroup.style.display = 'block';
                mass2Group.style.display = 'block';
                comparisonPanel.style.display = 'block';
                showFBDGroup.style.display = 'none';
                this.objects.push({ 
                    mass: this.mass2, 
                    position: 100, 
                    velocity: 0, 
                    distance: 0, 
                    trail: [] 
                });
                break;
        }
    }
    
    calculateAcceleration(mass) {
        let netForce = 0;
        
        switch(this.currentScenario) {
            case 'horizontal':
            case 'frictionless':
            case 'compare':
                netForce = this.force;
                if (this.friction) {
                    netForce -= this.frictionCoeff * mass * this.g;
                }
                break;
                
            case 'falling':
                netForce = mass * this.g;
                break;
                
            case 'incline':
                const angleRad = this.angle * Math.PI / 180;
                netForce = mass * this.g * Math.sin(angleRad);
                if (this.friction) {
                    netForce -= this.frictionCoeff * mass * this.g * Math.cos(angleRad);
                }
                break;
        }
        
        return netForce / mass;
    }
    
    updateCalculations() {
        const accel = this.calculateAcceleration(this.mass);
        const netForce = accel * this.mass;
        
        document.getElementById('netForceDisplay').textContent = netForce.toFixed(2) + ' N';
        document.getElementById('accelDisplay').textContent = accel.toFixed(2) + ' m/s²';
        document.getElementById('velocityDisplay').textContent = this.objects[0].velocity.toFixed(2) + ' m/s';
        document.getElementById('distanceDisplay').textContent = this.objects[0].distance.toFixed(2) + ' m';
        document.getElementById('timeDisplay').textContent = this.time.toFixed(2) + ' s';
        
        if (this.currentScenario === 'compare' && this.objects[1]) {
            const accel2 = this.calculateAcceleration(this.mass2);
            document.getElementById('accel2Display').textContent = accel2.toFixed(2) + ' m/s²';
            document.getElementById('velocity2Display').textContent = this.objects[1].velocity.toFixed(2) + ' m/s';
        }
        
        // Update equation display
        const equationResult = document.getElementById('equationResult');
        if (this.currentScenario === 'falling') {
            equationResult.textContent = `a = g = ${this.g.toFixed(2)} m/s²`;
        } else if (this.currentScenario === 'incline') {
            equationResult.textContent = `a = g·sin(${this.angle}°) = ${accel.toFixed(2)} m/s²`;
        } else {
            equationResult.textContent = `a = ${netForce.toFixed(1)} / ${this.mass.toFixed(1)} = ${accel.toFixed(2)} m/s²`;
        }
    }
    
    reset() {
        this.running = false;
        this.time = 0;
        this.timeData = [];
        this.velocityData = [];
        this.velocity2Data = [];
        this.accelerationData = [];
        
        this.objects.forEach((obj, i) => {
            obj.position = 100;
            obj.velocity = 0;
            obj.distance = 0;
            obj.trail = [];
        });
        
        this.updateCalculations();
        this.draw();
        this.drawPlot();
    }
    
    physics(dt) {
        this.time += dt;
        
        this.objects.forEach((obj, index) => {
            const accel = this.calculateAcceleration(obj.mass);
            obj.velocity += accel * dt;
            
            const displacement = obj.velocity * dt;
            
            if (this.currentScenario === 'falling') {
                obj.position += displacement * 50; // Scale for visualization
            } else if (this.currentScenario === 'incline') {
                obj.position += displacement * 10; // Increased scale for better travel distance
            } else {
                obj.position += displacement * 10;
            }
            
            obj.distance += Math.abs(displacement);
            
            // Trail
            if (this.showTrail) {
                if (this.currentScenario === 'incline') {
                    const angleRad = this.angle * Math.PI / 180;
                    const distAlongPlane = (obj.position - 100) / 10;
                    const boxSize = Math.sqrt(obj.mass) * 10;
                    let trailX = 50 + distAlongPlane * Math.cos(angleRad);
                    let trailY = this.mainCanvas.height - 50 - distAlongPlane * Math.sin(angleRad);
                    
                    // Apply same adjustment as in drawObject
                    trailY -= (boxSize / 2) * Math.cos(angleRad);
                    trailX -= (boxSize / 2) * Math.sin(angleRad);
                    
                    obj.trail.push({ x: trailX, y: trailY });
                } else {
                    obj.trail.push({ x: obj.position, y: this.getYPosition(obj, index) });
                }
                
                if (obj.trail.length > 100) {
                    obj.trail.shift();
                }
            }
            
            // Keep on screen (wrap around)
            if (this.currentScenario === 'falling') {
                if (obj.position > this.mainCanvas.height - 100) {
                    obj.position = 100;
                    obj.trail = [];
                }
            } else if (this.currentScenario === 'incline') {
                // Check if object went off the incline
                const angleRad = this.angle * Math.PI / 180;
                const height = 200;
                const base = height / Math.tan(angleRad);
                const maxDist = Math.sqrt(base * base + height * height);
                const distAlongPlane = (obj.position - 100) / 10;
                
                if (distAlongPlane > maxDist) {
                    obj.position = 100;
                    obj.trail = [];
                }
            } else {
                if (obj.position > this.mainCanvas.width - 100) {
                    obj.position = 100;
                    obj.trail = [];
                }
            }
        });
        
        // Store data
        this.timeData.push(this.time);
        this.velocityData.push(this.objects[0].velocity);
        this.accelerationData.push(this.calculateAcceleration(this.mass));
        
        if (this.currentScenario === 'compare' && this.objects[1]) {
            this.velocity2Data.push(this.objects[1].velocity);
        }
        
        if (this.timeData.length > this.maxDataPoints) {
            this.timeData.shift();
            this.velocityData.shift();
            this.accelerationData.shift();
            if (this.velocity2Data.length > 0) {
                this.velocity2Data.shift();
            }
        }
    }
    
    getYPosition(obj, index) {
        if (this.currentScenario === 'falling') {
            return obj.position;
        } else if (this.currentScenario === 'incline') {
            return this.mainCanvas.height - 50;
        } else {
            return this.mainCanvas.height - 50 - (index * 100);
        }
    }
    
    draw() {
        const ctx = this.mainCtx;
        const canvas = this.mainCanvas;
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw environment based on scenario
        this.drawEnvironment(ctx, canvas);
        
        // Draw objects
        this.objects.forEach((obj, index) => {
            this.drawObject(ctx, obj, index);
        });
        
        // Draw free body diagram
        if (this.showFBD && this.objects.length === 1) {
            this.drawFreBodyDiagram(ctx, canvas);
        }
    }
    
    drawEnvironment(ctx, canvas) {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (this.currentScenario === 'incline') {
            // Draw inclined plane
            const angleRad = this.angle * Math.PI / 180;
            const height = 200;
            const base = height / Math.tan(angleRad);
            
            ctx.fillStyle = isDark ? '#2a2a2a' : '#cccccc';
            ctx.beginPath();
            ctx.moveTo(50, canvas.height - 50);
            ctx.lineTo(50 + base, canvas.height - 50);
            ctx.lineTo(50 + base, canvas.height - 50 - height);
            ctx.closePath();
            ctx.fill();
            
            ctx.strokeStyle = isDark ? '#555' : '#999';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            // Angle arc
            ctx.strokeStyle = '#ff6600';
            ctx.beginPath();
            ctx.arc(50, canvas.height - 50, 40, -angleRad, 0);
            ctx.stroke();
            
            ctx.fillStyle = '#ff6600';
            ctx.font = '14px Arial';
            ctx.fillText(this.angle + '°', 90, canvas.height - 40);
            
        } else if (this.currentScenario === 'falling') {
            // Draw vertical reference line
            ctx.strokeStyle = isDark ? '#444' : '#ddd';
            ctx.lineWidth = 2;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            ctx.moveTo(canvas.width / 2, 0);
            ctx.lineTo(canvas.width / 2, canvas.height);
            ctx.stroke();
            ctx.setLineDash([]);
            
        } else {
            // Draw horizontal ground
            ctx.strokeStyle = isDark ? '#555' : '#666';
            ctx.lineWidth = 2;
            
            this.objects.forEach((obj, index) => {
                const y = this.getYPosition(obj, index);
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            });
            
            // Grid lines
            ctx.strokeStyle = isDark ? '#222' : '#f0f0f0';
            ctx.lineWidth = 1;
            for (let i = 100; i < canvas.width; i += 100) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, canvas.height);
                ctx.stroke();
            }
        }
    }
    
    drawObject(ctx, obj, index) {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const boxSize = Math.sqrt(obj.mass) * 10;
        
        let boxX, boxY;
        
        if (this.currentScenario === 'falling') {
            boxX = this.mainCanvas.width / 2 - boxSize / 2;
            boxY = obj.position;
        } else if (this.currentScenario === 'incline') {
            const angleRad = this.angle * Math.PI / 180;
            const distAlongPlane = (obj.position - 100) / 10; // Increased travel distance
            boxX = 50 + distAlongPlane * Math.cos(angleRad);
            boxY = this.mainCanvas.height - 50 - distAlongPlane * Math.sin(angleRad);
            
            // Adjust position so bottom of box sits on surface (not center)
            // Shift perpendicular to the incline (upward from surface) by half the box size
            boxY -= (boxSize / 2) * Math.cos(angleRad);
            boxX -= (boxSize / 2) * Math.sin(angleRad);
            
            // Save context for rotation
            ctx.save();
            ctx.translate(boxX, boxY);
            ctx.rotate(-angleRad); // Rotate to align with incline
            
            // Draw trail before rotating
            ctx.restore();
            if (this.showTrail && obj.trail.length > 1) {
                ctx.strokeStyle = index === 0 ? 'rgba(0, 100, 255, 0.3)' : 'rgba(255, 100, 0, 0.3)';
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.beginPath();
                obj.trail.forEach((point, i) => {
                    if (i === 0) ctx.moveTo(point.x, point.y);
                    else ctx.lineTo(point.x, point.y);
                });
                ctx.stroke();
            }
            ctx.save();
            ctx.translate(boxX, boxY);
            ctx.rotate(-angleRad);
            
            // Draw shadow
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.fillRect(-boxSize/2 + 3, -boxSize/2 + 3, boxSize, boxSize);
            
            // Draw box
            const colors = [
                { light: '#0066cc', dark: '#003d7a' },
                { light: '#ff6600', dark: '#cc5500' }
            ];
            
            const gradient = ctx.createLinearGradient(-boxSize/2, -boxSize/2, boxSize/2, boxSize/2);
            gradient.addColorStop(0, colors[index % 2].light);
            gradient.addColorStop(1, colors[index % 2].dark);
            
            ctx.fillStyle = gradient;
            ctx.fillRect(-boxSize/2, -boxSize/2, boxSize, boxSize);
            
            ctx.strokeStyle = colors[index % 2].dark;
            ctx.lineWidth = 2;
            ctx.strokeRect(-boxSize/2, -boxSize/2, boxSize, boxSize);
            
            // Label
            ctx.fillStyle = 'white';
            ctx.font = 'bold 13px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(obj.mass.toFixed(1) + ' kg', 0, 0);
            
            ctx.restore();
            
            // Draw vectors (after restoring context, with adjusted position)
            if (this.showVectors && this.running) {
                this.drawVectors(ctx, obj, boxX, boxY, boxSize, index);
            }
            
            return; // Exit early for incline case
        } else {
            boxX = obj.position - boxSize / 2;
            boxY = this.getYPosition(obj, index) - boxSize; // Position box so bottom touches ground
        }
        
        // Draw trail (for non-incline scenarios)
        if (this.showTrail && obj.trail.length > 1) {
            ctx.strokeStyle = index === 0 ? 'rgba(0, 100, 255, 0.3)' : 'rgba(255, 100, 0, 0.3)';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            
            if (this.currentScenario === 'falling') {
                obj.trail.forEach((point, i) => {
                    const x = this.mainCanvas.width / 2;
                    if (i === 0) ctx.moveTo(x, point.y);
                    else ctx.lineTo(x, point.y);
                });
            } else {
                obj.trail.forEach((point, i) => {
                    if (i === 0) ctx.moveTo(point.x, point.y - boxSize);
                    else ctx.lineTo(point.x, point.y - boxSize);
                });
            }
            ctx.stroke();
        }
        
        // Draw shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(boxX + 5, boxY + 5, boxSize, boxSize);
        
        // Draw box
        const colors = [
            { light: '#0066cc', dark: '#003d7a' },
            { light: '#ff6600', dark: '#cc5500' }
        ];
        
        const gradient = ctx.createLinearGradient(boxX, boxY, boxX + boxSize, boxY + boxSize);
        gradient.addColorStop(0, colors[index % 2].light);
        gradient.addColorStop(1, colors[index % 2].dark);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(boxX, boxY, boxSize, boxSize);
        
        ctx.strokeStyle = colors[index % 2].dark;
        ctx.lineWidth = 2;
        ctx.strokeRect(boxX, boxY, boxSize, boxSize);
        
        // Label
        ctx.fillStyle = 'white';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(obj.mass.toFixed(1) + ' kg', boxX + boxSize/2, boxY + boxSize/2);
        
        // Draw vectors
        if (this.showVectors && this.running) {
            this.drawVectors(ctx, obj, boxX, boxY, boxSize, index);
        }
    }
    
    drawVectors(ctx, obj, boxX, boxY, boxSize, index) {
        const accel = this.calculateAcceleration(obj.mass);
        
        if (this.currentScenario === 'falling') {
            // Weight vector (down)
            this.drawArrow(ctx, boxX + boxSize/2, boxY + boxSize, 
                          boxX + boxSize/2, boxY + boxSize + 60, '#ff0000', 'W');
        } else if (this.currentScenario === 'incline') {
            // Weight and components (vectors drawn in world space, not rotated)
            const angleRad = this.angle * Math.PI / 180;
            
            // Weight (vertical down from center of box)
            this.drawArrow(ctx, boxX, boxY, 
                          boxX, boxY + 60, '#ff0000', 'mg');
            
            // Component parallel to plane (along the incline)
            // Start from the right side of the box (along incline direction)
            const offsetRight = boxSize * 0.3;
            const startX = boxX + offsetRight * Math.cos(angleRad);
            const startY = boxY + offsetRight * Math.sin(angleRad);
            
            const len = 50;
            this.drawArrow(ctx, startX, startY,
                          startX + len * Math.cos(angleRad), 
                          startY + len * Math.sin(angleRad), 
                          '#ff6600', 'mg sin θ');
        } else {
            // Applied force
            const forceLen = Math.min(this.force * 1.2, 120);
            this.drawArrow(ctx, boxX + boxSize, boxY + boxSize/2,
                          boxX + boxSize + forceLen, boxY + boxSize/2,
                          '#ff0000', `F=${this.force}N`);
            
            // Friction (if applicable)
            if (this.friction && obj.velocity > 0.1) {
                const frictionLen = Math.min(this.frictionCoeff * obj.mass * this.g * 1.2, 80);
                this.drawArrow(ctx, boxX, boxY + boxSize/2,
                              boxX - frictionLen, boxY + boxSize/2,
                              '#ff9900', 'f');
            }
            
            // Velocity vector
            if (Math.abs(obj.velocity) > 0.5) {
                const velLen = Math.min(Math.abs(obj.velocity) * 3, 100);
                this.drawArrow(ctx, boxX + boxSize/2, boxY - 20,
                              boxX + boxSize/2 + velLen, boxY - 20,
                              '#00aa00', `v=${obj.velocity.toFixed(1)}`);
            }
        }
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
    
    drawFreBodyDiagram(ctx, canvas) {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const fbdX = canvas.width - 180;
        const fbdY = 120;
        const boxSize = 50;
        
        // Background
        ctx.fillStyle = isDark ? 'rgba(40, 40, 40, 0.9)' : 'rgba(240, 240, 240, 0.9)';
        ctx.fillRect(fbdX - 60, fbdY - 80, 220, 180);
        ctx.strokeStyle = isDark ? '#555' : '#999';
        ctx.lineWidth = 2;
        ctx.strokeRect(fbdX - 60, fbdY - 80, 220, 180);
        
        // Title
        ctx.fillStyle = isDark ? '#7db3f0' : '#00458b';
        ctx.font = 'bold 13px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Free Body Diagram', fbdX + 50, fbdY - 60);
        
        // Object
        ctx.fillStyle = '#0066cc';
        ctx.fillRect(fbdX, fbdY, boxSize, boxSize);
        ctx.strokeStyle = '#003d7a';
        ctx.lineWidth = 2;
        ctx.strokeRect(fbdX, fbdY, boxSize, boxSize);
        
        // Forces
        const scale = 0.5;
        
        // Applied force (right)
        if (this.currentScenario !== 'falling' && this.currentScenario !== 'incline') {
            this.drawArrow(ctx, fbdX + boxSize, fbdY + boxSize/2,
                          fbdX + boxSize + this.force * scale, fbdY + boxSize/2,
                          '#ff0000', 'F');
        }
        
        // Weight (down)
        this.drawArrow(ctx, fbdX + boxSize/2, fbdY + boxSize,
                      fbdX + boxSize/2, fbdY + boxSize + 40,
                      '#0088ff', 'W');
        
        // Normal force (up)
        if (this.currentScenario !== 'falling') {
            this.drawArrow(ctx, fbdX + boxSize/2, fbdY,
                          fbdX + boxSize/2, fbdY - 40,
                          '#00aa00', 'N');
        }
        
        // Friction (left)
        if (this.friction && this.currentScenario !== 'falling') {
            const frictionLen = this.frictionCoeff * this.mass * this.g * scale;
            this.drawArrow(ctx, fbdX, fbdY + boxSize/2,
                          fbdX - frictionLen, fbdY + boxSize/2,
                          '#ff9900', 'f');
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
            ctx.fillText('Press Start to see velocity vs time', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        const padding = 50;
        const plotWidth = canvas.width - 2 * padding;
        const plotHeight = canvas.height - 2 * padding;
        
        const maxTime = Math.max(...this.timeData);
        const maxVel = Math.max(...this.velocityData.map(Math.abs), 
                                  ...this.velocity2Data.map(Math.abs), 10);
        
        // Axes
        ctx.strokeStyle = isDark ? '#666' : '#333';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();
        
        // Labels
        ctx.fillStyle = isDark ? '#e4e4e4' : '#333';
        ctx.font = '13px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Time (s)', canvas.width / 2, canvas.height - 10);
        
        ctx.save();
        ctx.translate(15, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Velocity (m/s)', 0, 0);
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
        
        // Plot velocity 1
        ctx.strokeStyle = '#0066ff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        for (let i = 0; i < this.timeData.length; i++) {
            const x = padding + (this.timeData[i] / maxTime) * plotWidth;
            const y = canvas.height - padding - (this.velocityData[i] / maxVel) * plotHeight * 0.9;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Plot velocity 2 (comparison mode)
        if (this.velocity2Data.length > 0) {
            ctx.strokeStyle = '#ff6600';
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            for (let i = 0; i < this.timeData.length; i++) {
                const x = padding + (this.timeData[i] / maxTime) * plotWidth;
                const y = canvas.height - padding - (this.velocity2Data[i] / maxVel) * plotHeight * 0.9;
                
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        
        // Legend
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillStyle = '#0066ff';
        ctx.fillText(`Object 1 (${this.mass}kg)`, canvas.width - padding - 120, padding + 15);
        
        if (this.velocity2Data.length > 0) {
            ctx.fillStyle = '#ff6600';
            ctx.fillText(`Object 2 (${this.mass2}kg)`, canvas.width - padding - 120, padding + 35);
        }
    }
    
    exportData() {
        let csv = 'Time (s),Velocity 1 (m/s),Acceleration (m/s²)';
        
        if (this.velocity2Data.length > 0) {
            csv += ',Velocity 2 (m/s)\n';
        } else {
            csv += '\n';
        }
        
        for (let i = 0; i < this.timeData.length; i++) {
            csv += `${this.timeData[i].toFixed(3)},${this.velocityData[i].toFixed(3)},${this.accelerationData[i].toFixed(3)}`;
            
            if (this.velocity2Data.length > 0) {
                csv += `,${this.velocity2Data[i].toFixed(3)}`;
            }
            csv += '\n';
        }
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `newtons_second_law_${this.currentScenario}_${Date.now()}.csv`;
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
        this.updateCalculations();
        this.draw();
        this.drawPlot();
        
        requestAnimationFrame(() => this.animate());
    }
}

new NewtonsSecondLaw();
