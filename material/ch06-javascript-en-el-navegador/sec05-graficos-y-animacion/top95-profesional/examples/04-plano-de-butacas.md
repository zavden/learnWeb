---
example_description: "El plano de una sala de cine generado en SVG a partir de datos: cada butaca es un botón (role, aria-pressed, aria-label con fila, número y precio), se recorre con las flechas con un tabindex itinerante, se elige con clic, Enter o Espacio, las vendidas no se pueden elegir, y la selección (hasta 6) se recuerda en localStorage"
example_tags: "javascript|svg|createelementns|teclado|tabindex|aria|localstorage|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="booking">
  <h1>Cineteca · Sala 3 · «Roma» · 19:30</h1>
  <p id="help" class="booking__help">Elige hasta 6 butacas. Con el teclado: Tab hasta el plano, flechas para moverte, Enter o Espacio para elegir.</p>
  <svg id="plan" class="booking__plan" viewBox="0 0 370 250" aria-labelledby="plan-title" aria-describedby="help"
       font-family="system-ui, sans-serif" font-size="10">
    <title id="plan-title">Plano de la sala</title>
    <path d="M 60 22 Q 185 2 310 22" fill="none" stroke="#52606d" stroke-width="4"/>
    <text x="185" y="34" text-anchor="middle" fill="#52606d">PANTALLA</text>
    <g id="seats"></g>
  </svg>
  <ul class="legend" aria-label="Leyenda">
    <li><span class="swatch swatch--free"></span>Libre</li>
    <li><span class="swatch swatch--selected"></span>Tu elección</li>
    <li><span class="swatch swatch--sold"></span>Vendida</li>
  </ul>
  <p id="summary" class="booking__summary" role="status"></p>
  <button id="reset" type="button">Borrar la selección</button>
</main>
```

# CSS

```css
:root {
  --free: #e0f2fe;
  --free-border: #0369a1;
  --selected: #0e7490;
  --sold: #e4e7eb;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
.booking {
  max-width: 34rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.1rem;
  margin-top: 0;
}
.booking__help {
  color: #52606d;
  font-size: 0.9rem;
}
.booking__plan {
  display: block;
  width: 100%;
  height: auto;
  background: #ffffff;
  border-radius: 0.5rem;
}
.seat {
  cursor: pointer;
}
.seat rect {
  fill: var(--free);
  stroke: var(--free-border);
  stroke-width: 1;
}
.seat text {
  fill: #1f2933;
  pointer-events: none;
}
.seat[aria-pressed="true"] rect {
  fill: var(--selected);
}
.seat[aria-pressed="true"] text {
  fill: #ffffff;
}
.seat[aria-disabled="true"] {
  cursor: not-allowed;
}
.seat[aria-disabled="true"] rect {
  fill: var(--sold);
  stroke: #9aa5b1;
  stroke-dasharray: 3 2;
}
/* El foco, dibujado con el trazo (outline no se pinta igual en todos los navegadores en SVG) */
.seat:focus {
  outline: none;
}
.seat:focus-visible rect {
  stroke: #1d4ed8;
  stroke-width: 3;
}
.legend {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  padding: 0;
  list-style: none;
  font-size: 0.85rem;
}
.swatch {
  display: inline-block;
  width: 0.9rem;
  height: 0.9rem;
  margin-right: 0.3rem;
  vertical-align: -0.1rem;
  border: 1px solid var(--free-border);
  border-radius: 0.2rem;
}
.swatch--free { background: var(--free); }
.swatch--selected { background: var(--selected); }
.swatch--sold { background: var(--sold); border: 1px dashed #9aa5b1; }
.booking__summary {
  font-weight: 600;
}
button {
  font: inherit;
  padding: 0.3rem 0.8rem;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Plano de butacas accesible.
//
// Decisiones de diseño:
// - El plano se genera desde datos (filas, precios, vendidas): cambiar de sala es cambiar datos.
// - Cada butaca es un <g role="button"> con aria-pressed (elegida o no), aria-disabled (vendida)
//   y un aria-label completo («Fila C, butaca 5, 95 pesos»): la etiqueta visible es solo el número.
// - Tabindex itinerante: una sola butaca tiene tabindex="0" (Tab entra y sale del plano de un
//   salto); las flechas mueven el foco y el 0 a la butaca enfocada. Home/End van al principio
//   y al final de la fila.
// - Las vendidas y las elegidas no dependen solo del color: borde discontinuo y texto blanco.
// - La selección se guarda en «lw-gfx-butacas» y se valida al leerla (que exista, que no esté
//   vendida, como mucho 6). «Borrar la selección» borra la clave.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos, red y almacenamiento y este módulo.

const ROWS = [
  { name: 'A', price: 75 }, { name: 'B', price: 75 }, { name: 'C', price: 95 },
  { name: 'D', price: 95 }, { name: 'E', price: 95 }, { name: 'F', price: 95 },
];
const SEATS_PER_ROW = 10;
const SOLD = new Set(['A1', 'A2', 'C5', 'C6', 'D4', 'D5', 'D6', 'D7', 'E8']);
const MAX_SEATS = 6;
const STORAGE_KEY = 'lw-gfx-butacas';
const SVG_NS = 'http://www.w3.org/2000/svg';
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });

// ── Generar el plano ─────────────────────────────────────────────────────
const seatsGroup = document.querySelector('#seats');
const seats = [];                                 // en orden de lectura: fila a fila
ROWS.forEach((row, r) => {
  const label = document.createElementNS(SVG_NS, 'text');
  for (const [name, value] of Object.entries({ x: 14, y: 62 + r * 32, fill: '#52606d', 'text-anchor': 'middle' })) label.setAttribute(name, value);
  label.textContent = row.name;
  seatsGroup.append(label);
  for (let n = 1; n <= SEATS_PER_ROW; n++) {
    const id = `${row.name}${n}`;
    const x = 30 + (n - 1) * 30 + (n > 5 ? 20 : 0); // un pasillo en medio
    const y = 48 + r * 32;
    const seat = document.createElementNS(SVG_NS, 'g');
    seat.classList.add('seat');
    seat.dataset.id = id;
    seat.dataset.price = row.price;
    seat.setAttribute('role', 'button');
    seat.setAttribute('tabindex', '-1');
    seat.setAttribute('aria-pressed', 'false');
    const sold = SOLD.has(id);
    if (sold) seat.setAttribute('aria-disabled', 'true');
    seat.setAttribute('aria-label', `Fila ${row.name}, butaca ${n}, ${row.price} pesos${sold ? ', vendida' : ''}`);
    seat.innerHTML = `<rect x="${x}" y="${y}" width="24" height="22" rx="5"/><text x="${x + 12}" y="${y + 15}" text-anchor="middle">${n}</text>`;
    seatsGroup.append(seat);
    seats.push(seat);
  }
});
seats[0].setAttribute('tabindex', '0');

// ── Selección y almacenamiento ───────────────────────────────────────────
const selected = new Set();
const summaryLine = document.querySelector('#summary');
function loadSelection() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(saved)) return [];
    const valid = new Set(seats.map((seat) => seat.dataset.id));
    return saved.filter((id) => typeof id === 'string' && valid.has(id) && !SOLD.has(id)).slice(0, MAX_SEATS);
  } catch {
    return [];                                    // texto roto o almacenamiento bloqueado
  }
}
function saveSelection() {
  try {
    if (selected.size === 0) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify([...selected]));
  } catch {
    // sin almacenamiento: la selección dura lo que la página
  }
}
const seatById = (id) => seats.find((seat) => seat.dataset.id === id);
function total() {
  return [...selected].reduce((sum, id) => sum + Number(seatById(id).dataset.price), 0);
}
function updateSummary() {
  summaryLine.textContent = selected.size === 0
    ? 'Aún no has elegido butacas.'
    : `${selected.size} butaca(s): ${[...selected].join(', ')} · Total ${money.format(total())}`;
}
function toggle(seat) {
  const id = seat.dataset.id;
  if (seat.getAttribute('aria-disabled') === 'true') {
    console.log(`⛔ ${id} está vendida`);
    summaryLine.textContent = `La butaca ${id} ya está vendida.`;
    return;
  }
  if (selected.has(id)) {
    selected.delete(id);
  } else if (selected.size >= MAX_SEATS) {
    summaryLine.textContent = `Como mucho ${MAX_SEATS} butacas por compra.`;
    console.log(`⛔ máximo ${MAX_SEATS} butacas`);
    return;
  } else {
    selected.add(id);
  }
  seat.setAttribute('aria-pressed', String(selected.has(id)));
  saveSelection();
  updateSummary();
  console.log(`${selected.has(id) ? '➕' : '➖'} ${id} · total ${money.format(total())}`);
}

// ── Puntero y teclado ────────────────────────────────────────────────────
function focusSeat(index) {
  const next = seats[Math.max(0, Math.min(seats.length - 1, index))];
  seats.forEach((seat) => seat.setAttribute('tabindex', seat === next ? '0' : '-1'));
  next.focus();
}
seatsGroup.addEventListener('click', (event) => {
  const seat = event.target.closest('.seat');
  if (!seat) return;
  focusSeat(seats.indexOf(seat));
  toggle(seat);
});
seatsGroup.addEventListener('keydown', (event) => {
  const index = seats.indexOf(event.target.closest('.seat'));
  if (index === -1) return;
  const column = index % SEATS_PER_ROW;
  const moves = {
    ArrowRight: index + 1, ArrowLeft: index - 1,
    ArrowDown: index + SEATS_PER_ROW, ArrowUp: index - SEATS_PER_ROW,
    Home: index - column, End: index - column + SEATS_PER_ROW - 1,
  };
  if (event.key in moves) {
    event.preventDefault();
    focusSeat(moves[event.key]);
  } else if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();                       // que Espacio no desplace la página
    toggle(seats[index]);
  }
});
document.querySelector('#reset').addEventListener('click', () => {
  selected.clear();
  seats.forEach((seat) => seat.setAttribute('aria-pressed', 'false'));
  saveSelection();
  updateSummary();
  console.log('🧹 selección borrada');
});

for (const id of loadSelection()) {
  selected.add(id);
  seatById(id).setAttribute('aria-pressed', 'true');
}
updateSummary();
console.log(`🎟️ ${seats.length} butacas · ${SOLD.size} vendidas · ${seats.length - SOLD.size} libres · guardadas: ${selected.size}`);
console.log('Listo: elige C3 y C4 (clic, o Tab, flechas y Enter) y prueba a elegir C5');
```
