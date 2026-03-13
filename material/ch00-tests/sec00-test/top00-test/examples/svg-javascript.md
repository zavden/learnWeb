# SVG
```svg
<svg class="demo-svg" viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="200" height="140" rx="24" class="panel" />
  <circle id="shape" cx="120" cy="88" r="36" class="shape" />
  <text x="120" y="150" text-anchor="middle" class="label">Combination: svg-javascript</text>
</svg>
```

# JavaScript
```javascript
const svg = document.querySelector('.demo-svg');
const shape = document.getElementById('shape');
const label = document.querySelector('.label');

shape?.addEventListener('click', () => {
  svg?.classList.toggle('is-active');
  if (svg && label) {
    label.textContent = svg.classList.contains('is-active')
      ? 'State: active'
      : 'State: idle';
  }
});
```
