---
framework: react
console: true
example_description: "React console demo that logs effect mount, cleanup and state-driven updates."
example_tags: "react|jsx|console|useeffect|state"
example_rating: 4
example_importance: important
---

# JSX

```jsx
function App() {
  const [count, setCount] = React.useState(0);

  React.useEffect(() => {
    console.log('react effect: mounted');
    return () => {
      console.warn('react effect: cleanup');
    };
  }, []);

  React.useEffect(() => {
    console.info('react effect: count changed', count);
  }, [count]);

  return (
    <main className="react-app">
      <h1>React Console Demo</h1>
      <button type="button" onClick={() => setCount((value) => value + 1)}>
        Count {count}
      </button>
    </main>
  );
}
```

# CSS

```css
.react-app {
  display: grid;
  gap: 12px;
  max-width: 320px;
  padding: 24px;
  border-radius: 18px;
  background: #eff6ff;
  color: #1e3a8a;
  font-family: system-ui, sans-serif;
}

.react-app h1 {
  margin: 0;
  font-size: 26px;
}

.react-app button {
  justify-self: start;
  border: 0;
  border-radius: 999px;
  padding: 10px 16px;
  background: #2563eb;
  color: #fff;
  cursor: pointer;
}
```
