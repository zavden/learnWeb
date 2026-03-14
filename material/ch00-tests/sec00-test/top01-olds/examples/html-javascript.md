# HTML
```html
<main class="demo-card" data-combo="html-javascript">
  <h1>HTML playground</h1>
  <p id="status">Combination: html-javascript</p>
  <button id="action" type="button">Toggle state</button>
</main>
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
