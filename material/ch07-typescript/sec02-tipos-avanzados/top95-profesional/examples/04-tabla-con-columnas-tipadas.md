---
example_description: "Una tabla accesible de conciertos con columnas tipadas: cada columna nombra una clave del tipo (keyof) y su formateador recibe exactamente el tipo de esa propiedad gracias a un tipo mapeado indexado; las cabeceras ordenan con botones, aria-sort y un aviso en una región viva"
example_tags: "typescript|profesional|keyof|tipos-mapeados|tipos-indexados|genericos|tablas|dom|accesibilidad|intl"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>Gira de otoño 2026</h1>
  <div class="scroll" role="region" aria-labelledby="caption" tabindex="0">
    <table>
      <caption id="caption">Conciertos de la gira (pulsa una cabecera para ordenar)</caption>
      <thead><tr id="head"></tr></thead>
      <tbody id="body"></tbody>
    </table>
  </div>
  <p id="announce" class="sr-only" aria-live="polite"></p>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #7b8794; --soft: #d9e2ec; --accent: #1d4ed8; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: #f5f7fa; }
.app { max-width: 44rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
.scroll { overflow-x: auto; background: #fff; border: 1px solid var(--line); border-radius: 0.5rem; }
table { border-collapse: collapse; width: 100%; min-width: 34rem; font-size: 0.9rem; }
caption { text-align: start; padding: 0.5rem 0.75rem; color: var(--muted); }
th, td { padding: 0.4rem 0.75rem; border-top: 1px solid var(--soft); text-align: start; white-space: nowrap; }
th { background: #eef2f7; }
.end { text-align: end; }
th button { font: inherit; font-weight: 700; padding: 0.15rem 0.3rem; margin: -0.15rem -0.3rem; border: 0; background: none; color: var(--ink); cursor: pointer; }
th button::after { content: ' ↕'; color: var(--muted); }
th[aria-sort="ascending"] button::after { content: ' ↑'; color: var(--ink); }
th[aria-sort="descending"] button::after { content: ' ↓'; color: var(--ink); }
.sold-out { color: #b91c1c; font-weight: 600; }
:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.log { font-size: 0.85rem; color: var(--muted); }
```

# TypeScript

```typescript
// ── Columnas tipadas ──────────────────────────────────────────────────────
type Column<T, K extends keyof T> = { key: K; label: string; format: (value: T[K]) => string; align?: 'start' | 'end' };
// «Una columna de CUALQUIER clave, pero coherente»: un mapeado indexado por keyof T da la
// unión Column<T, 'city'> | Column<T, 'date'> | …, así que format recibe el tipo de SU clave.
type ColumnMap<T> = { [K in keyof T]: Column<T, K> };
type AnyColumn<T> = ColumnMap<T>[keyof T];
type Direction = 'ascending' | 'descending';

type Concert = { city: string; venue: string; date: string; price: number; soldOut: boolean };

const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 });
const day = new Intl.DateTimeFormat('es-MX', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });

const COLUMNS: readonly AnyColumn<Concert>[] = [
  { key: 'city', label: 'Ciudad', format: (city) => city },
  { key: 'venue', label: 'Foro', format: (venue) => venue },
  { key: 'date', label: 'Fecha', format: (iso) => day.format(new Date(`${iso}T12:00:00Z`)) },
  { key: 'price', label: 'Desde', format: (price) => pesos.format(price), align: 'end' }, // price: number
  { key: 'soldOut', label: 'Boletos', format: (soldOut) => (soldOut ? 'Agotado' : 'Disponibles') }, // boolean
  // { key: 'price', label: 'Desde', format: (price) => price.toUpperCase() } sería un error: price es number.
];

const CONCERTS: readonly Concert[] = [
  { city: 'Guadalajara', venue: 'Teatro Diana', date: '2026-10-30', price: 850, soldOut: false },
  { city: 'Monterrey', venue: 'Auditorio Pabellón M', date: '2026-11-06', price: 990, soldOut: true },
  { city: 'Ciudad de México', venue: 'Teatro Metropólitan', date: '2026-11-13', price: 1200, soldOut: false },
  { city: 'Oaxaca', venue: 'Teatro Macedonio Alcalá', date: '2026-11-21', price: 650, soldOut: false },
  { city: 'Mérida', venue: 'Teatro Peón Contreras', date: '2026-11-28', price: 700, soldOut: true },
];

// Un comparador genérico: K relaciona la clave con el tipo de los valores que compara.
function compareBy<T, K extends keyof T>(key: K, direction: Direction): (a: T, b: T) => number {
  const sign = direction === 'ascending' ? 1 : -1;
  return (a, b) => {
    const x = a[key];
    const y = b[key];
    if (typeof x === 'string' && typeof y === 'string') return sign * x.localeCompare(y, 'es');
    return sign * (x < y ? -1 : x > y ? 1 : 0);
  };
}

// ── La tabla ──────────────────────────────────────────────────────────────
function byId<T extends HTMLElement>(id: string, type: new () => T): T {
  const element = document.getElementById(id);
  if (!(element instanceof type)) throw new Error(`Falta #${id} o no es del tipo esperado`);
  return element;
}
const head = byId('head', HTMLTableRowElement);
const body = byId('body', HTMLTableSectionElement);
const announce = byId('announce', HTMLParagraphElement);
const logList = byId('log', HTMLOListElement);
let sort: { key: keyof Concert; direction: Direction } = { key: 'date', direction: 'ascending' };

// Una celda. Con la unión, TypeScript no ve que format y row[key] van juntos; tipando la
// columna como ColumnMap<Concert>[K], con K genérico, sí lo ve (correlación de uniones).
function cellText<K extends keyof Concert>(column: ColumnMap<Concert>[K], row: Concert): string {
  return column.format(row[column.key]);
}

function renderHead(): void {
  head.replaceChildren(...COLUMNS.map((column) => {
    const th = document.createElement('th');
    th.scope = 'col';
    if (column.align === 'end') th.className = 'end';
    th.setAttribute('aria-sort', sort.key === column.key ? sort.direction : 'none');
    const control = document.createElement('button');
    control.type = 'button';
    control.textContent = column.label;
    control.dataset.key = column.key;
    th.append(control);
    return th;
  }));
}
function renderBody(): void {
  const rows = [...CONCERTS].sort(compareBy<Concert, keyof Concert>(sort.key, sort.direction));
  body.replaceChildren(...rows.map((row) => {
    const tr = document.createElement('tr');
    tr.append(...COLUMNS.map((column) => {
      const td = document.createElement(column.key === 'city' ? 'th' : 'td'); // la ciudad encabeza la fila
      if (column.key === 'city') td.scope = 'row';
      td.textContent = cellText(column, row);
      if (column.align === 'end') td.className = 'end';
      if (column.key === 'soldOut' && row.soldOut) td.classList.add('sold-out');
      return td;
    }));
    return tr;
  }));
}

const isColumnKey = (value: string | undefined): value is keyof Concert => COLUMNS.some((column) => column.key === value);

head.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const control = event.target.closest('button');
  const key = control?.dataset.key;
  if (!isColumnKey(key)) return;
  sort = { key, direction: sort.key === key && sort.direction === 'ascending' ? 'descending' : 'ascending' };
  renderHead();
  renderBody();
  const again = head.querySelector(`button[data-key="${key}"]`); // el botón se volvió a crear:
  if (again instanceof HTMLButtonElement) again.focus(); // el foco vuelve a la misma cabecera
  const label = COLUMNS.find((column) => column.key === key)?.label ?? key;
  const first = body.rows[0]?.cells[0]?.textContent ?? '';
  announce.textContent = `Ordenado por ${label}, ${sort.direction === 'ascending' ? 'ascendente' : 'descendente'}`;
  const message = `↕ ${announce.textContent} · primero: ${first}`;
  console.log(message);
  logList.append(Object.assign(document.createElement('li'), { textContent: message }));
});

renderHead();
renderBody();
console.log('Listo: pulsa «Desde» (dos veces cambia el sentido) o cualquier otra cabecera');
```
