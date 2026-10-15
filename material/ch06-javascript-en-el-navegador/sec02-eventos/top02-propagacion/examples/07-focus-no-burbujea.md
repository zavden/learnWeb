---
example_description: "focus y blur no burbujean: un listener de focus en el formulario nunca se ejecuta al enfocar un campo; focusin y focusout sí suben (event.bubbles → true), y focus también se puede escuchar en la fase de captura"
example_tags: "javascript|eventos|focus|focusin|focusout|burbuja|formularios|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <form id="shipping" class="shipping">
    <h1>Datos de envío</h1>
    <label>Calle y número <input id="street" data-help="Ejemplo: Av. Juárez 120, int. 4"></label>
    <label>Código postal <input id="zip" inputmode="numeric" data-help="5 dígitos: 06000"></label>
    <p id="help" class="help" aria-live="polite">Elige un campo para ver una ayuda.</p>
  </form>
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
  font-size: 1.1rem;
  margin: 0 0 0.5rem;
}
.shipping {
  display: grid;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
/* Para estilos no hace falta JS: :focus-within marca el formulario activo. */
.shipping:focus-within {
  border-color: #1d4ed8;
}
label {
  display: grid;
  gap: 0.25rem;
}
input {
  font: inherit;
  padding: 0.35rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
}
input:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 1px;
}
.help {
  margin: 0;
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
const form = document.querySelector('#shipping');
const help = document.querySelector('#help');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// 🐛 focus no burbujea: llega al <input> y NO sube al formulario.
form.addEventListener('focus', (event) => {
  logLine(`🐛 focus en el form → #${event.target.id} (esta línea nunca sale)`);
});

// ✅ focusin es el mismo aviso, pero burbujea: el formulario se entera.
form.addEventListener('focusin', (event) => {
  help.textContent = event.target.dataset.help;
  logLine(`✅ focusin → #${event.target.id} · bubbles: ${event.bubbles}`);
});
form.addEventListener('focusout', (event) => {
  logLine(`✅ focusout → #${event.target.id}`);
});

// ✅ Un evento que no burbujea sí pasa por la fase de CAPTURA.
form.addEventListener('focus', (event) => {
  logLine(`✅ focus en captura → #${event.target.id} · bubbles: ${event.bubbles}`);
}, { capture: true });

logLine('Listo: haz clic en «Calle y número» y luego pulsa Tab');

// Tampoco burbujean blur, mouseenter/mouseleave, pointerenter/pointerleave,
// load y error de imágenes, ni scroll en un elemento. event.bubbles lo dice.
```
