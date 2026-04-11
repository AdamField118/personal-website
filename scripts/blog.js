const postsContainer = document.getElementById('postsContainer');
const sortNewestBtn = document.getElementById('sort-newest');
const sortOldestBtn = document.getElementById('sort-oldest');
const loadingIndicator = document.getElementById('loadingIndicator');
const urlParams = new URLSearchParams(window.location.search);

let allPosts = [];

function parseDate(dateString) {
    const parts = dateString.split('-');
    return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
}

function formatDate(dateString) {
    return parseDate(dateString).toLocaleDateString(undefined, {
        year: 'numeric', month: 'long', day: 'numeric'
    });
}

function animateCardsIn(cards, staggerDelay = 100) {
    cards.forEach((card, index) => {
        card.classList.remove('card-visible');
        card.classList.add('card-hidden');
        setTimeout(() => {
            card.classList.remove('card-hidden');
            card.classList.add('card-visible');
        }, index * staggerDelay);
    });
}

function animateCardsOut(cards, callback) {
    cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.remove('card-visible');
            card.classList.add('card-hidden');
        }, index * 50);
    });
    setTimeout(callback, cards.length * 50 + 300);
}

function sortNewestFirst(posts) {
    return [...posts].sort((a, b) => {
        const diff = parseDate(b.date) - parseDate(a.date);
        return diff !== 0 ? diff : a.title.localeCompare(b.title);
    });
}

function sortOldestFirst(posts) {
    return [...posts].sort((a, b) => {
        const diff = parseDate(a.date) - parseDate(b.date);
        return diff !== 0 ? diff : a.title.localeCompare(b.title);
    });
}

function renderPosts(posts) {
    const existingCards = Array.from(postsContainer.querySelectorAll('.card'));

    const doRender = () => {
        postsContainer.innerHTML = '';

        if (posts.length === 0) {
            postsContainer.innerHTML = '<div class="error">No blog posts found.</div>';
            return;
        }

        posts.forEach(post => {
            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="post-header">
                    <div class="post-title">${post.title}</div>
                    <div class="post-date">${formatDate(post.date)}</div>
                </div>
                <div class="post-snippet">${post.snippet}</div>
                <div class="post-footer">
                    <div class="post-tags">
                        ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="read-more">Click to read →</div>
                </div>
            `;

            card.addEventListener('click', () => {
                window.location.href = post.href;
            });

            postsContainer.appendChild(card);
        });

        const newCards = Array.from(postsContainer.querySelectorAll('.card'));
        setTimeout(() => animateCardsIn(newCards, 100), 50);
    };

    if (existingCards.length > 0) {
        animateCardsOut(existingCards, doRender);
    } else {
        doRender();
    }
}

fetch('/blog-posts/index.json')
    .then(r => {
        if (!r.ok) throw new Error('Failed to load index.json');
        return r.json();
    })
    .then(posts => {
        loadingIndicator.style.display = 'none';

        // Handle ?blog=Title redirect for old links
        const blogTitle = urlParams.get('blog');
        if (blogTitle) {
            const post = posts.find(p => p.title === blogTitle);
            if (post) { window.location.href = post.href; return; }
        }

        allPosts = posts;
        renderPosts(sortNewestFirst(allPosts));
    })
    .catch(err => {
        loadingIndicator.innerHTML = `<div class="error">Error loading posts: ${err.message}</div>`;
    });

sortNewestBtn.addEventListener('click', () => {
    renderPosts(sortNewestFirst(allPosts));
    sortNewestBtn.classList.add('active');
    sortOldestBtn.classList.remove('active');
});

sortOldestBtn.addEventListener('click', () => {
    renderPosts(sortOldestFirst(allPosts));
    sortOldestBtn.classList.add('active');
    sortNewestBtn.classList.remove('active');
});