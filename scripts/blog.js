// DOM Elements
const postsContainer = document.getElementById('postsContainer');
const closeBtn = document.getElementById('closeBtn');
const sortNewestBtn = document.getElementById('sort-newest');
const sortOldestBtn = document.getElementById('sort-oldest');
const loadingIndicator = document.getElementById('loadingIndicator');

// Store all loaded posts
let allPosts = [];

// Format date to readable format
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

// Generate HTML for markdown content
function renderMarkdown(content) {
    // Improved markdown to HTML conversion
    let html = content
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        .replace(/`(.*?)`/gim, '<code>$1</code>')
        .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
        .replace(/> (.*$)/gim, '<blockquote>$1</blockquote>')
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/(<li>.*)/gim, '<ul>$1</ul>')
        .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
        .replace(/(<li>.*)/gim, '<ol>$1</ol>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>');
    
    // Wrap any loose text in paragraphs
    return `<p>${html}</p>`.replace(/<p><\/p>/g, '');
}

// Array of markdown file paths - UPDATED FOR YOUR STRUCTURE
const markdownFiles = [
    "/blog_posts/test.md"  // Root-relative path
];

// Function to parse front matter
function parseFrontMatter(content) {
    // Check if content starts with front matter
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
    
    // Ensure required metadata fields
    if (!metadata.title) metadata.title = 'Untitled Post';
    if (!metadata.date) metadata.date = new Date().toISOString().split('T')[0];
    if (!metadata.tags) metadata.tags = '';
    if (!metadata.snippet) {
        // Auto-generate snippet from first 100 characters
        metadata.snippet = contentBody.substring(0, 100) + (contentBody.length > 100 ? '...' : '');
    }
    
    return { metadata, content: contentBody };
}

// Function to load and process markdown files
async function loadMarkdownFiles() {
    const posts = [];
    let loadedCount = 0;
    
    for (const file of markdownFiles) {
        try {
            // Construct absolute path for debugging
            const absolutePath = new URL(file, window.location.origin).href;
            console.log(`Fetching: ${absolutePath}`);
            loadingIndicator.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Loading ${loadedCount + 1}/${markdownFiles.length} posts...`;

            const response = await fetch(file);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${file}: ${response.status} ${response.statusText}`);
            }
            
            const text = await response.text();
            const { metadata, content } = parseFrontMatter(text);
            
            // Parse tags from comma-separated string
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
            // Create a placeholder for the failed post
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

// Render all posts
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

// Show full post in expanded view
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
    
    // Show close button
    closeBtn.classList.add('visible');
    
    // Show post with animation
    setTimeout(() => {
        postFull.classList.add('active');
    }, 10);
    
    // Prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    // Add escape key listener
    document.addEventListener('keydown', handleEscapeKey);
}

// Close full post view
function closeFullPost() {
    const postFull = document.getElementById('postFull');
    if (postFull) {
        // Hide with animation
        postFull.classList.remove('active');
        
        // Remove after animation completes
        setTimeout(() => {
            postFull.remove();
        }, 300);
    }
    
    // Hide close button
    closeBtn.classList.remove('visible');
    
    // Restore body scrolling
    document.body.style.overflow = '';
    
    // Remove escape key listener
    document.removeEventListener('keydown', handleEscapeKey);
}

// Handle escape key press
function handleEscapeKey(event) {
    if (event.key === 'Escape') {
        closeFullPost();
    }
}

// Sort posts by date (newest first)
function sortNewestFirst(posts) {
    return [...posts].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );
}

// Sort posts by date (oldest first)
function sortOldestFirst(posts) {
    return [...posts].sort((a, b) => 
        new Date(a.date) - new Date(b.date)
    );
}

// Event Listeners
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

// Initialize the blog
loadMarkdownFiles().then(posts => {
    allPosts = posts;
    const sortedPosts = sortNewestFirst(allPosts);
    renderPosts(sortedPosts);
}).catch(error => {
    console.error('Error loading posts:', error);
    loadingIndicator.innerHTML = `<div class="error">Error loading posts: ${error.message}</div>`;
});