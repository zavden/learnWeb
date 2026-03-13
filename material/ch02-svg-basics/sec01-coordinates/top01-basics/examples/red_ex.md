# SVG

```svg
<svg class="radar" viewBox="0 0 320 220" xmlns="http://www.w3.org/2000/svg">
  <rect x="0" y="0" width="320" height="220" rx="16" fill="red" />

  <g transform="translate(160 110)">
    <circle class="ring ring-1" cx="0" cy="0" r="28" />
    <circle class="ring ring-2" cx="0" cy="0" r="56" />
    <circle class="ring ring-3" cx="0" cy="0" r="84" />

    <line x1="-100" y1="0" x2="100" y2="0" class="axis" />
    <line x1="0" y1="-90" x2="0" y2="90" class="axis" />

    <circle class="target" cx="38" cy="-26" r="7" />
    <circle class="target secondary" cx="-52" cy="34" r="5" />
  </g>
</svg>
```

# CSS

```css
body {
  display: grid;
  place-items: center;
  min-height: 100vh;
  background: linear-gradient(180deg, #0d1117 0%, #111827 100%);
}

.radar {
  width: min(560px, 90vw);
  filter: drop-shadow(0 18px 30px rgba(0, 0, 0, 0.28));
}

.ring,
.axis {
  fill: none;
  stroke: rgba(63, 185, 80, 0.35);
  stroke-width: 1.5;
}

.target {
  fill: #39d2c0;
}

.target.secondary {
  fill: #f0883e;
}
```