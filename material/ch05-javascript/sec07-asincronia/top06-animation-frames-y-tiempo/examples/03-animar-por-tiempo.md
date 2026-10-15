---
example_description: "Animar por tiempo con requestAnimationFrame: la posición se calcula a partir del tiempo transcurrido (progreso = transcurrido / duración, con una curva de suavizado), no del número de frames; la furgoneta recorre la ruta en 1 s en cualquier pantalla y termina exactamente al final"
example_tags: "javascript|requestanimationframe|animacion|easing|tiempo"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main class="tracking">
  <h1>Seguimiento del pedido P-2077</h1>
  <div class="route" aria-hidden="true">
    <div class="van">🚚</div>
  </div>
  <p id="status" role="status">Saliendo del almacén…</p>
  <button id="replay" type="button">Repetir</button>
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
.tracking {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.route {
  position: relative;
  height: 3rem;
  border-bottom: 3px dashed #7b8794;
}
.van {
  position: absolute;
  bottom: 0.25rem;
  left: 0;
  font-size: 2rem;
  line-height: 1;
}
button {
  font: inherit;
  padding: 0.4rem 0.8rem;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// querySelector, textContent, offsetWidth, style y addEventListener se
// estudian en el capítulo 6. style.translate mueve el elemento en pantalla.
const van = document.querySelector('.van');
const route = document.querySelector('.route');
const statusLine = document.querySelector('#status');
const replayButton = document.querySelector('#replay');
const DURATION_MS = 1000;

// Curva de suavizado: arranca rápido y frena al llegar (progreso 0…1 → 0…1).
const easeOutCubic = (t) => 1 - (1 - t) ** 3;

function drive() {
  const distance = route.offsetWidth - van.offsetWidth; // px que hay que recorrer
  let start = null;
  let frames = 0;
  replayButton.disabled = true; // una animación cada vez
  statusLine.textContent = 'En camino…';

  requestAnimationFrame(function step(frameTime) {
    start ??= frameTime;                                      // el primer frame marca el inicio
    const progress = Math.min((frameTime - start) / DURATION_MS, 1); // 0 → 1, nunca más de 1
    const x = easeOutCubic(progress) * distance;
    van.style.translate = `${x}px 0`;
    frames += 1;
    if (progress < 1) {
      requestAnimationFrame(step);
      return;
    }
    statusLine.textContent = 'Entregado ✅';
    replayButton.disabled = false;
    console.log('▶ entrega animada');
    console.log('  la furgoneta acabó justo al final de la ruta →', x === distance);
    console.log(`  frames dibujados ≈ ${frames} (≈ 60 a 60 Hz, ≈ 120 a 120 Hz; varía)`);
  });
}

replayButton.addEventListener('click', drive);
drive();

// La clave: la posición depende del TIEMPO transcurrido, no de cuántos frames
// han pasado. Con 60 o con 120 frames por segundo, la furgoneta llega en 1 s;
// con más frames, el movimiento es más suave, no más rápido.
// Math.min(…, 1) garantiza que el último frame deja la furgoneta justo al final.
```
