const container = document.getElementById('simulation-container');

container.innerHTML = `
    <div class="physics-sim-container">
        <div class="sim-header">
            <h2>Kepler's Laws of Planetary Motion</h2>
            <p>Discover how planets move in elliptical orbits with the Sun at one focus!</p>
            <div class="law-tabs">
                <button class="law-tab active" data-law="second">2nd Law: Equal Areas</button>
                <button class="law-tab" data-law="first">1st Law: Elliptical Orbits</button>
            </div>
        </div>
        
        <div class="sim-layout">
            <div class="controls-panel">
                <h3>Controls</h3>
                
                <div class="preset-group">
                    <label>Famous Orbits:</label>
                    <select id="preset">
                        <option value="custom">Custom</option>
                        <option value="earth">Earth</option>
                        <option value="mercury">Mercury</option>
                        <option value="mars">Mars</option>
                        <option value="halley">Halley's Comet</option>
                        <option value="pluto">Pluto (dwarf planet)</option>
                    </select>
                </div>
                
                <div class="control-group">
                    <label>Semi-Major Axis (AU)</label>
                    <input type="range" id="semiMajor" min="0.4" max="5" value="1.5" step="0.1">
                    <span id="semiMajorValue">1.5</span>
                </div>
                
                <div class="control-group">
                    <label>Eccentricity (e)</label>
                    <input type="range" id="eccentricity" min="0" max="0.95" value="0.5" step="0.01">
                    <span id="eccentricityValue">0.50</span>
                </div>
                
                <div class="control-group">
                    <label>Animation Speed</label>
                    <input type="range" id="speed" min="0.1" max="10" value="3" step="0.1">
                    <span id="speedValue">3x</span>
                </div>
                
                <div class="control-group" id="areaIntervalGroup">
                    <label>Area Time Interval (days)</label>
                    <input type="range" id="timeInterval" min="10" max="90" value="30" step="5">
                    <span id="timeIntervalValue">30</span>
                </div>
                
                <div class="control-group">
                    <label>
                        <input type="checkbox" id="showTrail" checked>
                        Show Orbital Trail
                    </label>
                </div>
                
                <div class="control-group" id="showAreasGroup">
                    <label>
                        <input type="checkbox" id="showAreas" checked>
                        Show Area Sweeps
                    </label>
                </div>
                
                <div class="control-group" id="showVelocityGroup">
                    <label>
                        <input type="checkbox" id="showVelocity" checked>
                        Show Velocity Vector
                    </label>
                </div>
                
                <div class="button-group">
                    <button id="start">▶ Start</button>
                    <button id="pause">⏸ Pause</button>
                    <button id="reset">↻ Reset</button>
                    <button id="markArea" style="display:none;">Mark Area Point</button>
                    <button id="exportData">💾 Export Data</button>
                </div>
                
                <div class="info-panel">
                    <h4>Orbital Properties</h4>
                    <div class="info-row">
                        <span>Period (T):</span>
                        <span id="periodDisplay">0.0 days</span>
                    </div>
                    <div class="info-row">
                        <span>Speed (v):</span>
                        <span id="speedDisplay">0.0 km/s</span>
                    </div>
                    <div class="info-row">
                        <span>Distance (r):</span>
                        <span id="distanceDisplay">0.0 AU</span>
                    </div>
                    <div class="info-row">
                        <span>True Anomaly:</span>
                        <span id="angleDisplay">0.0°</span>
                    </div>
                </div>
                
                <div class="info-panel" id="areaPanel">
                    <h4>📐 Area Measurements</h4>
                    <div class="info-row">
                        <span>Area 1 (perihelion):</span>
                        <span id="area1Display">-- AU²</span>
                    </div>
                    <div class="info-row">
                        <span>Area 2 (aphelion):</span>
                        <span id="area2Display">-- AU²</span>
                    </div>
                    <div class="info-row">
                        <span>Ratio A1/A2:</span>
                        <span id="ratioDisplay" style="color: #ff6600;">--</span>
                    </div>
                    <div class="info-message" id="equalAreaMessage" style="display:none; color: #00aa00; font-weight: bold; margin-top: 8px; font-size: 13px;">
                        ✓ Areas are equal! (Kepler's 2nd Law verified)
                    </div>
                </div>
                
                <div class="help-panel">
                    <h4>💡 Tips</h4>
                    <ul id="helpText">
                        <li>Try different preset orbits</li>
                        <li>Watch how speed changes with distance</li>
                        <li>Compare areas swept in equal times</li>
                        <li>Press Space to play/pause</li>
                    </ul>
                </div>
            </div>
            
            <div class="visualization-area">
                <div class="canvas-controls">
                    <button id="zoomIn">🔍 +</button>
                    <button id="zoomOut">🔍 −</button>
                    <button id="resetZoom">⊙ Reset View</button>
                    <span id="zoomDisplay">Zoom: 100%</span>
                </div>
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
    
    .law-tabs {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 15px;
        flex-wrap: wrap;
    }
    
    .law-tab {
        padding: 8px 16px;
        background: white;
        border: 2px solid #00458b;
        border-radius: 5px;
        cursor: pointer;
        font-size: 13px;
        font-weight: bold;
        color: #00458b;
        transition: all 0.2s;
    }
    
    .law-tab:hover {
        background: #e6f2ff;
    }
    
    .law-tab.active {
        background: #00458b;
        color: white;
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
    
    .preset-group {
        margin-bottom: 20px;
    }
    
    .preset-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
        font-size: 14px;
    }
    
    .preset-group select {
        width: 100%;
        padding: 8px;
        border-radius: 5px;
        border: 2px solid #00458b;
        font-size: 14px;
        background: white;
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
    
    .info-panel, .help-panel {
        background: white;
        padding: 15px;
        border-radius: 5px;
        margin-top: 20px;
    }
    
    .info-panel h4, .help-panel h4 {
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
    
    .canvas-controls {
        display: flex;
        gap: 10px;
        align-items: center;
        padding: 8px;
        background: #f8f8f8;
        border-radius: 5px;
    }
    
    .canvas-controls button {
        padding: 6px 12px;
        background: #00458b;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        font-weight: bold;
    }
    
    .canvas-controls button:hover {
        background: #003366;
    }
    
    #zoomDisplay {
        margin-left: auto;
        font-size: 13px;
        font-weight: bold;
        color: #00458b;
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
        
        .law-tab {
            background: #2a2a2a;
            border-color: #7db3f0;
            color: #7db3f0;
        }
        
        .law-tab:hover {
            background: #1a3a5a;
        }
        
        .law-tab.active {
            background: #2d5aa0;
            color: white;
        }
        
        .controls-panel {
            background: #2a2a2a;
        }
        
        .controls-panel h3 {
            color: #7db3f0;
        }
        
        .preset-group select {
            background: #1a1a1a;
            color: #e4e4e4;
            border-color: #7db3f0;
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
        
        .canvas-controls {
            background: #2a2a2a;
        }
        
        #zoomDisplay {
            color: #7db3f0;
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

class KeplersLaws {
    constructor() {
        this.mainCanvas = document.getElementById('mainCanvas');
        this.plotCanvas = document.getElementById('plotCanvas');
        this.mainCtx = this.mainCanvas.getContext('2d');
        this.plotCtx = this.plotCanvas.getContext('2d');
        
        // Presets for famous orbits
        this.presets = {
            earth: { a: 1.0, e: 0.017, name: 'Earth' },
            mercury: { a: 0.387, e: 0.206, name: 'Mercury' },
            mars: { a: 1.524, e: 0.093, name: 'Mars' },
            halley: { a: 17.8, e: 0.967, name: "Halley's Comet" },
            pluto: { a: 39.5, e: 0.25, name: 'Pluto' }
        };
        
        // Orbital parameters
        this.semiMajorAxis = 1.5;
        this.eccentricity = 0.5;
        this.timeInterval = 30;
        this.animationSpeed = 3;
        
        // Current law being displayed
        this.currentLaw = 'second';
        
        // State
        this.running = false;
        this.showAreas = true;
        this.showTrail = true;
        this.showVelocity = true;
        this.time = 0;
        this.lastTime = 0;
        this.theta = 0;
        
        // Zoom
        this.zoom = 1.0;
        this.panX = 0;
        this.panY = 0;
        
        // Area tracking
        this.areaSweeps = [];
        this.area1 = null;
        this.area2 = null;
        this.measurePositions = [];
        this.lastMeasureTime = 0;
        
        // Trail
        this.trail = [];
        this.maxTrailLength = 300;
        
        // Data
        this.timeData = [];
        this.speedData = [];
        this.distanceData = [];
        this.maxDataPoints = 500;
        
        this.setupCanvas();
        this.setupEventListeners();
        this.updateLawDisplay();
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
        // Law tabs
        document.querySelectorAll('.law-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                document.querySelectorAll('.law-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                this.currentLaw = e.target.dataset.law;
                this.updateLawDisplay();
                this.reset();
            });
        });
        
        // Preset selector
        document.getElementById('preset').addEventListener('change', (e) => {
            const preset = e.target.value;
            if (preset !== 'custom' && this.presets[preset]) {
                this.loadPreset(preset);
            }
        });
        
        // Sliders
        document.getElementById('semiMajor').addEventListener('input', (e) => {
            this.semiMajorAxis = parseFloat(e.target.value);
            document.getElementById('semiMajorValue').textContent = this.semiMajorAxis.toFixed(1);
            document.getElementById('preset').value = 'custom';
            this.updateDisplays();
            if (!this.running) this.draw();
        });
        
        document.getElementById('eccentricity').addEventListener('input', (e) => {
            this.eccentricity = parseFloat(e.target.value);
            document.getElementById('eccentricityValue').textContent = this.eccentricity.toFixed(2);
            document.getElementById('preset').value = 'custom';
            if (!this.running) this.draw();
        });
        
        document.getElementById('speed').addEventListener('input', (e) => {
            this.animationSpeed = parseFloat(e.target.value);
            document.getElementById('speedValue').textContent = this.animationSpeed.toFixed(1) + 'x';
        });
        
        document.getElementById('timeInterval').addEventListener('input', (e) => {
            this.timeInterval = parseFloat(e.target.value);
            document.getElementById('timeIntervalValue').textContent = this.timeInterval;
        });
        
        // Checkboxes
        document.getElementById('showTrail').addEventListener('change', (e) => {
            this.showTrail = e.target.checked;
            if (!this.showTrail) this.trail = [];
            this.draw();
        });
        
        document.getElementById('showAreas').addEventListener('change', (e) => {
            this.showAreas = e.target.checked;
            this.draw();
        });
        
        document.getElementById('showVelocity').addEventListener('change', (e) => {
            this.showVelocity = e.target.checked;
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
        
        document.getElementById('exportData').addEventListener('click', () => {
            this.exportData();
        });
        
        // Zoom controls
        document.getElementById('zoomIn').addEventListener('click', () => {
            this.zoom *= 1.2;
            this.updateZoomDisplay();
            this.draw();
        });
        
        document.getElementById('zoomOut').addEventListener('click', () => {
            this.zoom /= 1.2;
            this.updateZoomDisplay();
            this.draw();
        });
        
        document.getElementById('resetZoom').addEventListener('click', () => {
            this.zoom = 1.0;
            this.panX = 0;
            this.panY = 0;
            this.updateZoomDisplay();
            this.draw();
        });
        
        // Mouse wheel zoom
        this.mainCanvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            if (e.deltaY < 0) {
                this.zoom *= 1.1;
            } else {
                this.zoom /= 1.1;
            }
            this.zoom = Math.max(0.1, Math.min(5, this.zoom));
            this.updateZoomDisplay();
            this.draw();
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
                case '+':
                case '=':
                    this.zoom *= 1.2;
                    this.updateZoomDisplay();
                    this.draw();
                    break;
                case '-':
                case '_':
                    this.zoom /= 1.2;
                    this.updateZoomDisplay();
                    this.draw();
                    break;
            }
        });
        
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.draw();
            this.drawPlot();
        });
    }
    
    loadPreset(presetName) {
        const preset = this.presets[presetName];
        this.semiMajorAxis = preset.a;
        this.eccentricity = preset.e;
        
        document.getElementById('semiMajor').value = preset.a;
        document.getElementById('eccentricity').value = preset.e;
        document.getElementById('semiMajorValue').textContent = preset.a.toFixed(1);
        document.getElementById('eccentricityValue').textContent = preset.e.toFixed(2);
        
        // Adjust zoom for outer planets
        if (preset.a > 5) {
            this.zoom = 0.3;
        } else {
            this.zoom = 1.0;
        }
        this.updateZoomDisplay();
        
        this.reset();
    }
    
    updateLawDisplay() {
        // Show/hide relevant controls
        const areaGroup = document.getElementById('areaIntervalGroup');
        const showAreasGroup = document.getElementById('showAreasGroup');
        const showVelocityGroup = document.getElementById('showVelocityGroup');
        const areaPanel = document.getElementById('areaPanel');
        
        if (this.currentLaw === 'second') {
            areaGroup.style.display = 'block';
            showAreasGroup.style.display = 'block';
            showVelocityGroup.style.display = 'block';
            areaPanel.style.display = 'block';
            
            // Update help text
            const helpText = document.getElementById('helpText');
            helpText.innerHTML = `
                <li>Watch how areas swept in equal times are equal</li>
                <li>Planet moves faster near perihelion</li>
                <li>Planet moves slower near aphelion</li>
                <li>The ratio A1/A2 should be ≈ 1.0</li>
            `;
        } else if (this.currentLaw === 'first') {
            areaGroup.style.display = 'none';
            showAreasGroup.style.display = 'none';
            showVelocityGroup.style.display = 'block';
            areaPanel.style.display = 'none';
            
            // Update help text
            const helpText = document.getElementById('helpText');
            helpText.innerHTML = `
                <li>All planetary orbits are ellipses</li>
                <li>The Sun is at one focus (not the center!)</li>
                <li>Eccentricity e = 0 is a circle</li>
                <li>Higher e means more elongated ellipse</li>
            `;
        }
    }
    
    updateZoomDisplay() {
        document.getElementById('zoomDisplay').textContent = `Zoom: ${(this.zoom * 100).toFixed(0)}%`;
    }
    
    calculateOrbitalPeriod(a = this.semiMajorAxis) {
        // Kepler's 3rd law: T² = a³ (in years for AU)
        return Math.sqrt(Math.pow(a, 3)) * 365.25; // days
    }
    
    getPosition(theta) {
        const a = this.semiMajorAxis;
        const e = this.eccentricity;
        const r = a * (1 - e * e) / (1 + e * Math.cos(theta));
        
        return {
            r: r,
            x: r * Math.cos(theta),
            y: r * Math.sin(theta)
        };
    }
    
    getSpeed(r) {
        // Vis-viva equation: v² = GM(2/r - 1/a)
        const a = this.semiMajorAxis;
        const GM = 4 * Math.PI * Math.PI; // AU³/year²
        const v_au_year = Math.sqrt(GM * (2 / r - 1 / a));
        return v_au_year * 29.78; // Convert to km/s (Earth's orbital speed as reference)
    }
    
    updateDisplays() {
        const period = this.calculateOrbitalPeriod();
        document.getElementById('periodDisplay').textContent = 
            period > 365 ? `${(period/365.25).toFixed(2)} years` : `${period.toFixed(1)} days`;
        
        if (this.running) {
            const pos = this.getPosition(this.theta);
            const speed = this.getSpeed(pos.r);
            document.getElementById('speedDisplay').textContent = speed.toFixed(2) + ' km/s';
            document.getElementById('distanceDisplay').textContent = pos.r.toFixed(3) + ' AU';
            document.getElementById('angleDisplay').textContent = (this.theta * 180 / Math.PI).toFixed(1) + '°';
        }
        
        if (this.area1 !== null && this.area2 !== null) {
            document.getElementById('area1Display').textContent = this.area1.toFixed(4) + ' AU²';
            document.getElementById('area2Display').textContent = this.area2.toFixed(4) + ' AU²';
            const ratio = this.area1 / this.area2;
            document.getElementById('ratioDisplay').textContent = ratio.toFixed(3);
            
            // Show success message if areas are close
            if (Math.abs(ratio - 1.0) < 0.1) {
                document.getElementById('equalAreaMessage').style.display = 'block';
            }
        }
    }
    
    updateThirdLawComparison() {
        const container = document.getElementById('planetComparison');
        let html = '<table style="width: 100%; font-size: 12px;">';
        html += '<tr style="font-weight: bold;"><td>Planet</td><td>a (AU)</td><td>T² / a³</td></tr>';
        
        this.comparisonPlanets.forEach(planet => {
            const T = this.calculateOrbitalPeriod(planet.a) / 365.25; // years
            const ratio = (T * T) / Math.pow(planet.a, 3);
            html += `<tr><td>${planet.name}</td><td>${planet.a.toFixed(3)}</td><td>${ratio.toFixed(4)}</td></tr>`;
        });
        
        html += '</table>';
        html += '<div style="margin-top: 10px; font-size: 11px; color: #666;">All ratios ≈ 1.000, confirming T² ∝ a³!</div>';
        container.innerHTML = html;
    }
    
    reset() {
        this.running = false;
        this.time = 0;
        this.theta = 0;
        this.trail = [];
        this.areaSweeps = [];
        this.area1 = null;
        this.area2 = null;
        this.measurePositions = [];
        this.lastMeasureTime = 0;
        this.timeData = [];
        this.speedData = [];
        this.distanceData = [];
        document.getElementById('area1Display').textContent = '-- AU²';
        document.getElementById('area2Display').textContent = '-- AU²';
        document.getElementById('ratioDisplay').textContent = '--';
        document.getElementById('equalAreaMessage').style.display = 'none';
        this.updateDisplays();
        this.draw();
        this.drawPlot();
    }
    
    calculateSweptArea(positions) {
        if (positions.length < 2) return 0;
        
        let area = 0;
        for (let i = 0; i < positions.length - 1; i++) {
            area += positions[i].x * positions[i+1].y - positions[i+1].x * positions[i].y;
        }
        
        return Math.abs(area) / 2;
    }
    
    physics(dt) {
        const period = this.calculateOrbitalPeriod();
        const meanMotion = 2 * Math.PI / period;
        
        const pos = this.getPosition(this.theta);
        
        // Kepler's 2nd law: angular velocity varies with 1/r²
        const perihelionDist = this.semiMajorAxis * (1 - this.eccentricity);
        const dThetaDt = meanMotion * Math.pow(perihelionDist / pos.r, 2);
        
        this.theta += dThetaDt * dt;
        
        if (this.theta > 2 * Math.PI) {
            this.theta -= 2 * Math.PI;
        }
        
        this.time += dt;
        
        // Track areas for second law
        if (this.currentLaw === 'second') {
            this.measurePositions.push({ x: pos.x, y: pos.y, time: this.time });
            
            if (this.measurePositions.length > 1) {
                const timeSpan = this.time - this.lastMeasureTime;
                
                if (timeSpan >= this.timeInterval) {
                    const area = this.calculateSweptArea(this.measurePositions);
                    
                    // Measure near perihelion (θ between 0 and 60 degrees)
                    if (this.area1 === null && this.theta >= 0 && this.theta < Math.PI / 3) {
                        this.area1 = area;
                        this.areaSweeps.push({
                            positions: [...this.measurePositions],
                            color: 'rgba(255, 100, 100, 0.4)',
                            label: 'Area 1 (fast)'
                        });
                        this.measurePositions = [this.measurePositions[this.measurePositions.length - 1]];
                        this.lastMeasureTime = this.time;
                    }
                    // Measure near aphelion (θ between 150 and 210 degrees)
                    else if (this.area2 === null && this.theta > 5 * Math.PI / 6 && this.theta < 7 * Math.PI / 6) {
                        this.area2 = area;
                        this.areaSweeps.push({
                            positions: [...this.measurePositions],
                            color: 'rgba(100, 100, 255, 0.4)',
                            label: 'Area 2 (slow)'
                        });
                        this.measurePositions = [this.measurePositions[this.measurePositions.length - 1]];
                        this.lastMeasureTime = this.time;
                    }
                    // If we've passed both regions without measuring, just measure wherever we are
                    else if (this.area1 === null || this.area2 === null) {
                        // Allow measurement but don't reset the positions yet
                        if (this.area1 === null && this.theta < Math.PI) {
                            this.area1 = area;
                            this.areaSweeps.push({
                                positions: [...this.measurePositions],
                                color: 'rgba(255, 100, 100, 0.4)',
                                label: 'Area 1'
                            });
                            this.measurePositions = [this.measurePositions[this.measurePositions.length - 1]];
                            this.lastMeasureTime = this.time;
                        } else if (this.area2 === null && this.theta >= Math.PI) {
                            this.area2 = area;
                            this.areaSweeps.push({
                                positions: [...this.measurePositions],
                                color: 'rgba(100, 100, 255, 0.4)',
                                label: 'Area 2'
                            });
                            this.measurePositions = [this.measurePositions[this.measurePositions.length - 1]];
                            this.lastMeasureTime = this.time;
                        }
                    }
                }
            }
        }
        
        // Trail
        if (this.showTrail) {
            this.trail.push({ x: pos.x, y: pos.y });
            if (this.trail.length > this.maxTrailLength) {
                this.trail.shift();
            }
        }
        
        // Data
        const speed = this.getSpeed(pos.r);
        this.timeData.push(this.time);
        this.speedData.push(speed);
        this.distanceData.push(pos.r);
        
        if (this.timeData.length > this.maxDataPoints) {
            this.timeData.shift();
            this.speedData.shift();
            this.distanceData.shift();
        }
    }
    
    draw() {
        const ctx = this.mainCtx;
        const canvas = this.mainCanvas;
        
        ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const centerX = canvas.width / 2 + this.panX;
        const centerY = canvas.height / 2 + this.panY;
        const baseScale = Math.min(canvas.width, canvas.height) / (this.semiMajorAxis * 2.5);
        const scale = baseScale * this.zoom;
        
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        // Draw orbit ellipse
        const a = this.semiMajorAxis * scale;
        const e = this.eccentricity;
        const b = a * Math.sqrt(1 - e * e);
        const c = a * e;
        
        // Ellipse center is offset from the sun (which is at a focus)
        const ellipseCenterX = centerX - c;
        const ellipseCenterY = centerY;
        
        ctx.strokeStyle = isDark ? '#444' : '#ccc';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.ellipse(ellipseCenterX, ellipseCenterY, a, b, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw axes if first law
        if (this.currentLaw === 'first') {
            ctx.strokeStyle = isDark ? '#555' : '#bbb';
            ctx.lineWidth = 1;
            
            // Major axis (horizontal through both foci)
            ctx.beginPath();
            ctx.moveTo(ellipseCenterX - a, ellipseCenterY);
            ctx.lineTo(ellipseCenterX + a, ellipseCenterY);
            ctx.stroke();
            
            // Minor axis (vertical through center)
            ctx.beginPath();
            ctx.moveTo(ellipseCenterX, ellipseCenterY - b);
            ctx.lineTo(ellipseCenterX, ellipseCenterY + b);
            ctx.stroke();
            
            // Labels
            ctx.fillStyle = isDark ? '#888' : '#666';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Semi-major axis: a = ' + this.semiMajorAxis.toFixed(2) + ' AU', ellipseCenterX, ellipseCenterY - b - 10);
            ctx.fillText('Semi-minor axis: b = ' + (this.semiMajorAxis * Math.sqrt(1 - e * e)).toFixed(2) + ' AU', ellipseCenterX, ellipseCenterY - b - 25);
            ctx.fillText('Eccentricity: e = ' + this.eccentricity.toFixed(2), ellipseCenterX, ellipseCenterY + b + 20);
            
            // Mark both foci
            ctx.fillStyle = isDark ? '#ff8888' : '#ff0000';
            
            // Focus 1 (Sun is here)
            ctx.beginPath();
            ctx.arc(centerX, centerY, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = isDark ? '#888' : '#666';
            ctx.font = '11px Arial';
            ctx.fillText('Focus 1 (Sun)', centerX, centerY + 25);
            
            // Focus 2 (empty focus)
            ctx.fillStyle = isDark ? '#ff8888' : '#ff0000';
            ctx.beginPath();
            ctx.arc(centerX - 2 * c, centerY, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = isDark ? '#888' : '#666';
            ctx.fillText('Focus 2', centerX - 2 * c, centerY + 25);
        }
        
        // Draw trail
        if (this.showTrail && this.trail.length > 1) {
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
            ctx.strokeStyle = 'rgba(100, 150, 255, 0.5)';
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            for (let i = 0; i < this.trail.length; i++) {
                const x = centerX + this.trail[i].x * scale;
                const y = centerY + this.trail[i].y * scale;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        
        // Draw area sweeps
        if (this.showAreas && this.currentLaw === 'second') {
            for (const sweep of this.areaSweeps) {
                ctx.fillStyle = sweep.color;
                ctx.strokeStyle = sweep.color.replace('0.4', '0.8');
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                for (const pos of sweep.positions) {
                    ctx.lineTo(centerX + pos.x * scale, centerY + pos.y * scale);
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();
                
                // Label
                if (sweep.positions.length > 0) {
                    const mid = sweep.positions[Math.floor(sweep.positions.length / 2)];
                    ctx.fillStyle = isDark ? '#fff' : '#000';
                    ctx.font = 'bold 11px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(sweep.label, centerX + mid.x * scale, centerY + mid.y * scale);
                }
            }
        }
        
        // Draw Sun
        const sunRadius = 18;
        const sunGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, sunRadius);
        sunGrad.addColorStop(0, '#ffff99');
        sunGrad.addColorStop(0.4, '#ffdd00');
        sunGrad.addColorStop(0.7, '#ffaa00');
        sunGrad.addColorStop(1, '#ff6600');
        
        ctx.fillStyle = sunGrad;
        ctx.beginPath();
        ctx.arc(centerX, centerY, sunRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#cc5500';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Sun rays
        ctx.strokeStyle = 'rgba(255, 200, 0, 0.3)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
            const angle = (i * Math.PI) / 4;
            const x1 = centerX + Math.cos(angle) * sunRadius;
            const y1 = centerY + Math.sin(angle) * sunRadius;
            const x2 = centerX + Math.cos(angle) * (sunRadius + 10);
            const y2 = centerY + Math.sin(angle) * (sunRadius + 10);
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
        }
        
        // Draw planet
        const pos = this.running ? this.getPosition(this.theta) : 
                    { x: this.semiMajorAxis * (1 - this.eccentricity), y: 0, r: this.semiMajorAxis * (1 - this.eccentricity) };
        const planetX = centerX + pos.x * scale;
        const planetY = centerY + pos.y * scale;
        const planetRadius = 12;
        
        const planetGrad = ctx.createRadialGradient(
            planetX - planetRadius/3, planetY - planetRadius/3, 0,
            planetX, planetY, planetRadius
        );
        planetGrad.addColorStop(0, '#88bbff');
        planetGrad.addColorStop(1, '#0055cc');
        
        ctx.fillStyle = planetGrad;
        ctx.beginPath();
        ctx.arc(planetX, planetY, planetRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#003388';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Draw line from sun to planet
        ctx.strokeStyle = isDark ? '#555' : '#999';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(planetX, planetY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw velocity vector
        if (this.showVelocity && this.running) {
            const speed = this.getSpeed(pos.r);
            const velScale = scale * 0.3;
            
            // Velocity is perpendicular to radius and tangent to orbit
            const vAngle = this.theta + Math.PI / 2;
            const vx = Math.cos(vAngle) * speed * velScale * 0.05;
            const vy = Math.sin(vAngle) * speed * velScale * 0.05;
            
            ctx.strokeStyle = '#00dd00';
            ctx.fillStyle = '#00dd00';
            ctx.lineWidth = 3;
            
            this.drawArrow(ctx, planetX, planetY, planetX + vx, planetY + vy);
            
            ctx.fillStyle = '#00dd00';
            ctx.font = 'bold 11px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('v', planetX + vx + 15, planetY + vy);
        }
        
        // Mark perihelion and aphelion
        const periR = this.semiMajorAxis * (1 - e);
        const aphelR = this.semiMajorAxis * (1 + e);
        
        ctx.fillStyle = isDark ? '#888' : '#666';
        ctx.font = '11px Arial';
        ctx.textAlign = 'center';
        
        // Perihelion is to the right of the sun
        ctx.fillText('Perihelion', centerX + periR * scale, centerY + 25);
        ctx.fillText('(closest & fastest)', centerX + periR * scale, centerY + 37);
        
        // Aphelion is to the left of the sun
        ctx.fillText('Aphelion', centerX - aphelR * scale, centerY + 25);
        ctx.fillText('(farthest & slowest)', centerX - aphelR * scale, centerY + 37);
    }
    
    drawArrow(ctx, x1, y1, x2, y2) {
        const headLen = 10;
        const angle = Math.atan2(y2 - y1, x2 - x1);
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(x2 - headLen * Math.cos(angle - Math.PI / 6), y2 - headLen * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(x2 - headLen * Math.cos(angle + Math.PI / 6), y2 - headLen * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
    }
    
    drawPlot() {
        const ctx = this.plotCtx;
        const canvas = this.plotCanvas;
        
        ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        if (this.timeData.length < 2) {
            ctx.fillStyle = isDark ? '#666' : '#999';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Orbital speed varies with distance from the Sun', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        const padding = 50;
        const plotWidth = canvas.width - 2 * padding;
        const plotHeight = canvas.height - 2 * padding;
        
        const maxTime = Math.max(...this.timeData);
        const maxSpeed = Math.max(...this.speedData);
        const minSpeed = Math.min(...this.speedData);
        const speedRange = maxSpeed - minSpeed;
        
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
        ctx.fillText('Time (days)', canvas.width / 2, canvas.height - 10);
        
        ctx.save();
        ctx.translate(15, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Speed (km/s)', 0, 0);
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
        
        // Plot speed
        ctx.strokeStyle = '#0066ff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let i = 0; i < this.timeData.length; i++) {
            const x = padding + (this.timeData[i] / maxTime) * plotWidth;
            const y = canvas.height - padding - ((this.speedData[i] - minSpeed) / speedRange) * plotHeight * 0.9;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Legend
        ctx.fillStyle = '#0066ff';
        ctx.fillRect(canvas.width - padding - 120, padding + 10, 20, 3);
        ctx.fillStyle = isDark ? '#e4e4e4' : '#333';
        ctx.textAlign = 'left';
        ctx.font = '12px Arial';
        ctx.fillText('Orbital Speed', canvas.width - padding - 95, padding + 15);
    }
    
    exportData() {
        let csv = 'Time (days),Distance (AU),Speed (km/s),True Anomaly (deg)\n';
        
        for (let i = 0; i < this.timeData.length; i++) {
            const angle = (this.timeData[i] / this.calculateOrbitalPeriod()) * 360;
            csv += `${this.timeData[i].toFixed(3)},${this.distanceData[i].toFixed(4)},${this.speedData[i].toFixed(3)},${angle.toFixed(2)}\n`;
        }
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `keplers_laws_${this.currentLaw}_data_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    animate() {
        if (!this.running) return;
        
        const currentTime = performance.now();
        const dt = Math.min((currentTime - this.lastTime) / 1000, 0.05) * this.animationSpeed;
        this.lastTime = currentTime;
        
        this.physics(dt);
        this.updateDisplays();
        this.draw();
        this.drawPlot();
        
        requestAnimationFrame(() => this.animate());
    }
}

new KeplersLaws();
