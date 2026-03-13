---
framework: react
---

# TSX
```tsx
type Todo = {
  id: number;
  label: string;
  done: boolean;
};

function App() {
  const [items, setItems] = React.useState<Todo[]>([
    { id: 1, label: 'Read JSX', done: true },
    { id: 2, label: 'Practice TSX', done: false },
    { id: 3, label: 'Inspect render order', done: false },
  ]);

  function toggleItem(id: number) {
    setItems((current) => current.map((item) => (
      item.id === id ? { ...item, done: !item.done } : item
    )));
  }

  return (
    <main className="todo-app">
      <header>
        <p>React + TSX</p>
        <h1>Single-file checklist</h1>
      </header>

      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <label>
              <input
                type="checkbox"
                checked={item.done}
                onChange={() => toggleItem(item.id)}
              />
              <span>{item.label}</span>
            </label>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

# CSS
```css
.todo-app {
  max-width: 460px;
  padding: 26px;
  border-radius: 24px;
  background: #0f172a;
  color: #e2e8f0;
  font-family: system-ui, sans-serif;
}

.todo-app header {
  margin-bottom: 18px;
}

.todo-app header p {
  margin: 0 0 6px;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #38bdf8;
}

.todo-app h1 {
  margin: 0;
  font-size: 28px;
}

.todo-app ul {
  display: grid;
  gap: 10px;
  list-style: none;
  padding: 0;
  margin: 0;
}

.todo-app li label {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(148, 163, 184, 0.14);
}

.todo-app input {
  accent-color: #38bdf8;
}
```
