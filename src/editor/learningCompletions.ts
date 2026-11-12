import { completeFromList, snippetCompletion } from '@codemirror/autocomplete';
import { cssLanguage } from '@codemirror/lang-css';
import { htmlLanguage } from '@codemirror/lang-html';
import { javascriptLanguage } from '@codemirror/lang-javascript';

const HTML_COMPLETION_ENTRIES = [
    snippetCompletion(
        [
            '<!DOCTYPE html>',
            '<html lang="en">',
            '<head>',
            '\t<meta charset="UTF-8" />',
            '\t<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
            '\t<title>${Document}</title>',
            '</head>',
            '<body>',
            '\t${}',
            '</body>',
            '</html>',
        ].join('\n'),
        {
            label: 'html:page',
            type: 'snippet',
            detail: 'Full document',
            info: 'Insert a full HTML document scaffold.',
        },
    ),
    snippetCompletion('<div class="${className}">${}</div>', {
        label: 'div',
        type: 'snippet',
        detail: 'Container',
        info: 'Insert a simple `div` with a class name.',
    }),
    snippetCompletion('<section class="${sectionName}">\n\t${}\n</section>', {
        label: 'section',
        type: 'snippet',
        detail: 'Section block',
        info: 'Insert a semantic `section` block.',
    }),
    snippetCompletion('<button type="button">${Label}</button>', {
        label: 'button',
        type: 'snippet',
        detail: 'Interactive button',
        info: 'Insert a basic button element.',
    }),
    snippetCompletion('<a href="${https://example.com}">${Link text}</a>', {
        label: 'a',
        type: 'snippet',
        detail: 'Link',
        info: 'Insert a link with href and text.',
    }),
    snippetCompletion('<img src="${image.png}" alt="${Description}" />', {
        label: 'img',
        type: 'snippet',
        detail: 'Image',
        info: 'Insert an image tag with `src` and `alt`.',
    }),
    snippetCompletion('<ul>\n\t<li>${First item}</li>\n\t<li>${Second item}</li>\n\t<li>${Third item}</li>\n</ul>', {
        label: 'ul>li',
        type: 'snippet',
        detail: 'List',
        info: 'Insert an unordered list with three items.',
    }),
    snippetCompletion(
        [
            '<form>',
            '\t<label>',
            '\t\t<span>${Label}</span>',
            '\t\t<input type="${text}" name="${fieldName}" />',
            '\t</label>',
            '\t<button type="submit">${Send}</button>',
            '</form>',
        ].join('\n'),
        {
            label: 'form',
            type: 'snippet',
            detail: 'Basic form',
            info: 'Insert a simple form with one labeled input.',
        },
    ),
];

const CSS_COMPLETION_ENTRIES = [
    snippetCompletion('display: flex;\njustify-content: center;\nalign-items: center;', {
        label: 'display:flex',
        type: 'snippet',
        detail: 'Flex layout',
        info: 'Insert a centered flex layout.',
    }),
    snippetCompletion('display: grid;\ngrid-template-columns: repeat(2, minmax(0, 1fr));\ngap: 12px;', {
        label: 'display:grid',
        type: 'snippet',
        detail: 'Grid layout',
        info: 'Insert a two-column responsive grid scaffold.',
    }),
    snippetCompletion('padding: ${12px};', {
        label: 'padding',
        type: 'snippet',
        detail: 'Spacing',
        info: 'Insert a padding declaration.',
    }),
    snippetCompletion('margin: ${0};', {
        label: 'margin',
        type: 'snippet',
        detail: 'Spacing',
        info: 'Insert a margin declaration.',
    }),
    snippetCompletion('border-radius: ${12px};', {
        label: 'border-radius',
        type: 'snippet',
        detail: 'Corners',
        info: 'Insert a border radius declaration.',
    }),
    snippetCompletion('box-shadow: 0 12px 24px rgba(0, 0, 0, 0.18);', {
        label: 'box-shadow',
        type: 'snippet',
        detail: 'Depth',
        info: 'Insert a soft card shadow.',
    }),
    snippetCompletion('transition: ${property} 200ms ease;', {
        label: 'transition',
        type: 'snippet',
        detail: 'Motion',
        info: 'Insert a transition declaration.',
    }),
    snippetCompletion('${selector}:hover {\n\t${}\n}', {
        label: ':hover',
        type: 'snippet',
        detail: 'Hover state',
        info: 'Insert a hover selector block.',
    }),
    snippetCompletion('@media (max-width: 768px) {\n\t${}\n}', {
        label: '@media',
        type: 'snippet',
        detail: 'Responsive rule',
        info: 'Insert a mobile breakpoint block.',
    }),
];

const JAVASCRIPT_COMPLETION_ENTRIES = [
    snippetCompletion('function ${name}(${params}) {\n\t${}\n}', {
        label: 'function',
        type: 'snippet',
        detail: 'Function declaration',
        info: 'Insert a basic function scaffold.',
    }),
    snippetCompletion('const ${element} = document.querySelector(\'${selector}\');', {
        label: 'querySelector',
        type: 'snippet',
        detail: 'DOM query',
        info: 'Select the first matching element from the page.',
    }),
    snippetCompletion('${target}.addEventListener(\'${click}\', (event) => {\n\t${}\n});', {
        label: 'addEventListener',
        type: 'snippet',
        detail: 'Event listener',
        info: 'Insert an event listener scaffold.',
    }),
    snippetCompletion('if (${condition}) {\n\t${}\n}', {
        label: 'if',
        type: 'snippet',
        detail: 'Conditional',
        info: 'Insert an `if` block.',
    }),
    snippetCompletion('for (const ${item} of ${items}) {\n\t${}\n}', {
        label: 'for...of',
        type: 'snippet',
        detail: 'Loop',
        info: 'Insert a `for...of` loop.',
    }),
    snippetCompletion('console.log(${value});', {
        label: 'console.log',
        type: 'snippet',
        detail: 'Debug output',
        info: 'Insert a `console.log()` statement.',
    }),
    snippetCompletion('setTimeout(() => {\n\t${}\n}, ${300});', {
        label: 'setTimeout',
        type: 'snippet',
        detail: 'Delayed callback',
        info: 'Run code after a delay in milliseconds.',
    }),
    snippetCompletion('const response = await fetch(\'${/api/example}\');\nconst data = await response.json();\n${}', {
        label: 'fetch',
        type: 'snippet',
        detail: 'Async request',
        info: 'Insert a simple `fetch()` + `json()` scaffold.',
    }),
];

const htmlCompletionSource = completeFromList(HTML_COMPLETION_ENTRIES);
const cssCompletionSource = completeFromList(CSS_COMPLETION_ENTRIES);
const javascriptCompletionSource = completeFromList(JAVASCRIPT_COMPLETION_ENTRIES);

export function getLearningHtmlCompletionEntries() {
    return HTML_COMPLETION_ENTRIES;
}

export function getLearningCssCompletionEntries() {
    return CSS_COMPLETION_ENTRIES;
}

export function getLearningJavaScriptCompletionEntries() {
    return JAVASCRIPT_COMPLETION_ENTRIES;
}

export function htmlLearningSupport() {
    return htmlLanguage.data.of({
        autocomplete: htmlCompletionSource,
    });
}

export function cssLearningSupport() {
    return cssLanguage.data.of({
        autocomplete: cssCompletionSource,
    });
}

export function javascriptLearningSupport() {
    return javascriptLanguage.data.of({
        autocomplete: javascriptCompletionSource,
    });
}
