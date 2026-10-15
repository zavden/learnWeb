---
example_description: "Atajos de teclado accesibles: «/» enfoca el buscador (solo si no se está escribiendo y con opción de desactivarlo, como pide WCAG 2.1.4) y Ctrl/⌘ + K abre la paleta de comandos; aria-keyshortcuts y <kbd> los anuncian"
example_tags: "javascript|eventos|teclado|atajos|accesibilidad|aria-keyshortcuts|dialog"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Panel de la tienda</h1>
  <label for="search">Buscar pedidos</label>
  <input id="search" type="search" aria-keyshortcuts="/">
  <p class="actions">
    <button id="open-palette" type="button" aria-keyshortcuts="Control+K Meta+K">Comandos <kbd>Ctrl/⌘ K</kbd></button>
    <label><input type="checkbox" id="single-key" checked> Atajos de una sola tecla (<kbd>/</kbd>)</label>
  </p>
  <dialog id="palette" aria-labelledby="palette-title">
    <h2 id="palette-title">Comandos</h2>
    <ul>
      <li>Nuevo pedido</li>
      <li>Exportar ventas del mes</li>
    </ul>
    <form method="dialog"><button>Cerrar</button></form>
  </dialog>
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
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}
kbd {
  padding: 0 0.3rem;
  border: 1px solid #7b8794;
  border-radius: 0.25rem;
  font-size: 0.85em;
}
button {
  font: inherit;
  padding: 0.35rem 0.75rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:focus-visible,
input:focus-visible {
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
const search = document.querySelector('#search');
const palette = document.querySelector('#palette');
const singleKey = document.querySelector('#single-key');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
function isTyping(target) {
  return target.isContentEditable
    || target.matches('textarea, select, input:not([type="checkbox"], [type="radio"], [type="button"], [type="submit"])');
}
function openPalette() {
  if (!palette.open) palette.showModal();
  logLine('🎛️ paleta de comandos abierta');
}

document.querySelector('#open-palette').addEventListener('click', openPalette);

document.addEventListener('keydown', (event) => {
  if (event.defaultPrevented) return;
  // Ctrl + K (Windows, Linux) o ⌘ + K (macOS). key en minúsculas: con
  // Shift o Bloq Mayús sería 'K', así que se normaliza.
  if ((event.ctrlKey || event.metaKey) && !event.altKey && event.key.toLowerCase() === 'k') {
    event.preventDefault(); // Ctrl + K también es un atajo de Chrome en Windows
    openPalette();
    return;
  }
  // «/» enfoca el buscador: atajo de UNA tecla, así que solo si no se está
  // escribiendo, sin modificadores y si el usuario no los ha desactivado.
  if (event.key === '/' && singleKey.checked && !isTyping(event.target) && !palette.open
      && !event.ctrlKey && !event.metaKey && !event.altKey) {
    event.preventDefault(); // que la «/» no se escriba en el buscador
    search.focus();
    logLine('🔎 «/» → foco en el buscador');
  }
});
singleKey.addEventListener('change', () => {
  logLine(`atajos de una tecla: ${singleKey.checked ? 'activados' : 'desactivados'}`);
});
logLine('Listo: haz clic en la vista previa (fuera del buscador) y pulsa «/»; luego Ctrl/⌘ + K');

// Un atajo de una sola tecla puede dispararse sin querer: quien usa control
// por voz «dicta» letras, y los lectores de pantalla usan letras para
// navegar. WCAG 2.1.4 pide poder desactivarlos (la casilla) o cambiarlos.
// aria-keyshortcuts anuncia el atajo a las tecnologías de apoyo; <kbd> lo
// muestra a todos.
```
