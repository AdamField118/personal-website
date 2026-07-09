const container = document.getElementById('simulation-container');

function getAdaptiveColor() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'white' : 'black';
}

const gui = document.createElement('gui');
gui.style = 'position: fixed; left: 0px; margin-top: 0px;';

const angle = document.createElement('input');
angle.id = 'angle';
angle.type = 'number';
angle.placeholder = 'Incident angle, starts 45';
gui.appendChild(angle);

const n0 = document.createElement('input');
n0.id = 'n0';
n0.type = 'number';
n0.placeholder = 'n\u2080 here, starts n\u2080=1';
gui.appendChild(n0);

const n1 = document.createElement('input');
n1.id = 'n1';
n1.type = 'number';
n1.placeholder = 'n\u2081 here, starts n\u2081=1.5';
gui.appendChild(n1);

const refresh = document.createElement('button');
refresh.textContent = 'RELOAD';
gui.appendChild(refresh);

container.appendChild(gui);

const canvas = document.createElement('canvas');
container.appendChild(canvas);

// Set initial values for inputs
angle.value = 45;
n0.value = 1;
n1.value = 1.5;

// Set responsive canvas size
function setCanvasSize() {
    canvas.width = window.innerWidth - (window.innerWidth / 10);
    canvas.height = window.innerHeight - (window.innerHeight / 2.15);
}

function center() {
    canvas.style.position = "absolute";
    canvas.style.left = ((window.innerWidth - canvas.width) / 2) + "px";
    canvas.style.top = ((window.innerHeight - canvas.height) / 2) + 40 + "px";
}

// Combined resize handler
function handleResize() {
    setCanvasSize();
    center();
    reload();
}

// Initial setup
setCanvasSize();
center();
window.addEventListener("resize", handleResize);

const ctx = canvas.getContext('2d');

// Set responsive font size
function setResponsiveFont() {
    const baseSize = Math.min(canvas.width, canvas.height) * 0.02;
    ctx.font = `${Math.max(12, baseSize)}px Arial`;
    ctx.textAlign = 'left';
}

// Initial draw
reload();

function reload() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setResponsiveFont(); // Update font size based on current canvas

    // Make ray length responsive
    const rayLength = Math.min(canvas.width, canvas.height) * 0.3;

    // Draw interface (air-glass boundary)
    ctx.beginPath();
    ctx.moveTo(0, canvas.height / 2);
    ctx.lineTo(canvas.width, canvas.height / 2);
    ctx.strokeStyle = getAdaptiveColor();
    ctx.stroke();

    // Draw normal
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo((canvas.width / 2), 0);
    ctx.lineTo((canvas.width / 2), canvas.height - 10);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw incident ray
    const incidentAngle = (document.getElementById('angle').value * Math.PI) / 180;
    const startX = canvas.width / 4;
    const startY = canvas.height / 2 - rayLength * Math.tan(incidentAngle);
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(canvas.width / 2, canvas.height / 2);
    ctx.strokeStyle = 'blue';
    ctx.stroke();

    // Calculate refraction (Snell's Law: n1*sin(theta1) = n2*sin(theta2))
    const n2 = document.getElementById('n0').value;
    const n3 = document.getElementById('n1').value;
    const thetaT = Math.asin((n2 / n3) * Math.sin(incidentAngle));

    // Draw reflected ray
    const endXR = (canvas.width / 2) + startX;
    const endYR = startY;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.lineTo(endXR, endYR);
    ctx.strokeStyle = 'green';
    ctx.stroke();

    // Draw refracted ray
    const endXT = canvas.width / 2 + rayLength * Math.cos(thetaT);
    const endYT = canvas.height / 2 + rayLength * Math.sin(thetaT);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.lineTo(endXT, endYT);
    ctx.strokeStyle = 'red';
    ctx.stroke();

    // Labels - Percentage-based positioning
    ctx.fillStyle = getAdaptiveColor();
    
    // Calculate label positions as percentages
    const labelX = canvas.width * 0.02; // 2% from left
    const labelOffsetYUp = canvas.height * 0.02; // 2% offset from interface
    const labelOffsetYDown = canvas.height * 0.04; // 4% offset from interface
    
    // Position n₀ just above interface
    ctx.fillText('n\u2080', labelX, canvas.height / 2 - labelOffsetYUp);
    
    // Position n₁ just below interface
    ctx.fillText('n\u2081', labelX, canvas.height / 2 + labelOffsetYDown);
    
    // Ray labels
    ctx.fillStyle = 'blue';
    ctx.fillText('Incident Ray', startX - 30, Math.max(startY - 10, 10));
    ctx.fillStyle = 'green';
    ctx.fillText('Reflected Ray', endXR - 30, Math.max(endYR - 10, 10));
    ctx.fillStyle = 'red';
    ctx.fillText('Refracted Ray', endXT - 30, Math.min(endYT + 10, canvas.height - 10));
}

refresh.addEventListener("click", () => {
    // Set input values if empty
    if (!document.getElementById('angle').value) {
        document.getElementById('angle').value = 45;
    }
    if (!document.getElementById('n0').value) {
        document.getElementById('n0').value = 1;
    }
    if (!document.getElementById('n1').value) {
        document.getElementById('n1').value = 1.5;
    }
    
    reload();
});

const colorSchemeListener = window.matchMedia('(prefers-color-scheme: dark)');
colorSchemeListener.addEventListener('change', () => {
    // Set input values if empty
    if (!document.getElementById('angle').value) {
        document.getElementById('angle').value = 45;
    }
    if (!document.getElementById('n0').value) {
        document.getElementById('n0').value = 1;
    }
    if (!document.getElementById('n1').value) {
        document.getElementById('n1').value = 1.5;
    }
    
    reload();
});
