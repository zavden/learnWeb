# Pug
```pug
main.demo-card(data-combo="pug-css-javascript")
  h1 Pug playground
  p#status Combination: pug-css-javascript
  button#action(type="button") Toggle state
```

# CSS
```css
.demo-card {
  max-width: 420px;
  padding: 24px;
  border: 2px solid #2563eb;
  border-radius: 18px;
  background: #eff6ff;
  color: #1e3a8a;
  font: 16px/1.5 system-ui, sans-serif;
}

#action {
  padding: 10px 14px;
  border: 0;
  border-radius: 999px;
  background: #2563eb;
  color: #ffffff;
  cursor: pointer;
}

.demo-card.is-active {
  background: #dcfce7;
  border-color: #059669;
  color: #065f46;
}
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
