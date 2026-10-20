---
example_description: "Resumen de horas de una programadora autónoma: duraciones a partir de instantes (medianoche y cambio de hora incluidos), solapes, semana ISO, horas extra y facturación por proyecto"
example_tags: "javascript|profesional|fechas|duraciones|map|intl"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// RESUMEN SEMANAL DE HORAS de una programadora autónoma (Madrid) con tres clientes.
//
// Decisiones:
// - Cada entrada guarda INSTANTES ISO con su desfase. La duración es end − start en
//   milisegundos: así es correcta aunque cruce la medianoche o el cambio de hora (la
//   noche del 25 de octubre de 2026 el reloj pasa de 03:00 a 02:00 en Madrid).
// - Las duraciones se guardan en MINUTOS enteros; las horas con decimales solo al mostrar.
// - Una entrada cuenta en el día (de Madrid) en que EMPIEZA.
// - Se factura por proyecto: minutos × tarifa / 60, redondeado al céntimo una sola vez.
// - Semana ISO 8601 (lunes a domingo; la semana 1 es la que contiene el primer jueves).
//
// Alcance: function y las flechas, en «Funciones y ámbito».

const ZONE = 'Europe/Madrid';
const WEEKLY_HOURS = 40;

const PROJECTS = new Map([
  ['tienda', { client: 'Té y Café en Casa', name: 'Tienda online', rateCents: 4500 }],
  ['clinica', { client: 'Clínica Dental Sonrisas', name: 'API de citas', rateCents: 5200 }],
  ['bodega', { client: 'Bodega Las Vides', name: 'Web corporativa', rateCents: 4000 }],
]);

const ENTRIES = [
  { project: 'tienda', task: 'Maquetación de la ficha de producto', start: '2026-10-19T09:00:00+02:00', end: '2026-10-19T13:30:00+02:00' },
  { project: 'tienda', task: 'Carrito: cupones', start: '2026-10-19T14:30:00+02:00', end: '2026-10-19T18:15:00+02:00' },
  { project: 'clinica', task: 'Endpoint de disponibilidad', start: '2026-10-20T08:45:00+02:00', end: '2026-10-20T12:45:00+02:00' },
  { project: 'clinica', task: 'Pruebas de la API', start: '2026-10-20T13:30:00+02:00', end: '2026-10-20T17:30:00+02:00' },
  { project: 'bodega', task: 'Reunión de arranque', start: '2026-10-20T17:45:00+02:00', end: '2026-10-20T19:00:00+02:00' },
  { project: 'tienda', task: 'Pasarela de pago', start: '2026-10-21T09:15:00+02:00', end: '2026-10-21T14:00:00+02:00' },
  { project: 'bodega', task: 'Arquitectura de la información', start: '2026-10-21T15:00:00+02:00', end: '2026-10-21T18:00:00+02:00' },
  { project: 'clinica', task: 'Despliegue nocturno', start: '2026-10-21T22:30:00+02:00', end: '2026-10-22T01:15:00+02:00' },
  { project: 'bodega', task: 'Diseño de la portada', start: '2026-10-22T10:00:00+02:00', end: '2026-10-22T14:00:00+02:00' },
  { project: 'bodega', task: 'Revisión de textos', start: '2026-10-22T18:00:00+02:00', end: '2026-10-22T17:00:00+02:00' },
  { project: 'tienda', task: 'Correcciones del carrito', start: '2026-10-22T15:00:00+02:00', end: '2026-10-22T19:30:00+02:00' },
  { project: 'clinica', task: 'Recordatorios por SMS', start: '2026-10-23T09:00:00+02:00', end: '2026-10-23T13:00:00+02:00' },
  { project: 'tienda', task: 'Accesibilidad del checkout', start: '2026-10-23T13:45:00+02:00', end: '2026-10-23T16:45:00+02:00' },
  { project: 'bodega', task: 'Llamada con la bodega', start: '2026-10-23T16:30:00+02:00', end: '2026-10-23T17:30:00+02:00' },
  { project: 'clinica', task: 'Urgencia: servidor caído', start: '2026-10-25T01:30:00+02:00', end: '2026-10-25T03:30:00+01:00' },
  { project: 'tienda', task: 'Reunión semanal', start: '2026-10-26T09:00:00+01:00', end: '2026-10-26T10:30:00+01:00' },
];

// ── Fechas en la zona de trabajo ────────────────────────────────────────

const DAY_MS = 24 * 60 * 60 * 1000;
const partsFormat = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: ZONE });

// Número de día de calendario (en Madrid) de un instante.
function calendarDay(date) {
  const parts = {};
  for (const part of partsFormat.formatToParts(date)) parts[part.type] = Number(part.value);
  return Date.UTC(parts.year, parts.month - 1, parts.day) / DAY_MS;
}

// Semana ISO de un día de calendario: la del jueves de esa semana.
function isoWeek(day) {
  const weekday = (new Date(day * DAY_MS).getUTCDay() + 6) % 7; // lunes = 0 … domingo = 6
  const thursday = day - weekday + 3;
  const year = new Date(thursday * DAY_MS).getUTCFullYear();
  const firstDay = Date.UTC(year, 0, 1) / DAY_MS;
  return `${year}-S${String(Math.floor((thursday - firstDay) / 7) + 1).padStart(2, '0')}`;
}

// ── Validación ──────────────────────────────────────────────────────────

const entries = [];
for (const raw of ENTRIES) {
  const start = new Date(raw.start);
  const end = new Date(raw.end);
  const label = `${raw.task} (${raw.start.slice(0, 16).replace('T', ' ')})`;
  if (!PROJECTS.has(raw.project)) {
    console.warn(`Descartada: proyecto desconocido «${raw.project}» en ${label}`);
  } else if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    console.warn(`Descartada: fecha no válida en ${label}`);
  } else if (end <= start) {
    console.warn(`Descartada: termina antes de empezar en ${label}`);
  } else {
    const minutes = Math.round((end - start) / 60000); // restar fechas da milisegundos
    const day = calendarDay(start);
    entries.push({ ...raw, start, end, minutes, day, week: isoWeek(day) });
  }
}

// Solapes: con las entradas ordenadas, cada una debe empezar después de que acabe la anterior.
const chronological = entries.toSorted((a, b) => a.start - b.start);
for (let i = 1; i < chronological.length; i++) {
  const previous = chronological[i - 1];
  const current = chronological[i];
  if (current.start < previous.end) {
    console.warn(`Solape de ${Math.round((previous.end - current.start) / 60000)} min: «${previous.task}» y «${current.task}»`);
  }
}

// ── Formatos ────────────────────────────────────────────────────────────

const money = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', useGrouping: 'always' });
const dayLabel = new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
const clock = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', timeZone: ZONE });
const list = new Intl.ListFormat('es', { type: 'conjunction' });

// 465 → '7 h 45 min'. Con enteros no hay decimales raros (7,75 h).
function formatMinutes(total) {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  if (hours === 0) return `${minutes} min`;
  return minutes === 0 ? `${hours} h` : `${hours} h ${String(minutes).padStart(2, '0')} min`;
}
function sumMinutes(list) {
  return list.reduce((sum, entry) => sum + entry.minutes, 0);
}

// ── Informe ─────────────────────────────────────────────────────────────

const weeks = Map.groupBy(chronological, (entry) => entry.week);
for (const [week, weekEntries] of weeks) {
  const weekMinutes = sumMinutes(weekEntries);
  console.group(`Semana ${week}: ${formatMinutes(weekMinutes)}`);

  // Por día: la fecha de calendario (medianoche UTC) se formatea en UTC.
  const rows = [];
  for (const [day, dayEntries] of Map.groupBy(weekEntries, (entry) => entry.day)) {
    const projects = new Set(dayEntries.map((entry) => PROJECTS.get(entry.project).name));
    rows.push({ día: dayLabel.format(new Date(day * DAY_MS)), horas: formatMinutes(sumMinutes(dayEntries)), proyectos: list.format([...projects]) });
  }
  console.table(rows);

  // Por proyecto, con la facturación redondeada UNA vez por proyecto.
  let weekCents = 0;
  for (const [projectId, projectEntries] of Map.groupBy(weekEntries, (entry) => entry.project)) {
    const project = PROJECTS.get(projectId);
    const minutes = sumMinutes(projectEntries);
    const cents = Math.round(minutes * project.rateCents / 60);
    weekCents += cents;
    console.log(`${project.client.padEnd(26)}${formatMinutes(minutes).padStart(12)} × ${money.format(project.rateCents / 100)}/h = ${money.format(cents / 100)}`);
  }
  console.log(`A facturar: ${money.format(weekCents / 100)}`);

  const overtime = weekMinutes - WEEKLY_HOURS * 60;
  if (overtime > 0) console.warn(`Horas extra: ${formatMinutes(overtime)} por encima de ${WEEKLY_HOURS} h`);
  console.groupEnd();
}

// El cambio de hora, visto en la entrada de la madrugada del domingo 25.
const dstEntry = entries.find((entry) => entry.task.startsWith('Urgencia'));
console.log(`🕐 ${dstEntry.task}: ${clock.format(dstEntry.start)} → ${clock.format(dstEntry.end)} en el reloj,` +
  ` pero ${formatMinutes(dstEntry.minutes)} reales (esa noche se atrasa la hora).`);
const midnightEntry = entries.find((entry) => entry.task === 'Despliegue nocturno');
console.log(`🌙 ${midnightEntry.task}: ${formatMinutes(midnightEntry.minutes)}, contadas el día en que empezó.`);

// Intl.DurationFormat es muy reciente (Chrome 129, 2024): compruébalo antes de usarlo.
if (typeof Intl.DurationFormat === 'function') {
  console.log('Con Intl.DurationFormat →', new Intl.DurationFormat('es', { style: 'long' }).format({ hours: 7, minutes: 45 }));
}
```
