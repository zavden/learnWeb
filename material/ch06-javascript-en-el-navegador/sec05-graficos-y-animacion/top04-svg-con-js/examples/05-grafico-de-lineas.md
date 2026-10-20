---
example_description: "Un gráfico de líneas: el atributo d de un <path> se construye con las coordenadas de cada dato (M para empezar, L para cada tramo), con marcas en los dos ejes, un punto con <title> por medida y una tabla con los datos"
example_tags: "javascript|svg|graficos|path|escalas|accesibilidad"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Temperatura en Ciudad de México, 14 de octubre</h1>
  <svg id="chart" viewBox="0 0 320 180" width="320" height="180" role="img" aria-labelledby="chart-title"
       font-family="system-ui, sans-serif" font-size="11" fill="#52606d">
    <title id="chart-title">Temperatura cada dos horas, de 11 °C a las 6:00 a una máxima de 23 °C a las 14:00</title>
  </svg>
  <details>
    <summary>Ver los datos</summary>
    <table>
      <thead><tr><th scope="col">Hora</th><th scope="col">°C</th></tr></thead>
      <tbody id="rows"></tbody>
    </table>
  </details>
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
  font-size: 1.1rem;
  margin-top: 0;
}
svg {
  display: block;
  max-width: 100%;
  height: auto;
  background: #ffffff;
}
details {
  margin-top: 0.5rem;
  font-size: 0.85rem;
}
th,
td {
  padding: 0.1rem 0.6rem;
  text-align: end;
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

const readings = [[6, 11], [8, 13], [10, 17], [12, 20], [14, 23], [16, 22], [18, 19], [20, 16], [22, 14]];
const chart = document.querySelector('#chart');
// Escalas: 34 unidades del viewBox cada 2 horas; 10 unidades por grado, de 10 °C (y = 150) a 24 °C (y = 10)
const xFor = (hour) => 36 + (hour - 6) * 17;
const yFor = (celsius) => 150 - (celsius - 10) * 10;

for (let celsius = 10; celsius <= 24; celsius += 2) {
  svgEl('line', { x1: 36, x2: 308, y1: yFor(celsius), y2: yFor(celsius), stroke: '#e4e7eb' }, chart);
  svgEl('text', { x: 30, y: yFor(celsius) + 4, 'text-anchor': 'end' }, chart).textContent = celsius;
}
for (const [hour] of readings) {
  svgEl('text', { x: xFor(hour), y: 166, 'text-anchor': 'middle' }, chart).textContent = hour;
}

// La línea: «M x y» mueve el lápiz al primer punto; «L x y» traza una recta hasta el siguiente
const d = readings.map(([hour, celsius], i) => `${i === 0 ? 'M' : 'L'} ${xFor(hour)} ${yFor(celsius)}`).join(' ');
svgEl('path', { d, fill: 'none', stroke: '#be123c', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, chart);
for (const [hour, celsius] of readings) {
  const dot = svgEl('circle', { cx: xFor(hour), cy: yFor(celsius), r: 4, fill: '#be123c' }, chart);
  svgEl('title', {}, dot).textContent = `${hour}:00 → ${celsius} °C`;
  const row = document.querySelector('#rows').insertRow();
  row.insertCell().textContent = `${hour}:00`;
  row.insertCell().textContent = celsius;
}

console.log('d →', d);
const [maxHour, maxCelsius] = readings.reduce((best, reading) => (reading[1] > best[1] ? reading : best));
console.log(`máxima → ${maxCelsius} °C a las ${maxHour}:00, en y = ${yFor(maxCelsius)}`);
```
