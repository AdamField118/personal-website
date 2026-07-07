// Renders the three most recent blog posts on the homepage from blog-posts/index.json.
(async () => {
    const container = document.getElementById('latestPosts');
    if (!container) return;

    try {
        const res = await fetch('./blog-posts/index.json');
        if (!res.ok) throw new Error(res.statusText);
        const posts = await res.json();

        posts.sort((a, b) => b.date.localeCompare(a.date));

        const formatDate = (s) => {
            const [y, m, d] = s.split('-').map(Number);
            return new Date(y, m - 1, d).toLocaleDateString(undefined, {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        };

        posts.slice(0, 2).forEach(post => {
            const link = document.createElement('a');
            link.className = 'card-link';
            link.href = post.href;

            const card = document.createElement('div');
            card.className = 'card card-visible latest-post-card';
            card.innerHTML = `
                <div class="post-header">
                    <div class="post-title">${post.title}</div>
                    <div class="post-date">${formatDate(post.date)}</div>
                </div>
                <div class="post-snippet">${post.snippet}</div>
                <div class="post-footer">
                    <div class="post-tags">
                        ${(post.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    <div class="read-more">Read →</div>
                </div>
            `;
            link.appendChild(card);
            container.appendChild(link);
        });
    } catch (err) {
        // Fail quietly — the "View all posts" link below still works.
        container.innerHTML = '';
    }
})();
