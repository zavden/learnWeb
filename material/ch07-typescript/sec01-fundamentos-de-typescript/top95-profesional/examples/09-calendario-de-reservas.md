---
example_description: "El calendario de una cabaña: estancias como tuplas [llegada, salida], la selección como unión discriminada de tres pasos, tarifas por tipo de noche con una tabla as const y un switch exhaustivo, y una rejilla de días navegable con las flechas"
example_tags: "typescript|profesional|tuplas|uniones-discriminadas|never|as-const|calendario|teclado|accesibilidad"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="app">
  <h1>Cabaña El Pinar · diciembre de 2026</h1>
  <p id="hint" class="hint" aria-live="polite"></p>
  <div class="weekdays" aria-hidden="true"><span>lu</span><span>ma</span><span>mi</span><span>ju</span><span>vi</span><span>sá</span><span>do</span></div>
  <div id="days" class="days" role="group" aria-label="Días de diciembre"></div>
  <section class="summary" aria-live="polite">
    <h2>Tu estancia</h2>
    <p id="summary">Sin fechas todavía.</p>
    <button type="button" id="reset">Empezar de nuevo</button>
  </section>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #7b8794; --soft: #cbd2d9; --accent: #166534; --accent-soft: #dcfce7; --busy: #9f1239; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: #f5f7fa; }
.app { max-width: 30rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.25rem; }
h2 { font-size: 1rem; margin: 0; }
.hint { margin: 0 0 0.5rem; color: var(--muted); min-height: 1.5em; }
.weekdays, .days { display: grid; grid-template-columns: repeat(7, 1fr); gap: 0.25rem; }
.weekdays span { text-align: center; font-size: 0.8rem; color: var(--muted); }
.days button { aspect-ratio: 1; font: inherit; border: 1px solid var(--line); border-radius: 0.4rem; background: #fff; color: var(--ink); cursor: pointer; }
.days button.busy { color: var(--busy); text-decoration: line-through; background: #fff1f2; }
.days button[aria-pressed="true"] { background: var(--accent); border-color: var(--accent); color: #fff; }
.days button.in-range { background: var(--accent-soft); }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.summary { margin-top: 1rem; padding: 0.75rem 1rem; background: #fff; border: 1px solid var(--soft); border-radius: 0.75rem; }
.summary button { font: inherit; padding: 0.3rem 0.8rem; border: 1px solid var(--line); border-radius: 0.4rem; background: #fff; cursor: pointer; }
.log { font-size: 0.85rem; color: var(--muted); }
```

# TypeScript

```typescript
// ── Fechas, estancias y tarifas ───────────────────────────────────────────
type IsoDate = string; // 'AAAA-MM-DD' (un alias que documenta; no comprueba el formato)
type Stay = readonly [checkIn: IsoDate, checkOut: IsoDate]; // la salida no se cobra
type NightKind = 'weekday' | 'weekend' | 'holiday';
type Selection = { step: 'check-in' } | { step: 'check-out'; checkIn: IsoDate } | { step: 'done'; stay: Stay };

const BOOKED: readonly Stay[] = [
  ['2026-12-05', '2026-12-08'],
  ['2026-12-18', '2026-12-21'],
  ['2026-12-26', '2026-12-29'],
];
const RATE_CENTS = { weekday: 180000, weekend: 240000, holiday: 320000 } as const;
const KIND_LABEL = { weekday: 'entre semana', weekend: 'fin de semana', holiday: 'festiva' } as const;
const HOLIDAYS: readonly IsoDate[] = ['2026-12-24', '2026-12-25', '2026-12-31'];
const DAY_MS = 86_400_000;

const dateOf = (day: number): IsoDate => `2026-12-${String(day).padStart(2, '0')}`;
const dayOf = (date: IsoDate): number => Number(date.slice(8));
const weekday = (date: IsoDate): number => new Date(`${date}T00:00:00Z`).getUTCDay(); // 0 = domingo

function nightsOf([checkIn, checkOut]: Stay): IsoDate[] {
  const nights: IsoDate[] = [];
  for (let time = Date.parse(`${checkIn}T00:00:00Z`); time < Date.parse(`${checkOut}T00:00:00Z`); time += DAY_MS) {
    nights.push(new Date(time).toISOString().slice(0, 10));
  }
  return nights;
}
const isBookedNight = (date: IsoDate): boolean => BOOKED.some(([checkIn, checkOut]) => date >= checkIn && date < checkOut);

function nightKind(date: IsoDate): NightKind {
  if (HOLIDAYS.includes(date)) return 'holiday';
  const day = weekday(date);
  return day === 5 || day === 6 ? 'weekend' : 'weekday'; // noches de viernes y sábado
}

function priceOf(stay: Stay): { nights: number; totalCents: number; detail: string } {
  const counts = { weekday: 0, weekend: 0, holiday: 0 };
  for (const night of nightsOf(stay)) counts[nightKind(night)] += 1;
  const kinds: readonly NightKind[] = ['weekday', 'weekend', 'holiday'];
  const used = kinds.filter((kind) => counts[kind] > 0);
  return {
    nights: used.reduce((sum, kind) => sum + counts[kind], 0),
    totalCents: used.reduce((sum, kind) => sum + counts[kind] * RATE_CENTS[kind], 0),
    detail: used.map((kind) => `${counts[kind]} ${KIND_LABEL[kind]}`).join(' + '),
  };
}

// ── La interfaz ───────────────────────────────────────────────────────────
function byId(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (element === null) throw new Error(`Falta el elemento #${id}`);
  return element;
}
const daysGrid = byId('days');
const hint = byId('hint');
const summary = byId('summary');
const logList = byId('log');
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const longDate = new Intl.DateTimeFormat('es-MX', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long' });
const LAST_DAY = 31;

let selection: Selection = { step: 'check-in' };
let focusDay = 1;

function report(message: string): void {
  console.log(message);
  const item = document.createElement('li');
  item.textContent = message;
  logList.append(item);
}

function render(): void {
  const current = selection;
  const range: Stay | null = current.step === 'done' ? current.stay : null;
  const buttons: HTMLButtonElement[] = [];
  for (let day = 1; day <= LAST_DAY; day += 1) {
    const date = dateOf(day);
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = String(day);
    button.dataset.day = String(day);
    button.tabIndex = day === focusDay ? 0 : -1;
    if (day === 1) button.style.gridColumnStart = String(((weekday(date) + 6) % 7) + 1); // lunes primero
    const busy = isBookedNight(date);
    button.classList.toggle('busy', busy);
    const isEdge = (current.step === 'check-out' && current.checkIn === date) || (range !== null && (range[0] === date || range[1] === date));
    button.setAttribute('aria-pressed', String(isEdge));
    button.classList.toggle('in-range', range !== null && date > range[0] && date < range[1]);
    button.setAttribute('aria-label', `${longDate.format(new Date(`${date}T00:00:00Z`))}${busy ? ', noche ocupada' : ''}`);
    buttons.push(button);
  }
  daysGrid.replaceChildren(...buttons);
  switch (current.step) {
    case 'check-in':
      hint.textContent = 'Elige el día de llegada.';
      summary.textContent = 'Sin fechas todavía.';
      break;
    case 'check-out':
      hint.textContent = `Llegada el ${current.checkIn}. Ahora, el día de salida.`;
      summary.textContent = 'Falta el día de salida.';
      break;
    case 'done': {
      const { nights, totalCents, detail } = priceOf(current.stay);
      hint.textContent = 'Listo. Pulsa otro día para empezar otra estancia.';
      summary.textContent = `${current.stay[0]} → ${current.stay[1]}: ${nights} noches (${detail}) · ${money.format(totalCents / 100)}`;
      break;
    }
  }
}

function choose(day: number): void {
  const date = dateOf(day);
  focusDay = day;
  const current = selection;
  if (current.step === 'check-out' && date > current.checkIn) {
    const stay: Stay = [current.checkIn, date];
    if (nightsOf(stay).some(isBookedNight)) {
      selection = { step: 'check-in' };
      report(`⚠️ ${stay[0]} → ${stay[1]} cruza noches ocupadas: elige otra llegada`);
    } else {
      selection = { step: 'done', stay };
      const { nights, totalCents } = priceOf(stay);
      report(`🛏️ ${stay[0]} → ${stay[1]}: ${nights} noches · ${money.format(totalCents / 100)}`);
    }
  } else if (isBookedNight(date) || day === LAST_DAY) {
    report(`⚠️ no se puede llegar el ${date}${isBookedNight(date) ? ': esa noche está ocupada' : ': elige un día anterior'}`);
  } else {
    selection = { step: 'check-out', checkIn: date };
    report(`📅 llegada ${date}`);
  }
  render();
  const focused = daysGrid.querySelector(`button[data-day="${focusDay}"]`);
  if (focused instanceof HTMLButtonElement) focused.focus();
}

type ArrowKey = 'ArrowLeft' | 'ArrowRight' | 'ArrowUp' | 'ArrowDown';
const toArrow = (key: string): ArrowKey | null =>
  key === 'ArrowLeft' || key === 'ArrowRight' || key === 'ArrowUp' || key === 'ArrowDown' ? key : null;
function offsetOf(key: ArrowKey): number {
  switch (key) {
    case 'ArrowLeft':
      return -1;
    case 'ArrowRight':
      return 1;
    case 'ArrowUp':
      return -7;
    case 'ArrowDown':
      return 7;
  }
}

daysGrid.addEventListener('click', (event) => {
  if (!(event.target instanceof Element)) return;
  const button = event.target.closest('button');
  if (button !== null) choose(Number(button.dataset.day));
});
daysGrid.addEventListener('keydown', (event) => {
  const key = toArrow(event.key);
  if (key === null) return;
  event.preventDefault();
  focusDay = Math.min(LAST_DAY, Math.max(1, focusDay + offsetOf(key)));
  render();
  const focused = daysGrid.querySelector(`button[data-day="${focusDay}"]`);
  if (focused instanceof HTMLButtonElement) focused.focus();
});
byId('reset').addEventListener('click', () => {
  selection = { step: 'check-in' };
  render();
  report('↺ sin fechas');
});

render();
console.log('Listo: pulsa la llegada y la salida (las fechas tachadas están ocupadas), o usa Tab y las flechas');
```
