# HTML
```html
<main class="demo-card" data-combo="html-sass-typescript">
  <h1>HTML playground</h1>
  <p id="status">Combination: html-sass-typescript</p>
  <button id="action" type="button">Toggle state</button>
</main>
```

# SASS
```sass
$accent: #7c3aed

.demo-card
  max-width: 420px
  padding: 24px
  border: 2px solid $accent
  border-radius: 18px
  background: rgba($accent, 0.12)
  color: #2e1065
  font: 16px/1.5 system-ui, sans-serif

  #action
    padding: 10px 14px
    border: 0
    border-radius: 999px
    background: $accent
    color: #ffffff
    cursor: pointer

  &.is-active
    background: rgba(#0f766e, 0.14)
    border-color: #0f766e
    color: #134e4a
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
