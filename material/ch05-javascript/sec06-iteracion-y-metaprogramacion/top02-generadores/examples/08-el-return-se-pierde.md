---
example_description: "El valor del return de un generador llega solo en el último next() (el de done: true): for…of, el spread y Array.from lo descartan; yield* sí lo devuelve, como yield from en Python"
example_tags: "javascript|python|generadores|return|yield-star|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
const rows = [
  { product: 'café', units: 12 },
  { product: 'pan', units: 0 },
  { product: 'leche', units: -3 },
  { product: 'queso', units: 4 },
];

// Entrega las filas válidas y, al final, DEVUELVE un resumen con return.
function* validRows(input) {
  let rejected = 0;
  for (const row of input) {
    if (row.units > 0) yield row;
    else rejected += 1;
  }
  return { rejected }; // 🐛 ¿quién recibe esto?
}

// 🐛 for…of, el spread y Array.from se quedan con los yield y TIRAN el return.
const accepted = [...validRows(rows)];
console.log('🐛 spread →', accepted.map((row) => row.product), '| el resumen se perdió');
for (const row of validRows(rows)) console.log('🐛 for…of →', row.product);

// El valor del return viaja en el ÚLTIMO resultado, el que tiene done: true,
// justo el que los consumidores usan como señal de fin y descartan.
const gen = validRows(rows);
let result = gen.next();
while (!result.done) result = gen.next();
console.log('último next() → done:', result.done, '| value:', result.value);

// ✅ yield* sí lo recoge: el valor de la expresión yield* es el return del
//    generador delegado.
function* withSummary(input) {
  const { rejected } = yield* validRows(input);
  yield `resumen: ${rejected} filas rechazadas`;
}
console.log('✅ yield* →', [...withSummary(rows)].map((value) => value.product ?? value));

// ✅ O, más simple: si el dato importa, no lo devuelvas con return. Entrégalo
//    con yield o guárdalo en un objeto que reciba el generador.
function* validRowsWithStats(input, stats) {
  for (const row of input) {
    if (row.units > 0) yield row;
    else stats.rejected += 1;
  }
}
const stats = { rejected: 0 };
const kept = [...validRowsWithStats(rows, stats)];
console.log('✅ stats →', kept.length, 'válidas,', stats.rejected, 'rechazadas');

// > Desde Python: idéntico. El return de un generador viaja en
//   StopIteration.value, el for lo descarta y yield from lo devuelve.
```
