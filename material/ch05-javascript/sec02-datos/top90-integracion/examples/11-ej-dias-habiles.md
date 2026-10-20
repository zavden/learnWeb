---
example_description: "Ejercicio: calcular fechas de entrega en días hábiles con Date en UTC, un Set de festivos, copias antes de modificar e Intl.DateTimeFormat"
example_tags: "javascript|ejercicio|fechas|set|intl"
exercise: true
exercise_title: "Calcula plazos en días hábiles"
exercise_instructions: "parseDay(iso): convierte 'AAAA-MM-DD' en un Date y lanza RangeError si la fecha no es válida o no existe (el 30 de febrero) || isBusinessDay(date): false los sábados, los domingos y los días que están en el Set HOLIDAYS || addBusinessDays(start, days): devuelve una fecha NUEVA, days días hábiles después de start, sin modificar start || formatDay(date): 'martes, 13 de octubre' con Intl.DateTimeFormat || Trabaja siempre en UTC (getUTCDay, setUTCDate, timeZone: 'UTC'): así el resultado no depende de la zona horaria de quien lo ejecute || Ejecuta hasta que todas las comprobaciones salgan con ✓"
exercise_hints: "new Date('2026-10-09') (solo fecha) es medianoche UTC || Date no valida: el 30 de febrero se convierte en un día de marzo; compara toKey(date) con el texto original || Comprueba Number.isNaN(date.getTime()) ANTES de llamar a toISOString, que lanza RangeError con una fecha inválida || getUTCDay(): 0 es domingo y 6 es sábado || new Date(start) crea una copia; luego avanza de uno en uno con setUTCDate(getUTCDate() + 1) y cuenta solo los días hábiles"
exercise_solution_example: 11-ej-dias-habiles-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
// EJERCICIO: completa las cuatro funciones para que todas las comprobaciones salgan ✓.
// Una tienda online promete «entrega en N días hábiles».
// (function se estudia en «Funciones y ámbito»; aquí basta con la sintaxis básica.)

// Festivos del calendario laboral de la empresa (fechas de calendario, sin hora).
const HOLIDAYS = new Set(['2026-10-12', '2026-11-02', '2026-12-07', '2026-12-08', '2026-12-25']);

// Ya escrita: la fecha de calendario de un Date en UTC, como texto 'AAAA-MM-DD'.
function toKey(date) {
  return date.toISOString().slice(0, 10);
}

function parseDay(iso) {
  const date = new Date(iso);
  // TODO 1: si la fecha es inválida (getTime() es NaN) → throw new RangeError(…)
  // TODO 2: si toKey(date) no coincide con iso (p. ej. '2026-02-30') → throw new RangeError(…)
  return date;
}

function isBusinessDay(date) {
  // TODO 3: false en sábado (6), domingo (0) o festivo (HOLIDAYS.has(toKey(date)))
  return true;
}

function addBusinessDays(start, days) {
  // TODO 4: copia start, avanza día a día y cuenta solo los hábiles hasta llegar a days
  return start;
}

function formatDay(date) {
  // TODO 5: Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
  return toKey(date);
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
