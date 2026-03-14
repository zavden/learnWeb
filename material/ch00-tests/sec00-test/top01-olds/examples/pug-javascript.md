# Pug
```pug
main.demo-card(data-combo="pug-javascript")
  h1 Pug playground
  p#status Combination: pug-javascript
  button#action(type="button") Toggle state
```

# JavaScript
```javascript
const root = document.querySelector('.demo-card');
const status = document.getElementById('status');
const action = document.getElementById('action');

action?.addEventListener('click', () => {
  root?.classList.toggle('is-active');
  if (root && status) {
    status.textContent = root.classList.contains('is-active')
      ? 'State: active'
      : 'State: idle';
  }
});
```
