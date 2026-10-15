---
example_description: "Calendario de plazos de un estudio de diseño: instantes ISO con desfase, días que faltan contados en la zona de Madrid, agrupación por mes y tiempo relativo con Intl"
example_tags: "javascript|integracion|fechas|intl|zonas-horarias|map"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// CALENDARIO DE PLAZOS de un estudio de diseño con sede en Madrid.
// Integra: Date e Intl con timeZone explícita («Fechas e Intl»), map/toSorted
// («Arrays»), Map.groupBy («Map y Set») y padEnd («Strings»).
// (function se estudia en «Funciones y ámbito»; aquí basta con la sintaxis básica.)
// Todo se calcula y se muestra en Europe/Madrid: la salida es la misma esté donde esté
// quien lo ejecute (el navegador de la persona puede estar en México o en Japón).

const ZONE = 'Europe/Madrid';
// «Ahora» fijo para que la salida no cambie cada día. En una app real: new Date().
const now = new Date('2026-10-12T10:00:00+02:00');

// Instantes ISO con su desfase. Ojo al cambio de hora: el 25 de octubre de 2026 Madrid
// pasa de +02:00 (CEST) a +01:00 (CET), y el desfase de cada fecha debe ser el correcto.
const deadlines = [
  { title: 'Presentación final al cliente', due: '2026-11-03T10:00:00+01:00' },
  { title: 'Modelo 303 (IVA del 3.er trimestre)', due: '2026-10-20T23:59:59+02:00' },
  { title: 'Revisión de bocetos', due: '2026-10-12T17:30:00+02:00' },
  { title: 'Pago del dominio', due: '2026-10-09T12:00:00+02:00' },
  { title: 'Entrega del diseño web', due: '2026-10-13T18:00:00+02:00' },
  { title: 'Factura de noviembre', due: '2026-11-30T23:59:59+01:00' },
];

// Un formateador por uso; todos con locale y timeZone explícitos.
const dayFormat = new Intl.DateTimeFormat('es-ES', { weekday: 'short', day: 'numeric', month: 'short', timeZone: ZONE });
const timeFormat = new Intl.DateTimeFormat('es-ES', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short', timeZone: ZONE });
const monthFormat = new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric', timeZone: ZONE });
const relative = new Intl.RelativeTimeFormat('es-ES', { numeric: 'auto' });

// Días de CALENDARIO entre dos instantes, vistos en Madrid. formatToParts devuelve las
// piezas sueltas ([{ type: 'day', value: '20' }, …]); con año, mes y día construimos
// una medianoche UTC, y la resta de dos medianoches UTC siempre es un número exacto de días.
const partsFormat = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'numeric', day: 'numeric', timeZone: ZONE });
function calendarDayNumber(date) {
  const parts = {};
  for (const part of partsFormat.formatToParts(date)) parts[part.type] = Number(part.value);
  return Date.UTC(parts.year, parts.month - 1, parts.day) / (24 * 60 * 60 * 1000); // mes − 1
}

const today = calendarDayNumber(now);
const sorted = deadlines
  .map((deadline) => ({ ...deadline, dueDate: new Date(deadline.due) })) // ({ … }): devuelve un objeto
  .toSorted((a, b) => a.dueDate - b.dueDate); // restar fechas da milisegundos

// Agrupar por mes (la clave es el texto «octubre de 2026»; Map conserva el orden).
const byMonth = Map.groupBy(sorted, (deadline) => monthFormat.format(deadline.dueDate));
for (const [month, group] of byMonth) {
  console.group(month);
  for (const { title, dueDate } of group) {
    const days = calendarDayNumber(dueDate) - today;
    const mark = dueDate < now ? '⛔' : days <= 2 ? '⚠' : '·';
    console.log(`${mark} ${dayFormat.format(dueDate).padEnd(12)} ${timeFormat.format(dueDate).padEnd(10)} ${title} (${relative.format(days, 'day')})`);
  }
  console.groupEnd();
}

// La misma presentación vista desde las otras oficinas del cliente:
const presentation = sorted.find((deadline) => deadline.title.startsWith('Presentación')).dueDate;
for (const zone of ['Europe/Madrid', 'America/Mexico_City', 'America/Bogota']) {
  const local = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium', timeStyle: 'short', timeZone: zone });
  console.log(`${zone.padEnd(20)} → ${local.format(presentation)}`);
}
```
