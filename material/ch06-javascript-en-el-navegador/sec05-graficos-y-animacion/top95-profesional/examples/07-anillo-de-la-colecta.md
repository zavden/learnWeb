---
example_description: "Un gráfico de anillo en SVG para una colecta: cada categoría es un círculo con pathLength=\"100\" y un stroke-dasharray de su porcentaje, desplazado con stroke-dashoffset. «Animar» los dibuja uno tras otro con la Web Animations API y await finished; volver a pulsar cancela la secuencia anterior sin errores. La leyenda con los importes es el texto del gráfico"
example_tags: "javascript|svg|web-animations|finished|stroke-dasharray|graficos|accesibilidad|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="drive">
  <h1>Colecta del Banco de Alimentos · octubre</h1>
  <div class="drive__layout">
    <svg class="drive__ring" viewBox="0 0 160 160" role="img" aria-labelledby="ring-title">
      <title id="ring-title">Recaudado: 85 % de la meta, por categorías (detalle en la leyenda)</title>
      <g transform="rotate(-90 80 80)">
        <circle cx="80" cy="80" r="60" fill="none" stroke="#e4e7eb" stroke-width="18"/>
        <g id="segments"></g>
      </g>
      <text id="ring-label" x="80" y="80" text-anchor="middle" dominant-baseline="central"
            font-family="system-ui, sans-serif" font-size="26" font-weight="700" fill="#1f2933">85 %</text>
    </svg>
    <ul id="legend" class="drive__legend"></ul>
  </div>
  <button id="animate" type="button">Animar el anillo</button>
  <p id="status" class="drive__status" role="status"></p>
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
.drive {
  max-width: 34rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.15rem;
  margin-top: 0;
}
.drive__layout {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  align-items: center;
}
.drive__ring {
  width: 180px;
  height: 180px;
}
.drive__legend {
  display: grid;
  gap: 0.4rem;
  padding: 0;
  list-style: none;
}
.drive__legend li {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.drive__swatch {
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 50%;
}
.drive__status {
  color: #52606d;
}
button {
  font: inherit;
  padding: 0.3rem 0.8rem;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Anillo de la colecta.
//
// Decisiones de diseño:
// - pathLength="100" hace que la longitud de cada círculo «mida» 100: un porcentaje es
//   directamente su stroke-dasharray («45 100»), sin calcular 2πr. stroke-dashoffset negativo
//   mueve el principio del trazo a donde acaba la categoría anterior.
// - Al cargar, el anillo está completo y quieto. «Animar» lo dibuja categoría a categoría:
//   cada paso es un element.animate() y un await de su finished.
// - Volver a pulsar a mitad cancela las animaciones en curso: sus finished se rechazan con
//   AbortError, que la secuencia anterior captura y la hace terminar sin tocar nada más.
// - Con «reducir movimiento», el botón no anima: el anillo ya está completo.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.

const GOAL = 50000;
const categories = [
  { name: 'Despensa', amount: 22500, color: '#0e7490' },
  { name: 'Medicinas', amount: 12500, color: '#be123c' },
  { name: 'Útiles escolares', amount: 7500, color: '#b45309' },
];
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
const SVG_NS = 'http://www.w3.org/2000/svg';

let start = 0;
const segments = categories.map((category) => {
  const percent = (category.amount * 100) / GOAL;   // porcentaje de la meta
  const circle = document.createElementNS(SVG_NS, 'circle');
  for (const [name, value] of Object.entries({
    cx: 80, cy: 80, r: 60, fill: 'none', stroke: category.color, 'stroke-width': 18,
    pathLength: 100, 'stroke-dasharray': `${percent} 100`, 'stroke-dashoffset': -start,
  })) circle.setAttribute(name, value);
  document.querySelector('#segments').append(circle);
  const item = document.createElement('li');
  item.innerHTML = `<span class="drive__swatch" style="background: ${category.color}"></span>`;
  item.append(`${category.name}: ${money.format(category.amount)} (${percent} %)`);
  document.querySelector('#legend').append(item);
  const segment = { ...category, percent, from: start, circle };
  start += percent;
  return segment;
});
const raised = categories.reduce((sum, c) => sum + c.amount, 0);
console.log(`recaudado ${money.format(raised)} de ${money.format(GOAL)} (${start} %)`);
for (const s of segments) console.log(`${s.name}: del ${s.from} % al ${s.from + s.percent} %`);

// Un fotograma congelado: a mitad de una animación lineal, el trazo lleva la mitad
const probe = segments[0].circle.animate({ strokeDasharray: ['0 100', `${segments[0].percent} 100`] }, { duration: 1000, easing: 'linear' });
probe.pause();
probe.currentTime = 500;
console.log('Despensa a mitad →', parseFloat(getComputedStyle(segments[0].circle).strokeDasharray), 'de', segments[0].percent);
probe.cancel();

// ── La secuencia ─────────────────────────────────────────────────────────
const label = document.querySelector('#ring-label');
const statusLine = document.querySelector('#status');
let running = [];
async function playSequence() {
  running.forEach((animation) => animation.cancel()); // la secuencia anterior, fuera
  running = [];
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {   // matchMedia: módulo siguiente
    statusLine.textContent = 'Movimiento reducido: el anillo ya está completo.';
    return;
  }
  for (const s of segments) s.circle.style.strokeDasharray = '0 100';
  let shown = 0;
  label.textContent = '0 %';
  try {
    for (const s of segments) {
      const animation = s.circle.animate(
        { strokeDasharray: ['0 100', `${s.percent} 100`] },
        { duration: 600 + s.percent * 10, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
      );
      running.push(animation);
      s.circle.style.strokeDasharray = `${s.percent} 100`;   // el estado final, en el estilo (sin fill)
      await animation.finished;
      shown += s.percent;
      label.textContent = `${shown} %`;
      statusLine.textContent = `${s.name}: ${money.format(s.amount)}`;
      console.log(`✔️ ${s.name} · ${shown} % de la meta`);
    }
    statusLine.textContent = `Total: ${money.format(raised)}, el ${shown} % de la meta`;
  } catch (error) {
    if (error.name !== 'AbortError') throw error;
    console.log('↩️ secuencia anterior cancelada');
  }
}
document.querySelector('#animate').addEventListener('click', playSequence);
console.log('Listo: pulsa «Animar el anillo» (y otra vez a mitad, para ver la cancelación)');
```
