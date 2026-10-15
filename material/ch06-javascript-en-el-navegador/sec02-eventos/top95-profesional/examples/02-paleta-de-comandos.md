---
example_description: "Una paleta de comandos: Ctrl/⌘ + K la abre desde cualquier parte, filtra al escribir sin distinguir tildes ni mayúsculas, ↑ ↓ mueven la opción activa (aria-activedescendant), Enter o un clic la ejecutan con un evento command:run, y Escape cierra el <dialog> devolviendo el foco"
example_tags: "javascript|eventos|profesional|paleta-de-comandos|combobox|atajos|dialog|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<header class="top">
  <h1>Panel de la tostaduría</h1>
  <button type="button" id="open-palette" aria-haspopup="dialog" aria-keyshortcuts="Control+K Meta+K">Comandos <kbd>Ctrl/⌘ K</kbd></button>
</header>
<main class="content">
  <p id="app-status" class="app-status" role="status">Sin actividad.</p>
  <label for="notes">Notas del turno (prueba también Ctrl/⌘ + K aquí)</label>
  <textarea id="notes" rows="2"></textarea>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
<dialog id="palette" class="palette" aria-label="Paleta de comandos">
  <input id="palette-input" type="text" role="combobox" aria-expanded="true" aria-controls="command-list"
    aria-autocomplete="list" autocomplete="off" placeholder="Escribe un comando…" aria-describedby="palette-count">
  <ul id="command-list" role="listbox" aria-label="Comandos"></ul>
  <p id="palette-count" class="count" aria-live="polite"></p>
</dialog>
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
.top {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: var(--surface);
  border-bottom: 1px solid var(--line);
}
h1 {
  font-size: 1.15rem;
  margin: 0;
}
.content {
  max-width: 36rem;
  margin: 0 auto;
  padding: 1rem;
}
.app-status {
  padding: 0.5rem 0.75rem;
  border-left: 4px solid var(--accent);
  background: var(--surface);
}
textarea {
  display: block;
  width: 100%;
  margin-top: 0.25rem;
  font: inherit;
  padding: 0.4rem;
}
button {
  font: inherit;
  padding: 0.35rem 0.75rem;
  border: 1px solid var(--muted);
  border-radius: 0.4rem;
  background: var(--surface);
  color: var(--ink);
  cursor: pointer;
}
kbd {
  padding: 0 0.3rem;
  border: 1px solid var(--muted);
  border-radius: 0.25rem;
  font-size: 0.8em;
}
.palette {
  width: calc(100% - 2rem);
  max-width: 30rem;
  margin-top: 4rem;
  padding: 0.5rem;
  border: 1px solid var(--muted);
  border-radius: 0.75rem;
}
.palette::backdrop {
  background: rgb(31 41 51 / 0.45);
}
#palette-input {
  width: 100%;
  font: inherit;
  padding: 0.5rem 0.6rem;
  border: 1px solid var(--muted);
  border-radius: 0.5rem;
}
[role="listbox"] {
  margin: 0.5rem 0 0;
  padding: 0;
  list-style: none;
}
[role="option"] {
  padding: 0.4rem 0.6rem;
  border-radius: 0.4rem;
  cursor: pointer;
}
[role="option"][aria-selected="true"] {
  background: var(--accent-soft);
  outline: 2px solid var(--accent);
}
.count {
  margin: 0.4rem 0 0;
  color: var(--muted);
  font-size: 0.85rem;
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
// Paleta de comandos (combobox con listbox, patrón de WAI-ARIA).
//
// Decisiones de diseño:
// - El foco se queda SIEMPRE en el campo de texto; la opción «activa» se
//   comunica con aria-activedescendant y aria-selected. Así se puede seguir
//   escribiendo mientras se elige con las flechas.
// - La paleta no ejecuta nada: avisa con command:run y la aplicación decide.
// - Ctrl/⌘ + K se escucha en document (también funciona desde un campo,
//   porque lleva modificador) y solo cancela esa combinación.
// - <dialog> con showModal(): Escape (evento cancel) y el foco de vuelta al
//   elemento que lo tenía antes los pone el navegador.
// - Filtro sin tildes ni mayúsculas con normalize('NFD'), sin expresiones
//   regulares: se quitan los signos diacríticos (U+0300–U+036F) uno a uno.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM y este módulo.

const logList = document.querySelector('#log');
let quiet = false;
function logLine(text) {
  if (quiet) return;
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

const commands = [
  { id: 'new-order', label: 'Nuevo pedido', keywords: 'crear venta' },
  { id: 'find-customer', label: 'Buscar cliente', keywords: 'persona contacto' },
  { id: 'export-sales', label: 'Exportar ventas del mes', keywords: 'csv informe' },
  { id: 'go-stock', label: 'Ir a inventario', keywords: 'existencias almacén' },
  { id: 'sign-out', label: 'Cerrar sesión', keywords: 'salir' },
];

const plain = (text) => [...text.normalize('NFD').toLowerCase()]
  .filter((char) => char < '̀' || char > 'ͯ').join('');

function createPalette({ dialog, input, list, count }) {
  let visible = [];
  let active = 0;

  function render() {
    list.replaceChildren(...visible.map((command, index) => {
      const option = document.createElement('li');
      option.setAttribute('role', 'option');
      option.id = `cmd-${command.id}`;
      option.dataset.index = index;
      option.textContent = command.label;
      option.setAttribute('aria-selected', String(index === active));
      return option;
    }));
    if (visible.length) input.setAttribute('aria-activedescendant', `cmd-${visible[active].id}`);
    else input.removeAttribute('aria-activedescendant');
    count.textContent = visible.length ? `${visible.length} comandos` : 'Sin resultados';
  }
  function filter(text) {
    const query = plain(text.trim());
    visible = commands.filter((command) => plain(`${command.label} ${command.keywords}`).includes(query));
    active = 0;
    render();
  }
  function move(step) {
    if (!visible.length) return;
    active = (active + step + visible.length) % visible.length;
    render();
  }
  function run(index = active) {
    const command = visible[index];
    if (!command) return;
    if (dialog.open) dialog.close();
    document.dispatchEvent(new CustomEvent('command:run', { detail: { id: command.id, label: command.label } }));
  }
  function open() {
    if (dialog.open) return false;
    input.value = '';
    filter('');
    dialog.showModal(); // el navegador enfoca el campo (el primer elemento enfocable)
    return true;
  }

  input.addEventListener('input', () => filter(input.value));
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault(); // que el cursor no salte al principio o al final
      move(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Enter' && !event.isComposing) {
      event.preventDefault();
      run();
    }
  });
  list.addEventListener('click', (event) => {
    const option = event.target.closest('[role="option"]');
    if (option) run(Number(option.dataset.index));
  });
  list.addEventListener('pointermove', (event) => {
    const option = event.target.closest('[role="option"]');
    if (option && Number(option.dataset.index) !== active) {
      active = Number(option.dataset.index);
      render();
    }
  });
  dialog.addEventListener('close', () => logLine('▴ paleta cerrada'));
  filter('');
  return { open, filter, get state() { return { visible: visible.length, active: input.getAttribute('aria-activedescendant') }; } };
}

const palette = createPalette({
  dialog: document.querySelector('#palette'),
  input: document.querySelector('#palette-input'),
  list: document.querySelector('#command-list'),
  count: document.querySelector('#palette-count'),
});

document.querySelector('#open-palette').addEventListener('click', () => {
  if (palette.open()) logLine('▾ paleta abierta (botón)');
});
document.addEventListener('keydown', (event) => {
  if (event.defaultPrevented || event.altKey || event.key.toLowerCase() !== 'k') return;
  if (!(event.ctrlKey || event.metaKey)) return;
  event.preventDefault(); // en Windows, Ctrl + K es también un atajo de Chrome
  if (palette.open()) logLine('▾ paleta abierta (Ctrl/⌘ + K)');
});

// La aplicación decide qué hace cada comando.
let orderNumber = 3310;
const actions = new Map([
  ['new-order', () => `Pedido P-${++orderNumber} creado`],
  ['find-customer', () => 'Buscador de clientes abierto'],
  ['export-sales', () => 'Exportando ventas de octubre…'],
  ['go-stock', () => 'Inventario: 42 productos'],
  ['sign-out', () => 'Sesión cerrada (simulado)'],
]);
document.addEventListener('command:run', (event) => {
  const message = actions.get(event.detail.id)?.() ?? 'Comando desconocido';
  document.querySelector('#app-status').textContent = message;
  logLine(`▶ ${event.detail.label} → ${message}`);
});

// ── Autocomprobación (simulada, sin abrir el diálogo ni mover el foco).
function audit() {
  quiet = true;
  const results = [];
  const expect = (label, ok) => results.push(`${ok ? '✓' : '✗'} ${label}`);
  const input = document.querySelector('#palette-input');
  const press = (key) => input.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true }));
  expect('5 comandos al empezar, el primero activo', palette.state.visible === 5 && palette.state.active === 'cmd-new-order');
  palette.filter('PEDÍDO');
  expect('«PEDÍDO» encuentra «Nuevo pedido» (sin tildes ni mayúsculas)', palette.state.visible === 1 && palette.state.active === 'cmd-new-order');
  palette.filter('csv');
  expect('busca también en las palabras clave («csv»)', palette.state.active === 'cmd-export-sales');
  palette.filter('');
  press('ArrowUp');
  expect('↑ desde la primera da la vuelta hasta la última', palette.state.active === 'cmd-sign-out');
  press('ArrowDown');
  press('ArrowDown');
  expect('↓ ↓ avanzan hasta la segunda', palette.state.active === 'cmd-find-customer');
  let ran = null;
  document.addEventListener('command:run', (event) => { ran = event.detail.id; }, { once: true });
  press('Enter');
  expect('Enter ejecuta la activa con un evento command:run', ran === 'find-customer');
  palette.filter('zzz');
  expect('sin coincidencias: 0 opciones y «Sin resultados»', palette.state.visible === 0 && palette.state.active === null);
  palette.filter('');
  document.querySelector('#app-status').textContent = 'Sin actividad.';
  quiet = false;
  console.log('Autocomprobación (simulada):');
  results.forEach((line) => console.log(`  ${line}`));
}
audit();
logLine('Listo: pulsa Ctrl/⌘ + K, escribe «expo», pulsa Enter; ábrela otra vez, usa ↓ y cierra con Escape');
```
