---
entry: src/main.jsx
framework: react
mode: multi-file
---

## @file src/main.jsx
## @lang jsx
## @role entry

```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.jsx';
import './styles.css';

const root = createRoot(document.getElementById('root'));
root.render(<App />);
```

## @file src/App.jsx
## @lang jsx
## @role app

```jsx
import React from 'react';
import { CounterPanel } from './components/CounterPanel.jsx';
import { Timeline } from './components/Timeline.jsx';

export function App() {
  return (
    <main className="playground">
      <header className="hero">
        <p className="eyebrow">React multi-file</p>
        <h1>React Project JSX</h1>
        <p>Use tabs or vertical panels to inspect each file.</p>
      </header>
      <CounterPanel />
      <Timeline />
    </main>
  );
}
```

## @file src/components/CounterPanel.jsx
## @lang jsx
## @role component

```jsx
import React from 'react';

export function CounterPanel() {
  const [count, setCount] = React.useState(0);
  const [step, setStep] = React.useState(1);

  return (
    <section className="card stack">
      <h2>Counter Hook</h2>
      <p>Count: {count}</p>
      <div className="controls">
        <button type="button" onClick={() => setCount((value) => value - step)}>-</button>
        <button type="button" onClick={() => setCount((value) => value + step)}>+</button>
        <label>
          Step
          <input
            type="range"
            min="1"
            max="5"
            value={step}
            onChange={(event) => setStep(Number(event.target.value))}
          />
        </label>
      </div>
    </section>
  );
}
```

## @file src/components/Timeline.jsx
## @lang jsx
## @role component

```jsx
import React from 'react';

const milestones = [
  'Props',
  'State',
  'Effects',
  'Custom hooks',
];

export function Timeline() {
  return (
    <section className="card">
      <h2>Learning Path</h2>
      <ol className="timeline">
        {milestones.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ol>
    </section>
  );
}
```

## @file src/styles.css
## @lang css
## @role style

```css
:root {
  color-scheme: dark;
}

body {
  margin: 0;
  background: linear-gradient(180deg, #f8fafc, #e2e8f0);
  color: #0f172a;
  font-family: system-ui, sans-serif;
}

.playground {
  display: grid;
  gap: 16px;
  max-width: 720px;
  margin: 0 auto;
}

.hero {
  display: grid;
  gap: 6px;
}

.eyebrow {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2563eb;
}

.hero h1,
.card h2,
.card p {
  margin: 0;
}

.card {
  display: grid;
  gap: 12px;
  padding: 18px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.22);
  box-shadow: 0 24px 50px rgba(15, 23, 42, 0.08);
}

.controls {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.controls button {
  border: 0;
  border-radius: 999px;
  padding: 10px 14px;
  background: #2563eb;
  color: #ffffff;
  cursor: pointer;
}

.controls label {
  display: grid;
  gap: 6px;
  font-size: 13px;
}

.timeline {
  display: grid;
  gap: 10px;
  padding-left: 20px;
}
```