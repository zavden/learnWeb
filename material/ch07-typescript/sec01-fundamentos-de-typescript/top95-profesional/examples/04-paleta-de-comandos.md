---
example_description: "Una paleta de comandos (Ctrl/⌘ + K) en un <dialog> modal: los identificadores salen de un array as const, cada comando se ejecuta con un switch exhaustivo, las teclas de navegación se convierten en una unión de literales y la lista sigue el patrón combobox de WAI-ARIA"
example_tags: "typescript|profesional|as-const|tipos-literales|never|dialog|combobox|teclado|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app" id="app">
  <header class="bar">
    <h1>Cocina Central · panel</h1>
    <button type="button" id="open-palette" aria-keyshortcuts="Control+K Meta+K">Comandos (Ctrl/⌘ + K)</button>
  </header>
  <p id="status" class="status" aria-live="polite">Abre la paleta con el botón o con Ctrl/⌘ + K.</p>
  <dialog id="palette" aria-label="Paleta de comandos">
    <label for="query" class="label">Buscar un comando</label>
    <input id="query" role="combobox" aria-expanded="true" aria-controls="results" aria-autocomplete="list" autocomplete="off" placeholder="pedido, contraste, ayuda…">
    <ul id="results" role="listbox" aria-label="Comandos"></ul>
  </dialog>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #7b8794; --soft: #cbd2d9; --accent: #1d4ed8; --accent-soft: #dbeafe; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.5; color: var(--ink); background: #f5f7fa; }
.app { max-width: 36rem; margin: 0 auto; padding: 1rem; }
.app.high-contrast { --ink: #000; --muted: #1f2933; --soft: #1f2933; background: #fff; }
.bar { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 0.5rem; }
h1 { font-size: 1.2rem; margin: 0; }
button, input { font: inherit; }
button { padding: 0.4rem 0.8rem; border: 1px solid var(--line); border-radius: 0.5rem; background: #fff; color: var(--ink); cursor: pointer; }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.status { padding: 0.5rem 0.75rem; background: #fff; border: 1px solid var(--soft); border-radius: 0.5rem; }
dialog { width: min(28rem, 92vw); padding: 0.75rem; border: 1px solid var(--line); border-radius: 0.75rem; color: var(--ink); }
dialog::backdrop { background: rgb(15 23 42 / 0.45); }
.label { display: block; font-size: 0.85rem; color: var(--muted); }
#query { width: 100%; padding: 0.5rem; border: 1px solid var(--line); border-radius: 0.5rem; }
[role="listbox"] { list-style: none; margin: 0.5rem 0 0; padding: 0; }
[role="option"] { display: flex; justify-content: space-between; gap: 1rem; padding: 0.4rem 0.6rem; border-radius: 0.4rem; cursor: pointer; }
[role="option"][aria-selected="true"] { background: var(--accent-soft); outline: 2px solid var(--accent); }
[role="option"] small { color: var(--muted); }
.log { font-size: 0.85rem; color: var(--muted); }
```

# TypeScript

```typescript
// Los identificadores se escriben una vez; el tipo sale del array (lección 5).
const COMMAND_IDS = ['new-order', 'open-orders', 'toggle-contrast', 'print-ticket', 'shortcuts'] as const;
type CommandId = (typeof COMMAND_IDS)[number]; // operadores de tipo: módulo 2
type PaletteCommand = { readonly id: CommandId; readonly label: string; readonly keywords: readonly string[] };
type NavKey = 'ArrowDown' | 'ArrowUp' | 'Home' | 'End' | 'Enter';

const COMMANDS: readonly PaletteCommand[] = [
  { id: 'new-order', label: 'Nuevo pedido', keywords: ['crear', 'orden', 'venta'] },
  { id: 'open-orders', label: 'Ver pedidos pendientes', keywords: ['lista', 'cocina', 'órdenes'] },
  { id: 'toggle-contrast', label: 'Alternar contraste alto', keywords: ['tema', 'accesibilidad', 'colores'] },
  { id: 'print-ticket', label: 'Imprimir el último ticket', keywords: ['recibo', 'impresora'] },
  { id: 'shortcuts', label: 'Ver atajos de teclado', keywords: ['ayuda', 'teclas'] },
];

function assertNever(value: never): never {
  throw new Error(`Caso no previsto: ${String(value)}`);
}
function byId(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (element === null) throw new Error(`Falta el elemento #${id}`);
  return element;
}
function dialogById(id: string): HTMLDialogElement {
  const element = byId(id);
  if (!(element instanceof HTMLDialogElement)) throw new Error(`#${id} no es un <dialog>`);
  return element;
}
function inputById(id: string): HTMLInputElement {
  const element = byId(id);
  if (!(element instanceof HTMLInputElement)) throw new Error(`#${id} no es un <input>`);
  return element;
}

const app = byId('app');
const palette = dialogById('palette');
const query = inputById('query');
const results = byId('results');
const statusLine = byId('status');
const logList = byId('log');

let nextOrder = 2050;
let visible: readonly PaletteCommand[] = COMMANDS;
let activeIndex = 0;
let chosen = false;

// Cada comando, un caso: añadir un id a COMMAND_IDS sin tratarlo es un error de tipos.
function runCommand(id: CommandId): string {
  switch (id) {
    case 'new-order':
      return `Pedido P-${nextOrder++} creado`;
    case 'open-orders':
      return '3 pedidos pendientes en cocina';
    case 'toggle-contrast':
      return `Contraste alto ${app.classList.toggle('high-contrast') ? 'activado' : 'desactivado'}`;
    case 'print-ticket':
      return 'Ticket P-2049 enviado a la impresora (simulado)';
    case 'shortcuts':
      return 'Atajos: Ctrl/⌘ + K abre esta paleta; ↑ ↓ eligen; Enter ejecuta; Escape cierra';
    default:
      return assertNever(id);
  }
}

// Sin tildes ni mayúsculas, para que «ordenes» encuentre «órdenes».
const normalize = (text: string): string =>
  [...text.normalize('NFD').toLowerCase()].filter((char) => char < '̀' || char > 'ͯ').join('');

function matches(command: PaletteCommand, text: string): boolean {
  const needle = normalize(text.trim());
  return [command.label, ...command.keywords].some((word) => normalize(word).includes(needle));
}

function report(message: string): void {
  console.log(message);
  const item = document.createElement('li');
  item.textContent = message;
  logList.append(item);
}

function renderResults(): void {
  results.replaceChildren(
    ...visible.map((command, index) => {
      const option = document.createElement('li');
      option.id = `cmd-${command.id}`;
      option.setAttribute('role', 'option');
      option.setAttribute('aria-selected', String(index === activeIndex));
      option.dataset.commandIndex = String(index);
      const hint = document.createElement('small');
      hint.textContent = command.keywords.join(', ');
      option.append(command.label, hint);
      return option;
    }),
  );
  const active = visible[activeIndex];
  if (active === undefined) query.removeAttribute('aria-activedescendant');
  else query.setAttribute('aria-activedescendant', `cmd-${active.id}`);
  statusLine.textContent = visible.length === 0 ? 'Ningún comando coincide' : `${visible.length} comandos`;
}

function openPalette(): void {
  if (palette.open) return;
  query.value = '';
  visible = COMMANDS;
  activeIndex = 0;
  chosen = false;
  renderResults();
  palette.showModal();
  report(`⌘ paleta abierta (${COMMANDS.length} comandos)`);
}

function choose(index: number): void {
  const command = visible[index];
  if (command === undefined) return;
  chosen = true;
  palette.close();
  const message = runCommand(command.id);
  statusLine.textContent = message;
  report(`▶ ${command.label}: ${message}`);
}

const toNavKey = (key: string): NavKey | null =>
  key === 'ArrowDown' || key === 'ArrowUp' || key === 'Home' || key === 'End' || key === 'Enter' ? key : null;

query.addEventListener('keydown', (event) => {
  const key = toNavKey(event.key);
  if (key === null || visible.length === 0) return;
  event.preventDefault();
  const last = visible.length - 1;
  switch (key) {
    case 'ArrowDown':
      activeIndex = activeIndex === last ? 0 : activeIndex + 1;
      break;
    case 'ArrowUp':
      activeIndex = activeIndex === 0 ? last : activeIndex - 1;
      break;
    case 'Home':
      activeIndex = 0;
      break;
    case 'End':
      activeIndex = last;
      break;
    case 'Enter':
      choose(activeIndex);
      return;
    default:
      assertNever(key);
  }
  renderResults();
});

query.addEventListener('input', () => {
  visible = COMMANDS.filter((command) => matches(command, query.value));
  activeIndex = 0;
  renderResults();
});

results.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const option = event.target.closest('[role="option"]');
  if (option instanceof HTMLElement) choose(Number(option.dataset.commandIndex));
});

palette.addEventListener('close', () => {
  if (!chosen) report('⌘ paleta cerrada sin elegir');
});

byId('open-palette').addEventListener('click', openPalette);
document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    openPalette();
  }
});

console.log('Listo: pulsa «Comandos» (o Ctrl/⌘ + K), escribe «ped», pulsa ↓ y Enter');
```
