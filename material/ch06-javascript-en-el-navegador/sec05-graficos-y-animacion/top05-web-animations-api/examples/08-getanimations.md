---
example_description: "document.getAnimations() devuelve TODAS las animaciones en marcha: las de @keyframes como CSSAnimation (con animationName), las transiciones como CSSTransition (con transitionProperty) y las de animate() como Animation. Con la misma API se pausan todas de una vez"
example_tags: "javascript|web-animations|getanimations|cssanimation|csstransition|accesibilidad"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Oferta del día</h1>
  <p id="badge" class="badge">−30 % en mezcal artesanal</p>
  <p id="price" class="price">$420</p>
  <button id="toggle" type="button" aria-pressed="false">⏸ Pausar las animaciones</button>
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
/* Una animación de CSS: un pulso de opacidad, 6 veces (nada infinito) */
.badge {
  width: max-content;
  padding: 0.3rem 0.6rem;
  border-radius: 0.4rem;
  background: #be123c;
  color: #ffffff;
  animation: pulse 1.5s ease-in-out 6;
}
@keyframes pulse {
  50% { opacity: 0.6; }
}
/* Una transición de CSS: arranca cuando el script añade la clase */
.price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1f2933;
  transition: color 8s;
}
.price.is-new {
  color: #0e7490;
}
button {
  font: inherit;
  padding: 0.3rem 0.8rem;
}
button:focus-visible {
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
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// La transición: leer el estilo fija el color de partida; añadir la clase la dispara
const price = document.querySelector('#price');
getComputedStyle(price).color;                // (leerlo obliga a calcular el estilo de ahora)
price.classList.add('is-new');

// Y una animación de JavaScript (un cambio de color, sin movimiento), con un id para reconocerla
const glow = document.querySelector('#badge').animate(
  { backgroundColor: ['#be123c', '#9f1239', '#be123c'] },
  { duration: 1500, iterations: 6 },
);
glow.id = 'destello';

function describe(animation) {
  if (animation instanceof CSSTransition) return `CSSTransition · transitionProperty: ${animation.transitionProperty}`;
  if (animation instanceof CSSAnimation) return `CSSAnimation · animationName: ${animation.animationName}`;
  return `${animation.constructor.name} · id: ${animation.id}`;
}
for (const animation of document.getAnimations()) logLine(describe(animation));

// Un botón para pausarlo todo: lo que pide la pauta WCAG 2.2.2 para el movimiento que dura
const toggle = document.querySelector('#toggle');
toggle.addEventListener('click', () => {
  const pause = toggle.getAttribute('aria-pressed') === 'false';
  for (const animation of document.getAnimations()) {
    if (pause) animation.pause();
    else animation.play();
  }
  toggle.setAttribute('aria-pressed', String(pause));
  toggle.textContent = pause ? '▶ Reanudar las animaciones' : '⏸ Pausar las animaciones';
  logLine(`${pause ? '⏸ pausadas' : '▶ reanudadas'}: ${document.getAnimations().map((a) => a.playState).join(', ')}`);
});
logLine('Listo: pulsa «Pausar las animaciones»');
```
