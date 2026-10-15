---
example_description: "Las tres Core Web Vitals observadas con PerformanceObserver dentro de la vista previa: largest-contentful-paint (LCP: el elemento más grande pintado), layout-shift (CLS: un aviso que llega tarde y empuja la página) y event (INP: un clic que tarda en pintarse). Se imprimen tipos y hechos, no valores"
example_tags: "javascript|rendimiento|web-vitals|lcp|cls|inp|performanceobserver"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <div id="promo-slot"></div>
  <h1 class="hero">Café de Chiapas, tueste medio</h1>
  <p class="price">Bolsa de 500 g · $189</p>
  <button id="add" type="button">Añadir al carrito</button>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
.hero { font-size: 2.4rem; line-height: 1.1; margin: 0.5rem 0; }
.price { margin: 0 0 0.75rem; }
.promo { margin: 0; padding: 0.5rem 0.75rem; border-radius: 0.4rem; background: #fef3c7; color: #78350f; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; cursor: pointer; }
button:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
// Todo lo que se observa aquí es del documento de la vista previa (un iframe), no de LearnWeb.

// LCP: cuándo se pintó el elemento más grande del primer vistazo. Puede haber varios
// candidatos mientras la página carga; deja de medirse con el primer clic o tecla.
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    logLine(`largest-contentful-paint · elemento: <${entry.element?.localName}>`);
  }
}).observe({ type: 'largest-contentful-paint', buffered: true });

// CLS: cada vez que algo visible se mueve sin que el usuario haya hecho nada.
let shifts = 0;
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    shifts += 1;
    logLine(`layout-shift ${shifts} · ¿justo tras un clic o una tecla? ${entry.hadRecentInput} · ¿movió algo? ${entry.value > 0}`);
  }
}).observe({ type: 'layout-shift', buffered: true });

// INP: del clic (o tecla) al siguiente pintado. durationThreshold: 16 pide también las cortas.
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.name !== 'click') continue; // llegan también pointerdown y pointerup
    logLine(`event · click · ¿tardó ≥ 100 ms en pintarse? ${entry.duration >= 100} · ¿es una interacción? ${entry.interactionId > 0}`);
  }
}).observe({ type: 'event', durationThreshold: 16, buffered: true });

// 🐛 CLS: un aviso que llega al segundo y nadie le reservó sitio: empuja todo hacia abajo.
// (✅ Reservar su altura en CSS, con min-height en #promo-slot, evita el salto.)
setTimeout(() => {
  const promo = Object.assign(document.createElement('p'), { className: 'promo', textContent: '🚚 Envío gratis en pedidos de más de $499' });
  document.querySelector('#promo-slot').append(promo);
}, 1000);

// 🐛 INP: el clic hace 150 ms de trabajo antes de que el navegador pueda pintar la respuesta.
const addButton = document.querySelector('#add');
addButton.addEventListener('click', () => {
  const end = performance.now() + 150;
  while (performance.now() < end) {} // simula validar, recalcular y guardar el carrito
  addButton.textContent = 'Añadido ✓';
});
console.log('Listo: espera un segundo (llega un aviso) y pulsa «Añadir al carrito»');
```
