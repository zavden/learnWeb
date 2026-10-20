---
example_description: "Ejercicio: resumir los gastos de un viaje compartido con importes en formato español, totales por categoría en un Map, reparto justo de céntimos e Intl"
example_tags: "javascript|ejercicio|dinero|map|intl|numeros"
exercise: true
exercise_title: "Resume los gastos de un viaje"
exercise_instructions: "parseCents(text): convierte '1.234,56' en 123456 céntimos (quita espacios y puntos de miles, cambia la coma por punto) || Lanza TypeError si el texto está vacío y RangeError si no es un número finito o es negativo || totalsByCategory(expenses): devuelve un Map categoría → céntimos, en el orden en que aparece cada categoría || splitEvenly(totalCents, people): reparte el total en un array de enteros; los céntimos sobrantes van, de uno en uno, a las primeras personas || formatEuros(cents): devuelve el importe con Intl.NumberFormat('es-ES') en euros || Ejecuta hasta que todas las comprobaciones salgan con ✓"
exercise_hints: "Para pasar a céntimos usa Math.round(euros * 100): 19.99 * 100 es 1998.9999999999998 y Math.floor perdería un céntimo || Number('') es 0: comprueba el texto vacío ANTES de convertir || Number.isFinite descarta a la vez NaN e Infinity || En un Map, map.get(clave) ?? 0 da 0 la primera vez que aparece la categoría || Math.floor(total / people) es la parte de cada uno y total % people los céntimos sobrantes || El texto de Intl lleva un espacio de no separación (U+00A0) antes del €: las comprobaciones lo cambian por un espacio normal antes de comparar"
exercise_solution_example: 09-ej-resumen-de-gastos-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
// EJERCICIO: completa las cuatro funciones para que todas las comprobaciones salgan ✓.
// Los importes llegan como en un extracto del banco español: '1.234,56'.
// (function se estudia en «Funciones y ámbito»; aquí basta con la sintaxis básica.)

const expenses = [
  { concept: 'Gasolina (ida)', category: 'transporte', amount: '64,30' },
  { concept: 'Casa rural, 3 noches', category: 'alojamiento', amount: '1.050,00' },
  { concept: 'Compra en el mercado', category: 'comida', amount: '87,45' },
  { concept: 'Sidrería en Gijón', category: 'comida', amount: '96,80' },
  { concept: 'Entradas al museo', category: 'ocio', amount: '19,99' },
  { concept: 'Peajes', category: 'transporte', amount: '12,10' },
  { concept: 'Gasolina (vuelta)', category: 'transporte', amount: ' 58,74 ' },
];

function parseCents(text) {
  // TODO 1: si text.trim() está vacío → throw new TypeError('Falta el importe')
  // TODO 2: quita los puntos de miles y cambia la coma decimal por un punto
  // TODO 3: si no es un número finito o es negativo → throw new RangeError(…)
  // TODO 4: devuelve los céntimos como entero (¡con Math.round!)
  return 0;
}

function totalsByCategory(list) {
  const totals = new Map();
  // TODO 5: recorre la lista y acumula parseCents(expense.amount) en su categoría
  return totals;
}

function splitEvenly(totalCents, people) {
  // TODO 6: devuelve un array de «people» enteros que sume exactamente totalCents
  return [];
}

function formatEuros(cents) {
  // TODO 7: usa Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' })
  return '';
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, actual, expected) {
  if (actual === expected) {
    console.log('✓', description);
  } else {
    console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
  }
}
// Devuelve el nombre del error que lanza parseCents(text), o 'sin error'.
function errorNameOf(text) {
  try {
    parseCents(text);
    return 'sin error';
  } catch (error) {
    return error.name;
  }
}
// Arrays y Map se comparan por su JSON («JSON y copias»); el NBSP de Intl, como espacio.
function plain(text) {
  return text.replaceAll(' ', ' ');
}

check("'12,50' → 1250", parseCents('12,50'), 1250);
check("'19,99' → 1999 (Math.round, no Math.floor)", parseCents('19,99'), 1999);
check("'1.050,00' → 105000", parseCents('1.050,00'), 105000);
check("' 58,74 ' → 5874", parseCents(' 58,74 '), 5874);
check("'' lanza TypeError", errorNameOf(''), 'TypeError');
check("'gratis' lanza RangeError", errorNameOf('gratis'), 'RangeError');
check("'-5,00' lanza RangeError", errorNameOf('-5,00'), 'RangeError');

const totals = totalsByCategory(expenses);
check('totales por categoría', JSON.stringify([...totals]),
  '[["transporte",13514],["alojamiento",105000],["comida",18425],["ocio",1999]]');
check('splitEvenly(10000, 3)', JSON.stringify(splitEvenly(10000, 3)), '[3334,3333,3333]');
check('splitEvenly(138938, 3)', JSON.stringify(splitEvenly(138938, 3)), '[46313,46313,46312]');
check('formatEuros(123456)', plain(formatEuros(123456)), '1234,56 €');
check('formatEuros(46313)', plain(formatEuros(46313)), '463,13 €');

// ── Resumen del viaje (usa tus funciones) ───────────────────────────────
let tripCents = 0;
for (const [category, cents] of totals) {
  console.log(`${category.padEnd(12)}${formatEuros(cents).padStart(12)}`);
  tripCents += cents;
}
console.log('Cada persona paga →', splitEvenly(tripCents, 3).map((cents) => formatEuros(cents)));
```
