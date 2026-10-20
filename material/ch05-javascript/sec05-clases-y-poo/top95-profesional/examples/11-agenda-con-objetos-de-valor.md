---
example_description: "La agenda de un equipo repartido entre Ciudad de México, Bogotá y Madrid: objetos de valor (Duration, TimeRange) creados desde instantes ISO, horarios laborales por zona con Intl, conflictos como errores propios y huecos libres que cambian cuando Madrid deja el horario de verano"
example_tags: "javascript|profesional|clases|inmutabilidad|intl|zonas-horarias|errores"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// LA AGENDA DE UN EQUIPO EN TRES PAÍSES: ¿cuándo podemos reunirnos?
// - Duration y TimeRange son objetos de valor inmutables. Un TimeRange solo se
//   crea desde instantes ISO con Z o con desfase (+02:00): nunca desde una hora
//   «local» ambigua.
// - Cada persona tiene su zona horaria; Intl.DateTimeFormat con timeZone calcula
//   su hora local. Nada depende de la zona del navegador.
// - Calendar compone reuniones; un solape lanza un ConflictError que dice con qué.
// - Madrid cambia de hora el 25 de octubre de 2026; México y Colombia no tienen
//   horario de verano. El mismo cálculo da huecos distintos antes y después.
const MINUTE_MS = 60 * 1000;

class Duration {
  #minutes;
  constructor(minutes) {
    if (!Number.isInteger(minutes) || minutes <= 0) throw new RangeError(`Duración no válida: ${minutes} min`);
    this.#minutes = minutes;
    Object.freeze(this);
  }
  static minutes(count) { return new Duration(count); }
  static hours(count) { return new Duration(count * 60); }
  get minutes() { return this.#minutes; }
  get ms() { return this.#minutes * MINUTE_MS; }
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') return this.#minutes; // permite comparar: a > b
    const hours = Math.floor(this.#minutes / 60);
    const rest = this.#minutes % 60;
    return [hours && `${hours} h`, rest && `${rest} min`].filter(Boolean).join(' ');
  }
}

const hasZone = (iso) => iso.endsWith('Z') || iso.at(-6) === '+' || iso.at(-6) === '-';

class TimeRange {
  #start;
  #end;
  constructor(start, end) {
    if (!(Number.isFinite(start) && Number.isFinite(end) && start < end)) throw new RangeError('Un intervalo debe empezar antes de acabar');
    this.#start = start;
    this.#end = end;
    Object.freeze(this);
  }
  static starting(isoInstant, duration) {
    if (!hasZone(isoInstant)) throw new RangeError(`«${isoInstant}» no dice su zona: añade Z o un desfase`);
    const start = Date.parse(isoInstant);
    return new TimeRange(start, start + duration.ms);
  }
  get start() { return this.#start; }
  get end() { return this.#end; }
  overlaps(other) { return this.#start < other.end && other.start < this.#end; }
  shift(duration) { return new TimeRange(this.#start + duration.ms, this.#end + duration.ms); }
  format(timeZone, locale = 'es-MX', options = {}) {
    return new Intl.DateTimeFormat(locale, { hour: 'numeric', minute: '2-digit', timeZone, ...options }).formatRange(this.#start, this.#end);
  }
}

class Attendee {
  #localClock;
  constructor({ name, city, timeZone, locale = 'es-MX', workStart = 9, workEnd = 18 }) {
    // Una zona mal escrita lanza RangeError aquí, al crear el formateador.
    this.#localClock = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hourCycle: 'h23', timeZone });
    Object.assign(this, { name, city, timeZone, locale, workStart, workEnd });
    Object.freeze(this);
  }
  #localMinutes(instant) {
    const parts = Object.fromEntries(this.#localClock.formatToParts(instant).map(({ type, value }) => [type, value]));
    return Number(parts.hour) * 60 + Number(parts.minute);
  }
  isWorking(range) {
    const start = this.#localMinutes(range.start);
    const end = this.#localMinutes(range.end) || 24 * 60; // las 00:00 del final cuentan como 24:00
    return start >= this.workStart * 60 && end <= this.workEnd * 60 && end > start;
  }
}

class ConflictError extends Error {
  constructor(meeting, existing, attendee) {
    super(`«${meeting.title}» choca con «${existing.title}» en la agenda de ${attendee.name}`);
    this.name = 'ConflictError';
    Object.assign(this, { meeting, existing, attendee });
  }
}

class Meeting {
  constructor({ title, range, attendees }) {
    Object.assign(this, { title, range, attendees: Object.freeze([...attendees]) });
    Object.freeze(this);
  }
}

class Calendar {
  #meetings = [];
  add(meeting) {
    for (const existing of this.#meetings) {
      const shared = meeting.attendees.find((person) => existing.attendees.includes(person));
      if (shared && existing.range.overlaps(meeting.range)) throw new ConflictError(meeting, existing, shared);
    }
    this.#meetings.push(meeting);
    this.#meetings.sort((a, b) => a.range.start - b.range.start);
    return this;
  }
  #isFree(person, range) {
    return this.#meetings.every((meeting) => !meeting.attendees.includes(person) || !meeting.range.overlaps(range));
  }
  // Huecos donde TODOS trabajan y están libres, cada step minutos dentro de un día (UTC).
  freeSlots({ attendees, duration, day, step = Duration.minutes(30) }) {
    const slots = [];
    let candidate = TimeRange.starting(`${day}T00:00:00Z`, duration);
    const dayEnd = Date.parse(`${day}T23:59:59Z`);
    while (candidate.start < dayEnd) {
      if (attendees.every((person) => person.isWorking(candidate) && this.#isFree(person, candidate))) slots.push(candidate);
      candidate = candidate.shift(step);
    }
    return slots;
  }
  [Symbol.iterator]() {
    const meetings = [...this.#meetings];
    let index = 0;
    return { next: () => (index < meetings.length ? { value: meetings[index++], done: false } : { value: undefined, done: true }) };
  }
}

// ── El equipo y su semana ─────────────────────────────────────────────
const mariana = new Attendee({ name: 'Mariana', city: 'Ciudad de México', timeZone: 'America/Mexico_City', workStart: 8, workEnd: 17 });
const valentina = new Attendee({ name: 'Valentina', city: 'Bogotá', timeZone: 'America/Bogota', locale: 'es-CO' });
const iker = new Attendee({ name: 'Iker', city: 'Madrid', timeZone: 'Europe/Madrid', locale: 'es-ES' });
const team = [mariana, valentina, iker];

const calendar = new Calendar()
  .add(new Meeting({ title: 'Revisión de diseño', range: TimeRange.starting('2026-10-20T10:00:00-05:00', Duration.minutes(30)), attendees: [valentina, iker] }))
  .add(new Meeting({ title: 'Dentista', range: TimeRange.starting('2026-11-03T09:00:00-06:00', Duration.hours(1)), attendees: [mariana] }));

const showSlot = (range) => team.map((person) => `${person.city}: ${range.format(person.timeZone, person.locale)}`).join(' · ');
const length = Duration.minutes(45);
for (const day of ['2026-10-20', '2026-11-03']) {
  console.group(`Huecos de ${length} el ${day}`);
  const slots = calendar.freeSlots({ attendees: team, duration: length, day });
  if (slots.length === 0) console.log('ninguno');
  for (const slot of slots) console.log(showSlot(slot));
  console.groupEnd();
}

console.group('Agenda');
for (const meeting of calendar) {
  console.log(`${meeting.title} → ${meeting.range.format('America/Mexico_City', 'es-MX', { weekday: 'short', day: 'numeric', month: 'short', timeZoneName: 'short' })}`);
}
console.groupEnd();

const attempts = [
  () => calendar.add(new Meeting({ title: 'Kickoff', range: TimeRange.starting('2026-10-20T17:15:00+02:00', Duration.hours(1)), attendees: [iker, mariana] })),
  () => TimeRange.starting('2026-10-20T10:00', Duration.hours(1)),
  () => new Attendee({ name: 'Ana', city: 'Madrid', timeZone: 'Europe/Madird' }),
  () => Duration.minutes(0),
];
for (const attempt of attempts) {
  try {
    attempt();
  } catch (error) {
    console.warn(`⛔ ${error.name}: ${error.message}`);
  }
}
console.log('¿una hora dura más que 45 min? →', Duration.hours(1) > length, `| ${Duration.minutes(90)}`);
```
