---
example_description: "Una gráfica de barras en canvas que se adapta a su caja y al tema: un ResizeObserver redimensiona el mapa de bits (× devicePixelRatio) y elige etiquetas largas, cortas o iniciales según el hueco de cada barra; matchMedia('(prefers-color-scheme: dark)') elige la paleta del canvas, que el CSS (light-dark) no alcanza, y su change redibuja"
example_tags: "javascript|resizeobserver|canvas|matchmedia|prefers-color-scheme|light-dark|intl"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Tazas vendidas esta semana</h1>
  <p class="hint">Arrastra la esquina inferior derecha del recuadro para cambiar su ancho.</p>
  <div id="chart-box" class="chart-box">
    <canvas id="chart" role="img" aria-label="Gráfica de barras: tazas vendidas de lunes a domingo; los datos están en la tabla de abajo"></canvas>
  </div>
  <details>
    <summary>Ver los datos</summary>
    <table id="data-table" class="data"></table>
  </details>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
/* La página sigue el tema del sistema con CSS puro (módulo «Diseño responsive»). */
:root {
  color-scheme: light dark;
  --text: light-dark(#1f2933, #e5e7eb);
  --page: light-dark(#f5f7fa, #111827);
  --panel: light-dark(#ffffff, #1f2933);
  --line: light-dark(#7b8794, #9aa5b1);
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: var(--text);
  background: var(--page);
}
main {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin: 0 0 0.25rem;
}
.hint {
  margin: 0 0 0.5rem;
}
/* 322 px de borde a borde = 300 px de contenido. */
.chart-box {
  box-sizing: border-box;
  width: 322px;
  min-width: 160px;
  max-width: 100%;
  padding: 10px;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: var(--panel);
  resize: horizontal;
  overflow: hidden;
}
/* La caja del canvas es fija (alto) o la marca su contenedor (ancho): cambiar
   su mapa de bits no cambia la caja observada, así que no hay bucle. */
#chart {
  display: block;
  width: 100%;
  height: 160px;
}
.data {
  border-collapse: collapse;
}
.data th,
.data td {
  padding: 0.15rem 0.5rem;
  text-align: start;
}
summary:focus-visible {
  outline: 3px solid light-dark(#1d4ed8, #93c5fd);
  outline-offset: 2px;
}
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: var(--panel);
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
const SALES = [86, 92, 78, 110, 134, 168, 152]; // de lunes a domingo
const HEIGHT = 160; // px CSS, como en el CSS
const PALETTES = {
  light: { background: '#ffffff', bar: '#b45309', text: '#1f2933', axis: '#7b8794' },
  dark: { background: '#1f2933', bar: '#fbbf24', text: '#f5f7fa', axis: '#9aa5b1' },
};
const box = document.querySelector('#chart-box');
const canvas = document.querySelector('#chart');
const context = canvas.getContext('2d');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// Nombres de los días con Intl (una semana fija en UTC: no depende de tu zona).
const dayNames = (style) => {
  const format = new Intl.DateTimeFormat('es-MX', { weekday: style, timeZone: 'UTC' });
  return SALES.map((_, index) => format.format(new Date(Date.UTC(2026, 9, 12 + index))));
};
const LABELS = { long: dayNames('long'), short: dayNames('short'), narrow: dayNames('narrow') };

// La tabla accesible con los mismos datos: un canvas es una sola imagen.
const table = document.querySelector('#data-table');
SALES.forEach((sales, index) => {
  const row = table.insertRow();
  row.insertCell().textContent = LABELS.long[index];
  row.insertCell().textContent = `${sales} tazas`;
});

const darkScheme = matchMedia('(prefers-color-scheme: dark)');
let width = 0;
let calls = 0;

function draw() {
  const dpr = devicePixelRatio;
  canvas.width = Math.round(width * dpr);   // el mapa de bits, en píxeles del dispositivo
  canvas.height = Math.round(HEIGHT * dpr); // (cambiarlo borra el canvas y su estado)
  context.setTransform(dpr, 0, 0, dpr, 0, 0); // a partir de aquí, píxeles CSS
  const palette = darkScheme.matches ? PALETTES.dark : PALETTES.light;
  const slot = width / SALES.length;
  const labelStyle = slot >= 60 ? 'long' : slot >= 28 ? 'short' : 'narrow';
  const max = Math.max(...SALES);
  const chartHeight = HEIGHT - 24; // abajo, sitio para las etiquetas

  context.fillStyle = palette.background;
  context.fillRect(0, 0, width, HEIGHT);
  context.font = '12px system-ui, sans-serif';
  context.textAlign = 'center';
  SALES.forEach((sales, index) => {
    const barHeight = (sales / max) * (chartHeight - 16);
    const x = index * slot;
    context.fillStyle = palette.bar;
    context.fillRect(x + slot * 0.15, chartHeight - barHeight, slot * 0.7, barHeight);
    context.fillStyle = palette.text;
    context.fillText(LABELS[labelStyle][index], x + slot / 2, HEIGHT - 6);
    if (slot >= 28) context.fillText(String(sales), x + slot / 2, chartHeight - barHeight - 4);
  });
  context.fillStyle = palette.axis;
  context.fillRect(0, chartHeight, width, 1);
  return { labelStyle, bitmap: `${canvas.width} × ${canvas.height}` };
}

// ResizeObserver: el ancho de la CAJA, no de la ventana.
new ResizeObserver((entries) => {
  calls += 1;
  width = entries[0].contentBoxSize[0].inlineSize;
  const { labelStyle, bitmap } = draw();
  logLine(`🖌 llamada ${calls} → ${width} px de ancho · mapa de bits ${bitmap} · etiquetas: ${LABELS[labelStyle].join(', ')}`);
}).observe(box);

// matchMedia: el CSS ya cambia solo con light-dark(); el canvas no, hay que redibujar.
darkScheme.addEventListener('change', () => {
  draw();
  logLine(`🎨 change → tema ${darkScheme.matches ? 'oscuro' : 'claro'}: redibujo`);
});

logLine(`tema → ${darkScheme.matches ? 'oscuro' : 'claro'} · devicePixelRatio → ${devicePixelRatio}`);
logLine('Listo: cambia el ancho del recuadro desde su esquina, o el tema del sistema');
```
