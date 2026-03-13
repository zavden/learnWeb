# Pug
```pug
main.demo-card(data-combo="pug-typescript")
  h1 Pug playground
  p#status Combination: pug-typescript
  button#action(type="button") Toggle state
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
