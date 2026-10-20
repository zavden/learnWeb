---
example_description: "Solución: gastos de un viaje con céntimos enteros, Map de totales, reparto de los céntimos sobrantes e Intl.NumberFormat"
example_tags: "javascript|solucion|dinero|map|intl|numeros"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// SOLUCIÓN: resumen de los gastos de un viaje compartido.
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
  const clean = text.trim();
  // 1. Vacío ANTES de convertir: Number('') sería 0 y pasaría por un importe válido.
  if (clean === '') {
    throw new TypeError('Falta el importe');
  }
  // 2. Formato español: el punto agrupa miles y la coma separa decimales.
  const euros = Number(clean.replaceAll('.', '').replace(',', '.'));
  // 3. Number.isFinite descarta NaN e Infinity sin convertir tipos.
  if (!Number.isFinite(euros) || euros < 0) {
    throw new RangeError(`Importe no válido: «${text}»`);
  }
  // 4. Math.round: 19.99 * 100 es 1998.9999999999998 en binario.
  return Math.round(euros * 100);
}

function totalsByCategory(list) {
  const totals = new Map();
  for (const expense of list) {
    // get devuelve undefined la primera vez: ?? lo convierte en 0.
    totals.set(expense.category, (totals.get(expense.category) ?? 0) + parseCents(expense.amount));
  }
  return totals; // un Map recorre sus claves en orden de inserción
}

function splitEvenly(totalCents, people) {
  const share = Math.floor(totalCents / people);
  const leftover = totalCents % people; // céntimos que no se pueden repartir a partes iguales
  // Array.from con length crea el array sin huecos; la flecha recibe (valor, índice) y
  // el valor, que aquí no se usa, se llama _ por convención.
  return Array.from({ length: people }, (_, index) => (index < leftover ? share + 1 : share));
}

// El formateador se crea una vez, fuera de la función, y se reutiliza.
const euroFormat = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
function formatEuros(cents) {
  return euroFormat.format(cents / 100); // dividir entre 100 solo al mostrar
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
