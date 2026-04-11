(function (root, factory) {
    if (typeof module !== 'undefined') module.exports = factory();
    else root.renderMarkdown = factory();
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

    function renderMarkdown(content) {
        const codeBlocks = [];
        let html = content.replace(/```([\w-]*)\s*\n?([\s\S]*?)```/g, (match, lang, code) => {
            let processedCode = code;
            if (processedCode.startsWith('\n')) processedCode = processedCode.substring(1);
            processedCode = processedCode.replace(/\s+$/, '').replace(/\t/g, '    ');
            const escapedCode = processedCode
                .replace(/&/g, '&amp;').replace(/</g, '&lt;')
                .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
            const codeBlockHtml = lang
                ? `<pre><code class="language-${lang}">${escapedCode}</code></pre>`
                : `<pre><code>${escapedCode}</code></pre>`;
            const placeholder = `__CODEBLOCK_${codeBlocks.length}__`;
            codeBlocks.push(codeBlockHtml);
            return placeholder;
        });

        const inlineCode = [];
        html = html.replace(/`(.*?)`/gim, (match, code) => {
            const escapedCode = code
                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
            const placeholder = `__INLINECODE_${inlineCode.length}__`;
            inlineCode.push(`<code>${escapedCode}</code>`);
            return placeholder;
        });

        const codeContainers = [];
        html = html.replace(/\[codeContainer\]\(([^)]+)\)/g, (match, scriptPath) => {
            const placeholder = `__CODECONTAINER_${codeContainers.length}__`;
            codeContainers.push(scriptPath);
            return placeholder;
        });

        const latexBlocks = [];
        html = html.replace(/\$\$([\s\S]*?)\$\$/g, (match, latex) => {
            const latexHtml = `<div class="latex-display">$$${latex.trim()}$$</div>`;
            const placeholder = `__LATEXBLOCK_${latexBlocks.length}__`;
            latexBlocks.push(latexHtml);
            return placeholder;
        });
        html = html.replace(/(?<!\$)\$(?!\$)((?:[^$]|\\\$)+?)\$(?!\$)/g, (match, latex) => {
            const latexHtml = `<span class="latex-inline">$${latex.trim()}$</span>`;
            const placeholder = `__LATEXBLOCK_${latexBlocks.length}__`;
            latexBlocks.push(latexHtml);
            return placeholder;
        });

        html = html
            .replace(/^### (.*$)/gim, '<h3>$1</h3>')
            .replace(/^## (.*$)/gim, '<h2>$1</h2>')
            .replace(/^# (.*$)/gim, '<h1>$1</h1>')
            .replace(/!\[([^\]]+)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1">')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>')
            .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/gim, '<em>$1</em>')
            .replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

        html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
        html = html.replace(/^\d+\. (.*$)/gim, '<li>$1</li>');

        const lines = html.split('\n');
        const processedLines = [];
        let inList = false;
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const isListItem = line.trim().match(/^<li>.*<\/li>$/);
            if (isListItem && !inList) {
                processedLines.push('<ol>');
                processedLines.push(line);
                inList = true;
            } else if (isListItem && inList) {
                processedLines.push(line);
            } else if (!isListItem && inList) {
                processedLines.push('</ol>');
                processedLines.push(line);
                inList = false;
            } else {
                processedLines.push(line);
            }
        }
        if (inList) processedLines.push('</ol>');
        html = processedLines.join('\n');

        html = html
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n(?!<li>|<\/ol>)/g, '<br>')
            .replace(/(<ol>)\n/g, '$1')
            .replace(/(<\/li>)\n/g, '$1');

        html = `<p>${html}</p>`
            .replace(/<p><\/p>/g, '')
            .replace(/<p>(<\/?(?:pre|h\d|blockquote|ol|div)[^>]*>)/g, '$1')
            .replace(/(<\/?(?:pre|h\d|blockquote|ol|div)[^>]*>)<\/p>/g, '$1');

        codeBlocks.forEach((block, i) => {
            html = html.replace(`__CODEBLOCK_${i}__`, block);
        });
        latexBlocks.forEach((block, i) => {
            html = html.replace(`__LATEXBLOCK_${i}__`, block);
        });
        codeContainers.forEach((scriptPath, i) => {
            const containerHtml = `<div class="code-container" data-script="${scriptPath}" id="codeContainer-${i}"></div>`;
            html = html.replace(`__CODECONTAINER_${i}__`, containerHtml);
        });
        inlineCode.forEach((code, i) => {
            html = html.replace(`__INLINECODE_${i}__`, code);
        });

        return html;
    }

    return renderMarkdown;
});