// DOM Elements
const postsContainer = document.getElementById('postsContainer');
const closeBtn = document.getElementById('closeBtn');
const sortNewestBtn = document.getElementById('sort-newest');
const sortOldestBtn = document.getElementById('sort-oldest');
const loadingIndicator = document.getElementById('loadingIndicator');

let allPosts = [];

// Updated date parsing function for Safari compatibility
function parseDate(dateString) {
    const parts = dateString.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1;  // Months are 0-indexed
    const day = parseInt(parts[2]);
    return new Date(year, month, day);
}

function formatDate(dateString) {
    const date = parseDate(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(undefined, options);
}

function renderMarkdown(content) {
    let html = content
        .replace(/```([\w-]*)\s*\n?([\s\S]*?)```/g, (match, lang, code) => {
            const trimmedCode = code.replace(/^\n/, '');
            
            const escapedCode = trimmedCode
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;');
                
            return lang 
                ? `<pre><code class="language-${lang}">${escapedCode}</code></pre>`
                : `<pre><code>${escapedCode}</code></pre>`;
        })
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/`(.*?)`/gim, (match, code) => {
            return `<code>${code
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')}</code>`;
        })
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/(\n<ul>)?<li>.*<\/li>/gim, '<ul>$&</ul>')
        .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
        .replace(/(\n<ol>)?<li>.*<\/li>/gim, '<ol>$&</ol>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');

    html = `<p>${html}</p>`
        .replace(/<p><\/p>/g, '')
        .replace(/<p>(<\/?(?:pre|h\d|blockquote|ul|ol)[^>]*>)/g, '$1')
        .replace(/(<\/?(?:pre|h\d|blockquote|ul|ol)[^>]*>)<\/p>/g, '$1');

    return html;
}

const markdownFiles = [
    "/blog_posts/example_blog.md"
];

function parseFrontMatter(content) {
    if (!content.startsWith('---')) {
        console.error('Front matter not found at start of file');
        return {
            metadata: { title: 'Untitled', date: new Date().toISOString().split('T')[0], tags: [], snippet: '' },
            content: content
        };
    }
    
    const frontMatterEnd = content.indexOf('---', 3);
    if (frontMatterEnd === -1) {
        console.error('Front matter not properly closed');
        return {
            metadata: { title: 'Untitled', date: new Date().toISOString().split('T')[0], tags: [], snippet: '' },
            content: content
        };
    }
    
    const frontMatter = content.slice(3, frontMatterEnd).trim();
    const contentBody = content.slice(frontMatterEnd + 3).trim();
    
    const metadata = {};
    frontMatter.split('\n').forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
            const key = line.slice(0, colonIndex).trim();
            const value = line.slice(colonIndex + 1).trim();
            metadata[key] = value.replace(/^['"](.*)['"]$/, '$1');
        }
    });
    
    if (!metadata.title) metadata.title = 'Untitled Post';
    if (!metadata.date) metadata.date = new Date().toISOString().split('T')[0];
    if (!metadata.tags) metadata.tags = '';
    if (!metadata.snippet) {
        metadata.snippet = contentBody.substring(0, 100) + (contentBody.length > 100 ? '...' : '');
    }
    
    return { metadata, content: contentBody };
}

async function loadMarkdownFiles() {
    const posts = [];
    let loadedCount = 0;
    
    for (const file of markdownFiles) {
        try {
            const absolutePath = new URL(file, window.location.origin).href;
            console.log(`Fetching: ${absolutePath}`);
            loadingIndicator.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Loading ${loadedCount + 1}/${markdownFiles.length} posts...`;

            const response = await fetch(file);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${file}: ${response.status} ${response.statusText}`);
            }
            
            const text = await response.text();
            const { metadata, content } = parseFrontMatter(text);
            
            const tags = metadata.tags 
                ? metadata.tags.split(',').map(tag => tag.trim()) 
                : [];
            
            posts.push({
                title: metadata.title,
                date: metadata.date,
                tags: tags,
                snippet: metadata.snippet,
                content: content
            });
            
            loadedCount++;
        } catch (error) {
            console.error(`Error loading ${file}:`, error);
            posts.push({
                title: `Error: ${file}`,
                date: new Date().toISOString().split('T')[0],
                tags: ['error'],
                snippet: `Failed to load this post: ${error.message}`,
                content: `# Error Loading Post\n\nCould not load the post from ${file}.\n\nError: ${error.message}`
            });
            loadedCount++;
        }
    }
    
    loadingIndicator.style.display = 'none';
    return posts;
}

function renderPosts(posts) {
    postsContainer.innerHTML = '';
    
    if (posts.length === 0) {
        postsContainer.innerHTML = '<div class="error">No blog posts found. Please check your markdown files.</div>';
        return;
    }
    
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'card';
        postElement.innerHTML = `
            <div class="post-header">
                <div class="post-title">${post.title}</div>
                <div class="post-date">${formatDate(post.date)}</div>
            </div>
            <div class="post-snippet">
                ${post.snippet}
            </div>
            <div class="post-footer">
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <div class="read-more">Click to read →</div>
            </div>
        `;
        
        postElement.addEventListener('click', () => {
            showFullPost(post);
        });
        
        postsContainer.appendChild(postElement);
    });
}

function showFullPost(post) {
    const postFull = document.createElement('div');
    postFull.className = 'post-full';
    postFull.id = 'postFull';
    postFull.innerHTML = `
        <div class="post-full-content">
            <div class="post-full-header">
                <h1 class="post-full-title">${post.title}</h1>
                <div class="post-full-meta">
                    <span><i class="far fa-calendar"></i> ${formatDate(post.date)}</span>
                    <span><i class="far fa-clock"></i> ${Math.ceil(post.content.length / 1200)} min read</span>
                </div>
            </div>
            <div class="post-full-body">
                ${renderMarkdown(post.content)}
            </div>
        </div>
    `;
    
    document.body.appendChild(postFull);
    
    closeBtn.classList.add('visible');
    
    setTimeout(() => {
        postFull.classList.add('active');
        if (window.Prism) {
            Prism.highlightAll();
        } else {
            console.warn("Prism not loaded. Syntax highlighting disabled.");
        }
    }, 10);
    
    document.body.style.overflow = 'hidden';
    
    document.addEventListener('keydown', handleEscapeKey);
}

function closeFullPost() {
    const postFull = document.getElementById('postFull');
    if (postFull) {
        postFull.classList.remove('active');
        
        setTimeout(() => {
            postFull.remove();
        }, 300);
    }
    
    closeBtn.classList.remove('visible');
    
    document.body.style.overflow = '';
    
    document.removeEventListener('keydown', handleEscapeKey);
}

function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        closeFullPost();
    }
}


function sortNewestFirst(posts) {
    return [...posts].sort((a, b) => 
        parseDate(b.date) - parseDate(a.date)
    );
}

function sortOldestFirst(posts) {
    return [...posts].sort((a, b) => 
        parseDate(a.date) - parseDate(b.date)
    );
}

closeBtn.addEventListener('click', closeFullPost);

sortNewestBtn.addEventListener('click', () => {
    const sortedPosts = sortNewestFirst(allPosts);
    renderPosts(sortedPosts);
    sortNewestBtn.classList.add('active');
    sortOldestBtn.classList.remove('active');
});

sortOldestBtn.addEventListener('click', () => {
    const sortedPosts = sortOldestFirst(allPosts);
    renderPosts(sortedPosts);
    sortOldestBtn.classList.add('active');
    sortNewestBtn.classList.remove('active');
});

loadMarkdownFiles().then(posts => {
    allPosts = posts;
    const sortedPosts = sortNewestFirst(allPosts);
    renderPosts(sortedPosts);
}).catch(error => {
    console.error('Error loading posts:', error);
    loadingIndicator.innerHTML = `<div class="error">Error loading posts: ${error.message}</div>`;
});