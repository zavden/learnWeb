---
example_description: "Un gráfico de barras generado con createElementNS a partir de un array: una escala que convierte visitantes en coordenadas, líneas de referencia con sus marcas, un <title> por barra (el tooltip) y los mismos datos en una tabla"
example_tags: "javascript|svg|graficos|createelementns|title|accesibilidad|tabla"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Visitantes del museo, semana 41</h1>
  <svg id="chart" viewBox="0 0 320 200" width="320" height="200" role="img" aria-labelledby="chart-title"
       font-family="system-ui, sans-serif" font-size="11" fill="#52606d">
    <title id="chart-title">Gráfico de barras de visitantes por día; los datos están en la tabla de abajo</title>
  </svg>
  <table>
    <caption>Visitantes por día (el lunes cierra)</caption>
    <thead><tr><th scope="col">Día</th><th scope="col">Visitantes</th></tr></thead>
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
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
svg {
  display: block;
  max-width: 100%;
  height: auto;
  background: #ffffff;
}
table {
  margin-top: 0.75rem;
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
const SVG_NS = 'http://www.w3.org/2000/svg';
function svgEl(tag, attributes, parent) {
  const element = document.createElementNS(SVG_NS, tag);
  for (const [name, value] of Object.entries(attributes)) element.setAttribute(name, value);
  parent.append(element);
  return element;
}

const visits = [['Mar', 'martes', 820], ['Mié', 'miércoles', 640], ['Jue', 'jueves', 910],
  ['Vie', 'viernes', 1280], ['Sáb', 'sábado', 2150], ['Dom', 'domingo', 1890]];
const chart = document.querySelector('#chart');
const plot = { left: 44, right: 310, top: 10, bottom: 170 };   // la zona de las barras, en el viewBox
const MAX = 2500;
const yFor = (value) => plot.bottom - (value / MAX) * (plot.bottom - plot.top); // la ESCALA

for (let value = 0; value <= MAX; value += 500) {               // líneas de referencia y sus marcas
  const y = yFor(value);
  svgEl('line', { x1: plot.left, x2: plot.right, y1: y, y2: y, stroke: '#e4e7eb' }, chart);
  svgEl('text', { x: plot.left - 6, y: y + 4, 'text-anchor': 'end' }, chart).textContent = value;
}

const slot = (plot.right - plot.left) / visits.length;
visits.forEach(([short, day, value], i) => {
  const x = plot.left + i * slot + 8;
  const bar = svgEl('rect', { x, y: yFor(value), width: slot - 16, height: plot.bottom - yFor(value), fill: '#0e7490' }, chart);
  svgEl('title', {}, bar).textContent = `${day}: ${value} visitantes`; // el tooltip al pasar el ratón
  svgEl('text', { x: x + (slot - 16) / 2, y: plot.bottom + 16, 'text-anchor': 'middle' }, chart).textContent = short;
  const row = document.querySelector('#rows').insertRow();             // la misma fila, en la tabla
  row.insertCell().textContent = day;
  row.insertCell().textContent = value;
});

console.log('sábado →', `barra de ${(plot.bottom - yFor(2150)).toFixed(1)} de alto, desde y = ${yFor(2150).toFixed(1)}`);
console.log(`creados → ${chart.querySelectorAll('rect').length} rect · ${chart.querySelectorAll('line').length} line · ${chart.querySelectorAll('text').length} text`);
```
