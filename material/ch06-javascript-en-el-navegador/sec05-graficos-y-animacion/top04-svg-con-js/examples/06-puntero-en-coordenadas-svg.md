---
example_description: "Un SVG con viewBox de 400 × 200 mostrado a 300 × 150 px: la posición del puntero en px CSS no es una coordenada del dibujo. getScreenCTM().inverse() convierte un punto de la pantalla al sistema del viewBox, y tiene en cuenta cualquier escala o desplazamiento"
example_tags: "javascript|svg|viewbox|getscreenctm|dompoint|coordenadas|puntero"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>¿Dónde ponemos el picnic?</h1>
  <p class="hint">Haz clic en el parque. Con el teclado: Tab hasta el plano y las flechas.</p>
  <svg id="park" viewBox="0 0 400 200" tabindex="0" role="img" aria-label="Plano del parque con un estanque en el centro; la marca roja es tu sitio">
    <rect width="400" height="200" fill="#dcfce7"/>
    <ellipse cx="200" cy="100" rx="70" ry="40" fill="#7dd3fc"/>
    <circle id="naive" r="8" fill="#9aa5b1" cx="-20" cy="-20"/>
    <circle id="marker" r="8" fill="#be123c" cx="60" cy="50"/>
  </svg>
  <ol id="log" class="log" aria-live="polite"></ol>
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
.hint {
  color: #52606d;
  font-size: 0.9rem;
}
/* La caja mide 300 × 150: cada unidad del viewBox ocupa 0,75 px CSS */
svg {
  display: block;
  width: 300px;
  height: 150px;
  cursor: crosshair;
}
svg:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.log {
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
const park = document.querySelector('#park');
const marker = document.querySelector('#marker');
const naive = document.querySelector('#naive');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.prepend(Object.assign(document.createElement('li'), { textContent: text }));
}
function place(circle, x, y) {
  circle.setAttribute('cx', x);
  circle.setAttribute('cy', y);
}

park.addEventListener('click', (event) => {
  // ✅ La matriz que lleva del viewBox a la pantalla, invertida: de la pantalla al viewBox
  const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(park.getScreenCTM().inverse());
  place(marker, point.x, point.y);
  // 🐛 Los px CSS dentro de la caja, usados como si fueran unidades del viewBox
  const box = park.getBoundingClientRect();
  const cssX = event.clientX - box.left;
  const cssY = event.clientY - box.top;
  place(naive, cssX, cssY);
  logLine(`✅ (${Math.round(point.x)}, ${Math.round(point.y)}) · 🐛 sin convertir (${Math.round(cssX)}, ${Math.round(cssY)})`);
});

// La alternativa de teclado: las flechas mueven la marca 10 unidades
park.addEventListener('keydown', (event) => {
  const moves = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] };
  if (!(event.key in moves)) return;
  event.preventDefault();
  const x = Math.min(400, Math.max(0, marker.cx.baseVal.value + moves[event.key][0]));
  const y = Math.min(200, Math.max(0, marker.cy.baseVal.value + moves[event.key][1]));
  place(marker, x, y);
  logLine(`⌨️ ${event.key} → (${Math.round(x)}, ${Math.round(y)})`);
});

const { x, y, width, height } = park.viewBox.baseVal;
const box = park.getBoundingClientRect();
logLine(`viewBox ${x} ${y} ${width} ${height} · caja ${box.width} × ${box.height} px → 1 unidad = ${park.getScreenCTM().a} px`);
logLine('Listo: haz clic en el parque');
```
