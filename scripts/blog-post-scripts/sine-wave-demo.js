// Sine Wave Plotter Demo
// This script creates an interactive sine wave plotter

(function() {
    // Get the container that this script should populate
    const container = window.currentCodeContainer;
    
    if (!container) {
        console.error('Code container not found!');
        return;
    }
    
    // Create the plotter HTML
    container.innerHTML = `
        <h3>Sine Wave Plotter</h3>
        <p>Visualize y = A·sin(B·x + C) + D</p>
        
        <div class="controls">
            <label>
                Amplitude (A): <input type="number" id="amplitude" value="1" step="0.1" min="0.1" max="5" />
            </label>
            <label>
                Frequency (B): <input type="number" id="frequency" value="1" step="0.1" min="0.1" max="5" />
            </label>
            <label>
                Phase (C): <input type="number" id="phase" value="0" step="0.1" min="-3.14" max="3.14" />
            </label>
            <label>
                Offset (D): <input type="number" id="offset" value="0" step="0.1" min="-3" max="3" />
            </label>
        </div>
        
        <canvas id="sine-canvas" width="600" height="300"></canvas>
        
        <div id="equation-display"></div>
    `;
    
    // Get elements
    const canvas = container.querySelector('#sine-canvas');
    const ctx = canvas.getContext('2d');
    const ampInput = container.querySelector('#amplitude');
    const freqInput = container.querySelector('#frequency');
    const phaseInput = container.querySelector('#phase');
    const offsetInput = container.querySelector('#offset');
    const eqDisplay = container.querySelector('#equation-display');
    
    // Make canvas responsive
    function resizeCanvas() {
        const containerWidth = container.offsetWidth;
        const maxWidth = 600;
        const width = Math.min(containerWidth - 40, maxWidth);
        canvas.width = width;
        canvas.height = Math.floor(width / 2);
        plotSineWave();
    }
    
    // Plot function
    function plotSineWave() {
        const width = canvas.width;
        const height = canvas.height;
        const amp = parseFloat(ampInput.value);
        const freq = parseFloat(freqInput.value);
        const phase = parseFloat(phaseInput.value);
        const offset = parseFloat(offsetInput.value);
        
        // Clear canvas
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        
        // Draw axes
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();
        
        // Draw sine wave
        ctx.strokeStyle = '#00458b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const scale = height / 6; // Scale to fit
        const centerY = height / 2;
        
        for (let x = 0; x < width; x++) {
            // Convert pixel x to mathematical x (roughly -2π to 2π)
            const mathX = ((x - width / 2) / width) * 4 * Math.PI;
            
            // Calculate y using the sine function
            const mathY = amp * Math.sin(freq * mathX + phase) + offset;
            
            // Convert mathematical y to pixel y
            const pixelY = centerY - (mathY * scale);
            
            if (x === 0) {
                ctx.moveTo(x, pixelY);
            } else {
                ctx.lineTo(x, pixelY);
            }
        }
        
        ctx.stroke();
        
        // Update equation display
        eqDisplay.innerHTML = `<div class="output"><strong>Current equation:</strong> y = ${amp}·sin(${freq}·x + ${phase}) + ${offset}</div>`;
    }
    
    // Add event listeners for real-time updates
    [ampInput, freqInput, phaseInput, offsetInput].forEach(input => {
        input.addEventListener('input', plotSineWave);
    });
    
    // Resize on window resize
    window.addEventListener('resize', resizeCanvas);
    
    // Initial plot
    resizeCanvas();
    
    console.log('Sine wave plotter loaded successfully!');
})();