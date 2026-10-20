---
example_description: "Un listener registrado con { capture: true } solo se quita pasando también capture: removeEventListener sin esa opción busca otro listener y no quita nada; once y passive no cuentan para encontrarlo"
example_tags: "javascript|eventos|removeeventlistener|capture|opciones|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Cafetería La Ceiba</h1>
  <p>Dos contadores de analítica escuchan los clics de toda la página (en la fase de captura). Al cargar, se intentó quitar los dos.</p>
  <p class="actions">
    <button id="buy" type="button">Comprar</button>
    <button id="menu" type="button">Ver la carta</button>
  </p>
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
.actions {
  display: flex;
  gap: 0.5rem;
}
button {
  font: inherit;
  padding: 0.4rem 0.8rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
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
}

// Qué se pulsó: el id del elemento o, si no tiene, su etiqueta.
function describeTarget(event) {
  return event.target.id ? `#${event.target.id}` : event.target.tagName;
}

// capture: true escucha en la fase de captura (lección «Propagación»): el
// documento se entera del clic ANTES que el botón.
function trackForAgency(event) {
  logLine(`🐛 analítica A (no se quitó) → clic en ${describeTarget(event)}`);
}
function trackForOwner(event) {
  logLine(`analítica B → clic en ${describeTarget(event)} (no debería salir)`);
}
document.addEventListener('click', trackForAgency, { capture: true });
document.addEventListener('click', trackForOwner, { capture: true, passive: true });

// 🐛 Sin capture, removeEventListener busca un listener de la fase de
//    burbuja con esa función. No existe, así que no quita nada (ni avisa).
document.removeEventListener('click', trackForAgency);

// ✅ Con la misma fase: { capture: true } o, abreviado, true.
//    once y passive no se comparan: solo tipo, función y capture.
document.removeEventListener('click', trackForOwner, true);

logLine('Listo: pulsa «Comprar» o «Ver la carta»');

// La clave de un listener es el trío (tipo, función, capture). Por eso
// también se puede registrar la MISMA función dos veces, una por fase:
//   addEventListener('click', f, true); addEventListener('click', f);
```
