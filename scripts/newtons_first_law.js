const container = document.getElementById('simulation-container');

container.innerHTML = `
    <div class="physics-sim-container">
        <div class="sim-header">
            <h2>Newton's First Law: Law of Inertia</h2>
            <p>An object at rest stays at rest, and an object in motion stays in motion with constant velocity, unless acted upon by a net external force.</p>
            <div class="scenario-selector">
                <label>Scenario:</label>
                <select id="scenario">
                    <option value="standard">Standard Surface</option>
                    <option value="ice">Ice Rink (Low Friction)</option>
                    <option value="space">Space (No Friction)</option>
                    <option value="balanced">Balanced Forces</option>
                    <option value="rough">Rough Surface (High Friction)</option>
                </select>
            </div>
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
                    <input type="range" id="force" min="-100" max="100" value="0" step="5">
                    <span id="forceValue">0</span>
                </div>
                
                <div class="control-group">
                    <label>Friction Coefficient (μ)</label>
                    <input type="range" id="friction" min="0" max="0.8" value="0.2" step="0.05">
                    <span id="frictionValue">0.20</span>
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
                
                <div class="button-group">
                    <button id="applyForce">Apply Force →</button>
                    <button id="stop">Stop</button>
                    <button id="reset">Reset</button>
                    <button id="exportData">Export Data</button>
                </div>
                
                <div class="info-panel">
                    <h4>Current State</h4>
                    <div class="info-row">
                        <span>Position:</span>
                        <span id="positionDisplay">0.00 m</span>
                    </div>
                    <div class="info-row">
                        <span>Velocity:</span>
                        <span id="velocityDisplay">0.00 m/s</span>
                    </div>
                    <div class="info-row">
                        <span>Acceleration:</span>
                        <span id="accelDisplay">0.00 m/s²</span>
                    </div>
                    <div class="info-row">
                        <span>Net Force:</span>
                        <span id="netForceDisplay">0.00 N</span>
                    </div>
                    <div class="info-row">
                        <span>Kinetic Energy:</span>
                        <span id="kineticDisplay">0.00 J</span>
                    </div>
                </div>
                
                <div class="help-panel">
                    <h4>💡 Tips</h4>
                    <ul>
                        <li>Click and drag the object to move it</li>
                        <li>Try different scenarios from the dropdown</li>
                        <li>Observe what happens with zero net force</li>
                        <li id="scenarioTip">Standard physics surface</li>
                    </ul>
                </div>
            </div>
            
            <div class="visualization-area">
                <canvas id="mainCanvas"></canvas>
                <div class="plot-controls">
                    <button id="clearPlot">Clear Plot</button>
                    <label>
                        <input type="checkbox" id="showAccelPlot">
                        Show Acceleration
                    </label>
                </div>
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
        padding: 5px 10px;
        border-radius: 5px;
        border: 2px solid #00458b;
        font-size: 14px;
    }
    
    .sim-layout {
        display: flex;
        gap: 20px;
    }
    
    .controls-panel {
        min-width: 280px;
        max-width: 300px;
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
        margin-right: 8px;
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
        transition: background 0.2s;
    }
    
    .button-group button:hover {
        background: #003366;
    }
    
    .button-group button:active {
        transform: scale(0.98);
    }
    
    .info-panel, .help-panel {
        background: white;
        padding: 15px;
        border-radius: 5px;
        margin-top: 20px;
    }
    
    .info-panel h4, .help-panel h4 {
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
    
    .help-panel ul {
        margin: 10px 0;
        padding-left: 20px;
        font-size: 13px;
        line-height: 1.6;
    }
    
    .help-panel li {
        margin-bottom: 8px;
    }
    
    #scenarioTip {
        color: #00458b;
        font-weight: bold;
        list-style: none;
        margin-left: -20px;
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
        cursor: grab;
    }
    
    #mainCanvas:active {
        cursor: grabbing;
    }
    
    .plot-controls {
        display: flex;
        gap: 15px;
        align-items: center;
        padding: 5px;
    }
    
    .plot-controls button {
        padding: 5px 15px;
        background: #00458b;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 12px;
    }
    
    .plot-controls label {
        font-size: 13px;
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
        
        .info-panel, .help-panel {
            background: #1a1a1a;
            color: #e4e4e4;
        }
        
        .info-panel h4, .help-panel h4 {
            color: #7db3f0;
        }
        
        .info-row span:last-child {
            color: #7db3f0;
        }
        
        #scenarioTip {
            color: #7db3f0;
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
            max-width: 100%;
        }
        
        #mainCanvas {
            height: 300px;
        }
    }
`;
document.head.appendChild(style);

class NewtonsFirstLaw {
    constructor() {
        this.mainCanvas = document.getElementById('mainCanvas');
        this.plotCanvas = document.getElementById('plotCanvas');
        this.mainCtx = this.mainCanvas.getContext('2d');
        this.plotCtx = this.plotCanvas.getContext('2d');
        
        // Scenarios
        this.scenarios = {
            standard: { friction: 0.2, description: 'Normal surface with moderate friction' },
            ice: { friction: 0.03, description: 'Ice rink - very low friction!' },
            space: { friction: 0, description: 'Space - no friction at all!' },
            balanced: { friction: 0.2, description: 'Forces balanced - constant velocity' },
            rough: { friction: 0.6, description: 'Rough surface - high friction' }
        };
        
        // Simulation parameters
        this.mass = 5;
        this.appliedForce = 0;
        this.frictionCoeff = 0.2;
        this.g = 9.81;
        this.currentScenario = 'standard';
        
        // Object state
        this.position = 0;
        this.velocity = 0;
        this.acceleration = 0;
        
        // Visual settings
        this.showVectors = true;
        this.showTrail = true;
        this.showAccelPlot = false;
        this.trail = [];
        this.maxTrailLength = 50;
        
        // Drag interaction
        this.isDragging = false;
        this.dragOffsetX = 0;
        
        // Time tracking
        this.time = 0;
        this.lastTime = 0;
        this.running = false;
        
        // Data for plotting
        this.timeData = [];
        this.velocityData = [];
        this.accelData = [];
        this.maxDataPoints = 300;
        
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
        
        // Set initial position to center
        this.position = this.mainCanvas.width / 2;
    }
    
    setupEventListeners() {
        // Sliders
        document.getElementById('mass').addEventListener('input', (e) => {
            this.mass = parseFloat(e.target.value);
            this.updateDisplays();
        });
        
        document.getElementById('force').addEventListener('input', (e) => {
            this.appliedForce = parseFloat(e.target.value);
            this.updateDisplays();
        });
        
        document.getElementById('friction').addEventListener('input', (e) => {
            this.frictionCoeff = parseFloat(e.target.value);
            this.updateDisplays();
        });
        
        // Checkboxes
        document.getElementById('showVectors').addEventListener('change', (e) => {
            this.showVectors = e.target.checked;
            this.draw();
        });
        
        document.getElementById('showTrail').addEventListener('change', (e) => {
            this.showTrail = e.target.checked;
            if (!this.showTrail) this.trail = [];
            this.draw();
        });
        
        document.getElementById('showAccelPlot').addEventListener('change', (e) => {
            this.showAccelPlot = e.target.checked;
            this.drawPlot();
        });
        
        // Buttons
        document.getElementById('applyForce').addEventListener('click', () => {
            this.running = true;
            this.lastTime = performance.now();
            this.animate();
        });
        
        document.getElementById('stop').addEventListener('click', () => {
            this.running = false;
        });
        
        document.getElementById('reset').addEventListener('click', () => {
            this.reset();
        });
        
        document.getElementById('clearPlot').addEventListener('click', () => {
            this.timeData = [];
            this.velocityData = [];
            this.accelData = [];
            this.time = 0;
            this.drawPlot();
        });
        
        document.getElementById('exportData').addEventListener('click', () => {
            this.exportData();
        });
        
        // Scenario selector
        document.getElementById('scenario').addEventListener('change', (e) => {
            this.loadScenario(e.target.value);
        });
        
        // Canvas drag interaction
        this.mainCanvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.mainCanvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.mainCanvas.addEventListener('mouseup', () => this.handleMouseUp());
        this.mainCanvas.addEventListener('mouseleave', () => this.handleMouseUp());
        
        // Touch support
        this.mainCanvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.mainCanvas.dispatchEvent(mouseEvent);
        });
        
        this.mainCanvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            this.mainCanvas.dispatchEvent(mouseEvent);
        });
        
        this.mainCanvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleMouseUp();
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
        
        window.addEventListener('resize', () => this.setupCanvas());
    }
    
    handleMouseDown(e) {
        const rect = this.mainCanvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const boxSize = Math.sqrt(this.mass) * 10;
        const boxY = this.mainCanvas.height - 50 - boxSize;
        
        // Check if clicking on the object
        if (mouseX >= this.position - boxSize/2 && 
            mouseX <= this.position + boxSize/2 &&
            e.clientY - rect.top >= boxY && 
            e.clientY - rect.top <= boxY + boxSize) {
            this.isDragging = true;
            this.dragOffsetX = mouseX - this.position;
            this.running = false;
            this.mainCanvas.style.cursor = 'grabbing';
        }
    }
    
    handleMouseMove(e) {
        if (this.isDragging) {
            const rect = this.mainCanvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const newPos = mouseX - this.dragOffsetX;
            
            // Clamp position
            const boxSize = Math.sqrt(this.mass) * 10;
            this.position = Math.max(boxSize/2, Math.min(this.mainCanvas.width - boxSize/2, newPos));
            
            // Reset velocity when dragging
            this.velocity = 0;
            this.acceleration = 0;
            this.updateDisplays();
            this.draw();
        }
    }
    
    handleMouseUp() {
        if (this.isDragging) {
            this.isDragging = false;
            this.mainCanvas.style.cursor = 'grab';
        }
    }
    
    loadScenario(scenario) {
        this.currentScenario = scenario;
        const config = this.scenarios[scenario];
        
        this.frictionCoeff = config.friction;
        document.getElementById('friction').value = config.friction;
        document.getElementById('scenarioTip').textContent = config.description;
        
        // Special setup for balanced forces scenario
        if (scenario === 'balanced') {
            this.velocity = 5;
            this.appliedForce = this.frictionCoeff * this.mass * this.g;
            document.getElementById('force').value = this.appliedForce;
        }
        
        this.updateDisplays();
        this.draw();
    }
    
    updateDisplays() {
        document.getElementById('massValue').textContent = this.mass.toFixed(1);
        document.getElementById('forceValue').textContent = this.appliedForce.toFixed(0);
        document.getElementById('frictionValue').textContent = this.frictionCoeff.toFixed(2);
        document.getElementById('positionDisplay').textContent = (this.position / 50).toFixed(2) + ' m';
        document.getElementById('velocityDisplay').textContent = this.velocity.toFixed(2) + ' m/s';
        document.getElementById('accelDisplay').textContent = this.acceleration.toFixed(2) + ' m/s²';
        
        const frictionForce = this.calculateFrictionForce();
        const netForce = this.appliedForce + frictionForce;
        document.getElementById('netForceDisplay').textContent = netForce.toFixed(2) + ' N';
        
        const kineticEnergy = 0.5 * this.mass * this.velocity * this.velocity;
        document.getElementById('kineticDisplay').textContent = kineticEnergy.toFixed(2) + ' J';
    }
    
    calculateFrictionForce() {
        if (Math.abs(this.velocity) < 0.01 && Math.abs(this.appliedForce) < this.frictionCoeff * this.mass * this.g) {
            // Static friction
            return -this.appliedForce;
        } else if (Math.abs(this.velocity) > 0.001) {
            // Kinetic friction with Stribeck effect
            const mu_k = this.frictionCoeff * 0.8;
            const mu_s = this.frictionCoeff;
            const vs = 0.1;
            const mu = mu_k + (mu_s - mu_k) * Math.exp(-Math.abs(this.velocity) / vs);
            return -mu * this.mass * this.g * Math.sign(this.velocity);
        }
        return 0;
    }
    
    reset() {
        this.running = false;
        this.position = this.mainCanvas.width / 2;
        this.velocity = 0;
        this.acceleration = 0;
        this.time = 0;
        this.timeData = [];
        this.velocityData = [];
        this.accelData = [];
        this.trail = [];
        this.updateDisplays();
        this.draw();
        this.drawPlot();
    }
    
    physics(dt) {
        const frictionForce = this.calculateFrictionForce();
        const netForce = this.appliedForce + frictionForce;
        
        this.acceleration = netForce / this.mass;
        this.velocity += this.acceleration * dt;
        
        // Stop if velocity is very small and no net force
        if (Math.abs(this.velocity) < 0.01 && Math.abs(netForce) < 0.1) {
            this.velocity = 0;
            this.acceleration = 0;
        }
        
        this.position += this.velocity * dt * 50; // Scale for visualization
        
        // Keep object on screen with wrapping
        if (this.position < 0) {
            this.position = this.mainCanvas.width;
        }
        if (this.position > this.mainCanvas.width) {
            this.position = 0;
        }
        
        // Add trail point
        if (this.showTrail && (Math.abs(this.velocity) > 0.1 || Math.abs(this.acceleration) > 0.1)) {
            this.trail.push({ x: this.position, y: this.mainCanvas.height - 50 });
            if (this.trail.length > this.maxTrailLength) {
                this.trail.shift();
            }
        }
        
        // Store data
        this.time += dt;
        this.timeData.push(this.time);
        this.velocityData.push(this.velocity);
        this.accelData.push(this.acceleration);
        
        if (this.timeData.length > this.maxDataPoints) {
            this.timeData.shift();
            this.velocityData.shift();
            this.accelData.shift();
        }
    }
    
    draw() {
        const ctx = this.mainCtx;
        const canvas = this.mainCanvas;
        
        // Clear
        ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw trail
        if (this.showTrail && this.trail.length > 1) {
            ctx.strokeStyle = 'rgba(0, 150, 255, 0.3)';
            ctx.lineWidth = 3;
            ctx.lineCap = 'round';
            ctx.beginPath();
            this.trail.forEach((point, i) => {
                const alpha = (i / this.trail.length) * 0.5;
                if (i === 0) {
                    ctx.moveTo(point.x, point.y);
                } else {
                    ctx.lineTo(point.x, point.y);
                }
            });
            ctx.stroke();
        }
        
        // Draw ground
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - 50);
        ctx.lineTo(canvas.width, canvas.height - 50);
        ctx.stroke();
        
        // Draw surface texture based on friction
        const numLines = Math.floor(this.frictionCoeff * 30);
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)';
        ctx.lineWidth = 1;
        for (let i = 0; i < numLines; i++) {
            const x = (i / numLines) * canvas.width;
            ctx.beginPath();
            ctx.moveTo(x, canvas.height - 50);
            ctx.lineTo(x + 10, canvas.height - 40);
            ctx.stroke();
        }
        
        // Draw object
        const boxSize = Math.sqrt(this.mass) * 10;
        const boxY = canvas.height - 50 - boxSize;
        
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.fillRect(this.position - boxSize/2 + 5, boxY + 5, boxSize, boxSize);
        
        // Main box
        const gradient = ctx.createLinearGradient(
            this.position - boxSize/2, boxY,
            this.position + boxSize/2, boxY + boxSize
        );
        gradient.addColorStop(0, '#0066cc');
        gradient.addColorStop(1, '#003d7a');
        ctx.fillStyle = gradient;
        ctx.fillRect(this.position - boxSize/2, boxY, boxSize, boxSize);
        
        // Border
        ctx.strokeStyle = '#003366';
        ctx.lineWidth = 2;
        ctx.strokeRect(this.position - boxSize/2, boxY, boxSize, boxSize);
        
        // Mass label
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.mass.toFixed(1) + ' kg', this.position, boxY + boxSize/2);
        
        if (this.showVectors) {
            // Applied force arrow
            if (Math.abs(this.appliedForce) > 0.5) {
                const arrowLength = Math.min(Math.abs(this.appliedForce) * 2, 150);
                const arrowY = boxY + boxSize/2;
                const direction = Math.sign(this.appliedForce);
                
                ctx.strokeStyle = '#ff0000';
                ctx.fillStyle = '#ff0000';
                ctx.lineWidth = 3;
                
                this.drawArrow(ctx, 
                    this.position + (boxSize/2) * direction, arrowY,
                    this.position + (boxSize/2) * direction + arrowLength * direction, arrowY
                );
                
                ctx.fillStyle = '#ff0000';
                ctx.font = 'bold 12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('F = ' + this.appliedForce.toFixed(0) + ' N', 
                    this.position + (boxSize/2 + arrowLength/2) * direction, arrowY - 15);
            }
            
            // Friction force arrow
            const frictionForce = this.calculateFrictionForce();
            if (Math.abs(frictionForce) > 0.5) {
                const arrowLength = Math.min(Math.abs(frictionForce) * 2, 150);
                const arrowY = boxY + boxSize/2 + 25;
                const direction = Math.sign(frictionForce);
                
                ctx.strokeStyle = '#ff9900';
                ctx.fillStyle = '#ff9900';
                ctx.lineWidth = 3;
                
                this.drawArrow(ctx,
                    this.position + (boxSize/2) * direction, arrowY,
                    this.position + (boxSize/2) * direction + arrowLength * direction, arrowY
                );
                
                ctx.fillStyle = '#ff9900';
                ctx.font = 'bold 12px Arial';
                ctx.fillText('Ff = ' + frictionForce.toFixed(0) + ' N',
                    this.position + (boxSize/2 + arrowLength/2) * direction, arrowY - 15);
            }
            
            // Velocity vector
            if (Math.abs(this.velocity) > 0.1) {
                const velLength = Math.min(Math.abs(this.velocity) * 15, 100);
                const velY = boxY - 20;
                const direction = Math.sign(this.velocity);
                
                ctx.strokeStyle = '#00aa00';
                ctx.fillStyle = '#00aa00';
                ctx.lineWidth = 2;
                
                this.drawArrow(ctx,
                    this.position, velY,
                    this.position + velLength * direction, velY
                );
                
                ctx.fillStyle = '#00aa00';
                ctx.font = 'bold 12px Arial';
                ctx.fillText('v = ' + this.velocity.toFixed(1) + ' m/s',
                    this.position + (velLength/2) * direction, velY - 10);
            }
        }
    }
    
    drawArrow(ctx, x1, y1, x2, y2) {
        const headLength = 10;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        
        // Line
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        // Arrowhead
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(
            x2 - headLength * Math.cos(angle - Math.PI / 6),
            y2 - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
            x2 - headLength * Math.cos(angle + Math.PI / 6),
            y2 - headLength * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fill();
    }
    
    drawPlot() {
        const ctx = this.plotCtx;
        const canvas = this.plotCanvas;
        
        ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (this.velocityData.length < 2) return;
        
        const padding = 50;
        const plotWidth = canvas.width - 2 * padding;
        const plotHeight = canvas.height - 2 * padding;
        
        // Find ranges
        const maxVel = Math.max(...this.velocityData.map(Math.abs), 10);
        const maxAccel = Math.max(...this.accelData.map(Math.abs), 5);
        const maxTime = Math.max(...this.timeData);
        
        // Draw axes
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        ctx.strokeStyle = isDark ? '#666' : '#333';
        ctx.lineWidth = 2;
        
        // Y-axis
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, canvas.height - padding);
        ctx.stroke();
        
        // X-axis
        ctx.beginPath();
        ctx.moveTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();
        
        // Grid
        ctx.strokeStyle = isDark ? '#333' : '#ddd';
        ctx.lineWidth = 1;
        for (let i = 1; i < 5; i++) {
            const y = padding + (plotHeight * i) / 5;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(canvas.width - padding, y);
            ctx.stroke();
        }
        
        // Labels
        ctx.fillStyle = isDark ? '#e4e4e4' : '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Time (s)', canvas.width / 2, canvas.height - 10);
        
        ctx.save();
        ctx.translate(15, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Velocity (m/s)', 0, 0);
        ctx.restore();
        
        // Draw velocity curve
        ctx.strokeStyle = '#00458b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < this.velocityData.length; i++) {
            const x = padding + (this.timeData[i] / maxTime) * plotWidth;
            const y = canvas.height - padding - ((this.velocityData[i] / maxVel) * plotHeight / 2 + plotHeight / 2);
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
        
        // Legend
        ctx.fillStyle = '#00458b';
        ctx.fillRect(canvas.width - padding - 100, padding + 10, 15, 3);
        ctx.fillStyle = isDark ? '#e4e4e4' : '#333';
        ctx.textAlign = 'left';
        ctx.fillText('Velocity', canvas.width - padding - 80, padding + 15);
        
        // Draw acceleration if enabled
        if (this.showAccelPlot) {
            ctx.strokeStyle = '#ff6600';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let i = 0; i < this.accelData.length; i++) {
                const x = padding + (this.timeData[i] / maxTime) * plotWidth;
                const y = canvas.height - padding - ((this.accelData[i] / maxAccel) * plotHeight / 4 + plotHeight / 2);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
            
            // Legend
            ctx.fillStyle = '#ff6600';
            ctx.fillRect(canvas.width - padding - 100, padding + 25, 15, 3);
            ctx.fillStyle = isDark ? '#e4e4e4' : '#333';
            ctx.fillText('Acceleration', canvas.width - padding - 80, padding + 30);
        }
    }
    
    exportData() {
        let csv = 'Time (s),Position (m),Velocity (m/s),Acceleration (m/s²)\n';
        
        for (let i = 0; i < this.timeData.length; i++) {
            csv += `${this.timeData[i].toFixed(3)},${(this.position / 50).toFixed(3)},${this.velocityData[i].toFixed(3)},${this.accelData[i].toFixed(3)}\n`;
        }
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `newtons_first_law_data_${Date.now()}.csv`;
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

new NewtonsFirstLaw();
