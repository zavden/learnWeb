# SVG
```svg
<svg class="demo-svg" viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="200" height="140" rx="24" class="panel" />
  <circle id="shape" cx="120" cy="88" r="36" class="shape" />
  <text x="120" y="150" text-anchor="middle" class="label">Combination: svg-css-typescript</text>
</svg>
```

# CSS
```css
.demo-svg {
  width: min(360px, 100%);
}

.panel {
  fill: #eff6ff;
  stroke: #2563eb;
  stroke-width: 4;
}

.shape {
  fill: #60a5fa;
  transform-origin: 120px 88px;
  transition: transform 160ms ease, fill 160ms ease;
}

.label {
  font: 600 13px system-ui, sans-serif;
  fill: #1e3a8a;
}

.demo-svg.is-active .shape {
  fill: #34d399;
  transform: scale(1.1);
}

.demo-svg.is-active .label {
  fill: #065f46;
}
```

# TypeScript
```typescript
const svg = document.querySelector<SVGSVGElement>('.demo-svg');
const shape = document.getElementById('shape') as SVGGraphicsElement | null;
const label = document.querySelector<SVGTextElement>('.label');

shape?.addEventListener('click', () => {
  svg?.classList.toggle('is-active');
  if (svg && label) {
    label.textContent = svg.classList.contains('is-active')
      ? 'State: active'
      : 'State: idle';
  }
});
```
