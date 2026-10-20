---
example_description: "Una reserva de hotel con dos type=\"date\" tratados en UTC de principio a fin: las noches salen de restar valueAsNumber (sin sorpresas de zona ni de cambio de hora), el día de la semana de cada noche con getUTCDay, las fechas se muestran con Intl y timeZone: 'UTC', la salida se ajusta si queda antes de la llegada y más de 14 noches es un error propio"
example_tags: "javascript|formularios|profesional|fechas|valueasnumber|valueasdate|utc|intl|setcustomvalidity"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Hotel Casa Azul · Oaxaca</h1>
  <p id="card-notice" class="notice" hidden>Esta tarjeta es un iframe aislado y aquí los formularios no se envían: ábrelo con «▶ Run» o en el editor.</p>
  <form id="booking" action="/reservas" method="post">
    <div class="row">
      <div class="field">
        <label for="check-in">Llegada</label>
        <input id="check-in" name="check_in" type="date" required min="2026-11-01" max="2027-03-31" value="2026-11-20">
      </div>
      <div class="field">
        <label for="check-out">Salida</label>
        <input id="check-out" name="check_out" type="date" required min="2026-11-02" max="2027-04-14" value="2026-11-23">
      </div>
    </div>
    <fieldset>
      <legend>Habitación</legend>
      <label><input type="radio" name="room" value="single" required> Sencilla · $1,200 por noche</label>
      <label><input type="radio" name="room" value="double" checked> Doble · $1,600 por noche</label>
    </fieldset>
    <p class="hint">Las noches de viernes y sábado cuestan un 25 % más.</p>
    <section aria-labelledby="summary-title" class="summary">
      <h2 id="summary-title">Tu estancia</h2>
      <ul id="nights"></ul>
      <p id="total" class="total"></p>
    </section>
    <p id="adjusted" role="status"></p>
    <button type="submit" class="primary">Reservar</button>
  </form>
  <ol id="log" class="log" aria-label="Registro"></ol>
</main>
```

# CSS

```css
:root {
  --ink: #1f2933;
  --muted: #52606d;
  --line: #cbd2d9;
  --field: #7b8794;
  --surface: #ffffff;
  --page: #f5f7fa;
  --accent: #1d4ed8;
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
main {
  max-width: 34rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.25rem;
  margin: 0 0 0.75rem;
}
h2 {
  font-size: 1rem;
  margin: 0;
}
.notice {
  padding: 0.5rem 0.75rem;
  border-left: 4px solid var(--accent);
  background: var(--surface);
}
form {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
  border: 1px solid var(--line);
  border-radius: 0.75rem;
  background: var(--surface);
}
.row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: 0.75rem;
}
.field {
  display: grid;
  gap: 0.2rem;
}
label {
  font-weight: 600;
}
fieldset {
  display: grid;
  gap: 0.3rem;
  margin: 0;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
}
fieldset label {
  font-weight: 400;
}
.hint {
  margin: 0;
  color: var(--muted);
}
.summary {
  padding: 0.75rem;
  border-radius: 0.5rem;
  background: var(--page);
}
.summary ul {
  margin: 0.25rem 0;
  padding-left: 1.2rem;
}
.total {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}
input,
button {
  font: inherit;
  color: var(--ink);
}
input[type="date"] {
  padding: 0.35rem 0.5rem;
  border: 1px solid var(--field);
  border-radius: 0.375rem;
  background: var(--surface);
}
.primary {
  justify-self: start;
  padding: 0.45rem 1rem;
  border: 1px solid var(--accent);
  border-radius: 0.5rem;
  background: var(--accent);
  color: #ffffff;
  cursor: pointer;
}
:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid var(--line);
  border-radius: 0.5rem;
  background: var(--surface);
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
  overflow-wrap: anywhere;
}
```

# JavaScript

```javascript
// Reserva de noches, siempre en UTC.
//
// Decisiones de diseño:
// - Un type="date" es una fecha de calendario: su valueAsNumber es la medianoche UTC.
//   Todo se calcula ahí: noches = diferencia / 86 400 000 (exacta, sin cambios de
//   hora), día de la semana con getUTCDay, y se muestra con Intl y timeZone: 'UTC'.
//   Con getDate() o toLocaleDateString() sin zona, en México todo saldría un día antes.
// - Lo que se envía son los strings AAAA-MM-DD de value, no objetos Date.
// - Si la llegada pasa a ser igual o posterior a la salida, la salida se mueve a la
//   noche siguiente (y se anuncia); más de 14 noches es una regla propia.
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.
const form = document.querySelector('#booking');
const checkIn = form.elements.check_in;
const checkOut = form.elements.check_out;
const logList = document.querySelector('#log');
const DAY = 86_400_000;
const RATES = { single: 1200, double: 1600 };
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const longDate = new Intl.DateTimeFormat('es-MX', { dateStyle: 'full', timeZone: 'UTC' });
const nightName = new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' });
let quiet = false;
function logLine(text) {
  if (quiet) return;
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
if (window.origin === 'null') document.querySelector('#card-notice').hidden = false;

const toDateString = (ms) => new Date(ms).toISOString().slice(0, 10); // 'AAAA-MM-DD' en UTC

function stayNights() {
  const start = checkIn.valueAsNumber;
  const end = checkOut.valueAsNumber;
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return [];
  const rate = RATES[form.elements.room.value];
  return Array.from({ length: (end - start) / DAY }, (_, i) => {
    const ms = start + i * DAY;
    const weekend = [5, 6].includes(new Date(ms).getUTCDay()); // viernes o sábado
    return { ms, weekend, price: weekend ? rate * 1.25 : rate };
  });
}

function update(why) {
  // La salida nunca antes de la noche siguiente a la llegada.
  if (!Number.isNaN(checkIn.valueAsNumber)) {
    const earliest = toDateString(checkIn.valueAsNumber + DAY);
    checkOut.min = earliest;
    if (checkOut.value !== '' && checkOut.value < earliest) {
      checkOut.value = earliest; // un cambio por código: no dispara eventos
      document.querySelector('#adjusted').textContent = `Hemos movido la salida al ${longDate.format(checkOut.valueAsDate)}.`;
      logLine(`↪️ salida ajustada a ${checkOut.value}`);
    }
  }
  const nights = stayNights();
  checkOut.setCustomValidity(nights.length > 14 ? 'Como máximo 14 noches por reserva.' : '');
  document.querySelector('#nights').replaceChildren(...nights.map((night) => {
    const item = document.createElement('li');
    item.textContent = `${nightName.format(night.ms)}${night.weekend ? ' (fin de semana)' : ''}: ${money.format(night.price)}`;
    return item;
  }));
  const total = nights.reduce((sum, night) => sum + night.price, 0);
  document.querySelector('#total').textContent = nights.length ? `${nights.length} noche(s): ${money.format(total)}` : 'Elige las fechas.';
  if (why) logLine(`🛏️ ${why} → ${checkIn.value} a ${checkOut.value}: ${nights.length} noche(s), ${money.format(total)}`);
  return { nights, total };
}

form.addEventListener('change', (event) => update(`cambio en ${event.target.name}`));
form.addEventListener('submit', (event) => {
  event.preventDefault(); // la validación nativa ya pasó
  const { nights, total } = update();
  logLine(`📨 reserva → ${JSON.stringify(Object.fromEntries(new FormData(form)))} · ${nights.length} noche(s) · ${money.format(total)}`);
});

// ── Autocomprobación (simulada; deja las fechas iniciales).
function audit() {
  quiet = true;
  const results = [];
  const expect = (label, ok) => results.push(`${ok ? '✓' : '✗'} ${label}`);
  const { nights, total } = update();
  expect('del 20 al 23 de noviembre: 3 noches', nights.length === 3);
  expect('viernes y sábado son fin de semana: $5,600.00 en doble', nights.filter((night) => night.weekend).length === 2 && total === 5600);
  expect('la llegada se muestra con Intl en UTC: viernes 20, no jueves 19', longDate.format(checkIn.valueAsDate) === 'viernes, 20 de noviembre de 2026');
  checkIn.value = '2026-11-24';
  update();
  expect('una llegada posterior mueve la salida a la noche siguiente', checkOut.value === '2026-11-25');
  checkIn.value = '2026-12-01';
  checkOut.value = '2026-12-20';
  update();
  expect('19 noches: error propio (customError)', checkOut.validity.customError);
  form.reset();
  update();
  document.querySelector('#adjusted').textContent = '';
  quiet = false;
  console.log('Autocomprobación (simulada):');
  results.forEach((line) => console.log(`  ${line}`));
}
audit();
logLine('Listo: elige la habitación sencilla; cambia la llegada al 25 de noviembre (con el calendario); luego pulsa «Reservar»');
```
