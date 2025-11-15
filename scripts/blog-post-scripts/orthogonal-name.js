// Orthogonal Polynomial Name Approximator
// Demonstrates completeness of Legendre polynomials by approximating text

(function() {
    const container = window.currentCodeContainer;
    if (!container) {
        console.error('Code container not found!');
        return;
    }
    
    // Create the HTML structure
    container.innerHTML = `
        <h3>Your Name in Orthogonal Polynomials</h3>
        <p>Enter your name below to see it approximated by a complete set of Legendre polynomials!</p>
        
        <div class="controls">
            <label>
                Your Name: <input type="text" id="name-input" value="ADAM" placeholder="Enter your name" maxlength="12" />
            </label>
            <button id="compute-btn">Compute Basis</button>
        </div>
        
        <div class="controls">
            <label style="display: flex; align-items: center; gap: 10px;">
                Polynomial Degree (N): <span id="n-value" style="font-weight: bold; min-width: 30px;">10</span>
                <input type="range" id="n-slider" min="10" max="30" value="10" style="flex: 1; min-width: 200px;" />
            </label>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
            <div>
                <h4 style="margin-top: 0;">Original</h4>
                <canvas id="original-canvas" width="256" height="256" style="border: 1px solid #ccc; width: 100%; max-width: 256px; image-rendering: pixelated;"></canvas>
            </div>
            <div>
                <h4 style="margin-top: 0;">Reconstruction (N = <span id="recon-n">10</span>)</h4>
                <canvas id="recon-canvas" width="256" height="256" style="border: 1px solid #ccc; width: 100%; max-width: 256px; image-rendering: pixelated;"></canvas>
            </div>
        </div>
        
        <div style="margin-top: 20px;">
            <h4>Your Complete Set of Orthogonal Polynomials</h4>
            <p style="font-size: 0.9rem; color: #666;">
                These coefficients a<sub>mn</sub> represent how much of each basis function P<sub>m</sub>(x)P<sub>n</sub>(y) 
                is needed to reconstruct your name. Showing top 20 by magnitude:
            </p>
            <div id="coefficients-display" class="output" style="max-height: 300px; overflow-y: auto; font-family: monospace; font-size: 0.85rem; white-space: pre-wrap;">
                Click "Compute Basis" to see your coefficients...
            </div>
        </div>
        
        <div id="progress-display" style="margin-top: 15px; font-style: italic; color: #666;"></div>
    `;
    
    // Get DOM elements
    const nameInput = container.querySelector('#name-input');
    const computeBtn = container.querySelector('#compute-btn');
    const nSlider = container.querySelector('#n-slider');
    const nValue = container.querySelector('#n-value');
    const reconN = container.querySelector('#recon-n');
    const originalCanvas = container.querySelector('#original-canvas');
    const reconCanvas = container.querySelector('#recon-canvas');
    const coeffDisplay = container.querySelector('#coefficients-display');
    const progressDisplay = container.querySelector('#progress-display');
    
    const originalCtx = originalCanvas.getContext('2d');
    const reconCtx = reconCanvas.getContext('2d');
    
    // State variables
    let imageData = null;  // 2D array of the original image
    let coefficients = null;  // 2D array of expansion coefficients
    let maxN = 30;  // Maximum degree computed
    
    // ============================================================================
    // LEGENDRE POLYNOMIAL EVALUATION
    // ============================================================================
    
    /**
     * Evaluate Legendre polynomial P_n(x) using three-term recurrence
     * Following Boas Eq. 12.15: (n+1)P_{n+1} = (2n+1)xP_n - nP_{n-1}
     */
    function legendreP(n, x) {
        if (n === 0) return 1.0;
        if (n === 1) return x;
        
        let P0 = 1.0;
        let P1 = x;
        let Pn = 0.0;
        
        for (let k = 1; k < n; k++) {
            Pn = ((2*k + 1) * x * P1 - k * P0) / (k + 1);
            P0 = P1;
            P1 = Pn;
        }
        
        return Pn;
    }
    
    /**
     * Precompute Legendre polynomials on a grid
     * Returns array of shape [gridSize, maxN+1]
     */
    function precomputeLegendreGrid(gridSize, maxDegree) {
        const grid = [];
        
        for (let i = 0; i < gridSize; i++) {
            const x = -1 + 2 * i / (gridSize - 1);  // Map to [-1, 1]
            const values = [];
            
            for (let n = 0; n <= maxDegree; n++) {
                values.push(legendreP(n, x));
            }
            
            grid.push(values);
        }
        
        return grid;
    }
    
    // ============================================================================
    // TEXT RENDERING
    // ============================================================================
    
    /**
     * Render text to canvas and return as 2D array
     */
    function renderTextToArray(text, size = 256) {
        // Clear and set up canvas
        originalCtx.fillStyle = 'white';
        originalCtx.fillRect(0, 0, size, size);
        
        // Draw text
        originalCtx.fillStyle = 'black';
        originalCtx.font = 'bold 80px Arial';
        originalCtx.textAlign = 'center';
        originalCtx.textBaseline = 'middle';
        originalCtx.fillText(text, size / 2, size / 2);
        
        // Get image data
        const imgData = originalCtx.getImageData(0, 0, size, size);
        const pixels = imgData.data;
        
        // Convert to 2D array (0 = white, 1 = black)
        const array = [];
        for (let y = 0; y < size; y++) {
            const row = [];
            for (let x = 0; x < size; x++) {
                const idx = (y * size + x) * 4;
                const brightness = (pixels[idx] + pixels[idx + 1] + pixels[idx + 2]) / 3;
                row.push(1 - brightness / 255);  // Invert: black = 1, white = 0
            }
            array.push(row);
        }
        
        return array;
    }
    
    // ============================================================================
    // COEFFICIENT COMPUTATION
    // ============================================================================
    
    /**
     * Compute 2D Legendre expansion coefficients
     * a_mn = (2m+1)(2n+1)/4 * ∫∫ f(x,y) P_m(x) P_n(y) dx dy
     * Using discrete approximation with uniform grid
     */
    function computeCoefficients(imageArray, maxDegree) {
        const size = imageArray.length;
        
        progressDisplay.textContent = 'Precomputing Legendre polynomials...';
        
        // Precompute Legendre values on grid
        const legendreGrid = precomputeLegendreGrid(size, maxDegree);
        
        // Initialize coefficient array
        const coeffs = [];
        for (let m = 0; m <= maxDegree; m++) {
            coeffs.push(new Array(maxDegree + 1).fill(0));
        }
        
        // Discrete integration: sum over grid points
        const dx = 2.0 / (size - 1);  // Grid spacing in [-1, 1]
        const dy = 2.0 / (size - 1);
        
        progressDisplay.textContent = 'Computing coefficients...';
        
        for (let m = 0; m <= maxDegree; m++) {
            for (let n = 0; n <= maxDegree; n++) {
                let sum = 0;
                
                // Double integral over grid
                for (let i = 0; i < size; i++) {
                    for (let j = 0; j < size; j++) {
                        sum += imageArray[i][j] * legendreGrid[j][m] * legendreGrid[i][n];
                    }
                }
                
                // Apply normalization: (2m+1)(2n+1)/4 * dx * dy
                const norm = (2*m + 1) * (2*n + 1) / 4.0;
                coeffs[m][n] = sum * dx * dy * norm;
            }
            
            // Update progress
            if (m % 5 === 0) {
                progressDisplay.textContent = `Computing coefficients... ${Math.round(100 * m / maxDegree)}%`;
            }
        }
        
        progressDisplay.textContent = 'Coefficients computed!';
        
        return coeffs;
    }
    
    // ============================================================================
    // RECONSTRUCTION
    // ============================================================================
    
    /**
     * Reconstruct image using partial sum up to degree N
     * f_N(x,y) = Σ_{m=0}^N Σ_{n=0}^N a_mn P_m(x) P_n(y)
     */
    function reconstruct(coeffs, N, size = 256) {
        progressDisplay.textContent = `Reconstructing with N=${N}...`;
        
        // Precompute Legendre values
        const legendreGrid = precomputeLegendreGrid(size, N);
        
        // Initialize reconstruction array
        const recon = [];
        for (let i = 0; i < size; i++) {
            recon.push(new Array(size).fill(0));
        }
        
        // Sum over basis functions
        for (let m = 0; m <= N; m++) {
            for (let n = 0; n <= N; n++) {
                const coeff = coeffs[m][n];
                
                // Add contribution: a_mn * P_m(x) * P_n(y)
                for (let i = 0; i < size; i++) {
                    for (let j = 0; j < size; j++) {
                        recon[i][j] += coeff * legendreGrid[j][m] * legendreGrid[i][n];
                    }
                }
            }
        }
        
        progressDisplay.textContent = '';
        
        return recon;
    }
    
    // ============================================================================
    // RENDERING
    // ============================================================================
    
    /**
     * Render 2D array to canvas
     */
    function renderArrayToCanvas(array, canvas, ctx) {
        const size = array.length;
        const imgData = ctx.createImageData(size, size);
        const pixels = imgData.data;
        
        // Find min/max for normalization
        let min = Infinity;
        let max = -Infinity;
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                if (array[i][j] < min) min = array[i][j];
                if (array[i][j] > max) max = array[i][j];
            }
        }
        
        // Normalize and convert to pixels
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                const idx = (i * size + j) * 4;
                
                // Normalize to [0, 1] then invert (black = high value)
                let value = (array[i][j] - min) / (max - min);
                value = 1 - value;  // Invert for display
                
                const gray = Math.floor(value * 255);
                pixels[idx] = gray;
                pixels[idx + 1] = gray;
                pixels[idx + 2] = gray;
                pixels[idx + 3] = 255;
            }
        }
        
        ctx.putImageData(imgData, 0, 0);
    }
    
    // ============================================================================
    // COEFFICIENT DISPLAY
    // ============================================================================
    
    /**
     * Display top coefficients by magnitude
     */
    function displayCoefficients(coeffs, N, topK = 20) {
        // Collect all coefficients with their indices
        const coeffList = [];
        for (let m = 0; m <= N; m++) {
            for (let n = 0; n <= N; n++) {
                coeffList.push({
                    m: m,
                    n: n,
                    value: coeffs[m][n]
                });
            }
        }
        
        // Sort by magnitude
        coeffList.sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
        
        // Display top K
        let html = `Total coefficients: ${(N+1) * (N+1)}\n`;
        html += `Showing top ${Math.min(topK, coeffList.length)} by magnitude:\n\n`;
        html += `  m   n      Coefficient a_mn\n`;
        html += `────────────────────────────────\n`;
        
        for (let i = 0; i < Math.min(topK, coeffList.length); i++) {
            const c = coeffList[i];
            const sign = c.value >= 0 ? '+' : '';
            html += `  ${String(c.m).padStart(2)}  ${String(c.n).padStart(2)}    ${sign}${c.value.toFixed(6)}\n`;
        }
        
        html += `\n... (${coeffList.length - topK} more coefficients)\n`;
        html += `\nSum of squares: ${coeffList.reduce((sum, c) => sum + c.value * c.value, 0).toFixed(4)}`;
        
        coeffDisplay.textContent = html;
    }
    
    // ============================================================================
    // EVENT HANDLERS
    // ============================================================================
    
    /**
     * Compute full basis expansion
     */
    function computeBasis() {
        const name = nameInput.value.trim().toUpperCase();
        if (!name) {
            alert('Please enter a name!');
            return;
        }
        
        computeBtn.disabled = true;
        computeBtn.textContent = 'Computing...';
        
        // Render text to array
        imageData = renderTextToArray(name);
        
        // Compute coefficients (this may take a moment)
        setTimeout(() => {
            coefficients = computeCoefficients(imageData, maxN);
            
            // Display coefficients
            const currentN = parseInt(nSlider.value);
            displayCoefficients(coefficients, currentN);
            
            // Reconstruct and display
            updateReconstruction();
            
            computeBtn.disabled = false;
            computeBtn.textContent = 'Compute Basis';
        }, 50);
    }
    
    /**
     * Update reconstruction with current N value
     */
    function updateReconstruction() {
        if (!coefficients) return;
        
        const N = parseInt(nSlider.value);
        nValue.textContent = N;
        reconN.textContent = N;
        
        // Reconstruct
        const reconArray = reconstruct(coefficients, N);
        
        // Render
        renderArrayToCanvas(reconArray, reconCanvas, reconCtx);
        
        // Update coefficient display
        displayCoefficients(coefficients, N);
    }
    
    // ============================================================================
    // INITIALIZATION
    // ============================================================================
    
    // Event listeners
    computeBtn.addEventListener('click', computeBasis);
    
    nSlider.addEventListener('input', () => {
        nValue.textContent = nSlider.value;
        reconN.textContent = nSlider.value;
    });
    
    nSlider.addEventListener('change', updateReconstruction);
    
    nameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            computeBasis();
        }
    });
    
    // Initial computation
    computeBasis();
    
    console.log('Orthogonal polynomial approximator loaded successfully!');
})();