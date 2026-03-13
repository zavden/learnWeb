---
framework: react
---

# JSX
```jsx
function App() {
  const [count, setCount] = React.useState(0);

  return (
    <main>
      <h1>Hello React JSX</h1>
      <p>This example renders a single component.</p>
      <button type="button" onClick={() => setCount(count + 1)}>
        Clicked {count} times
      </button>
    </main>
  );
}
```
