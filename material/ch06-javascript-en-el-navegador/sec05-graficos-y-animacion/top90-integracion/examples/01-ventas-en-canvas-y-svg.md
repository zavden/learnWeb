---
example_description: "Las ventas de una semana dibujadas dos veces a partir del MISMO cálculo de barras: en un canvas de alta densidad (píxeles) y en un SVG (elementos con <title>), con los datos también en una tabla. Una sola función de escala para los dos"
example_tags: "javascript|canvas|svg|graficos|devicepixelratio|accesibilidad|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Café La Parroquia · ventas de la semana (MXN)</h1>
  <div class="charts">
    <figure>
      <canvas id="canvas-chart" width="320" height="160" role="img" aria-label="Ventas por día en canvas; los datos están en la tabla"></canvas>
      <figcaption>Canvas: píxeles</figcaption>
    </figure>
    <figure>
      <svg id="svg-chart" viewBox="0 0 320 160" width="320" height="160" role="img" aria-labelledby="svg-title"
           font-family="system-ui, sans-serif" font-size="11" fill="#52606d">
        <title id="svg-title">Ventas por día en SVG; pasa el ratón por una barra para ver su valor</title>
      </svg>
      <figcaption>SVG: elementos</figcaption>
    </figure>
  </div>
  <table>
    <caption>Ventas por día</caption>
    <thead><tr><th scope="col">Día</th><th scope="col">Ventas</th></tr></thead>
    <tbody id="rows"></tbody>
  </table>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
main {
  max-width: 44rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.1rem;
  margin-top: 0;
}
.charts {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
figure {
  margin: 0;
  font-size: 0.85rem;
}
canvas,
svg {
  display: block;
  max-width: 100%;
  background: #ffffff;
}
table {
  margin-top: 1rem;
  border-collapse: collapse;
  font-size: 0.85rem;
}
caption {
  text-align: start;
  font-weight: 600;
}
th,
td {
  padding: 0.2rem 0.6rem;
  border-bottom: 1px solid #cbd2d9;
  text-align: start;
}
td:last-child {
  text-align: end;
  font-variant-numeric: tabular-nums;
}
```

# JavaScript

```javascript
const sales = [['Lun', 'lunes', 4200], ['Mar', 'martes', 3900], ['Mié', 'miércoles', 4600], ['Jue', 'jueves', 5100],
  ['Vie', 'viernes', 7800], ['Sáb', 'sábado', 9200], ['Dom', 'domingo', 8100]];
const MAX = 10000;
const BASE_Y = 140;                         // la línea del 0
const PLOT_HEIGHT = 120;
const COLOR = '#0e7490';
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

// 1. UN cálculo de geometría para los dos dibujos
const scaleY = (value) => Math.round((value / MAX) * PLOT_HEIGHT * 10) / 10;
const bars = sales.map(([short, day, value], i) => ({ short, day, value, x: 42 + i * 40, width: 28, height: scaleY(value) }));
const ticks = [0, 2500, 5000, 7500, 10000];

// 2. Canvas: alta densidad y órdenes de dibujo
const canvas = document.querySelector('#canvas-chart');
const dpr = window.devicePixelRatio;
canvas.style.width = '320px';
canvas.style.height = '160px';
canvas.width = 320 * dpr;
canvas.height = 160 * dpr;
const ctx = canvas.getContext('2d');
ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
ctx.font = '11px system-ui, sans-serif';
ctx.textAlign = 'end';
for (const tick of ticks) {
  ctx.fillStyle = '#e4e7eb';
  ctx.fillRect(36, BASE_Y - scaleY(tick), 278, 1);
  ctx.fillStyle = '#52606d';
  ctx.fillText(tick / 1000 + 'k', 32, BASE_Y - scaleY(tick) + 4);
}
ctx.textAlign = 'center';
for (const bar of bars) {
  ctx.fillStyle = COLOR;
  ctx.fillRect(bar.x, BASE_Y - bar.height, bar.width, bar.height);
  ctx.fillStyle = '#52606d';
  ctx.fillText(bar.short, bar.x + bar.width / 2, 154);
}

// 3. SVG: los mismos números como elementos, cada barra con su <title>
const SVG_NS = 'http://www.w3.org/2000/svg';
const svg = document.querySelector('#svg-chart');
function svgEl(tag, attributes) {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  return element;
}
for (const tick of ticks) {
  svg.append(svgEl('rect', { x: 36, y: BASE_Y - scaleY(tick), width: 278, height: 1, fill: '#e4e7eb' }));
  const label = svgEl('text', { x: 32, y: BASE_Y - scaleY(tick) + 4, 'text-anchor': 'end' });
  label.textContent = tick / 1000 + 'k';
  svg.append(label);
}
for (const bar of bars) {
  const rect = svgEl('rect', { x: bar.x, y: BASE_Y - bar.height, width: bar.width, height: bar.height, fill: COLOR });
  const tooltip = svgEl('title', {});
  tooltip.textContent = `${bar.day}: ${money.format(bar.value)}`;
  rect.append(tooltip);
  const label = svgEl('text', { x: bar.x + bar.width / 2, y: 154, 'text-anchor': 'middle' });
  label.textContent = bar.short;
  svg.append(rect, label);
  // 4. La tabla, con los mismos datos
  const row = document.querySelector('#rows').insertRow();
  row.insertCell().textContent = bar.day;
  row.insertCell().textContent = money.format(bar.value);
}

// Comprobaciones: los dos dibujos salen del mismo cálculo
const saturday = bars[5];
console.log(`sábado → ${money.format(saturday.value)} · barra de ${saturday.height} de alto, en x = ${saturday.x}`);
const [r, g, b] = ctx.getImageData((saturday.x + 14) * dpr, (BASE_Y - 20) * dpr, 1, 1).data;
console.log('canvas: centro de la barra del sábado →', `rgb(${r}, ${g}, ${b})`, '=', COLOR);
const svgSaturday = svg.querySelectorAll('rect[fill="#0e7490"]')[5];
console.log('svg: barra del sábado → height', svgSaturday.getAttribute('height'), '·', svgSaturday.querySelector('title').textContent);
```
