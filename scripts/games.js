// Renders the game cards on /pages/games.html from /games.json.
// Live games link through; "soon" games render as a disabled card with a badge.

const gamesContainer = document.getElementById('gamesContainer');

function gameCard(game) {
    const live = game.status === 'live';
    const card = document.createElement('div');
    card.className = 'card' + (live ? '' : ' card-soon');

    const thumb = game.image
        ? `<img src="${game.image}" alt="${game.title} preview" loading="lazy">`
        : `<div class="card-thumb-placeholder" aria-hidden="true">${live ? '' : 'Coming soon'}</div>`;

    const badge = live ? '' : '<span class="soon-badge">Coming soon</span>';
    const inner = `
        ${thumb}
        <div class="card-content">
            <h3>${game.title}${badge}</h3>
            <p>${game.description}</p>
        </div>
    `;

    if (live) {
        const a = document.createElement('a');
        a.href = game.href;
        a.innerHTML = inner;
        card.appendChild(a);
    } else {
        card.innerHTML = inner;
    }
    return card;
}

function renderGames(games) {
    gamesContainer.innerHTML = '';
    if (!games.length) {
        gamesContainer.innerHTML = '<div class="error">No games yet.</div>';
        return;
    }
    // Live games first, then the "coming soon" list.
    games
        .slice()
        .sort((a, b) => (a.status === 'live' ? 0 : 1) - (b.status === 'live' ? 0 : 1))
        .forEach((game, i) => {
            const card = gameCard(game);
            setTimeout(() => card.classList.add('card-visible'), i * 50);
            gamesContainer.appendChild(card);
        });
}

fetch('/games.json')
    .then(r => {
        if (!r.ok) throw new Error('Failed to load games.json');
        return r.json();
    })
    .then(renderGames)
    .catch(err => {
        gamesContainer.innerHTML = `<div class="error">Error: ${err.message}</div>`;
    });
