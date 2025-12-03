// Mass Reconstruction Demo
// Interactive demonstration of reconstructing mass from shear measurements

(function() {
    const container = window.currentCodeContainer;
    if (!container) {
        console.error('Code container not found!');
        return;
    }
    
    container.innerHTML = `
        <h3>Mass Reconstruction from Shear Measurements</h3>
        <p>Click to place masses, then click "Reconstruct" to see how we recover the mass distribution from shear</p>
        
        <div class="controls">
            <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 15px; flex-wrap: wrap;">
                <button id="reconstruct-btn" style="width: 140px;">🔍 Reconstruct</button>
                <button id="clear-btn" style="width: 140px;">🗑️ Clear</button>
                <button id="add-noise-btn" style="width: 140px;">📊 Add Noise</button>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <label style="display: flex; flex-direction: column;">
                    Noise Level: <span id="noise-val" style="font-weight: bold;">0.0</span>
                    <input type="range" id="noise-slider" min="0" max="0.3" step="0.02" value="0" style="width: 100%;" />
                </label>
                <label style="display: flex; flex-direction: column;">
                    Smoothing: <span id="smooth-val" style="font-weight: bold;">2</span>
                    <input type="range" id="smooth-slider" min="1" max="5" step="1" value="2" style="width: 100%;" />
                </label>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
            <div>
                <h4 style="margin-top: 0; text-align: center;">True Mass Distribution</h4>
                <canvas id="mass-canvas" width="400" height="400" style="border: 1px solid #ddd; width: 100%; cursor: crosshair; background: white;"></canvas>
            </div>
            <div>
                <h4 style="margin-top: 0; text-align: center;">Reconstructed from Shear</h4>
                <canvas id="recon-canvas" width="400" height="400" style="border: 1px solid #ddd; width: 100%; background: white;"></canvas>
            </div>
        </div>
        
        <div style="margin-top: 15px; padding: 10px; background: #f0f0f0; color: #000; border-radius: 5px;">
            <strong>Instructions:</strong><br>
            • Click on the left canvas to place masses<br>
            • Click "Reconstruct" to invert the shear field<br>
            • Add noise to see how measurement uncertainty affects reconstruction<br>
            • Try smoothing to reduce noise artifacts<br>
            <strong>Note:</strong> Real reconstructions use sophisticated algorithms (Kaiser-Squires, maximum entropy, etc.)
        </div>
    `;
    
    const massCanvas = container.querySelector('#mass-canvas');
    const reconCanvas = container.querySelector('#recon-canvas');
    const massCtx = massCanvas.getContext('2d');
    const reconCtx = reconCanvas.getContext('2d');
    const reconstructBtn = container.querySelector('#reconstruct-btn');
    const clearBtn = container.querySelector('#clear-btn');
    const addNoiseBtn = container.querySelector('#add-noise-btn');
    const noiseSlider = container.querySelector('#noise-slider');
    const smoothSlider = container.querySelector('#smooth-slider');
    const noiseVal = container.querySelector('#noise-val');
    const smoothVal = container.querySelector('#smooth-val');
    
    let masses = [];
    let noiseLevel = 0.0;
    let smoothing = 2;
    
    noiseSlider.addEventListener('input', () => {
        noiseLevel = parseFloat(noiseSlider.value);
        noiseVal.textContent = noiseLevel.toFixed(2);
    });
    
    smoothSlider.addEventListener('input', () => {
        smoothing = parseInt(smoothSlider.value);
        smoothVal.textContent = smoothing;
    });
    
    massCanvas.addEventListener('click', (e) => {
        const rect = massCanvas.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;
        
        masses.push({ x, y, m: 1.0 });
        drawMassDistribution();
    });
    
    reconstructBtn.addEventListener('click', () => {
        reconstruct();
    });
    
    clearBtn.addEventListener('click', () => {
        masses = [];
        drawMassDistribution();
        reconCtx.fillStyle = 'white';
        reconCtx.fillRect(0, 0, reconCanvas.width, reconCanvas.height);
    });
    
    addNoiseBtn.addEventListener('click', () => {
        if (noiseLevel === 0) {
            noiseSlider.value = 0.1;
            noiseLevel = 0.1;
            noiseVal.textContent = '0.10';
        }
        reconstruct();
    });
    
    function drawMassDistribution() {
        const width = massCanvas.width;
        const height = massCanvas.height;
        
        massCtx.fillStyle = 'white';
        massCtx.fillRect(0, 0, width, height);
        
        // Draw grid
        massCtx.strokeStyle = '#eee';
        massCtx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            const pos = (i / 10) * width;
            massCtx.beginPath();
            massCtx.moveTo(pos, 0);
            massCtx.lineTo(pos, height);
            massCtx.moveTo(0, pos);
            massCtx.lineTo(width, pos);
            massCtx.stroke();
        }
        
        // Draw masses
        masses.forEach(mass => {
            const px = mass.x * width;
            const py = mass.y * height;
            const radius = 30;
            
            // Glow
            const grd = massCtx.createRadialGradient(px, py, 0, px, py, radius);
            grd.addColorStop(0, 'rgba(255, 0, 0, 0.6)');
            grd.addColorStop(1, 'rgba(255, 0, 0, 0)');
            massCtx.fillStyle = grd;
            massCtx.beginPath();
            massCtx.arc(px, py, radius, 0, 2 * Math.PI);
            massCtx.fill();
            
            // Core
            massCtx.fillStyle = '#ff0000';
            massCtx.beginPath();
            massCtx.arc(px, py, 8, 0, 2 * Math.PI);
            massCtx.fill();
        });
        
        // Instructions
        if (masses.length === 0) {
            massCtx.fillStyle = '#999';
            massCtx.font = '16px Arial';
            massCtx.textAlign = 'center';
            massCtx.fillText('Click to place masses', width / 2, height / 2);
        }
    }
    
    function calculateShear(x, y) {
        let gamma1 = 0;
        let gamma2 = 0;
        
        masses.forEach(mass => {
            const dx = x - mass.x;
            const dy = y - mass.y;
            const r2 = dx * dx + dy * dy + 0.0001;
            const r = Math.sqrt(r2);
            
            const phi = Math.atan2(dy, dx);
            const gamma_t = mass.m / r2;
            
            gamma1 -= gamma_t * Math.cos(2 * phi);
            gamma2 -= gamma_t * Math.sin(2 * phi);
        });
        
        return { gamma1, gamma2 };
    }
    
    function reconstruct() {
        const width = reconCanvas.width;
        const height = reconCanvas.height;
        const gridSize = 50;
        
        // Calculate shear field with noise
        const shearField = [];
        for (let i = 0; i < gridSize; i++) {
            shearField[i] = [];
            for (let j = 0; j < gridSize; j++) {
                const x = i / gridSize;
                const y = j / gridSize;
                const shear = calculateShear(x, y);
                
                // Add noise
                shear.gamma1 += (Math.random() - 0.5) * noiseLevel;
                shear.gamma2 += (Math.random() - 0.5) * noiseLevel;
                
                shearField[i][j] = shear;
            }
        }
        
        // Reconstruct convergence (mass) from shear
        // Simplified Kaiser-Squires inversion
        const kappa = [];
        for (let i = 0; i < gridSize; i++) {
            kappa[i] = [];
            for (let j = 0; j < gridSize; j++) {
                let sum = 0;
                let weight = 0;
                
                // Integrate over shear field (simplified)
                for (let ii = 0; ii < gridSize; ii++) {
                    for (let jj = 0; jj < gridSize; jj++) {
                        const dx = ii - i;
                        const dy = jj - j;
                        const r2 = dx * dx + dy * dy + 1;
                        const r = Math.sqrt(r2);
                        
                        if (r < gridSize / 4) {
                            const w = 1 / (r + 1);
                            const phi = Math.atan2(dy, dx);
                            
                            const gamma_r = shearField[ii][jj].gamma1 * Math.cos(2 * phi) +
                                          shearField[ii][jj].gamma2 * Math.sin(2 * phi);
                            
                            sum += gamma_r * w;
                            weight += w;
                        }
                    }
                }
                
                kappa[i][j] = weight > 0 ? sum / weight : 0;
            }
        }
        
        // Apply smoothing
        if (smoothing > 1) {
            const smoothedKappa = [];
            for (let i = 0; i < gridSize; i++) {
                smoothedKappa[i] = [];
                for (let j = 0; j < gridSize; j++) {
                    let sum = 0;
                    let count = 0;
                    
                    for (let di = -smoothing; di <= smoothing; di++) {
                        for (let dj = -smoothing; dj <= smoothing; dj++) {
                            const ii = i + di;
                            const jj = j + dj;
                            if (ii >= 0 && ii < gridSize && jj >= 0 && jj < gridSize) {
                                sum += kappa[ii][jj];
                                count++;
                            }
                        }
                    }
                    
                    smoothedKappa[i][j] = sum / count;
                }
            }
            
            // Copy back
            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    kappa[i][j] = smoothedKappa[i][j];
                }
            }
        }
        
        // Find min and max for color scaling
        let minKappa = Infinity;
        let maxKappa = -Infinity;
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                minKappa = Math.min(minKappa, kappa[i][j]);
                maxKappa = Math.max(maxKappa, kappa[i][j]);
            }
        }
        
        // Draw reconstruction
        reconCtx.fillStyle = 'white';
        reconCtx.fillRect(0, 0, width, height);
        
        const cellWidth = width / gridSize;
        const cellHeight = height / gridSize;
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const value = (kappa[i][j] - minKappa) / (maxKappa - minKappa + 0.001);
                const intensity = Math.floor(255 * (1 - value));
                
                reconCtx.fillStyle = `rgb(${intensity}, ${intensity + (255 - intensity) * 0.3}, 255)`;
                reconCtx.fillRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
            }
        }
        
        // Draw contours
        reconCtx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
        reconCtx.lineWidth = 2;
        const contourLevels = [0.3, 0.5, 0.7];
        
        contourLevels.forEach(level => {
            reconCtx.beginPath();
            for (let i = 1; i < gridSize - 1; i++) {
                for (let j = 1; j < gridSize - 1; j++) {
                    const val = (kappa[i][j] - minKappa) / (maxKappa - minKappa + 0.001);
                    if (Math.abs(val - level) < 0.05) {
                        reconCtx.rect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
                    }
                }
            }
            reconCtx.stroke();
        });
    }
    
    drawMassDistribution();
    console.log('Mass reconstruction demo loaded!');
})();