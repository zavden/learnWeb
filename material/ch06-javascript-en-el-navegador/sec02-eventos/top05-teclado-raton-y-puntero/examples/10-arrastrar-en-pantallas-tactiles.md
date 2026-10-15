---
example_description: "Arrastrar con el dedo necesita touch-action: none: sin él, el navegador usa el gesto para desplazar la página, envía pointercancel y el arrastre se corta; con ratón no se nota. Se prueba con el modo dispositivo de DevTools"
example_tags: "javascript|eventos|pointer-events|touch-action|tactil|pointercancel|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Pegatinas para la foto del grupo</h1>
  <p class="hint">Arrastra cada pegatina con el dedo (o con el ratón). Teclado: Tab hasta una pegatina y las flechas.</p>
  <div id="photo" class="photo">
    <button type="button" class="sticker" id="sticker-a" aria-label="Pegatina A, sin touch-action">🎉 A</button>
    <button type="button" class="sticker sticker-fixed" id="sticker-b" aria-label="Pegatina B, con touch-action: none">⭐ B</button>
  </div>
  <ol id="log" class="log" aria-live="polite"></ol>
  <p class="spacer">(Espacio para que la página se pueda desplazar con el dedo.)</p>
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
}
.photo {
  position: relative;
  height: 12rem;
  border-radius: 0.75rem;
  background: linear-gradient(160deg, #fde68a, #fca5a5 60%, #c4b5fd);
}
.sticker {
  position: absolute;
  top: 2rem;
  left: 2rem;
  font: inherit;
  font-size: 1.25rem;
  padding: 0.4rem 0.6rem;
  border: 2px solid #1f2933;
  border-radius: 0.75rem;
  background: #ffffff;
  color: #1f2933;
  cursor: grab;
  user-select: none;
}
.sticker-fixed {
  left: 9rem;
  touch-action: none; /* ✅ el gesto en esta pegatina es para el script */
}
.sticker:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.spacer {
  height: 120vh;
  color: #52606d;
}
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
const photo = document.querySelector('#photo');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
  if (logList.children.length > 8) logList.firstElementChild.remove();
}

function makeDraggable(sticker) {
  let start = null; // dónde empezó el arrastre, o null si no se arrastra
  const moveTo = (x, y) => {
    sticker.style.left = `${x}px`;
    sticker.style.top = `${y}px`;
  };
  sticker.addEventListener('pointerdown', (event) => {
    start = { x: event.clientX - sticker.offsetLeft, y: event.clientY - sticker.offsetTop };
    sticker.setPointerCapture(event.pointerId);
    logLine(`#${sticker.id} · pointerdown · pointerType: ${event.pointerType}`);
  });
  sticker.addEventListener('pointermove', (event) => {
    if (start) moveTo(event.clientX - start.x, event.clientY - start.y);
  });
  sticker.addEventListener('pointerup', () => {
    if (start) logLine(`✅ #${sticker.id} · soltada`);
    start = null;
  });
  // 🐛 El navegador se quedó el gesto (para desplazar la página) y cancela
  //    el puntero: no llegarán más pointermove ni el pointerup.
  sticker.addEventListener('pointercancel', () => {
    logLine(`🐛 #${sticker.id} · pointercancel: el navegador usó el gesto para desplazar la página`);
    start = null;
  });
  sticker.addEventListener('keydown', (event) => {
    const steps = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] };
    if (!(event.key in steps)) return;
    event.preventDefault();
    const [dx, dy] = steps[event.key];
    moveTo(sticker.offsetLeft + dx, sticker.offsetTop + dy);
  });
}
for (const sticker of photo.querySelectorAll('.sticker')) makeDraggable(sticker);
logLine('Listo: arrastra las dos pegatinas hacia abajo; para el dedo, abre la vista previa con ↗ y usa el modo dispositivo de DevTools');

// Con el ratón, las dos funcionan: el bug solo aparece con el dedo. Antes de
// enviar los pointermove, el navegador decide si un gesto táctil es suyo
// (desplazar, hacer zoom) según el touch-action del elemento. Por defecto es
// auto: «el gesto es mío». touch-action: none lo deja todo para el script;
// pan-y le deja al navegador solo el desplazamiento vertical.
```
