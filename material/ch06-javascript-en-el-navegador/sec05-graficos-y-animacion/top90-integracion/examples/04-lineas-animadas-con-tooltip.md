---
example_description: "Un gráfico de líneas en SVG que se dibuja con la Web Animations API (stroke-dashoffset de la longitud a 0) y cuyos puntos aparecen escalonados con delay; un tooltip sigue al puntero convirtiendo su posición al viewBox, y las flechas del teclado recorren los meses"
example_tags: "javascript|svg|web-animations|gettotallength|getscreenctm|tooltip|accesibilidad|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Visitantes del museo en 2025 (miles)</h1>
  <svg id="chart" viewBox="0 0 340 200" tabindex="0" role="img" aria-labelledby="chart-title" aria-describedby="readout"
       font-family="system-ui, sans-serif" font-size="11" fill="#52606d">
    <title id="chart-title">Visitantes por mes: el máximo es agosto, con 82 mil</title>
    <path id="line" fill="none" stroke="#be123c" stroke-width="2.5" stroke-linejoin="round"/>
    <g id="dots"></g>
    <g id="tooltip" visibility="hidden">
      <rect x="-42" y="-30" width="84" height="22" rx="4" fill="#1f2933"/>
      <text id="tooltip-text" y="-15" text-anchor="middle" fill="#ffffff"></text>
    </g>
  </svg>
  <p id="readout" aria-live="polite">Pasa el puntero por el gráfico, o Tab y las flechas.</p>
  <button id="animate" type="button">Animar el gráfico</button>
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
  width: 100%;
  max-width: 340px;
  height: auto;
  background: #ffffff;
}
svg:focus-visible,
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
#dots circle {
  transform-box: fill-box;
  transform-origin: center;
}
button {
  font: inherit;
  padding: 0.3rem 0.8rem;
}
```

# JavaScript

```javascript
const MONTHS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
const visitors = [42, 38, 51, 47, 55, 61, 78, 82, 58, 49, 45, 66];
const xFor = (i) => 40 + i * 25;
const yFor = (thousands) => 170 - thousands * 1.5;
const nearestMonth = (x) => Math.min(11, Math.max(0, Math.round((x - 40) / 25)));

const SVG_NS = 'http://www.w3.org/2000/svg';
const chart = document.querySelector('#chart');
const line = document.querySelector('#line');
const dots = document.querySelector('#dots');
line.setAttribute('d', visitors.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xFor(i)} ${yFor(v)}`).join(' '));
visitors.forEach((v, i) => {
  const dot = document.createElementNS(SVG_NS, 'circle');
  for (const [name, value] of Object.entries({ cx: xFor(i), cy: yFor(v), r: 3.5, fill: '#be123c' })) dot.setAttribute(name, value);
  dots.append(dot);
  if (i % 2 === 0) {                                  // una marca cada dos meses
    const label = document.createElementNS(SVG_NS, 'text');
    for (const [name, value] of Object.entries({ x: xFor(i), y: 188, 'text-anchor': 'middle' })) label.setAttribute(name, value);
    label.textContent = MONTHS[i].slice(0, 3);
    chart.append(label);
  }
});

// La longitud: con rectas, la suma de los tramos
const lineLength = line.getTotalLength();
let sum = 0;
for (let i = 1; i < 12; i++) sum += Math.hypot(25, yFor(visitors[i]) - yFor(visitors[i - 1]));
console.log('getTotalLength() coincide con la suma de los tramos →', Math.abs(lineLength - sum) < 0.01, `(${sum.toFixed(2)})`);
line.style.strokeDasharray = lineLength;

// Un fotograma congelado: con easing lineal, a mitad del tiempo falta la mitad del trazo
const probe = line.animate({ strokeDashoffset: [lineLength, 0] }, { duration: 1000, easing: 'linear' });
probe.pause();
probe.currentTime = 500;
console.log('a mitad → dashoffset = la mitad de la longitud:', Math.abs(parseFloat(getComputedStyle(line).strokeDashoffset) - lineLength / 2) < 0.5);
probe.cancel();
console.log('x = 197 en el viewBox → el mes más cercano:', MONTHS[nearestMonth(197)]);

// La animación de entrada: primero la línea, después los puntos escalonados
document.querySelector('#animate').addEventListener('click', async () => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; // matchMedia: módulo siguiente
  if (!reduce) await line.animate({ strokeDashoffset: [lineLength, 0] }, { duration: 1200, easing: 'ease-out' }).finished;
  const pops = [...dots.children].map((dot, i) => dot.animate(
    reduce ? { opacity: [0, 1] } : { opacity: [0, 1], scale: [0, 1] },
    { duration: 300, delay: i * 80, fill: 'backwards' },  // backwards: invisible durante su retardo
  ));
  await Promise.all(pops.map((pop) => pop.finished));
  console.log('✅ gráfico animado');
});

// El tooltip: puntero → viewBox → mes más cercano
const tooltip = document.querySelector('#tooltip');
const readout = document.querySelector('#readout');
let current = 7;
function showMonth(i) {
  current = i;
  tooltip.setAttribute('transform', `translate(${xFor(i)} ${yFor(visitors[i])})`);
  tooltip.setAttribute('visibility', 'visible');
  document.querySelector('#tooltip-text').textContent = `${visitors[i]} mil`;
  readout.textContent = `${MONTHS[i]}: ${visitors[i]} mil visitantes`;
}
chart.addEventListener('pointermove', (event) => {
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(chart.getScreenCTM().inverse());
  if (nearestMonth(point.x) !== current || tooltip.getAttribute('visibility') === 'hidden') showMonth(nearestMonth(point.x));
});
chart.addEventListener('pointerleave', () => tooltip.setAttribute('visibility', 'hidden'));
chart.addEventListener('keydown', (event) => {
  const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key];
  if (!step) return;
  event.preventDefault();
  showMonth(Math.min(11, Math.max(0, current + step)));
  console.log(`⌨️ ${readout.textContent}`);
});
console.log('Listo: pulsa «Animar el gráfico» y pasa el puntero por la línea');
```
