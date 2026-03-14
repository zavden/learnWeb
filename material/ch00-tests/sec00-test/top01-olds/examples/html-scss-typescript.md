# HTML
```html
<main class="demo-card" data-combo="html-scss-typescript">
  <h1>HTML playground</h1>
  <p id="status">Combination: html-scss-typescript</p>
  <button id="action" type="button">Toggle state</button>
</main>
```

# SCSS
```scss
$accent: #b45309;

.demo-card {
  max-width: 420px;
  padding: 24px;
  border: 2px solid $accent;
  border-radius: 18px;
  background: rgba($accent, 0.12);
  color: #431407;
  font: 16px/1.5 system-ui, sans-serif;

  #action {
    padding: 10px 14px;
    border: 0;
    border-radius: 999px;
    background: $accent;
    color: #ffffff;
    cursor: pointer;
  }

  &.is-active {
    background: rgba(#059669, 0.14);
    border-color: #059669;
    color: #065f46;
  }
}
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
