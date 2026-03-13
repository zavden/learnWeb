# HTML
```html
<main class="demo-card" data-combo="html-typescript">
  <h1>HTML playground</h1>
  <p id="status">Combination: html-typescript</p>
  <button id="action" type="button">Toggle state</button>
</main>
```

# TypeScript
```typescript
const root = document.querySelector<HTMLElement>('.demo-card');
const status = document.getElementById('status');
const action = document.getElementById('action') as HTMLButtonElement | null;

action?.addEventListener('click', () => {
  root?.classList.toggle('is-active');
  if (root && status) {
    status.textContent = root.classList.contains('is-active')
      ? 'State: active'
      : 'State: idle';
  }
});
```
