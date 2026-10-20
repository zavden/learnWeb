---
example_description: "Arrastrar el tirador de un control de volumen escuchando pointermove en el propio tirador: al salirse el puntero (moverlo rápido, o arriba y abajo) se pierde el arrastre y el pointerup; setPointerCapture envía todos los eventos del puntero al tirador hasta soltar. Con flechas del teclado como alternativa"
example_tags: "javascript|eventos|pointer-events|setpointercapture|arrastrar|slider|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Volumen</h1>
  <p class="hint">Arrastra cada tirador deprisa, o moviendo el ratón hacia arriba y hacia abajo. Con el teclado: Tab hasta un tirador y las flechas.</p>
  <div class="slider" id="slider-buggy">
    <span class="label">🐛 sin captura</span>
    <div class="track"><div class="fill"></div>
      <div class="thumb" role="slider" tabindex="0" aria-label="Volumen sin captura" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"></div>
    </div>
    <output>50</output>
  </div>
  <div class="slider" id="slider-fixed">
    <span class="label">✅ con setPointerCapture</span>
    <div class="track"><div class="fill"></div>
      <div class="thumb" role="slider" tabindex="0" aria-label="Volumen con captura" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50"></div>
    </div>
    <output>50</output>
  </div>
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
}
.slider {
  display: grid;
  grid-template-columns: 11rem 1fr 2.5rem;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}
.track {
  position: relative;
  height: 0.5rem;
  border-radius: 0.25rem;
  background: #cbd2d9;
}
.fill {
  width: 50%;
  height: 100%;
  border-radius: 0.25rem;
  background: #1d4ed8;
}
.thumb {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 1.25rem;
  height: 1.25rem;
  translate: -50% -50%;
  border: 2px solid #1d4ed8;
  border-radius: 50%;
  background: #ffffff;
  cursor: grab;
  touch-action: none; /* en pantallas táctiles: el gesto es para el tirador (ejemplo 10) */
  user-select: none;
}
.thumb:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
output {
  font-variant-numeric: tabular-nums;
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
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
  if (logList.children.length > 8) logList.firstElementChild.remove();
}

function makeSlider(root, useCapture) {
  const track = root.querySelector('.track');
  const thumb = root.querySelector('.thumb');
  const label = useCapture ? '✅ con captura' : '🐛 sin captura';
  let dragging = false;

  function setValue(value) {
    const volume = Math.round(Math.min(100, Math.max(0, value)));
    thumb.style.left = `${volume}%`;
    root.querySelector('.fill').style.width = `${volume}%`;
    thumb.setAttribute('aria-valuenow', volume);
    root.querySelector('output').textContent = volume;
    return volume;
  }

  thumb.addEventListener('pointerdown', (event) => {
    dragging = true;
    // ✅ «Todos los eventos de ESTE puntero, a mí, hasta que se suelte.»
    if (useCapture) thumb.setPointerCapture(event.pointerId);
  });
  thumb.addEventListener('pointermove', (event) => {
    if (!dragging) return;
    const box = track.getBoundingClientRect();
    setValue(((event.clientX - box.left) / box.width) * 100);
  });
  thumb.addEventListener('pointerup', () => {
    dragging = false;
    logLine(`${label}: soltado en ${thumb.getAttribute('aria-valuenow')}`);
  });
  // 🐛 Sin captura, en cuanto el puntero sale del tirador, pointermove y
  //    pointerup van a OTRO elemento: el arrastre se corta.
  thumb.addEventListener('pointerleave', () => {
    if (dragging && !useCapture) logLine('🐛 el puntero salió del tirador: arrastre perdido');
  });
  // Con captura, el navegador la suelta solo al levantar el botón (o al cancelar).
  thumb.addEventListener('lostpointercapture', () => {
    dragging = false;
  });
  // La alternativa de teclado de cualquier arrastre.
  thumb.addEventListener('keydown', (event) => {
    const now = Number(thumb.getAttribute('aria-valuenow'));
    const steps = { ArrowRight: 5, ArrowUp: 5, ArrowLeft: -5, ArrowDown: -5, Home: -100, End: 100 };
    if (!(event.key in steps)) return;
    event.preventDefault(); // que las flechas no desplacen la página
    logLine(`${label}: ${event.key} → ${setValue(now + steps[event.key])}`);
  });
}
makeSlider(document.querySelector('#slider-buggy'), false);
makeSlider(document.querySelector('#slider-fixed'), true);
logLine('Listo: arrastra los dos tiradores deprisa, saliéndote de ellos');

// Fíjate en otro síntoma del 🐛: si sueltas el botón FUERA del tirador, el
// pointerup no le llega y dragging se queda en true; al volver a pasar por
// encima sin pulsar nada, ¡el tirador se mueve solo! Con captura, el pointerup
// llega siempre (incluso fuera de la vista previa).
```
