// DOM Elements
const postsContainer = document.getElementById('postsContainer');
const closeBtn = document.getElementById('closeBtn');
const sortNewestBtn = document.getElementById('sort-newest');
const sortOldestBtn = document.getElementById('sort-oldest');
const loadingIndicator = document.getElementById('loadingIndicator');

let allPosts = [];

// ANIMATION-ONLY FUNCTIONS - These are the ONLY new additions
function animateCardsIn(cards, staggerDelay = 100) {
    cards.forEach((card, index) => {
        // Start hidden
        card.classList.remove('card-visible');
        card.classList.add('card-hidden');
        
        // Animate in with stagger
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
    
    // Execute callback after all animations complete
    setTimeout(callback, cards.length * 50 + 300);
}
// END ANIMATION-ONLY FUNCTIONS

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
    // Step 1: Extract and placeholder LaTeX blocks to protect them from processing
    const latexBlocks = [];
    
    // Handle $ blocks first (display/block math)
    let html = content.replace(/\$\$([\s\S]*?)\$\$/g, (match, latex) => {
        const processedLatex = latex.trim();
        const latexHtml = `<div class="latex-display">$$${processedLatex}$$</div>`;
        const placeholder = `__LATEXBLOCK_${latexBlocks.length}__`;
        latexBlocks.push(latexHtml);
        return placeholder;
    });
    
    // Handle inline $ LaTeX (but avoid matching $ which we already processed)
    html = html.replace(/(?<!\$)\$(?!\$)((?:[^$]|\\\$)+?)\$(?!\$)/g, (match, latex) => {
        const processedLatex = latex.trim();
        const latexHtml = `<span class="latex-inline">$${processedLatex}$</span>`;
        const placeholder = `__LATEXBLOCK_${latexBlocks.length}__`;
        latexBlocks.push(latexHtml);
        return placeholder;
    });

    // Step 2: Extract and placeholder code blocks to protect them from processing
    const codeBlocks = [];
    html = html.replace(/```([\w-]*)\s*\n?([\s\S]*?)```/g, (match, lang, code) => {
        // Remove only the very first newline if it exists
        let processedCode = code;
        if (processedCode.startsWith('\n')) {
            processedCode = processedCode.substring(1);
        }
        
        // Remove trailing whitespace but preserve internal formatting
        processedCode = processedCode.replace(/\s+$/, '');
        
        // Convert tabs to 4 spaces for consistent rendering
        processedCode = processedCode.replace(/\t/g, '    ');
        
        // Escape HTML entities but preserve whitespace and newlines exactly
        const escapedCode = processedCode
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
            
        const codeBlockHtml = lang 
            ? `<pre><code class="language-${lang}">${escapedCode}</code></pre>`
            : `<pre><code>${escapedCode}</code></pre>`;
            
        // Store the processed code block and return a placeholder
        const placeholder = `__CODEBLOCK_${codeBlocks.length}__`;
        codeBlocks.push(codeBlockHtml);
        return placeholder;
    });

    // Step 3: Process the rest of the markdown (without code blocks and LaTeX)
    html = html
        // Headers
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        // Images (must be before links)
        .replace(/!\[([^\]]+)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1">')
        // Links
        .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
        // Bold and italic
        .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/gim, '<em>$1</em>')
        // Inline code
        .replace(/`(.*?)`/gim, (match, code) => {
            return `<code>${code
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')}</code>`;
        })
        // Blockquotes
        .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

    // Step 4: Handle lists
    // First, convert markdown unordered lists to ordered list items
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
    
    // Also handle existing numbered lists
    html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');
    
    // Split into lines and process list items
    const lines = html.split('\n');
    const processedLines = [];
    let inList = false;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const isListItem = line.trim().match(/^<li>.*<\/li>$/);
        
        if (isListItem && !inList) {
            // Starting a new list
            processedLines.push('<ol>');
            processedLines.push(line);
            inList = true;
        } else if (isListItem && inList) {
            // Continue current list
            processedLines.push(line);
        } else if (!isListItem && inList) {
            // End current list
            processedLines.push('</ol>');
            processedLines.push(line);
            inList = false;
        } else {
            // Regular line
            processedLines.push(line);
        }
    }
    
    // Close list if we ended while in a list
    if (inList) {
        processedLines.push('</ol>');
    }
    
    html = processedLines.join('\n');

    // Step 5: Process paragraphs and line breaks (but not inside code blocks or LaTeX)
    html = html
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n(?!<li>|<\/ol>)/g, '<br>')  // Don't add <br> before <li> or </ol>
        .replace(/(<ol>)\n/g, '$1')             // Remove newline after <ol>
        .replace(/(<\/li>)\n/g, '$1');          // Remove newline after </li>

    // Step 6: Wrap in paragraphs and clean up
    html = `<p>${html}</p>`
        .replace(/<p><\/p>/g, '')
        .replace(/<p>(<\/?(?:pre|h\d|blockquote|ol|div)[^>]*>)/g, '$1')
        .replace(/(<\/?(?:pre|h\d|blockquote|ol|div)[^>]*>)<\/p>/g, '$1');

    // Step 7: Restore the protected code blocks
    codeBlocks.forEach((codeBlock, index) => {
        html = html.replace(`__CODEBLOCK_${index}__`, codeBlock);
    });

    // Step 8: Restore the protected LaTeX blocks
    latexBlocks.forEach((latexBlock, index) => {
        html = html.replace(`__LATEXBLOCK_${index}__`, latexBlock);
    });

    return html;
}

const markdownFiles = [
    "/blog-posts/example-blog.md",
    "/blog-posts/blog-1.md",
    "/blog-posts/blog-2.md",
    "/blog-posts/blog-3.md",
    "/blog-posts/blog-4.md"
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

// ONLY modification: Added animation wrapper around your original function
function renderPosts(posts) {
    // Check if we should animate (if there are existing cards)
    const existingCards = Array.from(postsContainer.querySelectorAll('.card'));
    const shouldAnimate = existingCards.length > 0;
    
    if (shouldAnimate) {
        // Animate out existing cards first, then render new ones
        animateCardsOut(existingCards, () => {
            renderPostsOriginal(posts);
            // Animate in the new cards
            const newCards = Array.from(postsContainer.querySelectorAll('.card'));
            setTimeout(() => animateCardsIn(newCards, 100), 50);
        });
    } else {
        // First load - render normally then animate in
        renderPostsOriginal(posts);
        const newCards = Array.from(postsContainer.querySelectorAll('.card'));
        setTimeout(() => animateCardsIn(newCards, 100), 50);
    }
}

// Your EXACT original renderPosts function, renamed but unchanged
function renderPostsOriginal(posts) {
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
        // Render LaTeX with MathJax
        if (window.MathJax && window.MathJax.typesetPromise) {
            console.log('Rendering MathJax...');
            MathJax.typesetPromise().then(() => {
                console.log('MathJax rendering complete');
            }).catch((err) => {
                console.error('MathJax rendering error:', err);
            });
        } else {
            console.warn("MathJax not loaded or not ready. LaTeX rendering disabled.");
            console.log('MathJax object:', window.MathJax);
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
    return [...posts].sort((a, b) => {
        const dateComparison = parseDate(b.date) - parseDate(a.date);
        if (dateComparison === 0) {
            return a.title.localeCompare(b.title);
        }
        return dateComparison;
    });
}

function sortOldestFirst(posts) {
    return [...posts].sort((a, b) => {
        const dateComparison = parseDate(a.date) - parseDate(b.date);
        if (dateComparison === 0) {
            return a.title.localeCompare(b.title);
        }
        return dateComparison;
    });
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