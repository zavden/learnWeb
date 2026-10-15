---
example_description: "Solución: días hábiles con fechas de calendario en UTC, validación de fechas inexistentes, un Set de festivos y copias de Date antes de modificar"
example_tags: "javascript|solucion|fechas|set|intl"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// SOLUCIÓN: plazos en días hábiles.
// (function se estudia en «Funciones y ámbito»; aquí basta con la sintaxis básica.)

// Festivos del calendario laboral de la empresa (fechas de calendario, sin hora).
const HOLIDAYS = new Set(['2026-10-12', '2026-11-02', '2026-12-07', '2026-12-08', '2026-12-25']);

// Ya escrita: la fecha de calendario de un Date en UTC, como texto 'AAAA-MM-DD'.
function toKey(date) {
  return date.toISOString().slice(0, 10);
}

function parseDay(iso) {
  const date = new Date(iso); // solo fecha ISO → medianoche UTC
  // 1. Inválida: getTime() es NaN. Se comprueba primero porque toISOString lanzaría.
  // 2. Inexistente: Date no valida y el 30 de febrero «se desborda» a marzo; al volver a
  //    texto ya no coincide. Lo mismo descarta formatos ambiguos como '09/10/2026'.
  if (Number.isNaN(date.getTime()) || toKey(date) !== iso) {
    throw new RangeError(`Fecha no válida: «${iso}» (usa AAAA-MM-DD)`);
  }
  return date;
}

function isBusinessDay(date) {
  const weekday = date.getUTCDay(); // 0 = domingo … 6 = sábado
  return weekday !== 0 && weekday !== 6 && !HOLIDAYS.has(toKey(date));
}

function addBusinessDays(start, days) {
  const date = new Date(start); // COPIA: setUTCDate modifica el objeto
  let counted = 0;
  while (counted < days) {
    date.setUTCDate(date.getUTCDate() + 1); // el desbordamiento cambia de mes y de año
    if (isBusinessDay(date)) {
      counted++;
    }
  }
  return date;
}

// timeZone: 'UTC' porque las fechas son medianoches UTC: en México (UTC−6) se verían
// como el día anterior, y en Madrid como el mismo día a la 1:00 o las 2:00.
const dayFormat = new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
function formatDay(date) {
  return dayFormat.format(date);
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, actual, expected) {
  if (actual === expected) {
    console.log('✓', description);
  } else {
    console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
  }
}
// Devuelve el nombre del error que lanza parseDay(text), o 'sin error'.
function errorNameOf(text) {
  try {
    parseDay(text);
    return 'sin error';
  } catch (error) {
    return error.name;
  }
}

check("parseDay('2026-10-09') es medianoche UTC", parseDay('2026-10-09').toISOString(), '2026-10-09T00:00:00.000Z');
check("'2026-02-30' lanza RangeError", errorNameOf('2026-02-30'), 'RangeError');
check("'09/10/2026' lanza RangeError", errorNameOf('09/10/2026'), 'RangeError');
check("'' lanza RangeError", errorNameOf(''), 'RangeError');
check('sábado 10 no es hábil', isBusinessDay(parseDay('2026-10-10')), false);
check('domingo 11 no es hábil', isBusinessDay(parseDay('2026-10-11')), false);
check('lunes 12 (festivo) no es hábil', isBusinessDay(parseDay('2026-10-12')), false);
check('martes 13 es hábil', isBusinessDay(parseDay('2026-10-13')), true);
check('viernes 9 + 1 hábil → martes 13', toKey(addBusinessDays(parseDay('2026-10-09'), 1)), '2026-10-13');
check('viernes 4 dic + 3 hábiles → 11 dic', toKey(addBusinessDays(parseDay('2026-12-04'), 3)), '2026-12-11');
check('23 dic + 2 hábiles → 28 dic', toKey(addBusinessDays(parseDay('2026-12-23'), 2)), '2026-12-28');
const start = parseDay('2026-10-09');
addBusinessDays(start, 5);
check('addBusinessDays no modifica la fecha de partida', toKey(start), '2026-10-09');
check('formatDay', formatDay(parseDay('2026-10-13')), 'martes, 13 de octubre');

// ── Promesa de entrega para varios pedidos (usa tus funciones) ──────────
for (const ordered of ['2026-10-08', '2026-10-30', '2026-12-22']) {
  console.log(`pedido el ${formatDay(parseDay(ordered))} → llega el ${formatDay(addBusinessDays(parseDay(ordered), 3))}`);
}
```
