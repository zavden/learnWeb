// ─── Markdown ↔ Code Block Parser ───────────────────────

/**
 * Parse example .md content → { html, css, js }
 * Format:
 *   # HTML
 *   ```html
 *   ...code...
 *   ```
 *   # CSS
 *   ```css
 *   ...code...
 *   ```
 *   # JavaScript
 *   ```javascript
 *   ...code...
 *   ```
 */
export function parseExampleMd(text) {
    const result = { html: '', css: '', js: '' };
    if (!text) return result;

    // Match code blocks with their language
    const htmlMatch = text.match(/# HTML\s*\n+```html\n([\s\S]*?)```/);
    const cssMatch = text.match(/# CSS\s*\n+```css\n([\s\S]*?)```/);
    const jsMatch = text.match(/# JavaScript\s*\n+```javascript\n([\s\S]*?)```/);

    if (htmlMatch) result.html = htmlMatch[1].trim();
    if (cssMatch) result.css = cssMatch[1].trim();
    if (jsMatch) result.js = jsMatch[1].trim();

    return result;
}

/**
 * Build example .md from code blocks
 */
export function buildExampleMd(html, css, js) {
    return `# HTML

\`\`\`html
${html}
\`\`\`

# CSS

\`\`\`css
${css}
\`\`\`

# JavaScript

\`\`\`javascript
${js}
\`\`\`
`;
}
