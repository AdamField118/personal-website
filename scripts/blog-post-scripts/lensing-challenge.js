// Lensing Challenge Game
// Interactive challenge to design a lens and recover its mass

(function() {
    const container = window.currentCodeContainer;
    if (!container) {
        console.error('Code container not found!');
        return;
    }
    
    container.innerHTML = `
        <h3>Lensing Challenge: Design and Recover</h3>
        <p>Design a galaxy cluster, measure the shear from background galaxies, and try to recover the mass!</p>
        
        <div class="controls">
            <div style="display: flex; gap: 10px; justify-content: center; margin-bottom: 15px; flex-wrap: wrap;">
                <button id="measure-btn" style="width: 160px;">📏 Measure Shear</button>
                <button id="reconstruct-btn" style="width: 160px;">🔍 Reconstruct</button>
                <button id="check-btn" style="width: 160px;">✓ Check Answer</button>
                <button id="reset-btn" style="width: 160px;">🔄 New Challenge</button>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                <label style="display: flex; flex-direction: column;">
                    Number of Galaxies: <span id="ngal-val" style="font-weight: bold;">100</span>
                    <input type="range" id="ngal-slider" min="50" max="500" step="50" value="100" style="width: 100%;" />
                </label>
                <label style="display: flex; flex-direction: column;">
                    Measurement Noise: <span id="noise-val" style="font-weight: bold;">0.3</span>
                    <input type="range" id="noise-slider" min="0.1" max="0.5" step="0.05" value="0.3" style="width: 100%;" />
                </label>
            </div>
        </div>
        
        <canvas id="challenge-canvas" width="600" height="600" style="border: 1px solid #ddd; width: 100%; max-width: 600px; display: block; margin: 20px auto; background: white;"></canvas>
        
        <div id="results-display" style="margin-top: 15px; padding: 15px; background: #e6f2ff; color: #000; border-radius: 5px; display: none;">
            <strong>Results:</strong><br>
            <div id="results-text"></div>
        </div>
        
        <div style="margin-top: 15px; padding: 10px; background: #f0f0f0; color: #000; border-radius: 5px;">
            <strong>Your Mission:</strong><br>
            1. Click "Measure Shear" to simulate observing background galaxies<br>
            2. More galaxies = better statistics (but takes longer!)<br>
            3. Click "Reconstruct" to invert the shear and find the mass<br>
            4. Click "Check Answer" to see how close you got!<br>
            <strong>Pro tip:</strong> More galaxies help beat down the intrinsic shape noise!
        </div>
    `;
    
    const canvas = container.querySelector('#challenge-canvas');
    const ctx = canvas.getContext('2d');
    const measureBtn = container.querySelector('#measure-btn');
    const reconstructBtn = container.querySelector('#reconstruct-btn');
    const checkBtn = container.querySelector('#check-btn');
    const resetBtn = container.querySelector('#reset-btn');
    const ngalSlider = container.querySelector('#ngal-slider');
    const noiseSlider = container.querySelector('#noise-slider');
    const ngalVal = container.querySelector('#ngal-val');
    const noiseVal = container.querySelector('#noise-val');
    const resultsDisplay = container.querySelector('#results-display');
    const resultsText = container.querySelector('#results-text');
    
    let trueMasses = [];
    let galaxies = [];
    let reconstructedMass = null;
    let numGalaxies = 100;
    let noise = 0.3;
    let stage = 'setup';  // setup, measured, reconstructed, checked
    
    ngalSlider.addEventListener('input', () => {
        numGalaxies = parseInt(ngalSlider.value);
        ngalVal.textContent = numGalaxies;
    });
    
    noiseSlider.addEventListener('input', () => {
        noise = parseFloat(noiseSlider.value);
        noiseVal.textContent = noise.toFixed(2);
    });
    
    measureBtn.addEventListener('click', () => {
        measureShear();
        stage = 'measured';
        draw();
    });
    
    reconstructBtn.addEventListener('click', () => {
        if (stage === 'measured') {
            reconstructMass();
            stage = 'reconstructed';
            draw();
        }
    });
    
    checkBtn.addEventListener('click', () => {
        if (stage === 'reconstructed') {
            checkAnswer();
            stage = 'checked';
        }
    });
    
    resetBtn.addEventListener('click', () => {
        generateChallenge();
        stage = 'setup';
        resultsDisplay.style.display = 'none';
        draw();
    });
    
    function generateChallenge() {
        // Generate random mass configuration
        trueMasses = [];
        const numMasses = 1 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < numMasses; i++) {
            trueMasses.push({
                x: 0.3 + Math.random() * 0.4,
                y: 0.3 + Math.random() * 0.4,
                m: 0.5 + Math.random() * 1.0
            });
        }
        
        galaxies = [];
        reconstructedMass = null;
    }
    
    function calculateTrueShear(x, y) {
        let gamma1 = 0;
        let gamma2 = 0;
        
        trueMasses.forEach(mass => {
            const dx = x - mass.x;
            const dy = y - mass.y;
            const r2 = dx * dx + dy * dy + 0.0001;
            
            const phi = Math.atan2(dy, dx);
            const gamma_t = mass.m / (r2 * 10);
            
            gamma1 -= gamma_t * Math.cos(2 * phi);
            gamma2 -= gamma_t * Math.sin(2 * phi);
        });
        
        return { gamma1, gamma2 };
    }
    
    function measureShear() {
        galaxies = [];
        
        for (let i = 0; i < numGalaxies; i++) {
            const x = Math.random();
            const y = Math.random();
            
            const trueShear = calculateTrueShear(x, y);
            
            // Add intrinsic ellipticity (shape noise)
            const intrinsic_e1 = (Math.random() - 0.5) * noise * 2;
            const intrinsic_e2 = (Math.random() - 0.5) * noise * 2;
            
            // Observed ellipticity = intrinsic + shear
            const obs_e1 = intrinsic_e1 + trueShear.gamma1;
            const obs_e2 = intrinsic_e2 + trueShear.gamma2;
            
            galaxies.push({
                x, y,
                obs_e1, obs_e2,
                intrinsic_e1, intrinsic_e2,
                true_g1: trueShear.gamma1,
                true_g2: trueShear.gamma2
            });
        }
    }
    
    function reconstructMass() {
        const gridSize = 30;
        reconstructedMass = [];
        
        for (let i = 0; i < gridSize; i++) {
            reconstructedMass[i] = [];
            for (let j = 0; j < gridSize; j++) {
                const x = i / gridSize;
                const y = j / gridSize;
                
                // Average shear in local region
                let sum_e1 = 0;
                let sum_e2 = 0;
                let count = 0;
                
                galaxies.forEach(gal => {
                    const dx = gal.x - x;
                    const dy = gal.y - y;
                    const dist2 = dx * dx + dy * dy;
                    
                    if (dist2 < 0.04) {  // Within radius ~0.2
                        sum_e1 += gal.obs_e1;
                        sum_e2 += gal.obs_e2;
                        count++;
                    }
                });
                
                if (count > 0) {
                    const avg_g1 = sum_e1 / count;
                    const avg_g2 = sum_e2 / count;
                    const gamma = Math.sqrt(avg_g1 ** 2 + avg_g2 ** 2);
                    reconstructedMass[i][j] = gamma * 5;  // Scale for visualization
                } else {
                    reconstructedMass[i][j] = 0;
                }
            }
        }
    }
    
    function checkAnswer() {
        if (!reconstructedMass) return;
        
        // Calculate error metrics
        let totalError = 0;
        let count = 0;
        
        const gridSize = reconstructedMass.length;
        
        for (let i = 0; i < gridSize; i++) {
            for (let j = 0; j < gridSize; j++) {
                const x = i / gridSize;
                const y = j / gridSize;
                
                // True convergence
                let trueKappa = 0;
                trueMasses.forEach(mass => {
                    const dx = x - mass.x;
                    const dy = y - mass.y;
                    const r2 = dx * dx + dy * dy + 0.0001;
                    trueKappa += mass.m / (r2 * 10);
                });
                
                const error = Math.abs(reconstructedMass[i][j] - trueKappa);
                totalError += error;
                count++;
            }
        }
        
        const avgError = totalError / count;
        const quality = avgError < 0.1 ? 'Excellent' : avgError < 0.2 ? 'Good' : avgError < 0.3 ? 'Fair' : 'Poor';
        
        resultsText.innerHTML = `
            <strong>Reconstruction Quality:</strong> ${quality}<br>
            <strong>Average Error:</strong> ${avgError.toFixed(4)}<br>
            <strong>Number of Galaxies Used:</strong> ${galaxies.length}<br>
            <strong>Shape Noise Level:</strong> ${noise.toFixed(2)}<br>
            <br>
            <em>${quality === 'Excellent' ? '🎉 Great job! You successfully recovered the mass distribution!' :
                quality === 'Good' ? '👍 Not bad! Try more galaxies for better precision.' :
                '💡 Tip: More galaxies help average out the intrinsic shape noise!'}</em>
        `;
        
        resultsDisplay.style.display = 'block';
    }
    
    function draw() {
        const width = canvas.width;
        const height = canvas.height;
        
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        
        if (stage === 'setup') {
            // Draw true masses (hidden from user)
            ctx.fillStyle = '#eee';
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Click "Measure Shear" to observe galaxies!', width / 2, height / 2);
        }
        else if (stage === 'measured') {
            // Draw galaxies with observed ellipticities
            galaxies.forEach(gal => {
                const px = gal.x * width;
                const py = gal.y * height;
                
                const e = Math.sqrt(gal.obs_e1 ** 2 + gal.obs_e2 ** 2);
                const phi = 0.5 * Math.atan2(gal.obs_e2, gal.obs_e1);
                
                const size = 8;
                const a = size;
                const b = size * (1 - Math.min(e * 2, 0.8)) / (1 + Math.min(e * 2, 0.8));
                
                ctx.save();
                ctx.translate(px, py);
                ctx.rotate(phi);
                
                ctx.fillStyle = 'rgba(100, 100, 255, 0.5)';
                ctx.beginPath();
                ctx.ellipse(0, 0, a, b, 0, 0, 2 * Math.PI);
                ctx.fill();
                
                ctx.strokeStyle = '#0066cc';
                ctx.lineWidth = 1;
                ctx.stroke();
                
                ctx.restore();
            });
            
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${galaxies.length} galaxies measured`, width / 2, 30);
            ctx.fillText('Click "Reconstruct" to invert the shear', width / 2, height - 20);
        }
        else if (stage === 'reconstructed' || stage === 'checked') {
            // Draw reconstruction
            const gridSize = reconstructedMass.length;
            const cellWidth = width / gridSize;
            const cellHeight = height / gridSize;
            
            let maxMass = 0;
            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    maxMass = Math.max(maxMass, reconstructedMass[i][j]);
                }
            }
            
            for (let i = 0; i < gridSize; i++) {
                for (let j = 0; j < gridSize; j++) {
                    const value = reconstructedMass[i][j] / (maxMass + 0.01);
                    const intensity = Math.floor(255 * (1 - value));
                    
                    ctx.fillStyle = `rgb(255, ${intensity}, ${intensity})`;
                    ctx.fillRect(i * cellWidth, j * cellHeight, cellWidth, cellHeight);
                }
            }
            
            // If checked, overlay true positions
            if (stage === 'checked') {
                trueMasses.forEach(mass => {
                    const px = mass.x * width;
                    const py = mass.y * height;
                    
                    ctx.strokeStyle = '#00ff00';
                    ctx.lineWidth = 3;
                    ctx.beginPath();
                    ctx.arc(px, py, 20, 0, 2 * Math.PI);
                    ctx.stroke();
                    
                    ctx.fillStyle = '#00ff00';
                    ctx.font = 'bold 14px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('TRUE', px, py - 25);
                });
            }
        }
    }
    
    generateChallenge();
    draw();
    console.log('Lensing challenge loaded!');
})();