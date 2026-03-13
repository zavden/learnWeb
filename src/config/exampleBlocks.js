export const SLOT_ORDER = ['markup', 'style', 'script'];

export const BLOCK_REGISTRY = {
    html: {
        slot: 'markup',
        heading: 'HTML',
        badgeLabel: 'HTML',
        badgeClass: 'html',
        enabled: true,
    },
    svg: {
        slot: 'markup',
        heading: 'SVG',
        badgeLabel: 'SVG',
        badgeClass: 'svg',
        enabled: true,
    },
    pug: {
        slot: 'markup',
        heading: 'Pug',
        badgeLabel: 'PUG',
        badgeClass: 'pug',
        enabled: true,
    },
    css: {
        slot: 'style',
        heading: 'CSS',
        badgeLabel: 'CSS',
        badgeClass: 'css',
        enabled: true,
    },
    scss: {
        slot: 'style',
        heading: 'SCSS',
        badgeLabel: 'SCSS',
        badgeClass: 'scss',
        enabled: true,
    },
    javascript: {
        slot: 'script',
        heading: 'JavaScript',
        badgeLabel: 'JS',
        badgeClass: 'js',
        enabled: true,
    },
    sass: {
        slot: 'style',
        heading: 'SASS',
        badgeLabel: 'SASS',
        badgeClass: 'scss',
        enabled: true,
    },
    typescript: {
        slot: 'script',
        heading: 'TypeScript',
        badgeLabel: 'TS',
        badgeClass: 'ts',
        enabled: true,
    },
};

export const BLOCK_ALIASES = {
    js: 'javascript',
    ts: 'typescript',
};

export const SESSION_PRESETS = [
    {
        id: 'html',
        label: 'HTML',
        blocks: [
            { type: 'html', content: '<h1>Hello World</h1>' },
        ],
    },
    {
        id: 'html-css',
        label: 'HTML + CSS',
        blocks: [
            { type: 'html', content: '<h1 class="title">Hello World</h1>' },
            { type: 'css', content: '.title {\n  color: #58a6ff;\n}' },
        ],
    },
    {
        id: 'html-css-javascript',
        label: 'HTML + CSS + JavaScript',
        blocks: [
            { type: 'html', content: '<h1 class="title">Hello World</h1>' },
            { type: 'css', content: '.title {\n  color: #58a6ff;\n}' },
            { type: 'javascript', content: "console.log('Hello from JavaScript');" },
        ],
    },
    {
        id: 'html-scss',
        label: 'HTML + SCSS',
        blocks: [
            { type: 'html', content: '<section class="card"><h1>Hello World</h1><p>SCSS preset</p></section>' },
            { type: 'scss', content: '$accent: #58a6ff;\n.card {\n  padding: 24px;\n  border: 1px solid rgba($accent, 0.35);\n  h1 { color: $accent; }\n}' },
        ],
    },
    {
        id: 'html-typescript',
        label: 'HTML + TypeScript',
        blocks: [
            { type: 'html', content: '<button id="counter">Clicked 0 times</button>' },
            { type: 'typescript', content: "let count: number = 0;\nconst button = document.getElementById('counter') as HTMLButtonElement | null;\nbutton?.addEventListener('click', () => {\n  count += 1;\n  button.textContent = `Clicked ${count} times`;\n});" },
        ],
    },
    {
        id: 'svg',
        label: 'SVG',
        blocks: [
            {
                type: 'svg',
                content: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">\n  <circle cx="60" cy="60" r="44" fill="#58a6ff" />\n</svg>',
            },
        ],
    },
    {
        id: 'svg-css',
        label: 'SVG + CSS',
        blocks: [
            {
                type: 'svg',
                content: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">\n  <circle class="dot" cx="60" cy="60" r="44" />\n</svg>',
            },
            { type: 'css', content: '.dot {\n  fill: #58a6ff;\n}' },
        ],
    },
    {
        id: 'svg-css-javascript',
        label: 'SVG + CSS + JavaScript',
        blocks: [
            {
                type: 'svg',
                content: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">\n  <circle class="dot" cx="60" cy="60" r="44" />\n</svg>',
            },
            { type: 'css', content: '.dot {\n  fill: #58a6ff;\n  transition: transform 200ms ease;\n}' },
            {
                type: 'javascript',
                content: "const dot = document.querySelector('.dot');\nif (dot) {\n  dot.addEventListener('click', () => {\n    dot.style.transform = 'scale(0.9)';\n    setTimeout(() => { dot.style.transform = ''; }, 150);\n  });\n}",
            },
        ],
    },
    {
        id: 'svg-sass',
        label: 'SVG + SASS',
        blocks: [
            {
                type: 'svg',
                content: '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">\n  <rect class="frame" x="18" y="18" width="84" height="84" rx="14" />\n</svg>',
            },
            { type: 'sass', content: '$frame: #39d2c0\n.frame\n  fill: rgba($frame, 0.15)\n  stroke: $frame\n  stroke-width: 4' },
        ],
    },
    {
        id: 'pug',
        label: 'Pug',
        blocks: [
            { type: 'pug', content: 'main.card\n  h1 Hello from Pug\n  p This markup is compiled before preview.' },
        ],
    },
    {
        id: 'pug-scss',
        label: 'Pug + SCSS',
        blocks: [
            { type: 'pug', content: 'main.card\n  h1 Hello from Pug\n  p SCSS is compiled to CSS before preview.' },
            { type: 'scss', content: '$accent: #f0883e;\n.card {\n  padding: 24px;\n  background: #0d1117;\n  color: #e6edf3;\n  h1 { color: $accent; }\n}' },
        ],
    },
    {
        id: 'pug-typescript',
        label: 'Pug + TypeScript',
        blocks: [
            { type: 'pug', content: 'button#hello-btn Press me' },
            { type: 'typescript', content: "const button = document.getElementById('hello-btn') as HTMLButtonElement | null;\nbutton?.addEventListener('click', () => {\n  button.textContent = 'Pressed';\n});" },
        ],
    },
];

export function normalizeBlockType(type = '') {
    const normalized = String(type).trim().toLowerCase();
    if (!normalized) return '';
    return BLOCK_ALIASES[normalized] || normalized;
}

export function getBlockDefinition(type = '') {
    const normalized = normalizeBlockType(type);
    return BLOCK_REGISTRY[normalized] || null;
}

export function isEnabledBlockType(type = '') {
    const definition = getBlockDefinition(type);
    return Boolean(definition && definition.enabled);
}

export function sortBlocks(blocks = []) {
    return [...blocks].sort((left, right) => {
        const leftIndex = SLOT_ORDER.indexOf(left.slot);
        const rightIndex = SLOT_ORDER.indexOf(right.slot);
        return leftIndex - rightIndex;
    });
}

export function deriveSessionId(blocks = []) {
    return sortBlocks(blocks)
        .map((block) => block.type)
        .join('-');
}

export function getSessionPreset(id) {
    return SESSION_PRESETS.find((preset) => preset.id === id)
        || SESSION_PRESETS.find((preset) => preset.id === 'html-css-javascript')
        || SESSION_PRESETS[0];
}
