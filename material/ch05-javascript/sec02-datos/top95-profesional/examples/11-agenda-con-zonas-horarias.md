---
example_description: "Agenda de un equipo repartido en cinco zonas horarias: instantes en UTC, vista en la zona elegida, hora local de cada persona, avisos fuera de horario y el cambio de hora entre Europa y EE. UU."
example_tags: "javascript|profesional|fechas|intl|zonas-horarias|interfaz"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<main class="app">
  <header>
    <h1>Agenda del equipo</h1>
    <p class="intro">Las reuniones se guardan como instantes en UTC. Elige desde qué ciudad quieres verlas.</p>
  </header>

  <div class="card controls">
    <label for="zone">Ver la agenda en</label>
    <select id="zone">
      <option value="Europe/Madrid">Madrid</option>
      <option value="America/Mexico_City">Ciudad de México</option>
      <option value="America/Bogota">Bogotá</option>
      <option value="America/New_York">Nueva York</option>
      <option value="Asia/Tokyo">Tokio</option>
    </select>
    <p id="now" class="now">—</p>
  </div>

  <section aria-labelledby="agenda-title">
    <h2 id="agenda-title" class="visually-hidden">Reuniones</h2>
    <div id="agenda" class="agenda"></div>
  </section>

  <section class="card" aria-labelledby="dst-title">
    <h2 id="dst-title">Madrid y Nueva York no cambian la hora el mismo día</h2>
    <p class="intro">Europa pasa al horario de invierno el 25 de octubre de 2026; Estados Unidos, el 1 de noviembre. Esa semana la diferencia es de 5 horas, no de 6.</p>
    <ul id="offsets" class="offsets"></ul>
  </section>
</main>
```

# CSS

```css
:root {
  --text: #1b1f24;
  --muted: #545b66;
  --page: #f4f6f8;
  --surface: #ffffff;
  --border: #c4c9d0;
  --field-border: #8a929c;
  --accent: #0b5cad;
  --accent-bg: #e7f0fa;
  --warn: #7a4b00;
  --warn-bg: #fff4d6;
  --past: #545b66;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  line-height: 1.5;
  color: var(--text);
  background: var(--page);
}

.app {
  max-width: 52rem;
  margin: 0 auto;
  padding: 1.5rem 1rem 2.5rem;
  display: grid;
  gap: 1.25rem;
}

h1 {
  margin: 0;
  font-size: clamp(1.5rem, 1.2rem + 1.5vw, 2rem);
}

h2 {
  margin: 0 0 0.5rem;
  font-size: 1.1rem;
}

.intro,
.now {
  margin: 0;
  color: var(--muted);
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.25rem;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem 1rem;
}

label {
  font-weight: 600;
}

select {
  font: inherit;
  padding: 0.45rem 0.6rem;
  border: 1px solid var(--field-border);
  border-radius: 0.5rem;
  background: var(--surface);
  color: var(--text);
}

:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

.agenda {
  display: grid;
  gap: 1rem;
}

.day h3 {
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.relative {
  font-weight: 400;
  color: var(--muted);
}

.meeting {
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 4px solid var(--accent);
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
}

.meeting[data-past='true'] {
  border-left-color: var(--border);
  color: var(--past);
}

.meeting-head {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  align-items: baseline;
}

.title {
  margin: 0;
  font-size: 1rem;
}

.time {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.people {
  margin: 0.5rem 0 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.people li {
  padding: 0.15rem 0.6rem;
  border-radius: 999px;
  background: var(--accent-bg);
  font-size: 0.9rem;
  font-variant-numeric: tabular-nums;
}

.people li[data-off-hours='true'] {
  background: var(--warn-bg);
  color: var(--warn);
  font-weight: 600;
}

.offsets {
  margin: 0.75rem 0 0;
  padding-left: 1.25rem;
  font-variant-numeric: tabular-nums;
}
```

# JavaScript

```javascript
// AGENDA DE UN EQUIPO DISTRIBUIDO.
//
// Reglas que evitan casi todos los errores con fechas:
// 1. Un instante se GUARDA como ISO en UTC ('…Z'). Nunca como «16:00» sin zona.
// 2. Se MUESTRA con Intl.DateTimeFormat y una timeZone explícita: la elegida en el
//    selector, o la de cada persona. Nunca la del navegador por casualidad.
// 3. Los cálculos de calendario («¿es mañana?», «¿es fin de semana?») se hacen con las
//    piezas de la fecha EN ESA ZONA (formatToParts), no con getDate() / getHours(),
//    que usan la zona del ordenador que ejecuta el código.
//
// Alcance: function y las flechas, en «Funciones y ámbito»; querySelector, textContent,
// createElement, append y addEventListener, en el capítulo 6 (el DOM y los eventos).

// «Ahora» fijo para que el ejemplo se vea igual cualquier día. En una app: new Date().
const NOW = new Date('2026-10-21T08:00:00Z');
const WORK_START = 8; // horario laboral de cada persona, en SU hora local
const WORK_END = 19;

const TEAM = new Map([
  ['ana', { name: 'Ana', city: 'Madrid', zone: 'Europe/Madrid' }],
  ['diego', { name: 'Diego', city: 'Ciudad de México', zone: 'America/Mexico_City' }],
  ['camila', { name: 'Camila', city: 'Bogotá', zone: 'America/Bogota' }],
  ['rachel', { name: 'Rachel', city: 'Nueva York', zone: 'America/New_York' }],
  ['kenji', { name: 'Kenji', city: 'Tokio', zone: 'Asia/Tokyo' }],
]);

const MEETINGS = [
  { title: 'Demo para el cliente', start: '2026-10-27T15:00:00Z', minutes: 45, people: ['ana', 'diego', 'camila', 'rachel'] },
  { title: 'Planificación del sprint', start: '2026-10-20T14:00:00Z', minutes: 60, people: ['ana', 'diego', 'camila', 'rachel'] },
  { title: 'Revisión de diseño', start: '2026-10-22T07:00:00Z', minutes: 30, people: ['ana', 'kenji'] },
  { title: 'Retrospectiva', start: '2026-10-29T16:00:00Z', minutes: 60, people: ['ana', 'diego', 'camila', 'rachel', 'kenji'] },
  { title: 'Guardia de soporte', start: '2026-11-02T23:30:00Z', minutes: 90, people: ['diego', 'kenji'] },
];

// ── Lógica de fechas (no toca el DOM) ───────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;

// Piezas de un instante en una zona: { year, month, day, hour, minute, offset }.
// Un formateador por zona, creado la primera vez y guardado en un Map.
const partsFormatters = new Map();
function partsIn(date, zone) {
  if (!partsFormatters.has(zone)) {
    partsFormatters.set(zone, new Intl.DateTimeFormat('en-US', {
      year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric',
      hourCycle: 'h23', // horas de 0 a 23 (sin a. m. / p. m.)
      timeZoneName: 'longOffset', // el desfase como texto: 'GMT+02:00'
      timeZone: zone,
    }));
  }
  const parts = {};
  for (const part of partsFormatters.get(zone).formatToParts(date)) {
    parts[part.type] = part.type === 'timeZoneName' ? part.value : Number(part.value);
  }
  return parts;
}

// Número de día de calendario en esa zona (para «hoy», «mañana» y el día de la semana).
function calendarDay(date, zone) {
  const { year, month, day } = partsIn(date, zone);
  return Date.UTC(year, month - 1, day) / DAY_MS;
}

// 'GMT+02:00' → 120; 'GMT-04:00' → -240; 'GMT' → 0.
function offsetMinutes(date, zone) {
  const text = partsIn(date, zone).timeZoneName.slice(3); // quita 'GMT'
  if (text === '') return 0;
  const sign = text[0] === '-' ? -1 : 1;
  const [hours, minutes] = text.slice(1).split(':').map(Number);
  return sign * (hours * 60 + (minutes ?? 0));
}

// ¿Cae la reunión fuera del horario laboral de esa persona (o en su fin de semana)?
function isOffHours(start, end, zone) {
  const weekday = new Date(calendarDay(start, zone) * DAY_MS).getUTCDay(); // 0 domingo … 6 sábado
  const startParts = partsIn(start, zone);
  const endParts = partsIn(end, zone);
  const startHour = startParts.hour + startParts.minute / 60;
  const endHour = endParts.hour + endParts.minute / 60;
  const crossesMidnight = calendarDay(end, zone) !== calendarDay(start, zone);
  return weekday === 0 || weekday === 6 || crossesMidnight || startHour < WORK_START || endHour > WORK_END;
}

// Una reunión con start y end como Date (copia con spread: MEETINGS no cambia).
function toMeeting(raw) {
  const start = new Date(raw.start);
  return { ...raw, start, end: new Date(start.getTime() + raw.minutes * 60 * 1000) };
}
// Ordenadas por inicio: restar dos Date da milisegundos.
const meetings = MEETINGS.map((raw) => toMeeting(raw)).toSorted((a, b) => a.start - b.start);

// ── Formatos ────────────────────────────────────────────────────────────

const relative = new Intl.RelativeTimeFormat('es-ES', { numeric: 'auto' });
const list = new Intl.ListFormat('es-ES', { type: 'conjunction' });
function dayFormat(zone) {
  return new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: zone });
}
function timeFormat(zone) {
  return new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: zone });
}
function zoneName(zone, date) {
  // timeZoneName 'short' da «CEST», «GMT-6»…: útil para que nadie dude de qué hora es.
  const parts = new Intl.DateTimeFormat('es-ES', { timeZoneName: 'short', timeZone: zone }).formatToParts(date);
  return parts.find((part) => part.type === 'timeZoneName').value;
}

// ── Interfaz ────────────────────────────────────────────────────────────

const zoneSelect = document.querySelector('#zone');
const agenda = document.querySelector('#agenda');
const nowText = document.querySelector('#now');
const offsetsList = document.querySelector('#offsets');

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function renderMeeting(meeting, zone) {
  const card = element('article', 'meeting');
  card.setAttribute('data-past', String(meeting.end < NOW));
  const head = element('div', 'meeting-head');
  const time = timeFormat(zone);
  head.append(
    element('span', 'time', `${time.format(meeting.start)}–${time.format(meeting.end)} ${zoneName(zone, meeting.start)}`),
    element('h4', 'title', meeting.title),
  );
  const people = element('ul', 'people');
  const offHours = [];
  for (const id of meeting.people) {
    const person = TEAM.get(id);
    const off = isOffHours(meeting.start, meeting.end, person.zone);
    if (off) offHours.push(person.name);
    const item = element('li', '', `${person.name} (${person.city}) ${timeFormat(person.zone).format(meeting.start)}`);
    item.setAttribute('data-off-hours', String(off));
    people.append(item);
  }
  card.append(head, people);
  if (offHours.length > 0) {
    card.append(element('p', 'relative', `⚠ Fuera de horario para ${list.format(offHours)}.`));
  }
  return card;
}

function renderAgenda() {
  const zone = zoneSelect.value;
  nowText.textContent = `Ahora: ${dayFormat(zone).format(NOW)}, ${timeFormat(zone).format(NOW)} ${zoneName(zone, NOW)}`;
  agenda.textContent = '';
  const today = calendarDay(NOW, zone);
  // Agrupar por día EN LA ZONA ELEGIDA: la misma reunión puede caer en días distintos.
  const byDay = Map.groupBy(meetings, (meeting) => calendarDay(meeting.start, zone));
  for (const [day, group] of byDay) {
    const section = element('section', 'day');
    const heading = element('h3', '', dayFormat(zone).format(group[0].start));
    heading.append(element('span', 'relative', ` · ${relative.format(day - today, 'day')}`));
    section.append(heading);
    for (const meeting of group) {
      section.append(renderMeeting(meeting, zone));
    }
    agenda.append(section);
  }
}

function renderOffsets() {
  for (const meeting of meetings) {
    const hours = (offsetMinutes(meeting.start, 'Europe/Madrid') - offsetMinutes(meeting.start, 'America/New_York')) / 60;
    offsetsList.append(element('li', '', `${dayFormat('Europe/Madrid').format(meeting.start)}: Madrid va ${hours} h por delante de Nueva York`));
  }
}

zoneSelect.addEventListener('change', renderAgenda);
renderAgenda();
renderOffsets();

for (const meeting of meetings) {
  console.log(meeting.start.toISOString(), meeting.title, '→ Madrid', timeFormat('Europe/Madrid').format(meeting.start),
    '| México', timeFormat('America/Mexico_City').format(meeting.start), '| Nueva York', timeFormat('America/New_York').format(meeting.start));
}
```
