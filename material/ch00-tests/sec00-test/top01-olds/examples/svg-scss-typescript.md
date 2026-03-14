# SVG
```svg
<svg class="demo-svg" viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg">
  <rect x="20" y="20" width="200" height="140" rx="24" class="panel" />
  <circle id="shape" cx="120" cy="88" r="36" class="shape" />
  <text x="120" y="150" text-anchor="middle" class="label">Combination: svg-scss-typescript</text>
</svg>
```

# SCSS
```scss
$accent: #ea580c;

.demo-svg {
  width: min(360px, 100%);
}

.panel {
  fill: rgba($accent, 0.12);
  stroke: $accent;
  stroke-width: 4;
}

.shape {
  fill: rgba($accent, 0.75);
  transform-origin: 120px 88px;
  transition: transform 160ms ease, fill 160ms ease;
}

.label {
  font: 600 13px system-ui, sans-serif;
  fill: #7c2d12;
}

.demo-svg.is-active {
  .shape {
    fill: #10b981;
    transform: scale(1.1);
  }

  .label {
    fill: #065f46;
  }
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
