---
example_description: "Un gestor de atajos de teclado reutilizable: combinaciones normalizadas («mod+k», «?», «shift+e»), ámbitos (global y lista), sin atajos de una tecla mientras se escribe ni con un diálogo abierto, interruptor para desactivarlos (WCAG 2.1.4), detección de duplicados y una ayuda generada desde el propio registro"
example_tags: "javascript|eventos|profesional|atajos|teclado|eventtarget|handleevent|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="inbox">
  <header class="bar">
    <h1>Pedidos pendientes</h1>
    <button type="button" id="show-help" aria-keyshortcuts="?">Atajos <kbd>?</kbd></button>
  </header>
  <label for="search">Buscar pedido</label>
  <input id="search" type="search" aria-keyshortcuts="/">
  <ul id="orders" class="orders" aria-label="Pedidos (↑ ↓ para moverte, e para archivar)"></ul>
  <p class="actions">
    <button type="button" id="new-order" aria-keyshortcuts="N">Nuevo pedido <kbd>n</kbd></button>
    <label><input type="checkbox" id="single-keys" checked> Atajos de una sola tecla</label>
  </p>
  <dialog id="help" aria-labelledby="help-title">
    <h2 id="help-title">Atajos de teclado</h2>
    <div id="help-content"></div>
    <form method="dialog"><button>Cerrar</button></form>
  </dialog>
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
.inbox {
  max-width: 34rem;
  margin: 0 auto;
  padding: 1rem;
}
.bar {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}
h1 {
  font-size: 1.25rem;
  margin: 0;
}
#search {
  display: block;
  width: 100%;
  margin: 0.25rem 0 0.75rem;
  font: inherit;
  padding: 0.35rem 0.5rem;
}
.orders {
  display: grid;
  gap: 0.3rem;
  padding: 0;
  list-style: none;
}
.orders button {
  width: 100%;
  text-align: start;
}
.actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
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
  font-size: 0.85em;
}
dialog {
  width: calc(100% - 2rem);
  max-width: 26rem;
  border: 1px solid var(--muted);
  border-radius: 0.75rem;
}
#help-content dl {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.25rem 1rem;
}
#help-content dd {
  margin: 0;
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
// Gestor de atajos de teclado.
//
// Decisiones de diseño:
// - Las combinaciones se escriben como texto normalizado: «mod» es Ctrl o ⌘,
//   los modificadores van en un orden fijo y la tecla en minúsculas. Shift
//   solo cuenta en letras y teclas con nombre: «?» ya implica Shift, y en un
//   teclado español «/» se escribe con Shift + 7.
// - UN listener (el propio gestor, con handleEvent) en document. El ámbito se
//   deduce del target del evento: los atajos de «lista» solo valen dentro de
//   la lista. Con un <dialog> modal abierto, el gestor no hace nada.
// - Atajos de una tecla: nunca mientras se escribe, y desactivables (WCAG
//   2.1.4). Los que llevan Ctrl/⌘ funcionan también en los campos.
// - Registrar dos veces la misma combinación en el mismo ámbito lanza un
//   error: mejor enterarse al programar que con un atajo que no responde.
// - El gestor extiende EventTarget y avisa con «shortcut»; la ayuda se genera
//   desde el registro, así que nunca se desactualiza.
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

function comboFromEvent(event) {
  const key = event.key.toLowerCase();
  const isLetter = event.key.length === 1 && event.key.toLowerCase() !== event.key.toUpperCase();
  const parts = [];
  if (event.ctrlKey || event.metaKey) parts.push('mod');
  if (event.altKey) parts.push('alt');
  if (event.shiftKey && (isLetter || event.key.length > 1)) parts.push('shift');
  parts.push(key === ' ' ? 'space' : key);
  return parts.join('+');
}
const isSingleKey = (combo) => !combo.includes('+');
function isTyping(target) {
  return target.isContentEditable
    || target.matches('textarea, select, input:not([type="checkbox"], [type="radio"], [type="button"], [type="submit"])');
}

class ShortcutManager extends EventTarget {
  #bindings = new Map(); // «combo@ámbito» → { combo, scope, description, run }
  #scopes;               // ámbito → función que dice si un target está dentro
  singleKeysEnabled = true;

  constructor(scopes) {
    super();
    this.#scopes = scopes;
    document.addEventListener('keydown', this);
  }

  register(combo, scope, description, run) {
    const id = `${combo}@${scope}`;
    if (this.#bindings.has(id)) throw new Error(`atajo duplicado: ${combo} (${scope})`);
    this.#bindings.set(id, { combo, scope, description, run });
  }

  get bindings() {
    return [...this.#bindings.values()];
  }

  handleEvent(event) {
    if (event.defaultPrevented || event.isComposing || document.querySelector('dialog[open]')) return;
    const combo = comboFromEvent(event);
    if (isSingleKey(combo) && (!this.singleKeysEnabled || isTyping(event.target))) return;
    // El ámbito más concreto primero; «global» al final.
    const scope = Object.keys(this.#scopes).find((name) => this.#scopes[name](event.target)) ?? 'global';
    const binding = this.#bindings.get(`${combo}@${scope}`) ?? this.#bindings.get(`${combo}@global`);
    if (!binding) return;
    event.preventDefault();
    binding.run(event);
    this.dispatchEvent(new CustomEvent('shortcut', { detail: { combo, scope: binding.scope, description: binding.description } }));
  }
}

// ── La aplicación.
const ordersList = document.querySelector('#orders');
let nextOrder = 3310;
function addOrder(customer) {
  const item = document.createElement('li');
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.orderId = `P-${nextOrder}`;
  button.textContent = `P-${nextOrder} · ${customer}`;
  nextOrder += 1;
  item.append(button);
  ordersList.append(item);
  return button;
}
['Café El Jarocho', 'Panadería Rosetta', 'Restaurante Azul'].forEach(addOrder);

function moveFocus(from, step) {
  const buttons = [...ordersList.querySelectorAll('button')];
  const index = buttons.indexOf(from.closest('button'));
  const next = step === 'first' ? buttons[0] : step === 'last' ? buttons.at(-1) : buttons[index + step];
  next?.focus();
}

const shortcuts = new ShortcutManager({ lista: (target) => Boolean(target.closest('#orders')) });
shortcuts.register('/', 'global', 'Ir al buscador', () => document.querySelector('#search').focus());
shortcuts.register('?', 'global', 'Mostrar esta ayuda', () => openHelp());
shortcuts.register('n', 'global', 'Nuevo pedido', () => addOrder('Cliente nuevo'));
shortcuts.register('arrowdown', 'lista', 'Pedido siguiente', (event) => moveFocus(event.target, 1));
shortcuts.register('arrowup', 'lista', 'Pedido anterior', (event) => moveFocus(event.target, -1));
shortcuts.register('home', 'lista', 'Primer pedido', (event) => moveFocus(event.target, 'first'));
shortcuts.register('end', 'lista', 'Último pedido', (event) => moveFocus(event.target, 'last'));
shortcuts.register('e', 'lista', 'Archivar el pedido', (event) => {
  const item = event.target.closest('li');
  const sibling = item.nextElementSibling ?? item.previousElementSibling;
  const focusWasInside = ordersList.contains(document.activeElement);
  item.remove();
  if (focusWasInside) sibling?.querySelector('button').focus(); // el foco no se pierde
});

function openHelp() {
  const groups = Map.groupBy(shortcuts.bindings, (binding) => binding.scope);
  const sections = [...groups].map(([scope, bindings]) => {
    const heading = document.createElement('h3');
    heading.textContent = scope === 'global' ? 'En toda la página' : 'En la lista de pedidos';
    const list = document.createElement('dl');
    for (const { combo, description } of bindings) {
      const term = document.createElement('dt');
      combo.split('+').forEach((part) => {
        const kbd = document.createElement('kbd');
        kbd.textContent = part === 'mod' ? 'Ctrl/⌘' : part;
        term.append(kbd, ' ');
      });
      const definition = document.createElement('dd');
      definition.textContent = description;
      list.append(term, definition);
    }
    return [heading, list];
  });
  document.querySelector('#help-content').replaceChildren(...sections.flat());
  document.querySelector('#help').showModal();
}
document.querySelector('#show-help').addEventListener('click', openHelp);
document.querySelector('#new-order').addEventListener('click', () => addOrder('Cliente nuevo'));
document.querySelector('#single-keys').addEventListener('change', (event) => {
  shortcuts.singleKeysEnabled = event.currentTarget.checked;
  logLine(`atajos de una tecla: ${shortcuts.singleKeysEnabled ? 'activados' : 'desactivados'}`);
});
shortcuts.addEventListener('shortcut', (event) => {
  logLine(`⌨️ ${event.detail.combo} (${event.detail.scope}) → ${event.detail.description}`);
});

// ── Autocomprobación (simulada con KeyboardEvent; sin mover el foco).
function audit() {
  quiet = true;
  const results = [];
  const expect = (label, ok) => results.push(`${ok ? '✓' : '✗'} ${label}`);
  const press = (target, init) => {
    const keydown = new KeyboardEvent('keydown', { bubbles: true, cancelable: true, ...init });
    target.dispatchEvent(keydown);
    return keydown.defaultPrevented;
  };
  expect('normaliza: Ctrl + Shift + K → «mod+shift+k»', comboFromEvent({ key: 'K', ctrlKey: true, shiftKey: true }) === 'mod+shift+k');
  expect('normaliza: Shift + ? → «?» (el Shift va implícito)', comboFromEvent({ key: '?', shiftKey: true }) === '?');
  let duplicate = '';
  try {
    shortcuts.register('n', 'global', 'Otro', () => {});
  } catch (error) {
    duplicate = error.message;
  }
  expect('rechaza un atajo duplicado', duplicate === 'atajo duplicado: n (global)');
  const count = () => ordersList.children.length;
  const before = count();
  press(document.body, { key: 'n' });
  expect('«n» fuera de los campos crea un pedido', count() === before + 1);
  press(document.querySelector('#search'), { key: 'n' });
  expect('«n» mientras se escribe en el buscador no hace nada', count() === before + 1);
  shortcuts.singleKeysEnabled = false;
  press(document.body, { key: 'n' });
  expect('con los atajos de una tecla desactivados, «n» no hace nada', count() === before + 1);
  shortcuts.singleKeysEnabled = true;
  const prevented = press(ordersList.lastElementChild.querySelector('button'), { key: 'e' });
  expect('«e» en la lista archiva ese pedido (y cancela la tecla)', prevented && count() === before);
  expect('«e» fuera de la lista no es un atajo', !press(document.body, { key: 'e' }));
  nextOrder -= 1; // el pedido de prueba ya se archivó: su número vuelve a estar libre
  quiet = false;
  console.log('Autocomprobación (simulada):');
  results.forEach((line) => console.log(`  ${line}`));
}
audit();
logLine('Listo: haz clic en la vista previa y pulsa «?»; ciérrala, pulsa «/», sal del buscador con Tab, entra en la lista y usa ↑ ↓ y «e»');
```
