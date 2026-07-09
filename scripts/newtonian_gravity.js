const container = document.getElementById('simulation-container');

container.innerHTML = `
    <div class="physics-sim-container">
        <div class="sim-header">
            <h2>Newton's Law of Universal Gravitation</h2>
            <p>Every particle attracts every other particle with a force proportional to their masses and inversely proportional to the square of the distance!</p>
        </div>
        
        <div class="sim-layout">
            <div class="controls-panel">
                <h3>Controls</h3>
                
                <div class="control-group">
                    <label>Scenario</label>
                    <select id="scenario">
                        <option value="custom">Custom</option>
                        <option value="earth_moon">Earth-Moon</option>
                        <option value="binary_stars">Binary Stars</option>
                        <option value="sun_planet">Sun-Planet</option>
                        <option value="escape">Escape Velocity</option>
                    </select>
                </div>
                
                <div class="control-group">
                    <label>Mass 1 (×10²⁴ kg)</label>
                    <input type="range" id="mass1" min="1" max="100" value="50" step="1">
                    <span id="mass1Value">50</span>
                </div>
                
                <div class="control-group">
                    <label>Mass 2 (×10²⁴ kg)</label>
                    <input type="range" id="mass2" min="1" max="100" value="30" step="1">
                    <span id="mass2Value">30</span>
                </div>
                
                <div class="control-group">
                    <label>Distance (×10⁶ m)</label>
                    <input type="range" id="distance" min="5" max="100" value="20" step="1">
                    <span id="distanceValue">20</span>
                </div>
                
                <div class="control-group">
                    <label>Simulation Speed</label>
                    <input type="range" id="speed" min="0.1" max="100" value="10" step="0.5">
                    <span id="speedValue">10.0x</span>
                </div>
                
                <div class="control-group">
                    <label>
                        <input type="checkbox" id="showOrbits" checked> Show Orbital Trails
                    </label>
                </div>
                
                <div class="control-group">
                    <label>
                        <input type="checkbox" id="showField"> Show Gravity Field
                    </label>
                </div>
                
                <div class="control-group">
                    <label>
                        <input type="checkbox" id="showEnergy" checked> Show Energy
                    </label>
                </div>
                
                <div class="button-group">
                    <button id="start">Start Orbit</button>
                    <button id="pause">Pause</button>
                    <button id="reset">Reset</button>
                    <button id="export">Export Data</button>
                </div>
                
                <div class="info-panel">
                    <h4>Gravitational Force</h4>
                    <div class="info-row">
                        <span>Force (F):</span>
                        <span id="forceDisplay">0.00 N</span>
                    </div>
                    <div class="info-row">
                        <span>Distance (r):</span>
                        <span id="distDisplay">0.0 Mm</span>
                    </div>
                </div>
                
                <div class="info-panel">
                    <h4>Orbital Properties</h4>
                    <div class="info-row">
                        <span>Period (T):</span>
                        <span id="periodDisplay">-- s</span>
                    </div>
                    <div class="info-row">
                        <span>V₁ Speed:</span>
                        <span id="speed1Display">0.0 km/s</span>
                    </div>
                    <div class="info-row">
                        <span>V₂ Speed:</span>
                        <span id="speed2Display">0.0 km/s</span>
                    </div>
                </div>
                
                <div class="info-panel" id="energyPanel">
                    <h4>Energy Conservation</h4>
                    <div class="info-row">
                        <span>Kinetic (KE):</span>
                        <span id="keDisplay">0.00 J</span>
                    </div>
                    <div class="info-row">
                        <span>Potential (PE):</span>
                        <span id="peDisplay">0.00 J</span>
                    </div>
                    <div class="info-row">
                        <span>Total (E):</span>
                        <span id="totalEDisplay">0.00 J</span>
                    </div>
                </div>
                
                <div class="equation-panel">
                    <h4>Universal Gravitation</h4>
                    <div class="principle">
                        F = G(m₁m₂)/r²
                    </div>
                    <p style="font-size: 11px; margin: 5px 0;">
                        G = 6.674 × 10⁻¹¹ N·m²/kg²
                    </p>
                    <div class="principle" style="font-size: 14px; margin-top: 10px;">
                        PE = -G(m₁m₂)/r
                    </div>
                </div>
                
                <div class="help-text">
                    <p><strong>💡 Tips:</strong></p>
                    <ul style="font-size: 12px; padding-left: 20px;">
                        <li>Drag masses to reposition them</li>
                        <li>Adjust speed slider (up to 100x!)</li>
                        <li>Try different scenarios</li>
                        <li>Watch energy conservation!</li>
                        <li>Zoom with mouse wheel</li>
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
    
    .sim-layout {
        display: flex;
        gap: 20px;
    }
    
    .controls-panel {
        min-width: 300px;
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
        margin-bottom: 15px;
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
        cursor: pointer;
        margin-right: 5px;
    }
    
    .control-group select {
        width: 100%;
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #ccc;
        font-size: 14px;
    }
    
    .control-group span {
        display: inline-block;
        min-width: 60px;
        font-family: monospace;
        color: #00458b;
        font-weight: bold;
    }
    
    .button-group {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin: 15px 0;
    }
    
    .button-group button {
        padding: 10px;
        background: #00458b;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 13px;
        transition: background 0.2s;
    }
    
    .button-group button:hover {
        background: #003366;
    }
    
    .button-group button:disabled {
        background: #999;
        cursor: not-allowed;
    }
    
    .info-panel, .equation-panel {
        background: white;
        padding: 12px;
        border-radius: 5px;
        margin-top: 15px;
    }
    
    .info-panel h4, .equation-panel h4 {
        margin: 0 0 10px 0;
        color: #00458b;
        font-size: 14px;
    }
    
    .info-row {
        display: flex;
        justify-content: space-between;
        margin: 6px 0;
        font-size: 13px;
    }
    
    .info-row span:last-child {
        font-family: monospace;
        font-weight: bold;
        color: #00458b;
    }
    
    .principle {
        text-align: center;
        font-size: 16px;
        font-weight: bold;
        color: #00458b;
        margin: 8px 0;
        font-family: 'Times New Roman', serif;
        padding: 6px;
        background: #f0f8ff;
        border-radius: 5px;
    }
    
    .help-text {
        background: #fffbf0;
        border-left: 4px solid #ffa500;
        padding: 10px;
        margin-top: 15px;
        border-radius: 4px;
        font-size: 13px;
    }
    
    .help-text p {
        margin: 0 0 5px 0;
    }
    
    .help-text ul {
        margin: 5px 0 0 0;
    }
    
    .help-text li {
        margin: 3px 0;
    }
    
    .visualization-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    #mainCanvas {
        width: 100%;
        height: 500px;
        background: white;
        border: 2px solid #ddd;
        border-radius: 8px;
        cursor: grab;
    }
    
    #mainCanvas:active {
        cursor: grabbing;
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
        
        .help-text {
            background: #2a2510;
            border-left-color: #ffa500;
            color: #e4e4e4;
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
            max-width: 100%;
            max-height: none;
        }
        
        #mainCanvas {
            height: 400px;
        }
    }
`;
document.head.appendChild(style);

class EnhancedGravitationLaw {
    constructor() {
        this.mainCanvas = document.getElementById('mainCanvas');
        this.plotCanvas = document.getElementById('plotCanvas');
        this.mainCtx = this.mainCanvas.getContext('2d');
        this.plotCtx = this.plotCanvas.getContext('2d');
        
        // Constants
        this.G = 6.674e-11;
        
        // State
        this.mass1 = 10e24;
        this.mass2 = 20e24;
        this.distance = 30e6;
        this.running = false;
        this.paused = false;
        this.showOrbits = true;
        this.showField = false;
        this.showEnergy = true;
        this.time = 0;
        this.lastTime = 0;
        this.simSpeed = 10.0; // Start with 10x speed by default
        
        // View controls
        this.zoom = 1.0;
        this.offsetX = 0;
        this.offsetY = 0;
        this.isDragging = false;
        this.draggedBody = null;
        this.lastMouseX = 0;
        this.lastMouseY = 0;
        
        // Bodies
        this.pos1 = { x: 0, y: 0 };
        this.pos2 = { x: 0, y: 0 };
        this.vel1 = { x: 0, y: 0 };
        this.vel2 = { x: 0, y: 0 };
        
        // Trails
        this.trail1 = [];
        this.trail2 = [];
        this.maxTrailLength = 300;
        
        // Data
        this.force = 0;
        this.timeData = [];
        this.forceData = [];
        this.distanceData = [];
        this.kineticEnergyData = [];
        this.potentialEnergyData = [];
        this.totalEnergyData = [];
        this.maxDataPoints = 300;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.calculateForce();
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
        // Sliders
        document.getElementById('mass1').addEventListener('input', (e) => {
            this.mass1 = parseFloat(e.target.value) * 1e24;
            document.getElementById('mass1Value').textContent = e.target.value;
            if (!this.running) {
                this.calculateForce();
                this.updateDisplays();
                this.draw();
            }
        });
        
        document.getElementById('mass2').addEventListener('input', (e) => {
            this.mass2 = parseFloat(e.target.value) * 1e24;
            document.getElementById('mass2Value').textContent = e.target.value;
            if (!this.running) {
                this.calculateForce();
                this.updateDisplays();
                this.draw();
            }
        });
        
        document.getElementById('distance').addEventListener('input', (e) => {
            this.distance = parseFloat(e.target.value) * 1e6;
            document.getElementById('distanceValue').textContent = e.target.value;
            if (!this.running) {
                this.calculateForce();
                this.updateDisplays();
                this.draw();
            }
        });
        
        document.getElementById('speed').addEventListener('input', (e) => {
            this.simSpeed = parseFloat(e.target.value);
            document.getElementById('speedValue').textContent = this.simSpeed.toFixed(1) + 'x';
        });
        
        // Checkboxes
        document.getElementById('showOrbits').addEventListener('change', (e) => {
            this.showOrbits = e.target.checked;
            this.draw();
        });
        
        document.getElementById('showField').addEventListener('change', (e) => {
            this.showField = e.target.checked;
            this.draw();
        });
        
        document.getElementById('showEnergy').addEventListener('change', (e) => {
            this.showEnergy = e.target.checked;
            this.drawPlot();
        });
        
        // Scenario selector
        document.getElementById('scenario').addEventListener('change', (e) => {
            this.loadScenario(e.target.value);
        });
        
        // Buttons
        document.getElementById('start').addEventListener('click', () => {
            if (!this.running) {
                this.initializeOrbit();
                this.running = true;
                this.paused = false;
                this.lastTime = performance.now();
                this.animate();
                document.getElementById('start').disabled = true;
                document.getElementById('pause').disabled = false;
            }
        });
        
        document.getElementById('pause').addEventListener('click', () => {
            this.paused = !this.paused;
            document.getElementById('pause').textContent = this.paused ? 'Resume' : 'Pause';
            if (!this.paused) {
                this.lastTime = performance.now();
                this.animate();
            }
        });
        
        document.getElementById('reset').addEventListener('click', () => {
            this.reset();
        });
        
        document.getElementById('export').addEventListener('click', () => {
            this.exportData();
        });
        
        // Mouse events for dragging
        this.mainCanvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.mainCanvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.mainCanvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.mainCanvas.addEventListener('wheel', (e) => this.handleWheel(e));
        
        // Touch events
        this.mainCanvas.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        this.mainCanvas.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        this.mainCanvas.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        
        window.addEventListener('resize', () => this.setupCanvas());
    }
    
    loadScenario(scenario) {
        this.reset();
        
        switch(scenario) {
            case 'earth_moon':
                this.mass1 = 5.972e24; // Earth
                this.mass2 = 0.073e24; // Moon
                this.distance = 384.4e6; // m
                document.getElementById('mass1').value = 5.972;
                document.getElementById('mass1Value').textContent = '5.972';
                document.getElementById('mass2').value = 0.073;
                document.getElementById('mass2Value').textContent = '0.073';
                document.getElementById('distance').value = 38.44;
                document.getElementById('distanceValue').textContent = '38.44';
                break;
            case 'binary_stars':
                this.mass1 = 50e24;
                this.mass2 = 50e24;
                this.distance = 40e6;
                document.getElementById('mass1').value = 50;
                document.getElementById('mass1Value').textContent = '50';
                document.getElementById('mass2').value = 50;
                document.getElementById('mass2Value').textContent = '50';
                document.getElementById('distance').value = 40;
                document.getElementById('distanceValue').textContent = '40';
                break;
            case 'sun_planet':
                this.mass1 = 100e24;
                this.mass2 = 5e24;
                this.distance = 50e6;
                document.getElementById('mass1').value = 100;
                document.getElementById('mass1Value').textContent = '100';
                document.getElementById('mass2').value = 5;
                document.getElementById('mass2Value').textContent = '5';
                document.getElementById('distance').value = 50;
                document.getElementById('distanceValue').textContent = '50';
                break;
            case 'escape':
                this.mass1 = 80e24;
                this.mass2 = 0.1e24;
                this.distance = 20e6;
                document.getElementById('mass1').value = 80;
                document.getElementById('mass1Value').textContent = '80';
                document.getElementById('mass2').value = 0.1;
                document.getElementById('mass2Value').textContent = '0.1';
                document.getElementById('distance').value = 20;
                document.getElementById('distanceValue').textContent = '20';
                break;
        }
        
        this.calculateForce();
        this.updateDisplays();
        this.draw();
    }
    
    handleMouseDown(e) {
        const rect = this.mainCanvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const body = this.getBodyAtPosition(mouseX, mouseY);
        if (body) {
            this.draggedBody = body;
            this.isDragging = true;
            this.lastMouseX = mouseX;
            this.lastMouseY = mouseY;
        }
    }
    
    handleMouseMove(e) {
        if (this.isDragging && this.draggedBody && !this.running) {
            const rect = this.mainCanvas.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const worldPos = this.screenToWorld(mouseX, mouseY);
            
            if (this.draggedBody === 1) {
                this.pos1.x = worldPos.x;
                this.pos1.y = worldPos.y;
            } else {
                this.pos2.x = worldPos.x;
                this.pos2.y = worldPos.y;
            }
            
            const dx = this.pos2.x - this.pos1.x;
            const dy = this.pos2.y - this.pos1.y;
            this.distance = Math.sqrt(dx * dx + dy * dy);
            
            this.calculateForce();
            this.updateDisplays();
            this.draw();
        }
    }
    
    handleMouseUp(e) {
        this.isDragging = false;
        this.draggedBody = null;
    }
    
    handleWheel(e) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoom = Math.max(0.1, Math.min(5, this.zoom * delta));
        this.draw();
    }
    
    handleTouchStart(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const rect = this.mainCanvas.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;
            
            const body = this.getBodyAtPosition(touchX, touchY);
            if (body) {
                this.draggedBody = body;
                this.isDragging = true;
            }
        }
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        if (e.touches.length === 1 && this.isDragging && this.draggedBody && !this.running) {
            const touch = e.touches[0];
            const rect = this.mainCanvas.getBoundingClientRect();
            const touchX = touch.clientX - rect.left;
            const touchY = touch.clientY - rect.top;
            
            const worldPos = this.screenToWorld(touchX, touchY);
            
            if (this.draggedBody === 1) {
                this.pos1.x = worldPos.x;
                this.pos1.y = worldPos.y;
            } else {
                this.pos2.x = worldPos.x;
                this.pos2.y = worldPos.y;
            }
            
            const dx = this.pos2.x - this.pos1.x;
            const dy = this.pos2.y - this.pos1.y;
            this.distance = Math.sqrt(dx * dx + dy * dy);
            
            this.calculateForce();
            this.updateDisplays();
            this.draw();
        }
    }
    
    handleTouchEnd(e) {
        this.isDragging = false;
        this.draggedBody = null;
    }
    
    getBodyAtPosition(screenX, screenY) {
        const worldPos = this.screenToWorld(screenX, screenY);
        
        const dx1 = worldPos.x - this.pos1.x;
        const dy1 = worldPos.y - this.pos1.y;
        const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
        const radius1 = this.getRadius(this.mass1);
        
        if (dist1 < radius1) return 1;
        
        const dx2 = worldPos.x - this.pos2.x;
        const dy2 = worldPos.y - this.pos2.y;
        const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
        const radius2 = this.getRadius(this.mass2);
        
        if (dist2 < radius2) return 2;
        
        return null;
    }
    
    screenToWorld(screenX, screenY) {
        const centerX = this.mainCanvas.width / 2;
        const centerY = this.mainCanvas.height / 2;
        const scale = this.getScale();
        
        return {
            x: (screenX - centerX) / (scale * this.zoom) - this.offsetX,
            y: (screenY - centerY) / (scale * this.zoom) - this.offsetY
        };
    }
    
    worldToScreen(worldX, worldY) {
        const centerX = this.mainCanvas.width / 2;
        const centerY = this.mainCanvas.height / 2;
        const scale = this.getScale();
        
        return {
            x: (worldX + this.offsetX) * scale * this.zoom + centerX,
            y: (worldY + this.offsetY) * scale * this.zoom + centerY
        };
    }
    
    getScale() {
        return Math.min(this.mainCanvas.width, this.mainCanvas.height) / (this.distance * 3);
    }
    
    getRadius(mass) {
        return Math.cbrt(mass / 1e24) * 15 + 10;
    }
    
    calculateForce() {
        this.force = this.G * this.mass1 * this.mass2 / (this.distance * this.distance);
    }
    
    initializeOrbit() {
        const totalMass = this.mass1 + this.mass2;
        const r1 = this.distance * this.mass2 / totalMass;
        const r2 = this.distance * this.mass1 / totalMass;
        
        // Set positions in world coordinates
        this.pos1 = { x: -r1, y: 0 };
        this.pos2 = { x: r2, y: 0 };
        
        // For circular orbits in a two-body system:
        // Each body needs velocity such that centripetal force = gravitational force
        // Body 1 orbits at radius r1 with velocity v1
        // Body 2 orbits at radius r2 with velocity v2
        // The relative velocity must equal sqrt(G * totalMass / distance)
        
        // Velocity of each body around COM:
        const v_rel = Math.sqrt(this.G * totalMass / this.distance);
        const v1 = v_rel * this.mass2 / totalMass;
        const v2 = v_rel * this.mass1 / totalMass;
        
        // Set velocities perpendicular to position for circular orbit
        this.vel1 = { x: 0, y: v1 };
        this.vel2 = { x: 0, y: -v2 };
        
        this.trail1 = [];
        this.trail2 = [];
        this.time = 0;
        this.timeData = [];
        this.forceData = [];
        this.distanceData = [];
        this.kineticEnergyData = [];
        this.potentialEnergyData = [];
        this.totalEnergyData = [];
        
        console.log('Orbit initialized:', {
            totalMass,
            r1,
            r2,
            v_rel,
            v1,
            v2,
            'v1 (km/s)': v1/1000,
            'v2 (km/s)': v2/1000
        });
    }
    
    physics(dt) {
        const dx = this.pos2.x - this.pos1.x;
        const dy = this.pos2.y - this.pos1.y;
        const r = Math.sqrt(dx * dx + dy * dy);
        
        const F = this.G * this.mass1 * this.mass2 / (r * r);
        
        const ux = dx / r;
        const uy = dy / r;
        
        const Fx = F * ux;
        const Fy = F * uy;
        
        const a1x = Fx / this.mass1;
        const a1y = Fy / this.mass1;
        const a2x = -Fx / this.mass2;
        const a2y = -Fy / this.mass2;
        
        this.vel1.x += a1x * dt;
        this.vel1.y += a1y * dt;
        this.vel2.x += a2x * dt;
        this.vel2.y += a2y * dt;
        
        this.pos1.x += this.vel1.x * dt;
        this.pos1.y += this.vel1.y * dt;
        this.pos2.x += this.vel2.x * dt;
        this.pos2.y += this.vel2.y * dt;
        
        this.trail1.push({ x: this.pos1.x, y: this.pos1.y });
        this.trail2.push({ x: this.pos2.x, y: this.pos2.y });
        
        if (this.trail1.length > this.maxTrailLength) {
            this.trail1.shift();
            this.trail2.shift();
        }
        
        this.time += dt;
        
        // Calculate energies
        const v1 = Math.sqrt(this.vel1.x ** 2 + this.vel1.y ** 2);
        const v2 = Math.sqrt(this.vel2.x ** 2 + this.vel2.y ** 2);
        const KE = 0.5 * this.mass1 * v1 * v1 + 0.5 * this.mass2 * v2 * v2;
        const PE = -this.G * this.mass1 * this.mass2 / r;
        const totalE = KE + PE;
        
        // Store data (sample every few physics steps to avoid huge arrays)
        if (this.timeData.length === 0 || this.time - this.timeData[this.timeData.length - 1] > 0.5) {
            this.timeData.push(this.time);
            this.forceData.push(F);
            this.distanceData.push(r / 1e6);
            this.kineticEnergyData.push(KE);
            this.potentialEnergyData.push(PE);
            this.totalEnergyData.push(totalE);
            
            if (this.timeData.length > this.maxDataPoints) {
                this.timeData.shift();
                this.forceData.shift();
                this.distanceData.shift();
                this.kineticEnergyData.shift();
                this.potentialEnergyData.shift();
                this.totalEnergyData.shift();
            }
        }
        
        this.force = F;
    }
    
    updateDisplays() {
        document.getElementById('forceDisplay').textContent = this.force.toExponential(2) + ' N';
        
        if (this.running) {
            const dx = this.pos2.x - this.pos1.x;
            const dy = this.pos2.y - this.pos1.y;
            const r = Math.sqrt(dx * dx + dy * dy);
            document.getElementById('distDisplay').textContent = (r / 1e6).toFixed(2) + ' Mm';
            
            const v1 = Math.sqrt(this.vel1.x ** 2 + this.vel1.y ** 2);
            const v2 = Math.sqrt(this.vel2.x ** 2 + this.vel2.y ** 2);
            document.getElementById('speed1Display').textContent = (v1 / 1000).toFixed(2) + ' km/s';
            document.getElementById('speed2Display').textContent = (v2 / 1000).toFixed(2) + ' km/s';
            
            const totalMass = this.mass1 + this.mass2;
            const a = r / 2;
            const period = 2 * Math.PI * Math.sqrt(Math.pow(a, 3) / (this.G * totalMass));
            document.getElementById('periodDisplay').textContent = period.toFixed(1) + ' s';
            
            // Energy displays
            const KE = 0.5 * this.mass1 * v1 * v1 + 0.5 * this.mass2 * v2 * v2;
            const PE = -this.G * this.mass1 * this.mass2 / r;
            const totalE = KE + PE;
            
            document.getElementById('keDisplay').textContent = KE.toExponential(2) + ' J';
            document.getElementById('peDisplay').textContent = PE.toExponential(2) + ' J';
            document.getElementById('totalEDisplay').textContent = totalE.toExponential(2) + ' J';
        } else {
            document.getElementById('distDisplay').textContent = (this.distance / 1e6).toFixed(1) + ' Mm';
            document.getElementById('speed1Display').textContent = '0.0 km/s';
            document.getElementById('speed2Display').textContent = '0.0 km/s';
            document.getElementById('periodDisplay').textContent = '-- s';
            document.getElementById('keDisplay').textContent = '0.00 J';
            document.getElementById('peDisplay').textContent = '0.00 J';
            document.getElementById('totalEDisplay').textContent = '0.00 J';
        }
    }
    
    reset() {
        this.running = false;
        this.paused = false;
        this.time = 0;
        this.pos1 = { x: 0, y: 0 };
        this.pos2 = { x: 0, y: 0 };
        this.vel1 = { x: 0, y: 0 };
        this.vel2 = { x: 0, y: 0 };
        this.trail1 = [];
        this.trail2 = [];
        this.timeData = [];
        this.forceData = [];
        this.distanceData = [];
        this.kineticEnergyData = [];
        this.potentialEnergyData = [];
        this.totalEnergyData = [];
        this.zoom = 1.0;
        this.offsetX = 0;
        this.offsetY = 0;
        
        document.getElementById('start').disabled = false;
        document.getElementById('pause').disabled = true;
        document.getElementById('pause').textContent = 'Pause';
        
        this.calculateForce();
        this.updateDisplays();
        this.draw();
        this.drawPlot();
    }
    
    exportData() {
        if (this.timeData.length === 0) {
            alert('No data to export. Start the simulation first!');
            return;
        }
        
        let csv = 'Time (s),Force (N),Distance (Mm),KE (J),PE (J),Total E (J)\n';
        for (let i = 0; i < this.timeData.length; i++) {
            csv += `${this.timeData[i].toFixed(2)},${this.forceData[i].toExponential(4)},${this.distanceData[i].toFixed(2)},${this.kineticEnergyData[i].toExponential(4)},${this.potentialEnergyData[i].toExponential(4)},${this.totalEnergyData[i].toExponential(4)}\n`;
        }
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'gravity_simulation_data.csv';
        a.click();
        URL.revokeObjectURL(url);
    }
    
    draw() {
        const ctx = this.mainCtx;
        const canvas = this.mainCanvas;
        
        ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const scale = this.getScale() * this.zoom;
        
        // Draw gravity field if enabled
        if (this.showField) {
            this.drawGravityField(ctx, centerX, centerY, scale);
        }
        
        // Draw center of mass
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#666' : '#999';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('COM', centerX, centerY - 10);
        
        // Draw trails
        if (this.running && this.showOrbits) {
            this.drawTrail(ctx, this.trail1, centerX, centerY, scale, 'rgba(255, 100, 100, 0.5)');
            this.drawTrail(ctx, this.trail2, centerX, centerY, scale, 'rgba(100, 100, 255, 0.5)');
        }
        
        // Calculate positions
        let x1, y1, x2, y2;
        
        if (this.running) {
            const screen1 = this.worldToScreen(this.pos1.x, this.pos1.y);
            const screen2 = this.worldToScreen(this.pos2.x, this.pos2.y);
            x1 = screen1.x;
            y1 = screen1.y;
            x2 = screen2.x;
            y2 = screen2.y;
        } else {
            const totalMass = this.mass1 + this.mass2;
            const r1 = this.distance * this.mass2 / totalMass;
            const r2 = this.distance * this.mass1 / totalMass;
            
            x1 = centerX - r1 * scale;
            y1 = centerY;
            x2 = centerX + r2 * scale;
            y2 = centerY;
        }
        
        // Draw connection line
        ctx.strokeStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#444' : '#ddd';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw bodies
        this.drawBody(ctx, x1, y1, this.mass1, '#ff6666', '#cc0000', 'M₁');
        this.drawBody(ctx, x2, y2, this.mass2, '#6666ff', '#0000cc', 'M₂');
        
        // Draw force arrows
        if (!this.running || this.force > 1e18) {
            this.drawForceArrows(ctx, x1, y1, x2, y2);
        }
        
        // Draw zoom indicator
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e4e4e4' : '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Zoom: ${this.zoom.toFixed(1)}x`, 10, 20);
    }
    
    drawGravityField(ctx, centerX, centerY, scale) {
        const gridSize = 40;
        const arrowScale = 0.3;
        
        for (let x = 0; x < this.mainCanvas.width; x += gridSize) {
            for (let y = 0; y < this.mainCanvas.height; y += gridSize) {
                const worldPos = this.screenToWorld(x, y);
                
                const dx1 = worldPos.x - this.pos1.x;
                const dy1 = worldPos.y - this.pos1.y;
                const r1 = Math.sqrt(dx1 * dx1 + dy1 * dy1) || 1;
                
                const dx2 = worldPos.x - this.pos2.x;
                const dy2 = worldPos.y - this.pos2.y;
                const r2 = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;
                
                const fx1 = -this.G * this.mass1 * dx1 / (r1 * r1 * r1);
                const fy1 = -this.G * this.mass1 * dy1 / (r1 * r1 * r1);
                
                const fx2 = -this.G * this.mass2 * dx2 / (r2 * r2 * r2);
                const fy2 = -this.G * this.mass2 * dy2 / (r2 * r2 * r2);
                
                const fx = (fx1 + fx2) * 1e10;
                const fy = (fy1 + fy2) * 1e10;
                
                const magnitude = Math.sqrt(fx * fx + fy * fy);
                const maxMag = 20;
                const alpha = Math.min(magnitude / maxMag, 1) * 0.5;
                
                if (magnitude > 0.1) {
                    const endX = x + fx * arrowScale;
                    const endY = y + fy * arrowScale;
                    
                    ctx.strokeStyle = `rgba(150, 150, 150, ${alpha})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.lineTo(endX, endY);
                    ctx.stroke();
                }
            }
        }
    }
    
    drawTrail(ctx, trail, centerX, centerY, scale, color) {
        if (trail.length < 2) return;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < trail.length; i++) {
            const screen = this.worldToScreen(trail[i].x, trail[i].y);
            const alpha = (i / trail.length) * 0.8;
            ctx.globalAlpha = alpha;
            
            if (i === 0) {
                ctx.moveTo(screen.x, screen.y);
            } else {
                ctx.lineTo(screen.x, screen.y);
            }
        }
        
        ctx.stroke();
        ctx.globalAlpha = 1.0;
    }
    
    drawBody(ctx, x, y, mass, color1, color2, label) {
        const radius = this.getRadius(mass);
        
        const gradient = ctx.createRadialGradient(
            x - radius/3, y - radius/3, radius/10,
            x, y, radius
        );
        gradient.addColorStop(0, color1);
        gradient.addColorStop(1, color2);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = color2;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(label, x, y + 4);
    }
    
    drawForceArrows(ctx, x1, y1, x2, y2) {
        const forceScale = 2e-20;
        const arrowLength = Math.min(this.force * forceScale, 100);
        
        if (arrowLength < 5) return;
        
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const radius1 = this.getRadius(this.mass1);
        const radius2 = this.getRadius(this.mass2);
        
        ctx.strokeStyle = '#ff6600';
        ctx.fillStyle = '#ff6600';
        ctx.lineWidth = 3;
        
        // Force on mass 1
        const f1x = x1 + radius1 * Math.cos(angle);
        const f1y = y1 + radius1 * Math.sin(angle);
        const f1endX = f1x + arrowLength * Math.cos(angle);
        const f1endY = f1y + arrowLength * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(f1x, f1y);
        ctx.lineTo(f1endX, f1endY);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(f1endX, f1endY);
        ctx.lineTo(f1endX - 10 * Math.cos(angle - Math.PI/6), f1endY - 10 * Math.sin(angle - Math.PI/6));
        ctx.lineTo(f1endX - 10 * Math.cos(angle + Math.PI/6), f1endY - 10 * Math.sin(angle + Math.PI/6));
        ctx.closePath();
        ctx.fill();
        
        // Force on mass 2
        const f2x = x2 - radius2 * Math.cos(angle);
        const f2y = y2 - radius2 * Math.sin(angle);
        const f2endX = f2x - arrowLength * Math.cos(angle);
        const f2endY = f2y - arrowLength * Math.sin(angle);
        
        ctx.beginPath();
        ctx.moveTo(f2x, f2y);
        ctx.lineTo(f2endX, f2endY);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(f2endX, f2endY);
        ctx.lineTo(f2endX + 10 * Math.cos(angle - Math.PI/6), f2endY + 10 * Math.sin(angle - Math.PI/6));
        ctx.lineTo(f2endX + 10 * Math.cos(angle + Math.PI/6), f2endY + 10 * Math.sin(angle + Math.PI/6));
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
            const text = this.showEnergy ? 'Energy vs Time' : 'Force and Distance vs Time';
            ctx.fillText(text, canvas.width / 2, canvas.height / 2);
            return;
        }
        
        const padding = 50;
        const plotWidth = canvas.width - 2 * padding;
        const plotHeight = canvas.height - 2 * padding;
        
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
        
        const maxTime = Math.max(...this.timeData);
        
        if (this.showEnergy) {
            // Draw energy curves
            const maxKE = Math.max(...this.kineticEnergyData.map(Math.abs));
            const maxPE = Math.max(...this.potentialEnergyData.map(Math.abs));
            const maxE = Math.max(maxKE, maxPE);
            
            // KE
            this.drawCurve(ctx, this.timeData, this.kineticEnergyData, maxTime, maxE, padding, plotWidth, plotHeight, '#ff6600', 'KE');
            
            // PE (normalized by absolute value)
            this.drawCurve(ctx, this.timeData, this.potentialEnergyData.map(Math.abs), maxTime, maxE, padding, plotWidth, plotHeight, '#0066ff', '|PE|');
            
            // Total Energy
            const totalENormalized = this.totalEnergyData.map(e => Math.abs(e));
            this.drawCurve(ctx, this.timeData, totalENormalized, maxTime, maxE, padding, plotWidth, plotHeight, '#00ff00', '|E|');
            
        } else {
            const maxForce = Math.max(...this.forceData, 1e20);
            const maxDist = Math.max(...this.distanceData, 1);
            
            this.drawCurve(ctx, this.timeData, this.forceData, maxTime, maxForce, padding, plotWidth, plotHeight, '#ff6600', 'Force');
            
            const distScale = maxForce / maxDist;
            const distScaled = this.distanceData.map(d => d * distScale);
            this.drawCurve(ctx, this.timeData, distScaled, maxTime, maxForce, padding, plotWidth, plotHeight, '#0066ff', 'Distance');
        }
    }
    
    drawCurve(ctx, xData, yData, maxX, maxY, padding, plotWidth, plotHeight, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < xData.length; i++) {
            const x = padding + (xData[i] / maxX) * plotWidth;
            const y = this.plotCanvas.height - padding - (yData[i] / maxY) * plotHeight * 0.9;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
    }
    
    animate() {
        if (!this.running || this.paused) return;
        
        const currentTime = performance.now();
        let dt = (currentTime - this.lastTime) / 1000 * this.simSpeed;
        
        // Cap dt to prevent instability, but allow larger steps for faster simulation
        dt = Math.min(dt, 1.0);
        
        // Skip if dt is too small or too large (first frame)
        if (dt < 0.001 || dt > 2) {
            this.lastTime = currentTime;
            requestAnimationFrame(() => this.animate());
            return;
        }
        
        this.lastTime = currentTime;
        
        // Run multiple physics steps per frame for faster simulation
        const substeps = Math.ceil(dt / 0.1);
        const substepDt = dt / substeps;
        
        for (let i = 0; i < substeps; i++) {
            this.physics(substepDt);
        }
        
        this.updateDisplays();
        this.draw();
        
        // Only update plot every few frames for performance
        if (this.timeData.length % 5 === 0) {
            this.drawPlot();
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

new EnhancedGravitationLaw();
