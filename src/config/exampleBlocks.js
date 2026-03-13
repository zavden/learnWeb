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
    css: {
        slot: 'style',
        heading: 'CSS',
        badgeLabel: 'CSS',
        badgeClass: 'css',
        enabled: true,
    },
    javascript: {
        slot: 'script',
        heading: 'JavaScript',
        badgeLabel: 'JS',
        badgeClass: 'js',
        enabled: true,
    },
    scss: {
        slot: 'style',
        heading: 'SCSS',
        badgeLabel: 'SCSS',
        badgeClass: 'css',
        enabled: false,
    },
    sass: {
        slot: 'style',
        heading: 'SASS',
        badgeLabel: 'SASS',
        badgeClass: 'css',
        enabled: false,
    },
    typescript: {
        slot: 'script',
        heading: 'TypeScript',
        badgeLabel: 'TS',
        badgeClass: 'js',
        enabled: false,
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
