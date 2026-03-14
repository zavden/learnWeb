---
entry: src/main.tsx
framework: react
mode: multi-file
---

## @file src/main.tsx
## @lang tsx
## @role entry

```tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.tsx';
import './styles.scss';

const root = createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);
```

## @file src/App.tsx
## @lang tsx
## @role app

```tsx
import React from 'react';
import { StatusCard } from './components/StatusCard.tsx';
import { useStepCounter } from './hooks/useStepCounter.ts';

export function App() {
  const counter = useStepCounter(2);

  return (
    <main className="dashboard">
      <header className="dashboard__hero">
        <p className="dashboard__eyebrow">React TSX multi-file</p>
        <h1>React Project TSX</h1>
      </header>
      <StatusCard label="Current value" value={counter.count} />
      <div className="dashboard__actions">
        <button type="button" onClick={counter.decrement}>Decrease</button>
        <button type="button" onClick={counter.increment}>Increase</button>
      </div>
    </main>
  );
}
```

## @file src/components/StatusCard.tsx
## @lang tsx
## @role component

```tsx
type StatusCardProps = {
  label: string;
  value: number;
};

export function StatusCard({ label, value }: StatusCardProps) {
  return (
    <section className="status-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </section>
  );
}
```

## @file src/hooks/useStepCounter.ts
## @lang typescript
## @role hook

```typescript
import React from 'react';

type CounterApi = {
  count: number;
  increment: () => void;
  decrement: () => void;
};

export function useStepCounter(step: number): CounterApi {
  const [count, setCount] = React.useState<number>(step);

  return {
    count,
    increment: () => setCount((value) => value + step),
    decrement: () => setCount((value) => value - step),
  };
}
```

## @file src/styles.scss
## @lang scss
## @role style

```scss
$bg: #0f172a;
$accent: #38bdf8;
$surface: rgba(15, 23, 42, 0.88);

body {
  margin: 0;
  background: radial-gradient(circle at top, #1e293b, $bg 68%);
  color: #e2e8f0;
  font-family: system-ui, sans-serif;
}

.dashboard {
  display: grid;
  gap: 16px;
  max-width: 520px;
  margin: 0 auto;

  &__hero {
    display: grid;
    gap: 8px;
  }

  &__eyebrow {
    margin: 0;
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: $accent;
  }

  &__actions {
    display: flex;
    gap: 10px;
  }

  button {
    border: 0;
    border-radius: 999px;
    padding: 10px 16px;
    background: $accent;
    color: $bg;
    cursor: pointer;
    font-weight: 700;
  }
}

.status-card {
  display: grid;
  gap: 8px;
  padding: 18px;
  border: 1px solid rgba($accent, 0.25);
  border-radius: 18px;
  background: $surface;

  strong {
    font-size: 42px;
    color: $accent;
  }
}
```