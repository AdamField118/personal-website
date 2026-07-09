const simsContainer = document.getElementById('simsContainer');
const filterSelect  = document.getElementById('filter');
const measurer      = document.getElementById('measurer');

let allSims = [];

function renderSims(sims) {
    simsContainer.innerHTML = '';

    if (sims.length === 0) {
        simsContainer.innerHTML = '<div class="error">No simulations found.</div>';
        return;
    }

    sims.forEach((sim, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.dataset.topic = sim.topic;

        card.innerHTML = `
            <a href="${sim.href}">
                <img src="${sim.image}" alt="${sim.title} simulation preview" loading="lazy">
                <div class="card-content">
                    <h3>${sim.title}</h3>
                    <p>${sim.description}</p>
                </div>
            </a>
        `;

        setTimeout(() => card.classList.add('card-visible'), index * 50);
        simsContainer.appendChild(card);
    });

    adjustSelectWidth(filterSelect);
}

function applyFilter(topic) {
    const cards = simsContainer.querySelectorAll('.card');
    cards.forEach((card, index) => {
        const show = topic === 'all' || card.dataset.topic === topic;
        if (show) {
            card.style.display = '';
            setTimeout(() => {
                card.classList.add('card-visible');
                card.classList.remove('card-hidden');
            }, index * 50);
        } else {
            card.classList.add('card-hidden');
            card.classList.remove('card-visible');
            setTimeout(() => {
                if (card.classList.contains('card-hidden')) card.style.display = 'none';
            }, 300);
        }
    });
}

function adjustSelectWidth(el) {
    if (!measurer || !el) return;
    const opt = el.options[el.selectedIndex];
    const text = opt ? opt.text : '';
    const cs = window.getComputedStyle(el);
    measurer.style.font = cs.font;
    measurer.textContent = text;
    const w = Math.min((measurer.offsetWidth + 20) / el.closest('.filter-section').offsetWidth * 100, 65);
    el.style.width = w + '%';
}

filterSelect.addEventListener('change', function () {
    applyFilter(this.value);
    adjustSelectWidth(this);
});

fetch('/simulations.json')
    .then(r => {
        if (!r.ok) throw new Error('Failed to load simulations.json');
        return r.json();
    })
    .then(sims => {
        allSims = sims;
        simsContainer.innerHTML = '';
        renderSims(allSims);
    })
    .catch(err => {
        simsContainer.innerHTML = `<div class="error">Error: ${err.message}</div>`;
    });
