---
example_description: "Dos formas de animar un nivel en SVG: con requestAnimationFrame, cambiando los atributos y y height en cada frame (sirve para cualquier atributo, en el hilo principal), o cambiando una sola vez el estilo y dejando que una transición de CSS de scale haga el resto"
example_tags: "javascript|svg|animacion|requestanimationframe|transition|transform-box|prefers-reduced-motion"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Depósitos de agua</h1>
  <svg viewBox="0 0 300 150" width="300" height="150" role="img" aria-labelledby="levels">
    <rect x="30" y="10" width="100" height="120" fill="#e0f2fe" stroke="#0369a1" stroke-width="2"/>
    <rect id="level-js" x="31" y="106" width="98" height="24" fill="#0284c7"/>
    <rect x="170" y="10" width="100" height="120" fill="#e0f2fe" stroke="#0369a1" stroke-width="2"/>
    <!-- Este mide siempre el depósito entero y se escala desde abajo -->
    <rect id="level-css" x="171" y="10" width="98" height="120" fill="#0284c7"/>
    <text x="80" y="146" text-anchor="middle" font-size="11" fill="#1f2933">rAF + atributos</text>
    <text x="220" y="146" text-anchor="middle" font-size="11" fill="#1f2933">transición de CSS</text>
  </svg>
  <p id="levels" aria-live="polite">Nivel: 20 %</p>
  <button type="button" data-level="0.75">Llenar al 75 %</button>
  <button type="button" data-level="0.2">Vaciar al 20 %</button>
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
  background: #ffffff;
}
/* transform-box: fill-box → el origen se mide en la caja de la propia forma, no en el viewBox */
#level-css {
  transform-box: fill-box;
  transform-origin: bottom;
  scale: 1 0.2;
  transition: scale 0.8s ease-out;
}
@media (prefers-reduced-motion: reduce) {
  #level-css {
    transition: none;
  }
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
const INNER = 120;                                // la altura útil del depósito
const BOTTOM = 130;                               // la y del fondo
const easeOutCubic = (t) => 1 - (1 - t) ** 3;
const heightAt = (from, to, progress) => from + (to - from) * easeOutCubic(progress);

// 1. JavaScript: en cada frame, calcula la altura y reescribe y + height
const levelJs = document.querySelector('#level-js');
let current = 0.2;
let frameId = null;
function animateLevel(target) {
  cancelAnimationFrame(frameId);                  // si había una animación a medias, se sustituye
  const from = current;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; // módulo siguiente
  let start = null;
  frameId = requestAnimationFrame(function frame(now) {
    start ??= now;
    const progress = reduce ? 1 : Math.min((now - start) / 800, 1);
    current = heightAt(from, target, progress);
    levelJs.setAttribute('y', BOTTOM - current * INNER);
    levelJs.setAttribute('height', current * INNER);
    if (progress < 1) frameId = requestAnimationFrame(frame);
  });
}

// 2. CSS: un solo cambio de estilo; la transición la ejecuta el navegador (scale: compositor)
const levelCss = document.querySelector('#level-css');

document.querySelectorAll('button').forEach((button) => {
  button.addEventListener('click', () => {
    const target = Number(button.dataset.level);
    animateLevel(target);
    levelCss.style.scale = `1 ${target}`;
    document.querySelector('#levels').textContent = `Nivel: ${target * 100} %`;
    console.log(`→ ${target * 100} %`);
  });
});

// La cuenta del frame que cae a mitad de camino (de 20 % a 75 %), sin pantalla
console.log('a mitad de la animación → altura', (heightAt(0.2, 0.75, 0.5) * INNER).toFixed(2), 'de', INNER);
console.log('Listo: pulsa «Llenar al 75 %»');
```
