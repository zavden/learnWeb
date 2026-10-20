---
example_description: "Pointer Events: los mismos eventos (pointerdown, pointermove, pointerup) para ratón, dedo y lápiz; pointerType dice cuál, button qué botón cambió, buttons cuáles siguen pulsados (máscara de bits) y pressure la presión"
example_tags: "javascript|eventos|pointer-events|raton|tactil|lapiz|buttons"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Probador del puntero</h1>
  <div id="pad" class="pad">
    <span id="dot" class="dot" aria-hidden="true"></span>
    Pulsa, arrastra o haz clic derecho aquí
  </div>
  <p class="readout">buttons: <output id="buttons">0</output> · pressure: <output id="pressure">0</output></p>
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
.pad {
  position: relative;
  display: grid;
  place-items: center;
  height: 9rem;
  border: 2px dashed #7b8794;
  border-radius: 0.75rem;
  background: #ffffff;
  color: #52606d;
  user-select: none;
  touch-action: none; /* que el dedo no desplace la página (ejemplo 10) */
}
.dot {
  position: absolute;
  top: -0.5rem;
  left: -0.5rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: #1d4ed8;
  pointer-events: none; /* el punto nunca es target: lo es siempre la zona */
}
.readout {
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
const pad = document.querySelector('#pad');
const dot = document.querySelector('#dot');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
  if (logList.children.length > 8) logList.firstElementChild.remove();
}

// Los mismos eventos para cualquier dispositivo apuntador.
for (const type of ['pointerdown', 'pointerup', 'pointercancel']) {
  pad.addEventListener(type, (event) => {
    logLine(`${event.type} · pointerType: ${event.pointerType} · button: ${event.button}`
      + ` · buttons: ${event.buttons} · isPrimary: ${event.isPrimary}`);
  });
}

// pointermove llega muchas veces por segundo: no se escribe en la lista,
// solo mueve el punto y actualiza los indicadores.
pad.addEventListener('pointermove', (event) => {
  const box = pad.getBoundingClientRect();
  dot.style.translate = `${event.clientX - box.left}px ${event.clientY - box.top}px`;
  document.querySelector('#buttons').textContent = event.buttons;
  document.querySelector('#pressure').textContent = event.pressure;
});

// Sin el menú del navegador, para poder probar el botón derecho.
pad.addEventListener('contextmenu', (event) => event.preventDefault());
logLine('Listo: pulsa en la zona con el botón izquierdo y luego con el derecho');

// button: qué botón CAMBIÓ en este evento (0 izquierdo, 1 central, 2 derecho;
//         -1 en pointermove, porque no cambió ninguno).
// buttons: cuáles están pulsados AHORA, sumados como bits (1 izquierdo,
//          2 derecho, 4 central): 3 = izquierdo + derecho.
// pressure: 0 a 1; un ratón da 0.5 con un botón pulsado y 0 sin ninguno.
// Después de cada pointer*, el navegador dispara también el mouse*
// equivalente (mousedown, mousemove…) por compatibilidad.
// Esta zona solo muestra datos del puntero; una función de verdad necesitaría
// su alternativa de teclado (como el control deslizante del ejemplo siguiente).
```
