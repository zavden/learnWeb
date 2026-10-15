---
example_description: "El mapa de asientos de una sala de cine guardado como un conjunto de bits: 96 asientos en 12 bytes (Uint8Array), ocupación y selección como máscaras, conteo de bits encendidos, rejilla navegable con las flechas y la selección compartida en la URL en base64url con replaceState, solo al pulsar"
example_tags: "javascript|bits|bitset|uint8array|base64url|url|accesibilidad|teclado|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="cinema-app">
  <h1>Sala 3 · «Cielito lindo» · 19:30</h1>
  <p class="screen" aria-hidden="true">Pantalla</p>
  <div id="seats" class="seats" role="grid" aria-label="Asientos de la sala" aria-describedby="seats-help"></div>
  <p id="seats-help" class="help">Muévete con las flechas y elige con Espacio o Intro. Como mucho, 8 asientos por compra.</p>
  <ul class="legend" aria-hidden="true">
    <li><span class="sample free"></span> libre</li>
    <li><span class="sample chosen"></span> tu selección</li>
    <li><span class="sample taken"></span> ocupado</li>
  </ul>
  <p id="summary" class="summary" role="status"></p>
  <p class="share">
    <button id="share" type="button">Poner mi selección en el enlace</button>
    <button id="clear" type="button">Quitar la selección</button>
  </p>
  <p id="link" class="link"></p>
  <ol id="log" class="log"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; --free: #ffffff; --chosen: #1d4ed8; --chosen-ink: #ffffff; --taken: #94a3b8; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.cinema-app { max-width: 36rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0 0 0.75rem; font-size: 1.2rem; }
.screen { margin: 0 auto 0.75rem; max-inline-size: 22rem; padding: 0.15rem; border-radius: 0 0 50% 50% / 0 0 100% 100%; background: #e2e8f0; color: var(--muted); text-align: center; font-size: 0.75rem; letter-spacing: 0.3em; text-transform: uppercase; }
.seats { display: grid; gap: 0.3rem; justify-content: center; }
.seats [role="row"] { display: grid; grid-template-columns: 1.4rem repeat(12, 1.6rem); gap: 0.25rem; align-items: center; }
.seats [role="rowheader"] { font-weight: 700; color: var(--muted); text-align: center; }
.seat { inline-size: 1.6rem; block-size: 1.6rem; padding: 0; border: 1px solid var(--muted); border-radius: 0.35rem 0.35rem 0.15rem 0.15rem; background: var(--free); color: var(--ink); font: 600 0.65rem system-ui, sans-serif; cursor: pointer; }
.seat[aria-pressed="true"] { background: var(--chosen); border-color: var(--chosen); color: var(--chosen-ink); }
.seat[aria-disabled="true"] { background: var(--taken); border-color: var(--taken); color: var(--ink); cursor: not-allowed; }
:is(.seat, button):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.help { font-size: 0.8rem; color: var(--muted); text-align: center; }
.legend { display: flex; justify-content: center; gap: 1rem; padding: 0; list-style: none; font-size: 0.8rem; }
.sample { display: inline-block; inline-size: 0.9rem; block-size: 0.9rem; vertical-align: -0.1rem; border: 1px solid var(--muted); border-radius: 0.2rem; }
.sample.chosen { background: var(--chosen); border-color: var(--chosen); }
.sample.taken { background: var(--taken); border-color: var(--taken); }
.summary { font-weight: 600; text-align: center; }
.share { display: flex; flex-wrap: wrap; gap: 0.5rem; justify-content: center; }
.share button { font: inherit; padding: 0.3rem 0.7rem; border: 1px solid var(--muted); border-radius: 0.4rem; background: var(--surface); color: var(--ink); cursor: pointer; }
.link { font-family: Menlo, Consolas, monospace; font-size: 0.8rem; text-align: center; overflow-wrap: anywhere; }
.log { margin: 1rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
```

# JavaScript

```javascript
// Mapa de asientos con conjuntos de bits.
//
// Decisiones de diseño:
// - 8 filas × 12 asientos = 96 bits = 12 bytes. El asiento i (fila × 12 + columna)
//   es el bit i & 7 del byte i >> 3. La ocupación que manda el servidor y la
//   selección son dos Uint8Array del mismo tamaño: comprobar, marcar y contar son
//   operaciones de bits.
// - El servidor manda la ocupación en base64url (16 caracteres): cabe en cualquier
//   URL o JSON. La selección se comparte igual, en ?asientos=…
// - Lo que llega en la URL se valida: 12 bytes exactos, y se le quitan los asientos
//   ocupados con selección & ~ocupados (alguien pudo comprarlos después).
// - replaceState solo al pulsar el botón, y dentro de try/catch: en una tarjeta de
//   la teoría (origen null) lanza SecurityError y se explica en la página.
// - Rejilla con tabindex itinerante: un único asiento enfocable y flechas para
//   moverse. Los ocupados usan aria-disabled (no disabled) para que se puedan
//   recorrer y anunciar.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos, URL e
// historial (capítulo 6) y este módulo.

const ROWS = 'ABCDEFGH';
const PER_ROW = 12;
const MAX_SEATS = 8;
const PRICE_CENTS = 8500;
const OCCUPIED_FROM_SERVER = 'AwwA8IAfYHAAAAYG';
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const grid = document.querySelector('#seats');
const logList = document.querySelector('#log');

function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// --- Conjuntos de bits sobre Uint8Array ---
const BYTES = (ROWS.length * PER_ROW) / 8;
const has = (set, index) => (set[index >> 3] & (1 << (index & 7))) !== 0;
const toggle = (set, index) => { set[index >> 3] ^= 1 << (index & 7); };
function popcount(set) {
  let count = 0;
  for (let byte of set) {
    for (; byte !== 0; byte &= byte - 1) count += 1; // apaga el bit 1 más bajo
  }
  return count;
}
const toBase64Url = (set) => set.toBase64({ alphabet: 'base64url', omitPadding: true });
function fromBase64Url(text) {
  const set = Uint8Array.fromBase64(text, { alphabet: 'base64url' });
  if (set.length !== BYTES) throw new RangeError(`se esperaban ${BYTES} bytes y llegaron ${set.length}`);
  return set;
}
const labelOf = (index) => `${ROWS[Math.floor(index / PER_ROW)]}${(index % PER_ROW) + 1}`;

const occupied = fromBase64Url(OCCUPIED_FROM_SERVER);
let selection = new Uint8Array(BYTES);
let focusIndex = 0;

function readSharedSelection() {
  const shared = new URLSearchParams(location.search).get('asientos');
  if (!shared) return 'sin selección compartida en el enlace';
  try {
    const decoded = fromBase64Url(shared);
    const conflicts = popcount(decoded.map((byte, index) => byte & occupied[index]));
    selection = decoded.map((byte, index) => byte & ~occupied[index]); // ✅ fuera los ocupados
    return `selección del enlace: ${popcount(selection)} asiento(s)${conflicts ? `, ${conflicts} ya ocupado(s) y descartado(s)` : ''}`;
  } catch (error) {
    return `el enlace trae una selección no válida (${error.message}): se ignora`;
  }
}

function buildGrid() {
  const rows = [];
  for (let row = 0; row < ROWS.length; row += 1) {
    const rowElement = document.createElement('div');
    rowElement.setAttribute('role', 'row');
    const header = Object.assign(document.createElement('span'), { textContent: ROWS[row] });
    header.setAttribute('role', 'rowheader');
    rowElement.append(header);
    for (let column = 0; column < PER_ROW; column += 1) {
      const index = row * PER_ROW + column;
      const cell = document.createElement('span');
      cell.setAttribute('role', 'gridcell');
      const seat = Object.assign(document.createElement('button'), { type: 'button', className: 'seat', textContent: column + 1, tabIndex: -1 });
      seat.dataset.index = index;
      cell.append(seat);
      rowElement.append(cell);
    }
    rows.push(rowElement);
  }
  grid.replaceChildren(...rows);
}

function paint() {
  for (const seat of grid.querySelectorAll('.seat')) {
    const index = Number(seat.dataset.index);
    const taken = has(occupied, index);
    const chosen = has(selection, index);
    seat.setAttribute('aria-disabled', String(taken));
    seat.setAttribute('aria-pressed', String(chosen));
    seat.setAttribute('aria-label', `Fila ${labelOf(index)[0]}, asiento ${(index % PER_ROW) + 1}${taken ? ', ocupado' : ''}`);
    seat.tabIndex = index === focusIndex ? 0 : -1;
  }
  const count = popcount(selection);
  document.querySelector('#summary').textContent = count
    ? `${count} asiento(s): ${[...Array(ROWS.length * PER_ROW).keys()].filter((i) => has(selection, i)).map(labelOf).join(', ')} · ${money.format((count * PRICE_CENTS) / 100)}`
    : 'Elige tus asientos.';
  return count;
}

function choose(index) {
  const label = labelOf(index);
  if (has(occupied, index)) {
    logLine(`⛔ ${label} está ocupado`);
    return;
  }
  if (!has(selection, index) && popcount(selection) >= MAX_SEATS) {
    logLine(`⛔ como mucho ${MAX_SEATS} asientos por compra`);
    return;
  }
  toggle(selection, index);
  const count = paint();
  logLine(`${has(selection, index) ? '➕' : '➖'} ${label} · ${count} asiento(s) · ${money.format((count * PRICE_CENTS) / 100)}`);
}

grid.addEventListener('click', (event) => {
  const seat = event.target.closest('.seat');
  if (!seat) return;
  focusIndex = Number(seat.dataset.index);
  choose(focusIndex);
});
grid.addEventListener('keydown', (event) => {
  const steps = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: PER_ROW, ArrowUp: -PER_ROW };
  if (!(event.key in steps)) return;
  event.preventDefault();
  const next = focusIndex + steps[event.key];
  const sameRow = Math.floor(next / PER_ROW) === Math.floor(focusIndex / PER_ROW);
  if (next < 0 || next >= ROWS.length * PER_ROW || (Math.abs(steps[event.key]) === 1 && !sameRow)) return;
  focusIndex = next;
  paint();
  grid.querySelector(`[data-index="${focusIndex}"]`).focus();
});

document.querySelector('#share').addEventListener('click', () => {
  const code = toBase64Url(selection);
  const url = new URL(location.href);
  url.searchParams.set('asientos', code);
  const linkText = document.querySelector('#link');
  try {
    history.replaceState(history.state, '', url); // sin entrada nueva en el historial
    linkText.textContent = `…${url.search}`;
    logLine(`🔗 ?asientos=${code} (${selection.length} bytes → ${code.length} caracteres)`);
  } catch (error) {
    linkText.textContent = `?asientos=${code} · Esta tarjeta es un iframe aislado (origen null): ábrelo con ▶ o en el editor para cambiar el enlace.`;
    logLine(`🔗 ?asientos=${code} (no se pudo cambiar el enlace: ${error.name})`);
  }
});
document.querySelector('#clear').addEventListener('click', () => {
  selection = new Uint8Array(BYTES);
  paint();
  logLine('🧹 selección vacía');
});

buildGrid();
const sharedNote = readSharedSelection();
paint();
const total = ROWS.length * PER_ROW;
logLine(`🎬 ${total} asientos en ${BYTES} bytes · ocupados ${popcount(occupied)} · libres ${total - popcount(occupied)} · ${sharedNote}`);
logLine('Listo: elige E8 y E9 (con el ratón o con Tab y las flechas) y pulsa «Poner mi selección en el enlace»');
```
