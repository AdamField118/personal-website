// Simple Counter Demo
// This demonstrates how easy it is to create an interactive component

(function() {
    const container = window.currentCodeContainer;
    if (!container) return;
    
    // Create the HTML
    container.innerHTML = `
        <h3>Simple Counter</h3>
        <p>A basic example of an interactive component</p>
        
        <div class="controls">
            <button id="decrement">-</button>
            <span id="counter-value" style="font-size: 2rem; margin: 0 20px; font-weight: bold;">0</span>
            <button id="increment">+</button>
            <button id="reset" style="margin-left: 20px;">Reset</button>
        </div>
        
        <div class="output" style="margin-top: 20px;">
            <p id="counter-message">Click the buttons to change the counter!</p>
        </div>
    `;
    
    // Get elements
    const decrementBtn = container.querySelector('#decrement');
    const incrementBtn = container.querySelector('#increment');
    const resetBtn = container.querySelector('#reset');
    const valueDisplay = container.querySelector('#counter-value');
    const messageDisplay = container.querySelector('#counter-message');
    
    // Counter state
    let count = 0;
    
    // Update display
    function updateDisplay() {
        valueDisplay.textContent = count;
        
        // Update message based on count
        if (count === 0) {
            messageDisplay.textContent = 'Counter is at zero.';
        } else if (count > 0) {
            messageDisplay.textContent = `Positive value: ${count}`;
        } else {
            messageDisplay.textContent = `Negative value: ${count}`;
        }
        
        // Change color based on count
        if (count > 0) {
            valueDisplay.style.color = '#4caf50'; // Green
        } else if (count < 0) {
            valueDisplay.style.color = '#f44336'; // Red
        } else {
            valueDisplay.style.color = '#00458b'; // Blue
        }
    }
    
    // Event handlers
    incrementBtn.addEventListener('click', () => {
        count++;
        updateDisplay();
    });
    
    decrementBtn.addEventListener('click', () => {
        count--;
        updateDisplay();
    });
    
    resetBtn.addEventListener('click', () => {
        count = 0;
        updateDisplay();
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === '+' || e.key === '=') {
            count++;
            updateDisplay();
        } else if (e.key === '-' || e.key === '_') {
            count--;
            updateDisplay();
        } else if (e.key === '0') {
            count = 0;
            updateDisplay();
        }
    });
    
    console.log('Simple counter loaded! Use +/- keys or buttons.');
})();