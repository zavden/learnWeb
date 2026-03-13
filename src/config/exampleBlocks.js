export const SLOT_ORDER = ['app', 'markup', 'style', 'script'];

export const BLOCK_REGISTRY = {
    jsx: {
        slot: 'app',
        heading: 'JSX',
        badgeLabel: 'JSX',
        badgeClass: 'jsx',
        enabled: true,
    },
    tsx: {
        slot: 'app',
        heading: 'TSX',
        badgeLabel: 'TSX',
        badgeClass: 'tsx',
        enabled: true,
    },
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
        id: 'react-jsx',
        label: 'React JSX',
        metadata: { framework: 'react' },
        blocks: [
            {
                type: 'jsx',
                content: "function App() {\n  const [count, setCount] = React.useState(0);\n\n  return (\n    <main className=\"react-app\">\n      <h1>Hello React</h1>\n      <button type=\"button\" onClick={() => setCount(count + 1)}>\n        Clicked {count} times\n      </button>\n    </main>\n  );\n}",
            },
        ],
    },
    {
        id: 'react-jsx-css',
        label: 'React JSX + CSS',
        metadata: { framework: 'react' },
        blocks: [
            {
                type: 'jsx',
                content: "function App() {\n  const [count, setCount] = React.useState(0);\n\n  return (\n    <main className=\"react-app\">\n      <p className=\"eyebrow\">React single-file</p>\n      <h1>Hello React</h1>\n      <button type=\"button\" onClick={() => setCount(count + 1)}>\n        Clicked {count} times\n      </button>\n    </main>\n  );\n}",
            },
            {
                type: 'css',
                content: ".react-app {\n  display: grid;\n  gap: 12px;\n  max-width: 360px;\n  padding: 24px;\n  border-radius: 18px;\n  background: linear-gradient(160deg, #eff6ff, #dbeafe);\n  color: #1e3a8a;\n  font-family: system-ui, sans-serif;\n}\n\n.eyebrow {\n  margin: 0;\n  font-size: 12px;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n  color: #2563eb;\n}\n\n.react-app h1 {\n  margin: 0;\n  font-size: 28px;\n}\n\n.react-app button {\n  justify-self: start;\n  border: 0;\n  border-radius: 999px;\n  padding: 10px 16px;\n  background: #2563eb;\n  color: #ffffff;\n  cursor: pointer;\n}",
            },
        ],
    },
    {
        id: 'react-tsx',
        label: 'React TSX',
        metadata: { framework: 'react' },
        blocks: [
            {
                type: 'tsx',
                content: "function App() {\n  const [count, setCount] = React.useState<number>(0);\n\n  return (\n    <main className=\"react-app\">\n      <h1>Hello React TSX</h1>\n      <button type=\"button\" onClick={() => setCount(count + 1)}>\n        Clicked {count} times\n      </button>\n    </main>\n  );\n}",
            },
        ],
    },
    {
        id: 'react-tsx-css',
        label: 'React TSX + CSS',
        metadata: { framework: 'react' },
        blocks: [
            {
                type: 'tsx',
                content: "type Todo = {\n  id: number;\n  label: string;\n  done: boolean;\n};\n\nfunction App() {\n  const [items, setItems] = React.useState<Todo[]>([\n    { id: 1, label: 'Read props', done: true },\n    { id: 2, label: 'Use state', done: false },\n  ]);\n\n  function toggleItem(id: number) {\n    setItems((current) => current.map((item) => (\n      item.id === id ? { ...item, done: !item.done } : item\n    )));\n  }\n\n  return (\n    <main className=\"react-app todo-app\">\n      <h1>React TSX Todo</h1>\n      <ul>\n        {items.map((item) => (\n          <li key={item.id}>\n            <label>\n              <input\n                type=\"checkbox\"\n                checked={item.done}\n                onChange={() => toggleItem(item.id)}\n              />\n              <span>{item.label}</span>\n            </label>\n          </li>\n        ))}\n      </ul>\n    </main>\n  );\n}",
            },
            {
                type: 'css',
                content: ".todo-app {\n  max-width: 420px;\n  padding: 24px;\n  border-radius: 20px;\n  background: #0f172a;\n  color: #e2e8f0;\n  font-family: system-ui, sans-serif;\n}\n\n.todo-app h1 {\n  margin: 0 0 16px;\n  font-size: 26px;\n}\n\n.todo-app ul {\n  margin: 0;\n  padding: 0;\n  list-style: none;\n  display: grid;\n  gap: 10px;\n}\n\n.todo-app label {\n  display: flex;\n  gap: 10px;\n  align-items: center;\n  padding: 12px 14px;\n  border-radius: 12px;\n  background: rgba(148, 163, 184, 0.14);\n}\n\n.todo-app input {\n  accent-color: #38bdf8;\n}",
            },
        ],
    },
    {
        id: 'react-project-jsx',
        label: 'React Project JSX',
        metadata: {
            framework: 'react',
            mode: 'multi-file',
            entry: 'src/main.jsx',
        },
        files: [
            {
                path: 'src/main.jsx',
                language: 'jsx',
                role: 'entry',
                content: "import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport { App } from './App.jsx';\nimport './styles.css';\n\nconst root = createRoot(document.getElementById('root'));\nroot.render(<App />);",
            },
            {
                path: 'src/App.jsx',
                language: 'jsx',
                role: 'app',
                content: "import React from 'react';\nimport { CounterPanel } from './components/CounterPanel.jsx';\nimport { Timeline } from './components/Timeline.jsx';\n\nexport function App() {\n  return (\n    <main className=\"playground\">\n      <header className=\"hero\">\n        <p className=\"eyebrow\">React multi-file</p>\n        <h1>__EXAMPLE_NAME__</h1>\n        <p>Use tabs or vertical panels to inspect each file.</p>\n      </header>\n      <CounterPanel />\n      <Timeline />\n    </main>\n  );\n}",
            },
            {
                path: 'src/components/CounterPanel.jsx',
                language: 'jsx',
                role: 'component',
                content: "import React from 'react';\n\nexport function CounterPanel() {\n  const [count, setCount] = React.useState(0);\n  const [step, setStep] = React.useState(1);\n\n  return (\n    <section className=\"card stack\">\n      <h2>Counter Hook</h2>\n      <p>Count: {count}</p>\n      <div className=\"controls\">\n        <button type=\"button\" onClick={() => setCount((value) => value - step)}>-</button>\n        <button type=\"button\" onClick={() => setCount((value) => value + step)}>+</button>\n        <label>\n          Step\n          <input\n            type=\"range\"\n            min=\"1\"\n            max=\"5\"\n            value={step}\n            onChange={(event) => setStep(Number(event.target.value))}\n          />\n        </label>\n      </div>\n    </section>\n  );\n}",
            },
            {
                path: 'src/components/Timeline.jsx',
                language: 'jsx',
                role: 'component',
                content: "import React from 'react';\n\nconst milestones = [\n  'Props',\n  'State',\n  'Effects',\n  'Custom hooks',\n];\n\nexport function Timeline() {\n  return (\n    <section className=\"card\">\n      <h2>Learning Path</h2>\n      <ol className=\"timeline\">\n        {milestones.map((item) => (\n          <li key={item}>{item}</li>\n        ))}\n      </ol>\n    </section>\n  );\n}",
            },
            {
                path: 'src/styles.css',
                language: 'css',
                role: 'style',
                content: ":root {\n  color-scheme: light;\n}\n\nbody {\n  margin: 0;\n  background: linear-gradient(180deg, #f8fafc, #e2e8f0);\n  color: #0f172a;\n  font-family: system-ui, sans-serif;\n}\n\n.playground {\n  display: grid;\n  gap: 16px;\n  max-width: 720px;\n  margin: 0 auto;\n}\n\n.hero {\n  display: grid;\n  gap: 6px;\n}\n\n.eyebrow {\n  margin: 0;\n  font-size: 12px;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n  color: #2563eb;\n}\n\n.hero h1,\n.card h2,\n.card p {\n  margin: 0;\n}\n\n.card {\n  display: grid;\n  gap: 12px;\n  padding: 18px;\n  border-radius: 18px;\n  background: rgba(255, 255, 255, 0.78);\n  border: 1px solid rgba(148, 163, 184, 0.22);\n  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.08);\n}\n\n.controls {\n  display: flex;\n  flex-wrap: wrap;\n  gap: 10px;\n  align-items: center;\n}\n\n.controls button {\n  border: 0;\n  border-radius: 999px;\n  padding: 10px 14px;\n  background: #2563eb;\n  color: #ffffff;\n  cursor: pointer;\n}\n\n.controls label {\n  display: grid;\n  gap: 6px;\n  font-size: 13px;\n}\n\n.timeline {\n  display: grid;\n  gap: 10px;\n  padding-left: 20px;\n}",
            },
        ],
    },
    {
        id: 'react-project-tsx',
        label: 'React Project TSX + SCSS',
        metadata: {
            framework: 'react',
            mode: 'multi-file',
            entry: 'src/main.tsx',
        },
        files: [
            {
                path: 'src/main.tsx',
                language: 'tsx',
                role: 'entry',
                content: "import React from 'react';\nimport { createRoot } from 'react-dom/client';\nimport { App } from './App.tsx';\nimport './styles.scss';\n\nconst root = createRoot(document.getElementById('root') as HTMLElement);\nroot.render(<App />);",
            },
            {
                path: 'src/App.tsx',
                language: 'tsx',
                role: 'app',
                content: "import React from 'react';\nimport { StatusCard } from './components/StatusCard.tsx';\nimport { useStepCounter } from './hooks/useStepCounter.ts';\n\nexport function App() {\n  const counter = useStepCounter(2);\n\n  return (\n    <main className=\"dashboard\">\n      <header className=\"dashboard__hero\">\n        <p className=\"dashboard__eyebrow\">React TSX multi-file</p>\n        <h1>__EXAMPLE_NAME__</h1>\n      </header>\n      <StatusCard label=\"Current value\" value={counter.count} />\n      <div className=\"dashboard__actions\">\n        <button type=\"button\" onClick={counter.decrement}>Decrease</button>\n        <button type=\"button\" onClick={counter.increment}>Increase</button>\n      </div>\n    </main>\n  );\n}",
            },
            {
                path: 'src/components/StatusCard.tsx',
                language: 'tsx',
                role: 'component',
                content: "type StatusCardProps = {\n  label: string;\n  value: number;\n};\n\nexport function StatusCard({ label, value }: StatusCardProps) {\n  return (\n    <section className=\"status-card\">\n      <span>{label}</span>\n      <strong>{value}</strong>\n    </section>\n  );\n}",
            },
            {
                path: 'src/hooks/useStepCounter.ts',
                language: 'typescript',
                role: 'hook',
                content: "import React from 'react';\n\ntype CounterApi = {\n  count: number;\n  increment: () => void;\n  decrement: () => void;\n};\n\nexport function useStepCounter(step: number): CounterApi {\n  const [count, setCount] = React.useState<number>(step);\n\n  return {\n    count,\n    increment: () => setCount((value) => value + step),\n    decrement: () => setCount((value) => value - step),\n  };\n}",
            },
            {
                path: 'src/styles.scss',
                language: 'scss',
                role: 'style',
                content: "$bg: #0f172a;\n$accent: #38bdf8;\n$surface: rgba(15, 23, 42, 0.88);\n\nbody {\n  margin: 0;\n  background: radial-gradient(circle at top, #1e293b, $bg 68%);\n  color: #e2e8f0;\n  font-family: system-ui, sans-serif;\n}\n\n.dashboard {\n  display: grid;\n  gap: 16px;\n  max-width: 520px;\n  margin: 0 auto;\n\n  &__hero {\n    display: grid;\n    gap: 8px;\n  }\n\n  &__eyebrow {\n    margin: 0;\n    font-size: 12px;\n    letter-spacing: 0.08em;\n    text-transform: uppercase;\n    color: $accent;\n  }\n\n  &__actions {\n    display: flex;\n    gap: 10px;\n  }\n\n  button {\n    border: 0;\n    border-radius: 999px;\n    padding: 10px 16px;\n    background: $accent;\n    color: $bg;\n    cursor: pointer;\n    font-weight: 700;\n  }\n}\n\n.status-card {\n  display: grid;\n  gap: 8px;\n  padding: 18px;\n  border: 1px solid rgba($accent, 0.25);\n  border-radius: 18px;\n  background: $surface;\n\n  strong {\n    font-size: 42px;\n    color: $accent;\n  }\n}",
            },
        ],
    },
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
