---
example_description: "Un menú contextual para una lista de archivos: se abre con el clic derecho, con la tecla de menú o Shift + F10 (también disparan contextmenu) y con un botón «⋯»; es un popover con role=menu colocado junto al puntero sin salirse de la ventana, se recorre con flechas, Inicio, Fin y la primera letra, Escape devuelve el foco y cada acción sale en un evento file:action"
example_tags: "javascript|eventos|profesional|contextmenu|menu|popover|teclado|customevent|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="files-page">
  <h1>Documentos del pedido P-2077</h1>
  <ul id="files" class="files" aria-label="Archivos"></ul>
  <div id="file-menu" class="menu" role="menu" popover>
    <button type="button" role="menuitem" tabindex="-1" data-action="abrir">Abrir</button>
    <button type="button" role="menuitem" tabindex="-1" data-action="renombrar">Renombrar</button>
    <button type="button" role="menuitem" tabindex="-1" data-action="duplicar">Duplicar</button>
    <button type="button" role="menuitem" tabindex="-1" data-action="descargar">Descargar</button>
    <button type="button" role="menuitem" tabindex="-1" data-action="eliminar">Eliminar</button>
  </div>
  <p class="hint">Clic derecho sobre un archivo, o Tab hasta él y la tecla de menú (Shift + F10 en Windows), o su botón «⋯».</p>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root {
  --ink: #1f2933;
  --muted: #52606d;
  --line: #cbd2d9;
  --surface: #ffffff;
  --page: #f5f7fa;
  --accent: #1d4ed8;
  --accent-soft: #dbeafe;
}
* {
  box-sizing: border-box;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: var(--ink);
  background: var(--page);
}
.files-page {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.files {
  display: grid;
  gap: 0.35rem;
  padding: 0;
  list-style: none;
}
.files li {
  display: flex;
  gap: 0.35rem;
}
.files .file {
  flex: 1;
  text-align: start;
}
button {
  font: inherit;
  padding: 0.35rem 0.7rem;
  border: 1px solid var(--muted);
  border-radius: 0.4rem;
  background: var(--surface);
  color: var(--ink);
  cursor: pointer;
}
/* Un popover está en la capa superior; se coloca con left/top desde JS. */
.menu {
  position: fixed;
  inset: auto;
  margin: 0;
  padding: 0.25rem;
  min-width: 10rem;
  border: 1px solid var(--muted);
  border-radius: 0.5rem;
  background: var(--surface);
  box-shadow: 0 6px 16px rgb(0 0 0 / 0.18);
}
.menu [role="menuitem"] {
  display: block;
  width: 100%;
  border-color: transparent;
  text-align: start;
}
.menu [role="menuitem"]:focus {
  background: var(--accent-soft);
}
.hint {
  color: var(--muted);
  font-size: 0.9rem;
}
:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
.log {
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: var(--surface);
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
// Menú contextual accesible para una lista de archivos.
//
// Decisiones de diseño:
// - Tres formas de abrirlo y un solo camino: el clic derecho y la tecla de
//   menú (o Shift + F10) disparan contextmenu sobre el elemento con el foco;
//   el botón «⋯» llama a la misma función. El menú del navegador solo se
//   sustituye sobre los archivos.
// - Un popover (popover="auto"): la capa superior, el cierre con un clic fuera
//   y con Escape ya vienen hechos. Se coloca junto al puntero (o bajo el
//   botón) y, si no cabe, se desplaza: una escritura, una lectura del
//   tamaño real y, si hace falta, otra escritura.
// - Patrón «menú» de WAI-ARIA: el foco entra en la primera opción; flechas,
//   Inicio, Fin y la primera letra (repetida, va a la siguiente con esa letra);
//   Escape y Tab cierran, y Escape devuelve el foco a quien lo abrió.
// - El menú no hace nada con los archivos: avisa con file:action.
// - La autocomprobación abre y recorre el menú sin mover el foco de la página
//   (moveFocus = false mientras dura).
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM y este módulo.

const logList = document.querySelector('#log');
let quiet = false;
let moveFocus = true;
function logLine(text) {
  if (quiet) return;
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// ── La lista de archivos.
const filesList = document.querySelector('#files');
function addFile(name, before = null) {
  const item = document.createElement('li');
  item.dataset.file = name;
  const open = document.createElement('button');
  open.type = 'button';
  open.className = 'file';
  open.textContent = `📄 ${name}`;
  const more = document.createElement('button');
  more.type = 'button';
  more.className = 'more';
  more.textContent = '⋯';
  more.setAttribute('aria-haspopup', 'menu');
  more.setAttribute('aria-label', `Acciones de ${name}`);
  item.append(open, more);
  filesList.insertBefore(item, before);
  return item;
}
['factura-P-2077.pdf', 'guia-de-envio.pdf', 'foto-del-paquete.jpg'].forEach((name) => addFile(name));

// ── El menú.
function createContextMenu(menu) {
  const items = [...menu.querySelectorAll('[role="menuitem"]')];
  let active = 0;
  let invoker = null; // quién lo abrió (para devolverle el foco)
  let file = null;    // sobre qué archivo actúa

  function focusItem(index) {
    active = (index + items.length) % items.length;
    if (moveFocus) items[active].focus();
  }
  function open(fileItem, from, x, y) {
    file = fileItem.dataset.file;
    invoker = from;
    menu.setAttribute('aria-label', `Acciones de ${file}`);
    menu.style.left = `${x}px`;
    menu.style.top = `${y}px`;
    if (!menu.matches(':popover-open')) menu.showPopover();
    // ¿Cabe? Una lectura del tamaño real, y se corrige si se sale.
    const box = menu.getBoundingClientRect();
    if (box.right > innerWidth - 8) menu.style.left = `${Math.max(8, innerWidth - box.width - 8)}px`;
    if (box.bottom > innerHeight - 8) menu.style.top = `${Math.max(8, y - box.height)}px`;
    focusItem(0);
  }
  function close(returnFocus) {
    if (menu.matches(':popover-open')) menu.hidePopover();
    if (returnFocus && moveFocus) invoker?.focus();
  }

  menu.addEventListener('keydown', (event) => {
    const moves = { ArrowDown: active + 1, ArrowUp: active - 1, Home: 0, End: items.length - 1 };
    if (event.key in moves) {
      event.preventDefault();
      focusItem(moves[event.key]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close(true);
    } else if (event.key === 'Tab') {
      close(false); // el foco sigue su camino
    } else if (event.key.length === 1 && event.key !== ' ') {
      // Primera letra: la siguiente opción que empieza así (dando la vuelta).
      const letter = event.key.toLowerCase();
      for (let step = 1; step <= items.length; step++) {
        const index = (active + step) % items.length;
        if (items[index].textContent.toLowerCase().startsWith(letter)) {
          focusItem(index);
          break;
        }
      }
    }
  });
  menu.addEventListener('click', (event) => {
    const item = event.target.closest('[role="menuitem"]');
    if (!item) return;
    close(true);
    menu.dispatchEvent(new CustomEvent('file:action', { bubbles: true, detail: { action: item.dataset.action, file } }));
  });
  return { open, close, get active() { return items[active].dataset.action; } };
}
const contextMenu = createContextMenu(document.querySelector('#file-menu'));

// Clic derecho, tecla de menú o Shift + F10: contextmenu sobre el archivo.
filesList.addEventListener('contextmenu', (event) => {
  const fileItem = event.target.closest('[data-file]');
  if (!fileItem) return;
  event.preventDefault();
  let { clientX: x, clientY: y } = event;
  if (x === 0 && y === 0) { // sin coordenadas: debajo del elemento
    const box = event.target.getBoundingClientRect();
    x = box.left;
    y = box.bottom;
  }
  contextMenu.open(fileItem, event.target.closest('button') ?? fileItem.querySelector('.file'), x, y);
  logLine(`📋 menú de ${fileItem.dataset.file} (contextmenu)`);
});
// El botón «⋯».
filesList.addEventListener('click', (event) => {
  const more = event.target.closest('.more');
  if (!more) return;
  const box = more.getBoundingClientRect();
  contextMenu.open(more.closest('[data-file]'), more, box.left, box.bottom + 4);
  logLine(`📋 menú de ${more.closest('[data-file]').dataset.file} (botón ⋯)`);
});

// La aplicación decide qué hace cada acción.
document.addEventListener('file:action', (event) => {
  const { action, file } = event.detail;
  const item = filesList.querySelector(`[data-file="${file}"]`);
  if (action === 'duplicar') addFile(file.replace('.', '-copia.'), item.nextElementSibling);
  if (action === 'eliminar') {
    const neighbour = item.nextElementSibling ?? item.previousElementSibling;
    item.remove();
    if (moveFocus) neighbour?.querySelector('.file').focus(); // el foco no se pierde
  }
  logLine(`▶ ${action} → ${file}`);
});

// ── Autocomprobación (simulada; sin mover el foco y dejando la lista igual).
function audit() {
  quiet = true;
  moveFocus = false;
  const results = [];
  const expect = (label, ok) => results.push(`${ok ? '✓' : '✗'} ${label}`);
  const menu = document.querySelector('#file-menu');
  const target = filesList.querySelector('[data-file="guia-de-envio.pdf"] .file');
  const contextEvent = new MouseEvent('contextmenu', { bubbles: true, cancelable: true, clientX: 40, clientY: 60 });
  target.dispatchEvent(contextEvent);
  expect('contextmenu sobre un archivo: sin menú del navegador y con el nuestro abierto', contextEvent.defaultPrevented && menu.matches(':popover-open'));
  expect('el menú dice de qué archivo es', menu.getAttribute('aria-label') === 'Acciones de guia-de-envio.pdf');
  const press = (key) => menu.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  press('ArrowUp');
  expect('↑ desde la primera opción da la vuelta hasta «Eliminar»', contextMenu.active === 'eliminar');
  press('d');
  press('d');
  expect('«d» dos veces: «Duplicar» y luego «Descargar»', contextMenu.active === 'descargar');
  let received = null;
  document.addEventListener('file:action', (event) => { received = event.detail; }, { once: true });
  menu.querySelector('[data-action="descargar"]').click();
  expect('elegir una opción cierra el menú y avisa con file:action', !menu.matches(':popover-open')
    && received?.action === 'descargar' && received?.file === 'guia-de-envio.pdf');
  const outside = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
  document.querySelector('h1').dispatchEvent(outside);
  expect('fuera de los archivos se respeta el menú del navegador', !outside.defaultPrevented);
  moveFocus = true;
  quiet = false;
  console.log('Autocomprobación (simulada):');
  results.forEach((line) => console.log(`  ${line}`));
}
audit();
logLine('Listo: clic derecho sobre «guia-de-envio.pdf»; recorre el menú con ↓ y elige «Duplicar»; luego pulsa un «⋯» y Escape');
```
