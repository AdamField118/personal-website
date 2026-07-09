const container = document.getElementById('simulation-container');

container.innerHTML = `
    <div class="physics-sim-container">
        <div class="sim-header">
            <h2>Conservation of Energy</h2>
            <p>Energy cannot be created or destroyed, only transformed. Watch potential energy convert to kinetic energy!</p>
        </div>
        
        <div class="sim-layout">
            <div class="controls-panel">
                <h3>Controls</h3>
                
                <div class="control-group">
                    <label>Ball Mass (kg)</label>
                    <input type="range" id="mass" min="1" max="10" value="2" step="0.5">
                    <span id="massValue">2.0</span>
                </div>
                
                <div class="control-group">
                    <label>Initial Height (m)</label>
                    <input type="range" id="height" min="1" max="20" value="15" step="0.5">
                    <span id="heightValue">15.0</span>
                </div>
                
                <div class="control-group">
                    <label>Include Air Resistance</label>
                    <input type="checkbox" id="airResistance">
                </div>
                
                <div class="control-group">
                    <label>Drag Coefficient</label>
                    <input type="range" id="drag" min="0" max="0.5" value="0.1" step="0.01">
                    <span id="dragValue">0.10</span>
                </div>
                
                <div class="button-group">
                    <button id="drop">Drop Ball</button>
                    <button id="reset">Reset</button>
                </div>
                
                <div class="info-panel">
                    <h4>Energy Values</h4>
                    <div class="info-row">
                        <span>Potential Energy:</span>
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
                    <div class="info-row">
                        <span>Height:</span>
                        <span id="currentHeight">0.0 m</span>
                    </div>
                    <div class="info-row">
                        <span>Velocity:</span>
                        <span id="velocityDisplay">0.0 m/s</span>
                    </div>
                </div>
                
                <div class="equation-panel">
                    <h4>Energy Equations</h4>
                    <div class="principle">
                        PE = mgh
                    </div>
                    <div class="principle">
                        KE = ½mv²
                    </div>
                    <div class="principle" style="font-size: 16px;">
                        E<sub>total</sub> = PE + KE = constant
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
    
    .control-group input[type="checkbox"] {
        width: 20px;
        height: 20px;
        cursor: pointer;
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

class EnergyConservation {
    constructor() {
        this.mainCanvas = document.getElementById('mainCanvas');
        this.plotCanvas = document.getElementById('plotCanvas');
        this.mainCtx = this.mainCanvas.getContext('2d');
        this.plotCtx = this.plotCanvas.getContext('2d');
        
        // Parameters
        this.mass = 2;
        this.initialHeight = 15;
        this.g = 9.81;
        this.airResistance = false;
        this.dragCoeff = 0.1;
        
        // Ball state
        this.height = this.initialHeight;
        this.velocity = 0;
        this.falling = false;
        
        // Energy values
        this.pe = 0;
        this.ke = 0;
        this.totalEnergy = 0;
        this.initialTotalEnergy = 0;
        
        // Time tracking
        this.time = 0;
        this.lastTime = 0;
        
        // Data for plotting
        this.timeData = [];
        this.peData = [];
        this.keData = [];
        this.totalEnergyData = [];
        this.maxDataPoints = 200;
        
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
            this.calculateEnergy();
            this.updateDisplays();
        });
        
        document.getElementById('height').addEventListener('input', (e) => {
            this.initialHeight = parseFloat(e.target.value);
            if (!this.falling) {
                this.height = this.initialHeight;
                this.calculateEnergy();
                this.updateDisplays();
            }
        });
        
        document.getElementById('airResistance').addEventListener('change', (e) => {
            this.airResistance = e.target.checked;
        });
        
        document.getElementById('drag').addEventListener('input', (e) => {
            this.dragCoeff = parseFloat(e.target.value);
            document.getElementById('dragValue').textContent = this.dragCoeff.toFixed(2);
        });
        
        document.getElementById('drop').addEventListener('click', () => {
            if (!this.falling) {
                this.falling = true;
                this.initialTotalEnergy = this.totalEnergy;
                this.lastTime = performance.now();
                this.animate();
            }
        });
        
        document.getElementById('reset').addEventListener('click', () => {
            this.reset();
        });
        
        window.addEventListener('resize', () => this.setupCanvas());
    }
    
    calculateEnergy() {
        this.pe = this.mass * this.g * this.height;
        this.ke = 0.5 * this.mass * this.velocity * this.velocity;
        this.totalEnergy = this.pe + this.ke;
    }
    
    updateDisplays() {
        document.getElementById('massValue').textContent = this.mass.toFixed(1);
        document.getElementById('heightValue').textContent = this.initialHeight.toFixed(1);
        document.getElementById('peDisplay').textContent = this.pe.toFixed(2) + ' J';
        document.getElementById('keDisplay').textContent = this.ke.toFixed(2) + ' J';
        document.getElementById('totalDisplay').textContent = this.totalEnergy.toFixed(2) + ' J';
        document.getElementById('currentHeight').textContent = this.height.toFixed(2) + ' m';
        document.getElementById('velocityDisplay').textContent = this.velocity.toFixed(2) + ' m/s';
    }
    
    reset() {
        this.falling = false;
        this.height = this.initialHeight;
        this.velocity = 0;
        this.time = 0;
        this.timeData = [];
        this.peData = [];
        this.keData = [];
        this.totalEnergyData = [];
        this.calculateEnergy();
        this.updateDisplays();
        this.draw();
        this.drawPlot();
    }
    
    physics(dt) {
        if (this.height <= 0) {
            // Bounce with energy loss
            this.height = 0;
            this.velocity = -this.velocity * 0.8; // 80% restitution
            
            if (Math.abs(this.velocity) < 0.5) {
                this.falling = false;
                this.velocity = 0;
            }
        } else {
            // Calculate acceleration
            let acceleration = -this.g;
            
            // Add air resistance if enabled
            if (this.airResistance && this.velocity !== 0) {
                const dragForce = -this.dragCoeff * this.velocity * Math.abs(this.velocity);
                acceleration += dragForce / this.mass;
            }
            
            // Update velocity and position
            this.velocity += acceleration * dt;
            this.height += this.velocity * dt;
        }
        
        this.time += dt;
        
        // Calculate energies
        this.calculateEnergy();
        
        // Store data
        this.timeData.push(this.time);
        this.peData.push(this.pe);
        this.keData.push(this.ke);
        this.totalEnergyData.push(this.totalEnergy);
        
        if (this.timeData.length > this.maxDataPoints) {
            this.timeData.shift();
            this.peData.shift();
            this.keData.shift();
            this.totalEnergyData.shift();
        }
    }
    
    draw() {
        const ctx = this.mainCtx;
        const canvas = this.mainCanvas;
        
        ctx.fillStyle = getComputedStyle(canvas).backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const margin = 50;
        const availableHeight = canvas.height - 2 * margin;
        const maxHeight = 20; // meters
        const scale = availableHeight / maxHeight;
        
        // Draw height scale
        ctx.strokeStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#444' : '#ddd';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        
        for (let h = 0; h <= maxHeight; h += 5) {
            const y = canvas.height - margin - h * scale;
            ctx.beginPath();
            ctx.moveTo(margin, y);
            ctx.lineTo(canvas.width - margin, y);
            ctx.stroke();
            
            ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#666' : '#999';
            ctx.font = '12px Arial';
            ctx.textAlign = 'right';
            ctx.fillText(h + ' m', margin - 10, y + 4);
        }
        ctx.setLineDash([]);
        
        // Draw ground
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(0, canvas.height - margin, canvas.width, margin);
        
        ctx.strokeStyle = '#654321';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(0, canvas.height - margin);
        ctx.lineTo(canvas.width, canvas.height - margin);
        ctx.stroke();
        
        // Draw ball
        const ballRadius = Math.sqrt(this.mass) * 8 + 10;
        const ballX = canvas.width / 2;
        const ballY = canvas.height - margin - this.height * scale;
        
        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.beginPath();
        ctx.ellipse(ballX, canvas.height - margin - 5, ballRadius, ballRadius * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Ball
        const gradient = ctx.createRadialGradient(
            ballX - ballRadius/3, ballY - ballRadius/3, ballRadius/10,
            ballX, ballY, ballRadius
        );
        gradient.addColorStop(0, '#ff6600');
        gradient.addColorStop(1, '#cc3300');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#aa2200';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        // Mass label
        ctx.fillStyle = 'white';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.mass.toFixed(1) + ' kg', ballX, ballY + 5);
        
        // Draw velocity arrow if moving
        if (Math.abs(this.velocity) > 0.5) {
            const arrowLength = Math.min(Math.abs(this.velocity) * 5, 80);
            const arrowX = ballX + ballRadius + 20;
            
            ctx.strokeStyle = '#0000cc';
            ctx.fillStyle = '#0000cc';
            ctx.lineWidth = 3;
            
            ctx.beginPath();
            ctx.moveTo(arrowX, ballY);
            ctx.lineTo(arrowX, ballY - arrowLength * Math.sign(this.velocity));
            ctx.stroke();
            
            const headY = ballY - arrowLength * Math.sign(this.velocity);
            ctx.beginPath();
            ctx.moveTo(arrowX, headY);
            ctx.lineTo(arrowX - 5, headY + 10 * Math.sign(this.velocity));
            ctx.lineTo(arrowX + 5, headY + 10 * Math.sign(this.velocity));
            ctx.closePath();
            ctx.fill();
            
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText('v = ' + this.velocity.toFixed(1) + ' m/s', arrowX + 10, ballY);
        }
        
        // Energy bars
        const barWidth = 60;
        const barMaxHeight = 150;
        const barX = canvas.width - margin - barWidth * 3 - 40;
        const barY = margin + 50;
        
        const maxEnergy = this.initialTotalEnergy || this.totalEnergy || 100;
        
        // PE bar
        ctx.fillStyle = '#0088ff';
        const peHeight = (this.pe / maxEnergy) * barMaxHeight;
        ctx.fillRect(barX, barY + barMaxHeight - peHeight, barWidth, peHeight);
        ctx.strokeStyle = '#0066cc';
        ctx.lineWidth = 2;
        ctx.strokeRect(barX, barY, barWidth, barMaxHeight);
        
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e4e4e4' : '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('PE', barX + barWidth/2, barY - 5);
        ctx.fillText(this.pe.toFixed(0) + ' J', barX + barWidth/2, barY + barMaxHeight + 15);
        
        // KE bar
        ctx.fillStyle = '#ff0000';
        const keHeight = (this.ke / maxEnergy) * barMaxHeight;
        ctx.fillRect(barX + barWidth + 20, barY + barMaxHeight - keHeight, barWidth, keHeight);
        ctx.strokeStyle = '#cc0000';
        ctx.strokeRect(barX + barWidth + 20, barY, barWidth, barMaxHeight);
        
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e4e4e4' : '#333';
        ctx.fillText('KE', barX + barWidth + 20 + barWidth/2, barY - 5);
        ctx.fillText(this.ke.toFixed(0) + ' J', barX + barWidth + 20 + barWidth/2, barY + barMaxHeight + 15);
        
        // Total bar
        ctx.fillStyle = '#00aa00';
        const totalHeight = (this.totalEnergy / maxEnergy) * barMaxHeight;
        ctx.fillRect(barX + barWidth * 2 + 40, barY + barMaxHeight - totalHeight, barWidth, totalHeight);
        ctx.strokeStyle = '#008800';
        ctx.strokeRect(barX + barWidth * 2 + 40, barY, barWidth, barMaxHeight);
        
        ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e4e4e4' : '#333';
        ctx.fillText('Total', barX + barWidth * 2 + 40 + barWidth/2, barY - 5);
        ctx.fillText(this.totalEnergy.toFixed(0) + ' J', barX + barWidth * 2 + 40 + barWidth/2, barY + barMaxHeight + 15);
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
            ctx.fillText('Energy vs Time Graph', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        const padding = 50;
        const plotWidth = canvas.width - 2 * padding;
        const plotHeight = canvas.height - 2 * padding;
        
        const maxTime = Math.max(...this.timeData);
        const maxEnergy = Math.max(...this.totalEnergyData, ...this.peData, ...this.keData, 10);
        
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
        
        ctx.save();
        ctx.translate(15, canvas.height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Energy (J)', 0, 0);
        ctx.restore();
        
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
        
        // Draw energy curves
        const drawCurve = (data, color) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            for (let i = 0; i < this.timeData.length; i++) {
                const x = padding + (this.timeData[i] / maxTime) * plotWidth;
                const y = canvas.height - padding - (data[i] / maxEnergy) * plotHeight * 0.9;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.stroke();
        };
        
        drawCurve(this.peData, '#0088ff');
        drawCurve(this.keData, '#ff0000');
        drawCurve(this.totalEnergyData, '#00aa00');
        
        // Legend
        const legendX = canvas.width - padding - 100;
        const legendY = padding + 20;
        
        const drawLegendItem = (y, color, label) => {
            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(legendX, y);
            ctx.lineTo(legendX + 30, y);
            ctx.stroke();
            
            ctx.fillStyle = window.matchMedia('(prefers-color-scheme: dark)').matches ? '#e4e4e4' : '#333';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(label, legendX + 35, y + 4);
        };
        
        drawLegendItem(legendY, '#0088ff', 'PE');
        drawLegendItem(legendY + 20, '#ff0000', 'KE');
        drawLegendItem(legendY + 40, '#00aa00', 'Total');
    }
    
    animate() {
        if (!this.falling) return;
        
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

new EnergyConservation();
