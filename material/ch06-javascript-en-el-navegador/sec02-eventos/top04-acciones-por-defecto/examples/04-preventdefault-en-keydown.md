---
example_description: "Un atajo de teclado global que llama a preventDefault() en TODAS las teclas impide escribir en los campos, moverse con Tab y usar atajos del navegador; la versión correcta solo cancela sus teclas, fuera de los campos y sin modificadores"
example_tags: "javascript|eventos|keydown|preventdefault|atajos|accesibilidad|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Bandeja de entrada</h1>
  <label for="search">Buscar correo</label>
  <input id="search" type="search">
  <ul id="inbox" class="inbox">
    <li>Tostaduría La Ceiba · Tu pedido salió hoy</li>
    <li>Lucía Méndez · Fotos del taller de barismo</li>
    <li>Banco del Pacífico · Estado de cuenta de octubre</li>
  </ul>
  <p class="hint"><kbd>j</kbd> / <kbd>k</kbd>: siguiente / anterior correo (fuera del buscador).</p>
  <label><input type="checkbox" id="buggy" checked> Modo con bug (<code>preventDefault</code> en todas las teclas)</label>
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
#search {
  display: block;
  width: 100%;
  box-sizing: border-box;
  margin-top: 0.25rem;
  font: inherit;
  padding: 0.35rem 0.5rem;
}
input:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.inbox {
  padding: 0;
  list-style: none;
}
.inbox li {
  padding: 0.35rem 0.5rem;
  border-bottom: 1px solid #cbd2d9;
}
.inbox li.selected {
  background: #e0e7ff;
  font-weight: 600;
}
.hint {
  color: #52606d;
  font-size: 0.9rem;
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
const emails = [...document.querySelectorAll('#inbox li')];
const buggyMode = document.querySelector('#buggy');
const logList = document.querySelector('#log');
let selected = 0;
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
// ¿Está escribiendo? Campos de texto sí; casillas y botones no.
function isTyping(target) {
  return target.isContentEditable
    || target.matches('textarea, select, input:not([type="checkbox"], [type="radio"], [type="button"], [type="submit"])');
}
function selectEmail(index) {
  emails[selected].classList.remove('selected');
  selected = (index + emails.length) % emails.length;
  emails[selected].classList.add('selected');
  logLine(`✉️ ${emails[selected].textContent}`);
}

document.addEventListener('keydown', (event) => {
  if (buggyMode.checked) {
    // 🐛 Cancela la acción por defecto de TODAS las teclas: las letras no se
    //    escriben, Tab no mueve el foco, Espacio no hace scroll…
    event.preventDefault();
    if (event.key === 'j') selectEmail(selected + 1);
    else if (event.key === 'k') selectEmail(selected - 1);
    else logLine(`🐛 «${event.key}» bloqueada`);
    return;
  }
  // ✅ Solo las teclas propias, y solo cuando no molestan:
  if (event.defaultPrevented) return;                         // otro ya la atendió
  if (event.metaKey || event.ctrlKey || event.altKey) return; // atajos del sistema
  if (isTyping(event.target)) return;                         // está escribiendo
  if (event.key !== 'j' && event.key !== 'k') return;         // no es nuestra
  event.preventDefault();
  selectEmail(event.key === 'j' ? selected + 1 : selected - 1);
});
selectEmail(0);
logLine('Listo: haz clic en «Buscar correo» y escribe; pulsa Tab; desmarca la casilla y repite');

// keydown de document recibe las teclas de toda la página (burbujean desde
// el elemento con el foco). Cancelar keydown cancela lo que esa tecla haría:
// escribir, mover el foco, activar un botón… y algunos atajos del navegador.
```
