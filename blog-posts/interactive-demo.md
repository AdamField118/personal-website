---
title: "Interactive Code Demo"
date: "2025-11-15"
tags: "tutorial, example"
snippet: "An example of interactive code containers in blog posts"
---

# Interactive Code Containers Demo

This blog post demonstrates how to embed interactive JavaScript components into your markdown blog posts!

## Basic Math Calculator

Below is an interactive calculator that lets you compute simple mathematical operations. This is powered by a separate JavaScript file that gets loaded dynamically.

[codeContainer](../scripts/blog-post-scripts/math-demo.js)

## How It Works

When you write `[codeContainer](../scripts/blog-post-scripts/your-script.js)` in your markdown, the blog system:

1. **Parses** the syntax before any other markdown processing
2. **Creates** a styled div with the class `code-container`
3. **Loads** the referenced JavaScript file
4. **Executes** the script, which can manipulate the container

## The Math Behind It

Let's say we want to calculate the quadratic formula:

$$x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$$

The interactive calculator above can help you compute this for different values of $a$, $b$, and $c$!

## Another Example: Sine Wave Plotter

Here's another example that plots a sine wave:

[codeContainer](../scripts/blog-post-scripts/sine-wave-demo.js)

## Technical Details

The JavaScript files have access to:
- The container element via `window.currentCodeContainer`
- The container ID via `window.currentCodeContainerId`
- All standard browser APIs
- Can create buttons, inputs, canvases, etc.

## Creating Your Own

To create your own interactive component:

1. Write your markdown with `[codeContainer](path/to/script.js)`
2. Create a JavaScript file that manipulates `window.currentCodeContainer`
3. Add your HTML, event listeners, and logic
4. The container will be automatically styled!

Example JavaScript structure:

```javascript
// Get the container
const container = window.currentCodeContainer;

// Add content
container.innerHTML = `
    <h3>My Interactive Widget</h3>
    <button id="myButton">Click Me!</button>
    <div id="output"></div>
`;

// Add interactivity
document.getElementById('myButton').addEventListener('click', () => {
    document.getElementById('output').textContent = 'Hello!';
});
```

## Conclusion

This feature makes it easy to create interactive, educational content that combines markdown text, LaTeX math, and dynamic JavaScript components all in one blog post!