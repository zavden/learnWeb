export const SLOT_ORDER = ['app', 'markup', 'style', 'script', 'vertex', 'fragment'];

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
    'html-full': {
        slot: 'markup',
        heading: 'HTML-FULL',
        badgeLabel: 'HTML-FULL',
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
    vertex: {
        slot: 'vertex',
        heading: 'Vertex',
        badgeLabel: 'VERT',
        badgeClass: 'shader',
        enabled: true,
    },
    fragment: {
        slot: 'fragment',
        heading: 'Fragment',
        badgeLabel: 'FRAG',
        badgeClass: 'shader',
        enabled: true,
    },
};

export const BLOCK_ALIASES = {
    frag: 'fragment',
    fs: 'fragment',
    'html-b': 'html',
    htmlfull: 'html-full',
    'html_full': 'html-full',
    js: 'javascript',
    ts: 'typescript',
    vert: 'vertex',
    vs: 'vertex',
};

export const SESSION_PRESETS = [
    {
        id: 'shader-basic',
        label: 'Shader Basic',
        metadata: {
            renderer: 'shader',
            resolution: '800x600',
        },
        blocks: [
            {
                type: 'vertex',
                content: "attribute vec2 a_position;\nvarying vec2 v_uv;\n\nvoid main() {\n  v_uv = a_position * 0.5 + 0.5;\n  gl_Position = vec4(a_position, 0.0, 1.0);\n}",
            },
            {
                type: 'fragment',
                content: "precision mediump float;\n\nuniform float u_time;\nuniform vec2 u_resolution;\nvarying vec2 v_uv;\n\nvoid main() {\n  vec2 uv = gl_FragCoord.xy / u_resolution;\n  gl_FragColor = vec4(uv, 0.5 + 0.5 * sin(u_time), 1.0);\n}",
            },
        ],
    },
    {
        id: 'shader-time',
        label: 'Shader Time Animation',
        metadata: {
            renderer: 'shader',
            resolution: '960x540',
        },
        blocks: [
            {
                type: 'vertex',
                content: "attribute vec2 a_position;\nvarying vec2 v_uv;\n\nvoid main() {\n  v_uv = a_position * 0.5 + 0.5;\n  gl_Position = vec4(a_position, 0.0, 1.0);\n}",
            },
            {
                type: 'fragment',
                content: "precision mediump float;\n\nuniform float u_time;\nuniform vec2 u_resolution;\n\nvoid main() {\n  vec2 uv = gl_FragCoord.xy / u_resolution;\n  float wave = 0.5 + 0.5 * sin(u_time * 2.0 + uv.x * 10.0);\n  float glow = 0.5 + 0.5 * cos(u_time * 1.3 + uv.y * 8.0);\n  gl_FragColor = vec4(uv.x, wave, glow, 1.0);\n}",
            },
        ],
    },
    {
        id: 'shader-mouse',
        label: 'Shader Mouse Interaction',
        metadata: {
            renderer: 'shader',
            resolution: '800x800',
        },
        blocks: [
            {
                type: 'vertex',
                content: "attribute vec2 a_position;\nvarying vec2 v_uv;\n\nvoid main() {\n  v_uv = a_position * 0.5 + 0.5;\n  gl_Position = vec4(a_position, 0.0, 1.0);\n}",
            },
            {
                type: 'fragment',
                content: "precision mediump float;\n\nuniform vec2 u_mouse;\nuniform float u_mouse_pressed;\nuniform vec2 u_resolution;\n\nvoid main() {\n  vec2 uv = gl_FragCoord.xy / u_resolution;\n  vec2 mouse = u_mouse / u_resolution;\n  float d = distance(uv, mouse);\n  float ring = smoothstep(0.22, 0.18, d);\n  float core = smoothstep(0.08, 0.02, d);\n  vec3 base = vec3(0.05, 0.08, 0.14) + vec3(uv.x * 0.18, uv.y * 0.12, 0.20);\n  vec3 glow = mix(vec3(0.22, 0.72, 1.0), vec3(1.0, 0.42, 0.28), u_mouse_pressed);\n  vec3 color = base + glow * ring + vec3(1.0) * core;\n  gl_FragColor = vec4(color, 1.0);\n}",
            },
        ],
    },
    {
        id: 'shader-frame',
        label: 'Shader Frame Counter',
        metadata: {
            renderer: 'shader',
            resolution: '1024x576',
        },
        blocks: [
            {
                type: 'vertex',
                content: "attribute vec2 a_position;\nvarying vec2 v_uv;\n\nvoid main() {\n  v_uv = a_position * 0.5 + 0.5;\n  gl_Position = vec4(a_position, 0.0, 1.0);\n}",
            },
            {
                type: 'fragment',
                content: "precision mediump float;\n\nuniform float u_frame;\nuniform vec2 u_resolution;\n\nvoid main() {\n  vec2 uv = gl_FragCoord.xy / u_resolution;\n  float stepped = mod(floor(u_frame / 6.0), 20.0) / 20.0;\n  float stripes = step(0.5, fract(uv.y * 12.0 + stepped * 6.0));\n  vec3 color = mix(vec3(0.08, 0.11, 0.18), vec3(0.95, 0.62, 0.18), stripes);\n  color += vec3(stepped * 0.35, uv.x * 0.18, 0.05);\n  gl_FragColor = vec4(color, 1.0);\n}",
            },
        ],
    },
    {
        id: 'shader-custom-uniforms',
        label: 'Shader Custom Uniforms',
        metadata: {
            renderer: 'shader',
            resolution: '960x540',
            shader_uniforms: 'intensity:float=0.8|invert:bool=false|focus:vec2=0.5,0.5',
        },
        blocks: [
            {
                type: 'vertex',
                content: "attribute vec2 a_position;\nvarying vec2 v_uv;\n\nvoid main() {\n  v_uv = a_position * 0.5 + 0.5;\n  gl_Position = vec4(a_position, 0.0, 1.0);\n}",
            },
            {
                type: 'fragment',
                content: "precision mediump float;\n\nuniform vec2 u_resolution;\nuniform float intensity;\nuniform bool invert;\nuniform vec2 focus;\n\nvoid main() {\n  vec2 uv = gl_FragCoord.xy / u_resolution;\n  float distanceToFocus = distance(uv, focus);\n  float ring = smoothstep(0.45, 0.08, distanceToFocus);\n  vec3 color = vec3(uv.x, uv.y, ring * intensity);\n\n  if (invert) {\n    color = 1.0 - color;\n  }\n\n  gl_FragColor = vec4(color, 1.0);\n}",
            },
        ],
    },
    {
        id: 'shader-vector-uniforms',
        label: 'Shader Vector Uniforms',
        metadata: {
            renderer: 'shader',
            resolution: '960x540',
            shader_uniforms: 'tint:vec3=0.15,0.75,1|mask:vec4=1,0.45,0.2,0.8',
        },
        blocks: [
            {
                type: 'vertex',
                content: "attribute vec2 a_position;\nvarying vec2 v_uv;\n\nvoid main() {\n  v_uv = a_position * 0.5 + 0.5;\n  gl_Position = vec4(a_position, 0.0, 1.0);\n}",
            },
            {
                type: 'fragment',
                content: "precision mediump float;\n\nuniform vec2 u_resolution;\nuniform vec3 tint;\nuniform vec4 mask;\n\nvoid main() {\n  vec2 uv = gl_FragCoord.xy / u_resolution;\n  vec3 base = vec3(uv.x, uv.y, 1.0 - uv.x);\n  vec3 color = mix(base, tint, mask.w);\n  color *= mix(vec3(1.0), mask.rgb, 0.5);\n  gl_FragColor = vec4(color, 1.0);\n}",
            },
        ],
    },
    {
        id: 'shader-ranged-uniforms',
        label: 'Shader Ranged Uniforms',
        metadata: {
            renderer: 'shader',
            resolution: '960x540',
            shader_uniforms: 'intensity:float=0.8[0,1.5,0.01]|bands:int=6[2,18,1]',
        },
        blocks: [
            {
                type: 'vertex',
                content: "attribute vec2 a_position;\nvarying vec2 v_uv;\n\nvoid main() {\n  v_uv = a_position * 0.5 + 0.5;\n  gl_Position = vec4(a_position, 0.0, 1.0);\n}",
            },
            {
                type: 'fragment',
                content: "precision mediump float;\n\nuniform vec2 u_resolution;\nuniform float intensity;\nuniform int bands;\n\nvoid main() {\n  vec2 uv = gl_FragCoord.xy / u_resolution;\n  float bandCount = max(float(bands), 1.0);\n  float stepped = floor(uv.x * bandCount) / bandCount;\n  vec3 color = vec3(stepped * intensity, uv.y * intensity, 1.0 - stepped * 0.5);\n  gl_FragColor = vec4(color, 1.0);\n}",
            },
        ],
    },
    {
        id: 'shader-textures',
        label: 'Shader Textures',
        metadata: {
            renderer: 'shader',
            resolution: '960x540',
            shader_textures: 'u_checker=checker.svg|u_spot=spotlight.svg',
        },
        blocks: [
            {
                type: 'vertex',
                content: "attribute vec2 a_position;\nvarying vec2 v_uv;\n\nvoid main() {\n  v_uv = a_position * 0.5 + 0.5;\n  gl_Position = vec4(a_position, 0.0, 1.0);\n}",
            },
            {
                type: 'fragment',
                content: "precision mediump float;\n\nuniform vec2 u_resolution;\nuniform sampler2D u_checker;\nuniform sampler2D u_spot;\n\nvoid main() {\n  vec2 uv = gl_FragCoord.xy / u_resolution;\n  vec3 checker = texture2D(u_checker, uv * 2.0).rgb;\n  vec3 spot = texture2D(u_spot, uv).rgb;\n  vec3 color = mix(checker, spot, 0.45);\n  gl_FragColor = vec4(color, 1.0);\n}",
            },
        ],
    },
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
        id: 'vue-javascript',
        label: 'Vue Composition + JavaScript',
        metadata: { framework: 'vue' },
        blocks: [
            {
                type: 'html',
                content: '<main class="vue-app">\n  <p class="eyebrow">Vue Composition API</p>\n  <h1>{{ title }}</h1>\n  <p>{{ summary }}</p>\n  <button type="button" @click="increment">Clicked {{ count }} times</button>\n</main>',
            },
            {
                type: 'javascript',
                content: "import { computed, ref } from 'vue';\n\nexport default {\n  setup() {\n    const title = ref('__EXAMPLE_NAME__');\n    const count = ref(0);\n    const summary = computed(() => `Reactive count: ${count.value}`);\n    const increment = () => {\n      count.value += 1;\n    };\n\n    return {\n      count,\n      increment,\n      summary,\n      title,\n    };\n  },\n};",
            },
        ],
    },
    {
        id: 'vue-css-javascript',
        label: 'Vue Composition + CSS + JavaScript',
        metadata: { framework: 'vue' },
        blocks: [
            {
                type: 'html',
                content: '<main class="vue-card">\n  <p class="eyebrow">Vue Composition API</p>\n  <h1>{{ title }}</h1>\n  <p>{{ message }}</p>\n  <button type="button" @click="toggleMood">{{ moodLabel }}</button>\n</main>',
            },
            {
                type: 'css',
                content: ".vue-card {\n  display: grid;\n  gap: 12px;\n  max-width: 420px;\n  padding: 24px;\n  border-radius: 18px;\n  background: linear-gradient(180deg, #f8fafc, #dbeafe);\n  color: #1e3a8a;\n  font-family: system-ui, sans-serif;\n}\n\n.eyebrow {\n  margin: 0;\n  font-size: 12px;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n  color: #2563eb;\n}\n\n.vue-card h1,\n.vue-card p {\n  margin: 0;\n}\n\n.vue-card button {\n  justify-self: start;\n  border: 0;\n  border-radius: 999px;\n  padding: 10px 16px;\n  background: #2563eb;\n  color: #ffffff;\n  cursor: pointer;\n}",
            },
            {
                type: 'javascript',
                content: "import { computed, ref, watch } from 'vue';\n\nexport default {\n  setup() {\n    const title = ref('__EXAMPLE_NAME__');\n    const happy = ref(true);\n    const moodLabel = computed(() => (happy.value ? 'Happy' : 'Calm'));\n    const message = computed(() => (\n      happy.value ? 'Computed state stays reactive.' : 'Watch and refs also work here.'\n    ));\n\n    watch(happy, (value) => {\n      console.info('Mood changed:', value ? 'happy' : 'calm');\n    });\n\n    const toggleMood = () => {\n      happy.value = !happy.value;\n    };\n\n    return {\n      happy,\n      message,\n      moodLabel,\n      title,\n      toggleMood,\n    };\n  },\n};",
            },
        ],
    },
    {
        id: 'vue-typescript',
        label: 'Vue Composition + TypeScript',
        metadata: { framework: 'vue' },
        blocks: [
            {
                type: 'html',
                content: '<section class="vue-ts">\n  <h1>{{ title }}</h1>\n  <p>Current step: {{ step }}</p>\n  <p>Double step: {{ doubled }}</p>\n  <button type="button" @click="advance">Advance</button>\n</section>',
            },
            {
                type: 'typescript',
                content: "import { computed, defineComponent, ref } from 'vue';\n\nexport default defineComponent({\n  setup() {\n    const title = ref('__EXAMPLE_NAME__');\n    const step = ref<number>(1);\n    const doubled = computed(() => step.value * 2);\n    const advance = () => {\n      step.value += 1;\n    };\n\n    return {\n      advance,\n      doubled,\n      step,\n      title,\n    };\n  },\n});",
            },
            {
                type: 'css',
                content: ".vue-ts {\n  display: grid;\n  gap: 10px;\n  max-width: 360px;\n  padding: 24px;\n  border-radius: 16px;\n  background: #0f172a;\n  color: #e2e8f0;\n  font-family: system-ui, sans-serif;\n}\n\n.vue-ts h1,\n.vue-ts p {\n  margin: 0;\n}\n\n.vue-ts button {\n  justify-self: start;\n  border: 0;\n  border-radius: 999px;\n  padding: 10px 16px;\n  background: #38bdf8;\n  color: #0f172a;\n  cursor: pointer;\n  font-weight: 700;\n}",
            },
        ],
    },
    {
        id: 'vue-project-javascript',
        label: 'Vue Project JavaScript',
        metadata: {
            framework: 'vue',
            mode: 'multi-file',
            entry: 'src/main.js',
        },
        files: [
            {
                path: 'src/main.js',
                language: 'javascript',
                role: 'entry',
                content: "import { createApp } from 'vue';\nimport App from './App.js';\nimport './styles.css';\n\ncreateApp(App).mount('#app');",
            },
            {
                path: 'src/App.js',
                language: 'javascript',
                role: 'app',
                content: "import { computed, defineComponent, ref } from 'vue';\nimport CounterPanel from './components/CounterPanel.js';\nimport LessonList from './components/LessonList.js';\nimport render from './App.html';\n\nexport default defineComponent({\n  name: 'App',\n  components: {\n    CounterPanel,\n    LessonList,\n  },\n  setup() {\n    const title = ref('__EXAMPLE_NAME__');\n    const lessonCount = ref(2);\n    const subtitle = computed(() => `There are ${lessonCount.value} reactive pieces in this demo.`);\n    const registerLesson = () => {\n      lessonCount.value += 1;\n    };\n\n    return {\n      lessonCount,\n      registerLesson,\n      subtitle,\n      title,\n    };\n  },\n  render,\n});",
            },
            {
                path: 'src/App.html',
                language: 'html',
                role: 'markup',
                content: "<main class=\"playground\">\n  <header class=\"hero\">\n    <p class=\"eyebrow\">Vue multi-file</p>\n    <h1>{{ title }}</h1>\n    <p>{{ subtitle }}</p>\n  </header>\n  <CounterPanel @register=\"registerLesson\" />\n  <LessonList :count=\"lessonCount\" />\n</main>",
            },
            {
                path: 'src/components/CounterPanel.js',
                language: 'javascript',
                role: 'component',
                content: "import { defineComponent, ref } from 'vue';\nimport render from './CounterPanel.html';\n\nexport default defineComponent({\n  name: 'CounterPanel',\n  emits: ['register'],\n  setup(_, { emit }) {\n    const count = ref(0);\n    const increment = () => {\n      count.value += 1;\n      emit('register');\n    };\n\n    return {\n      count,\n      increment,\n    };\n  },\n  render,\n});",
            },
            {
                path: 'src/components/CounterPanel.html',
                language: 'html',
                role: 'markup',
                content: "<section class=\"card stack\">\n  <h2>Counter component</h2>\n  <p>Each click emits an event to the parent.</p>\n  <button type=\"button\" @click=\"increment\">Clicked {{ count }} times</button>\n</section>",
            },
            {
                path: 'src/components/LessonList.js',
                language: 'javascript',
                role: 'component',
                content: "import { computed, defineComponent } from 'vue';\nimport render from './LessonList.html';\n\nexport default defineComponent({\n  name: 'LessonList',\n  props: {\n    count: {\n      type: Number,\n      required: true,\n    },\n  },\n  setup(props) {\n    const lessons = computed(() => Array.from({ length: props.count }, (_, index) => `Lesson ${index + 1}`));\n\n    return {\n      lessons,\n    };\n  },\n  render,\n});",
            },
            {
                path: 'src/components/LessonList.html',
                language: 'html',
                role: 'markup',
                content: "<section class=\"card\">\n  <h2>Lesson list</h2>\n  <ol class=\"timeline\">\n    <li v-for=\"lesson in lessons\" :key=\"lesson\">{{ lesson }}</li>\n  </ol>\n</section>",
            },
            {
                path: 'src/styles.css',
                language: 'css',
                role: 'style',
                content: ":root {\n  color-scheme: light;\n}\n\nbody {\n  margin: 0;\n  background: linear-gradient(180deg, #f8fafc, #e2e8f0);\n  color: #0f172a;\n  font-family: system-ui, sans-serif;\n}\n\n.playground {\n  display: grid;\n  gap: 16px;\n  max-width: 720px;\n  margin: 0 auto;\n}\n\n.hero {\n  display: grid;\n  gap: 6px;\n}\n\n.eyebrow {\n  margin: 0;\n  font-size: 12px;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n  color: #2563eb;\n}\n\n.hero h1,\n.card h2,\n.card p {\n  margin: 0;\n}\n\n.card {\n  display: grid;\n  gap: 12px;\n  padding: 18px;\n  border-radius: 18px;\n  background: rgba(255, 255, 255, 0.78);\n  border: 1px solid rgba(148, 163, 184, 0.22);\n  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.08);\n}\n\n.stack {\n  align-items: start;\n}\n\nbutton {\n  justify-self: start;\n  border: 0;\n  border-radius: 999px;\n  padding: 10px 14px;\n  background: #2563eb;\n  color: #ffffff;\n  cursor: pointer;\n}\n\n.timeline {\n  display: grid;\n  gap: 10px;\n  padding-left: 20px;\n}\n",
            },
        ],
    },
    {
        id: 'vue-project-typescript',
        label: 'Vue Project TypeScript',
        metadata: {
            framework: 'vue',
            mode: 'multi-file',
            entry: 'src/main.ts',
        },
        files: [
            {
                path: 'src/main.ts',
                language: 'typescript',
                role: 'entry',
                content: "import { createApp } from 'vue';\nimport App from './App.ts';\nimport './styles.scss';\n\ncreateApp(App).mount('#app');",
            },
            {
                path: 'src/App.ts',
                language: 'typescript',
                role: 'app',
                content: "import { defineComponent, ref } from 'vue';\nimport StatusCard from './components/StatusCard.ts';\nimport { useStepCounter } from './composables/useStepCounter.ts';\nimport render from './App.html';\n\nexport default defineComponent({\n  name: 'App',\n  components: {\n    StatusCard,\n  },\n  setup() {\n    const title = ref('__EXAMPLE_NAME__');\n    const { count, decrement, increment } = useStepCounter(2);\n\n    return {\n      count,\n      decrement,\n      increment,\n      title,\n    };\n  },\n  render,\n});",
            },
            {
                path: 'src/App.html',
                language: 'html',
                role: 'markup',
                content: "<main class=\"dashboard\">\n  <header class=\"dashboard__hero\">\n    <p class=\"dashboard__eyebrow\">Vue TS multi-file</p>\n    <h1>{{ title }}</h1>\n  </header>\n  <StatusCard label=\"Current value\" :value=\"count\" />\n  <div class=\"dashboard__actions\">\n    <button type=\"button\" @click=\"decrement\">Decrease</button>\n    <button type=\"button\" @click=\"increment\">Increase</button>\n  </div>\n</main>",
            },
            {
                path: 'src/components/StatusCard.ts',
                language: 'typescript',
                role: 'component',
                content: "import { defineComponent, type PropType } from 'vue';\nimport render from './StatusCard.html';\n\nexport default defineComponent({\n  name: 'StatusCard',\n  props: {\n    label: {\n      type: String as PropType<string>,\n      required: true,\n    },\n    value: {\n      type: Number as PropType<number>,\n      required: true,\n    },\n  },\n  render,\n});",
            },
            {
                path: 'src/components/StatusCard.html',
                language: 'html',
                role: 'markup',
                content: "<section class=\"status-card\">\n  <span>{{ label }}</span>\n  <strong>{{ value }}</strong>\n</section>",
            },
            {
                path: 'src/composables/useStepCounter.ts',
                language: 'typescript',
                role: 'hook',
                content: "import { ref, type Ref } from 'vue';\n\nexport type StepCounterApi = {\n  count: Ref<number>;\n  increment: () => void;\n  decrement: () => void;\n};\n\nexport function useStepCounter(step: number): StepCounterApi {\n  const count = ref<number>(step);\n\n  return {\n    count,\n    increment: () => {\n      count.value += step;\n    },\n    decrement: () => {\n      count.value -= step;\n    },\n  };\n}\n",
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
        id: 'vue-project-sfc-javascript',
        label: 'Vue Project SFC JavaScript',
        metadata: {
            framework: 'vue',
            mode: 'multi-file',
            entry: 'src/main.js',
        },
        files: [
            {
                path: 'src/main.js',
                language: 'javascript',
                role: 'entry',
                content: "import { createApp } from 'vue';\nimport App from './App.vue';\nimport './styles.css';\n\ncreateApp(App).mount('#app');",
            },
            {
                path: 'src/App.vue',
                language: 'vue',
                role: 'app',
                content: "<template>\n  <main class=\"playground-shell\">\n    <header class=\"playground-shell__hero\">\n      <p class=\"playground-shell__eyebrow\">Vue SFC multi-file</p>\n      <h1>{{ title }}</h1>\n      <p>{{ summary }}</p>\n    </header>\n    <LessonCard :count=\"count\" @increment=\"increment\" />\n  </main>\n</template>\n\n<script setup>\nimport { computed } from 'vue';\nimport LessonCard from './components/LessonCard.vue';\nimport { useCounter } from './composables/useCounter.js';\n\nconst title = '__EXAMPLE_NAME__';\nconst { count, increment } = useCounter(2);\nconst summary = computed(() => `The current counter starts at ${count.value}.`);\n</script>\n\n<style scoped>\n.playground-shell {\n  display: grid;\n  gap: 16px;\n}\n\n.playground-shell__hero {\n  display: grid;\n  gap: 6px;\n}\n\n.playground-shell__eyebrow {\n  margin: 0;\n  font-size: 12px;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n  color: #2563eb;\n}\n\n.playground-shell h1,\n.playground-shell p {\n  margin: 0;\n}\n</style>",
            },
            {
                path: 'src/components/LessonCard.vue',
                language: 'vue',
                role: 'component',
                content: "<template>\n  <section class=\"lesson-card\">\n    <h2>Composition API + SFC</h2>\n    <p>Count: {{ count }}</p>\n    <button type=\"button\" @click=\"$emit('increment')\">Increment</button>\n  </section>\n</template>\n\n<script setup>\ndefineProps({\n  count: {\n    type: Number,\n    required: true,\n  },\n});\n\ndefineEmits(['increment']);\n</script>\n\n<style scoped>\n.lesson-card {\n  display: grid;\n  gap: 12px;\n  padding: 18px;\n  border-radius: 18px;\n  background: rgba(255, 255, 255, 0.82);\n  border: 1px solid rgba(148, 163, 184, 0.22);\n  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.08);\n}\n\n.lesson-card h2,\n.lesson-card p {\n  margin: 0;\n}\n\n.lesson-card button {\n  justify-self: start;\n  border: 0;\n  border-radius: 999px;\n  padding: 10px 14px;\n  background: #2563eb;\n  color: #ffffff;\n  cursor: pointer;\n}\n</style>",
            },
            {
                path: 'src/composables/useCounter.js',
                language: 'javascript',
                role: 'hook',
                content: "import { ref } from 'vue';\n\nexport function useCounter(initialValue = 0) {\n  const count = ref(initialValue);\n\n  return {\n    count,\n    increment: () => {\n      count.value += 1;\n    },\n  };\n}",
            },
            {
                path: 'src/styles.css',
                language: 'css',
                role: 'style',
                content: "body {\n  margin: 0;\n  background: linear-gradient(180deg, #f8fafc, #e2e8f0);\n  color: #0f172a;\n  font-family: system-ui, sans-serif;\n}\n\n#app {\n  min-height: 100vh;\n}\n\n.playground-shell {\n  max-width: 680px;\n  margin: 0 auto;\n}",
            },
        ],
    },
    {
        id: 'vue-project-sfc-typescript',
        label: 'Vue Project SFC TypeScript',
        metadata: {
            framework: 'vue',
            mode: 'multi-file',
            entry: 'src/main.ts',
        },
        files: [
            {
                path: 'src/main.ts',
                language: 'typescript',
                role: 'entry',
                content: "import { createApp } from 'vue';\nimport App from './App.vue';\nimport './styles.scss';\n\ncreateApp(App).mount('#app');",
            },
            {
                path: 'src/App.vue',
                language: 'vue',
                role: 'app',
                content: "<template>\n  <main class=\"dashboard\">\n    <header class=\"dashboard__hero\">\n      <p class=\"dashboard__eyebrow\">Vue SFC + TS</p>\n      <h1>{{ title }}</h1>\n      <p>{{ summary }}</p>\n    </header>\n    <StatusCard label=\"Current value\" :value=\"count\" :total=\"target\" />\n    <div class=\"dashboard__actions\">\n      <button type=\"button\" @click=\"decrement\">Decrease</button>\n      <button type=\"button\" @click=\"increment\">Increase</button>\n    </div>\n  </main>\n</template>\n\n<script setup lang=\"ts\">\nimport { computed } from 'vue';\nimport StatusCard from './components/StatusCard.vue';\nimport { useProgress } from './composables/useProgress.ts';\n\nconst title = '__EXAMPLE_NAME__';\nconst target = 12;\nconst { count, decrement, increment } = useProgress(4);\nconst summary = computed(() => `Goal progress: ${count.value}/${target}`);\n</script>\n\n<style scoped lang=\"scss\">\n.dashboard {\n  display: grid;\n  gap: 16px;\n\n  &__hero {\n    display: grid;\n    gap: 8px;\n  }\n\n  &__eyebrow {\n    margin: 0;\n    font-size: 12px;\n    letter-spacing: 0.08em;\n    text-transform: uppercase;\n    color: #38bdf8;\n  }\n\n  &__actions {\n    display: flex;\n    gap: 10px;\n  }\n\n  h1,\n  p {\n    margin: 0;\n  }\n\n  button {\n    border: 0;\n    border-radius: 999px;\n    padding: 10px 16px;\n    background: #38bdf8;\n    color: #0f172a;\n    cursor: pointer;\n    font-weight: 700;\n  }\n}\n</style>",
            },
            {
                path: 'src/components/StatusCard.vue',
                language: 'vue',
                role: 'component',
                content: "<template>\n  <section class=\"status-card\">\n    <span>{{ label }}</span>\n    <strong>{{ value }}</strong>\n    <small>Target: {{ total }}</small>\n  </section>\n</template>\n\n<script setup lang=\"ts\">\ndefineProps<{\n  label: string;\n  value: number;\n  total: number;\n}>();\n</script>\n\n<style scoped>\n.status-card {\n  display: grid;\n  gap: 8px;\n  padding: 18px;\n  border-radius: 18px;\n  background: rgba(15, 23, 42, 0.88);\n  border: 1px solid rgba(56, 189, 248, 0.25);\n  color: #e2e8f0;\n}\n\n.status-card strong {\n  font-size: 42px;\n  color: #38bdf8;\n}\n</style>",
            },
            {
                path: 'src/composables/useProgress.ts',
                language: 'typescript',
                role: 'hook',
                content: "import { ref, type Ref } from 'vue';\n\nexport type ProgressApi = {\n  count: Ref<number>;\n  increment: () => void;\n  decrement: () => void;\n};\n\nexport function useProgress(initialValue: number): ProgressApi {\n  const count = ref<number>(initialValue);\n\n  return {\n    count,\n    increment: () => {\n      count.value += 1;\n    },\n    decrement: () => {\n      count.value -= 1;\n    },\n  };\n}",
            },
            {
                path: 'src/styles.scss',
                language: 'scss',
                role: 'style',
                content: "$bg: #0f172a;\n\nbody {\n  margin: 0;\n  background: radial-gradient(circle at top, #1e293b, $bg 68%);\n  color: #e2e8f0;\n  font-family: system-ui, sans-serif;\n}\n\n#app {\n  min-height: 100vh;\n}\n\n.dashboard {\n  max-width: 560px;\n  margin: 0 auto;\n}",
            },
        ],
    },
    {
        id: 'react-project-json',
        label: 'React Project + JSON',
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
                content: "import React from 'react';\nimport lessonData from './data/lessons.json';\n\nexport function App() {\n  return (\n    <main className=\"json-demo\">\n      <header className=\"json-demo__hero\">\n        <img src=\"lesson-badge.svg\" alt=\"Lesson badge\" width=\"64\" height=\"64\" />\n        <div>\n          <p className=\"json-demo__eyebrow\">React + local JSON</p>\n          <h1>{lessonData.title}</h1>\n          <p>{lessonData.description}</p>\n        </div>\n      </header>\n      <ol className=\"json-demo__list\">\n        {lessonData.lessons.map((lesson) => (\n          <li key={lesson.id}>\n            <strong>{lesson.label}</strong>\n            <span>{lesson.duration}</span>\n          </li>\n        ))}\n      </ol>\n    </main>\n  );\n}",
            },
            {
                path: 'src/data/lessons.json',
                language: 'json',
                role: 'config',
                content: '{\n  \"title\": \"React Data Snapshot\",\n  \"description\": \"This mini-project imports JSON from the same Markdown document.\",\n  \"lessons\": [\n    {\n      \"id\": 1,\n      \"label\": \"Props review\",\n      \"duration\": \"8 min\"\n    },\n    {\n      \"id\": 2,\n      \"label\": \"State refresh\",\n      \"duration\": \"12 min\"\n    },\n    {\n      \"id\": 3,\n      \"label\": \"Hook order\",\n      \"duration\": \"10 min\"\n    }\n  ]\n}',
            },
            {
                path: 'src/styles.css',
                language: 'css',
                role: 'style',
                content: "body {\n  margin: 0;\n  background: linear-gradient(180deg, #f8fafc, #e2e8f0);\n  color: #0f172a;\n  font-family: system-ui, sans-serif;\n}\n\n.json-demo {\n  display: grid;\n  gap: 18px;\n  max-width: 720px;\n  margin: 0 auto;\n}\n\n.json-demo__hero {\n  display: flex;\n  gap: 16px;\n  align-items: center;\n}\n\n.json-demo__eyebrow {\n  margin: 0 0 4px;\n  font-size: 12px;\n  letter-spacing: 0.08em;\n  text-transform: uppercase;\n  color: #2563eb;\n}\n\n.json-demo__hero h1,\n.json-demo__hero p {\n  margin: 0;\n}\n\n.json-demo__list {\n  display: grid;\n  gap: 10px;\n  margin: 0;\n  padding-left: 20px;\n}\n\n.json-demo__list li {\n  display: flex;\n  justify-content: space-between;\n  gap: 12px;\n  padding: 12px 14px;\n  border-radius: 12px;\n  background: rgba(255, 255, 255, 0.82);\n}\n",
            },
        ],
    },
    {
        id: 'vue-project-json',
        label: 'Vue Project + JSON',
        metadata: {
            framework: 'vue',
            mode: 'multi-file',
            entry: 'src/main.ts',
        },
        files: [
            {
                path: 'src/main.ts',
                language: 'typescript',
                role: 'entry',
                content: "import { createApp } from 'vue';\nimport App from './App.vue';\nimport './styles.scss';\n\ncreateApp(App).mount('#app');",
            },
            {
                path: 'src/App.vue',
                language: 'vue',
                role: 'app',
                content: "<template>\n  <main class=\"json-dashboard\">\n    <header class=\"json-dashboard__hero\">\n      <img src=\"lesson-badge.svg\" alt=\"Lesson badge\" width=\"64\" height=\"64\" />\n      <div>\n        <p class=\"json-dashboard__eyebrow\">Vue + local JSON</p>\n        <h1>{{ dataset.title }}</h1>\n        <p>{{ dataset.summary }}</p>\n      </div>\n    </header>\n    <ul class=\"json-dashboard__list\">\n      <li v-for=\"module in dataset.modules\" :key=\"module.id\">\n        <strong>{{ module.label }}</strong>\n        <span>{{ module.count }} steps</span>\n      </li>\n    </ul>\n  </main>\n</template>\n\n<script setup lang=\"ts\">\nimport dataset from './data/modules.json';\n</script>\n\n<style scoped lang=\"scss\">\n.json-dashboard {\n  display: grid;\n  gap: 18px;\n\n  &__hero {\n    display: flex;\n    gap: 16px;\n    align-items: center;\n  }\n\n  &__eyebrow {\n    margin: 0 0 4px;\n    font-size: 12px;\n    letter-spacing: 0.08em;\n    text-transform: uppercase;\n    color: #38bdf8;\n  }\n\n  &__list {\n    display: grid;\n    gap: 10px;\n    margin: 0;\n    padding: 0;\n    list-style: none;\n  }\n\n  &__list li {\n    display: flex;\n    justify-content: space-between;\n    gap: 12px;\n    padding: 12px 14px;\n    border-radius: 12px;\n    background: rgba(15, 23, 42, 0.82);\n    color: #e2e8f0;\n  }\n\n  h1,\n  p {\n    margin: 0;\n  }\n}\n</style>",
            },
            {
                path: 'src/data/modules.json',
                language: 'json',
                role: 'config',
                content: '{\n  \"title\": \"Vue Data Snapshot\",\n  \"summary\": \"This project consumes JSON stored inside the same Markdown file.\",\n  \"modules\": [\n    {\n      \"id\": 1,\n      \"label\": \"Refs\",\n      \"count\": 3\n    },\n    {\n      \"id\": 2,\n      \"label\": \"Computed\",\n      \"count\": 2\n    },\n    {\n      \"id\": 3,\n      \"label\": \"Composables\",\n      \"count\": 4\n    }\n  ]\n}',
            },
            {
                path: 'src/styles.scss',
                language: 'scss',
                role: 'style',
                content: "$bg: #0f172a;\n\nbody {\n  margin: 0;\n  background: radial-gradient(circle at top, #1e293b, $bg 68%);\n  color: #e2e8f0;\n  font-family: system-ui, sans-serif;\n}\n\n.json-dashboard {\n  max-width: 720px;\n  margin: 0 auto;\n}\n",
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
        id: 'html-b',
        label: 'HTML-B (Body)',
        blocks: [
            { type: 'html-b', content: '<h1>Hello Body Fragment</h1>' },
        ],
    },
    {
        id: 'html-full',
        label: 'HTML-FULL',
        blocks: [
            {
                type: 'html-full',
                content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n  <title>Hello HTML-FULL</title>\n  <style>\n    body {\n      margin: 0;\n      padding: 24px;\n      font-family: system-ui, sans-serif;\n      background: #0f172a;\n      color: #e2e8f0;\n    }\n\n    .card {\n      max-width: 420px;\n      padding: 18px;\n      border-radius: 16px;\n      background: rgba(148, 163, 184, 0.14);\n    }\n  </style>\n</head>\n<body>\n  <main class=\"card\">\n    <h1>Hello HTML-FULL</h1>\n    <button id=\"hello-btn\" type=\"button\">Click me</button>\n  </main>\n  <script>\n    const button = document.getElementById(\"hello-btn\");\n    button?.addEventListener(\"click\", () => {\n      button.textContent = \"Pressed\";\n    });\n  </script>\n</body>\n</html>',
            },
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
