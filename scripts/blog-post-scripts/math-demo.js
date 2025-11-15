// Math Calculator Demo
// This script creates an interactive calculator in the code container

(function() {
    // Get the container that this script should populate
    const container = window.currentCodeContainer;
    
    if (!container) {
        console.error('Code container not found!');
        return;
    }
    
    // Create the calculator HTML
    container.innerHTML = `
        <h3>Quadratic Formula Calculator</h3>
        <p>Calculate the roots of ax² + bx + c = 0</p>
        
        <div class="controls">
            <label>
                a: <input type="number" id="coeff-a" value="1" step="0.1" />
            </label>
            <label>
                b: <input type="number" id="coeff-b" value="-3" step="0.1" />
            </label>
            <label>
                c: <input type="number" id="coeff-c" value="2" step="0.1" />
            </label>
            <button id="calculate-btn">Calculate</button>
        </div>
        
        <div id="result-output"></div>
    `;
    
    // Get elements
    const aInput = container.querySelector('#coeff-a');
    const bInput = container.querySelector('#coeff-b');
    const cInput = container.querySelector('#coeff-c');
    const calcButton = container.querySelector('#calculate-btn');
    const output = container.querySelector('#result-output');
    
    // Calculate function
    function calculateQuadratic() {
        const a = parseFloat(aInput.value);
        const b = parseFloat(bInput.value);
        const c = parseFloat(cInput.value);
        
        if (a === 0) {
            output.innerHTML = '<div class="error">Error: Coefficient "a" cannot be zero!</div>';
            return;
        }
        
        // Calculate discriminant
        const discriminant = b * b - 4 * a * c;
        
        let resultHTML = '<div class="output">';
        resultHTML += `<strong>Equation:</strong> ${a}x² + ${b}x + ${c} = 0<br><br>`;
        resultHTML += `<strong>Discriminant:</strong> ${discriminant.toFixed(4)}<br><br>`;
        
        if (discriminant > 0) {
            // Two real roots
            const x1 = (-b + Math.sqrt(discriminant)) / (2 * a);
            const x2 = (-b - Math.sqrt(discriminant)) / (2 * a);
            resultHTML += `<strong>Two real roots:</strong><br>`;
            resultHTML += `x₁ = ${x1.toFixed(4)}<br>`;
            resultHTML += `x₂ = ${x2.toFixed(4)}`;
        } else if (discriminant === 0) {
            // One real root
            const x = -b / (2 * a);
            resultHTML += `<strong>One real root:</strong><br>`;
            resultHTML += `x = ${x.toFixed(4)}`;
        } else {
            // Complex roots
            const realPart = -b / (2 * a);
            const imagPart = Math.sqrt(-discriminant) / (2 * a);
            resultHTML += `<strong>Two complex roots:</strong><br>`;
            resultHTML += `x₁ = ${realPart.toFixed(4)} + ${imagPart.toFixed(4)}i<br>`;
            resultHTML += `x₂ = ${realPart.toFixed(4)} - ${imagPart.toFixed(4)}i`;
        }
        
        resultHTML += '</div>';
        output.innerHTML = resultHTML;
    }
    
    // Add event listeners
    calcButton.addEventListener('click', calculateQuadratic);
    
    // Calculate on Enter key
    [aInput, bInput, cInput].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                calculateQuadratic();
            }
        });
    });
    
    // Calculate initial result
    calculateQuadratic();
    
    console.log('Math calculator loaded successfully!');
})();