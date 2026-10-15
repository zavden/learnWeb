---
example_description: "Reserva de mesa con una sola puerta de entrada: el formulario y un JSON importado pasan por la misma función, que recibe unknown y devuelve una unión ok/errores; cada error nombra su campo (una unión de literales) y se muestra con aria-invalid y aria-describedby"
example_tags: "typescript|profesional|unknown|validacion|json|uniones-discriminadas|tipos-literales|formularios|accesibilidad"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<main class="app">
  <h1>Reserva en Casa Oaxaca</h1>
  <div id="summary" class="summary" role="alert" hidden></div>
  <form id="booking-form" class="card" novalidate>
    <div class="field"><label for="guest">Nombre</label><input id="guest" autocomplete="name" aria-describedby="guest-error"><p id="guest-error" class="error"></p></div>
    <div class="field"><label for="email">Correo</label><input id="email" type="email" autocomplete="email" aria-describedby="email-error"><p id="email-error" class="error"></p></div>
    <div class="row">
      <div class="field"><label for="party">Personas</label><input id="party" type="number" min="1" max="12" value="2" aria-describedby="party-error"><p id="party-error" class="error"></p></div>
      <div class="field"><label for="date">Fecha</label><input id="date" type="date" min="2026-11-01" max="2027-01-31" value="2026-12-24" aria-describedby="date-error"><p id="date-error" class="error"></p></div>
      <div class="field"><label for="time">Hora</label>
        <select id="time" aria-describedby="time-error"><option>13:00</option><option>14:30</option><option>16:00</option><option>19:00</option><option>20:30</option></select>
        <p id="time-error" class="error"></p></div>
    </div>
    <div class="field"><label for="occasion">Ocasión</label>
      <select id="occasion" aria-describedby="occasion-error">
        <option value="none">Ninguna</option><option value="birthday">Cumpleaños</option><option value="anniversary">Aniversario</option><option value="business">Comida de trabajo</option>
      </select><p id="occasion-error" class="error"></p></div>
    <div class="field"><label for="notes">Notas (opcional)</label><textarea id="notes" rows="2" aria-describedby="notes-error"></textarea><p id="notes-error" class="error"></p></div>
    <button type="submit" class="primary">Reservar</button>
  </form>
  <details class="card">
    <summary>Importar una reserva guardada (JSON)</summary>
    <label for="json" class="sr-only">Reserva en formato JSON</label>
    <textarea id="json" rows="4" spellcheck="false">{"guest": "Carmen Vidal", "email": "carmen@example.com", "party": 15, "date": "2026-12-24", "time": "21:00", "occasion": "birthday"}</textarea>
    <button type="button" id="import">Importar</button>
  </details>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root { color-scheme: light; --ink: #1f2933; --muted: #52606d; --line: #7b8794; --soft: #cbd2d9; --accent: #9a3412; --danger: #b91c1c; --danger-soft: #fef2f2; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: #fff8f0; }
.app { max-width: 36rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.3rem; margin: 0 0 0.75rem; }
.card { padding: 0.75rem 1rem; background: #fff; border: 1px solid var(--soft); border-radius: 0.75rem; margin-bottom: 1rem; }
.row { display: flex; flex-wrap: wrap; gap: 0 1rem; }
.field { display: grid; gap: 0.15rem; }
input, select, textarea, button { font: inherit; }
input, select, textarea { padding: 0.3rem 0.45rem; border: 1px solid var(--line); border-radius: 0.4rem; }
textarea { width: 100%; }
[aria-invalid="true"] { border: 2px solid var(--danger); }
.error { min-height: 1.3em; margin: 0; color: var(--danger); font-size: 0.85rem; font-weight: 600; }
button { padding: 0.4rem 0.9rem; border: 1px solid var(--line); border-radius: 0.5rem; background: #fff; color: var(--ink); cursor: pointer; }
button.primary { border-color: var(--accent); background: var(--accent); color: #fff; }
:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.summary { padding: 0.5rem 1rem; margin-bottom: 1rem; border-left: 4px solid var(--danger); background: var(--danger-soft); color: var(--danger); }
.summary.ok { border-color: #166534; background: #f0fdf4; color: #166534; }
.summary[hidden] { display: none; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
.log { font-size: 0.85rem; color: var(--muted); }
```

# TypeScript

```typescript
// ── El tipo bueno y la única puerta para llegar a él ──────────────────────
const TIME_SLOTS = ['13:00', '14:30', '16:00', '19:00', '20:30'] as const;
type TimeSlot = (typeof TIME_SLOTS)[number]; // operadores de tipo: módulo 2
type Occasion = 'none' | 'birthday' | 'anniversary' | 'business';
const OCCASION_LABEL = { none: '', birthday: ' (cumpleaños)', anniversary: ' (aniversario)', business: ' (trabajo)' } as const;
const SEASON = ['2026-11-01', '2027-01-31'] as const; // reservas abiertas

type Booking = {
  readonly guest: string;
  readonly email: string;
  readonly party: number;
  readonly date: string;
  readonly time: TimeSlot;
  readonly occasion: Occasion;
  readonly notes: string;
};
type Field = 'guest' | 'email' | 'party' | 'date' | 'time' | 'occasion' | 'notes';
type FieldError = { readonly field: Field; readonly message: string };
type Validation = { ok: true; booking: Booking } | { ok: false; errors: readonly FieldError[] };

const toTimeSlot = (value: string): TimeSlot | null => TIME_SLOTS.find((slot) => slot === value) ?? null;
function toOccasion(value: string): Occasion | null {
  return value === 'none' || value === 'birthday' || value === 'anniversary' || value === 'business' ? value : null;
}
function isSeasonDate(text: string): boolean {
  const time = Date.parse(`${text}T00:00:00Z`);
  // La vuelta a texto descarta fechas imposibles como 2026-02-30.
  return !Number.isNaN(time) && new Date(time).toISOString().slice(0, 10) === text && text >= SEASON[0] && text <= SEASON[1];
}

// Leer una propiedad de un objeto desconocido: Reflect.get (capítulo 5) devuelve
// any, así que el resultado se guarda como unknown y se comprueba antes de usarlo.
function readField(data: object, key: Field): unknown {
  return Reflect.get(data, key);
}
function readText(data: object, key: Field): string {
  const value = readField(data, key);
  return typeof value === 'string' ? value.trim() : '';
}

// Recibe unknown: un formulario, un JSON, localStorage… todo pasa por aquí.
function validateBooking(data: unknown): Validation {
  if (typeof data !== 'object' || data === null) return { ok: false, errors: [{ field: 'guest', message: 'Los datos no son un objeto' }] };
  const errors: FieldError[] = [];
  const guest = readText(data, 'guest');
  if (guest.length < 2) errors.push({ field: 'guest', message: 'Escribe tu nombre' });
  const email = readText(data, 'email');
  const at = email.indexOf('@');
  if (at < 1 || at === email.length - 1) errors.push({ field: 'email', message: 'Escribe un correo como ana@example.com' });
  const rawParty = readField(data, 'party');
  const party = typeof rawParty === 'number' ? rawParty : Number.NaN;
  if (!Number.isInteger(party) || party < 1 || party > 12) errors.push({ field: 'party', message: 'De 1 a 12 personas (para más, llámanos)' });
  const date = readText(data, 'date');
  if (!isSeasonDate(date)) errors.push({ field: 'date', message: `Elige un día entre ${SEASON[0]} y ${SEASON[1]}` });
  const time = toTimeSlot(readText(data, 'time'));
  if (time === null) errors.push({ field: 'time', message: `Horarios: ${TIME_SLOTS.join(', ')}` });
  const occasion = toOccasion(readText(data, 'occasion') || 'none');
  if (occasion === null) errors.push({ field: 'occasion', message: 'Ocasión desconocida' });
  const notes = readText(data, 'notes');
  if (notes.length > 200) errors.push({ field: 'notes', message: 'Máximo 200 caracteres' });
  if (errors.length > 0 || time === null || occasion === null) return { ok: false, errors };
  return { ok: true, booking: { guest, email, party, date, time, occasion, notes } };
}

// ── La interfaz ───────────────────────────────────────────────────────────
function byId(id: string): HTMLElement {
  const element = document.getElementById(id);
  if (element === null) throw new Error(`Falta el elemento #${id}`);
  return element;
}
function inputById(id: string): HTMLInputElement {
  const element = byId(id);
  if (!(element instanceof HTMLInputElement)) throw new Error(`#${id} no es un <input>`);
  return element;
}
function selectById(id: string): HTMLSelectElement {
  const element = byId(id);
  if (!(element instanceof HTMLSelectElement)) throw new Error(`#${id} no es un <select>`);
  return element;
}
function textareaById(id: string): HTMLTextAreaElement {
  const element = byId(id);
  if (!(element instanceof HTMLTextAreaElement)) throw new Error(`#${id} no es un <textarea>`);
  return element;
}

// Un control por campo: controls[field] existe para cualquier Field.
const controls = {
  guest: inputById('guest'),
  email: inputById('email'),
  party: inputById('party'),
  date: inputById('date'),
  time: selectById('time'),
  occasion: selectById('occasion'),
  notes: textareaById('notes'),
} as const;
const FIELDS: readonly Field[] = ['guest', 'email', 'party', 'date', 'time', 'occasion', 'notes'];
const summary = byId('summary');
const jsonInput = textareaById('json');
const logList = byId('log');

function report(message: string): void {
  console.log(message);
  const item = document.createElement('li');
  item.textContent = message;
  logList.append(item);
}

// El formulario se convierte en un objeto… de tipo unknown: misma puerta que el JSON.
function readForm(): unknown {
  return {
    guest: controls.guest.value,
    email: controls.email.value,
    party: controls.party.value === '' ? null : Number(controls.party.value),
    date: controls.date.value,
    time: controls.time.value,
    occasion: controls.occasion.value,
    notes: controls.notes.value,
  };
}

function showErrors(errors: readonly FieldError[], source: string): void {
  for (const field of FIELDS) {
    const error = errors.find((item) => item.field === field);
    controls[field].setAttribute('aria-invalid', String(error !== undefined));
    byId(`${field}-error`).textContent = error?.message ?? '';
  }
  summary.hidden = errors.length === 0;
  summary.className = 'summary';
  summary.textContent = `${source}: ${errors.length} ${errors.length === 1 ? 'error' : 'errores'}. ${errors.map((item) => item.message).join(' · ')}`;
  if (errors.length > 0) report(`⚠️ ${source}: ${errors.length} errores (${errors.map((item) => item.field).join(', ')})`);
}

function fillForm(booking: Booking): void {
  controls.guest.value = booking.guest;
  controls.email.value = booking.email;
  controls.party.value = String(booking.party);
  controls.date.value = booking.date;
  controls.time.value = booking.time;
  controls.occasion.value = booking.occasion;
  controls.notes.value = booking.notes;
}

byId('booking-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const result = validateBooking(readForm());
  if (!result.ok) {
    showErrors(result.errors, 'Formulario');
    const first = result.errors[0];
    if (first !== undefined) controls[first.field].focus();
    return;
  }
  showErrors([], 'Formulario');
  const { party, date, time, guest, occasion } = result.booking;
  summary.hidden = false;
  summary.className = 'summary ok';
  summary.textContent = `Mesa para ${party} el ${date} a las ${time}. ¡Te esperamos, ${guest}!`;
  report(`✅ mesa para ${party} · ${date} a las ${time} · ${guest}${OCCASION_LABEL[occasion]}`);
});

byId('import').addEventListener('click', () => {
  let data: unknown;
  try {
    data = JSON.parse(jsonInput.value);
  } catch {
    summary.hidden = false;
    summary.className = 'summary';
    summary.textContent = 'JSON: el texto no es JSON válido (revisa comillas y comas).';
    report('⚠️ JSON: el texto no es JSON válido');
    return;
  }
  const result = validateBooking(data);
  if (!result.ok) {
    showErrors(result.errors, 'JSON');
    return;
  }
  fillForm(result.booking);
  showErrors([], 'JSON');
  report(`📥 importada: ${result.booking.guest}, ${result.booking.party} personas, ${result.booking.date} ${result.booking.time}`);
  controls.guest.focus();
});

console.log('Listo: pulsa «Reservar» con el formulario vacío, o abre «Importar» (el JSON trae 2 errores)');
```
