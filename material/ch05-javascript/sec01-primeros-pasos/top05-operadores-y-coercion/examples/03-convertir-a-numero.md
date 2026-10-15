---
example_description: "Tabla de conversiones a número (ToNumber): Number('') es 0, Number('42px') es NaN, Number([]) es 0"
example_tags: "javascript|python|coercion|number|tonumber"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Cuando un operador necesita un número (-, *, /, <, == entre tipos…), JavaScript
// aplica la conversión ToNumber: exactamente lo que hace Number(valor).
// Cada fila lleva como nombre el valor convertido; la columna «python» muestra
// qué haría float(valor) con el equivalente de Python.
console.table({
  "'42'":      { number: Number('42'),      python: '42.0' },
  "' 42 '":    { number: Number(' 42 '),    python: '42.0' },       // ignora espacios en los extremos
  "''":        { number: Number(''),        python: 'ValueError' }, // 🐛 0, no NaN
  "'   '":     { number: Number('   '),     python: 'ValueError' }, // 🐛 0
  "'42px'":    { number: Number('42px'),    python: 'ValueError' }, // todo o nada: NaN
  "'1e3'":     { number: Number('1e3'),     python: '1000.0' },
  'true':      { number: Number(true),      python: '1.0' },
  'false':     { number: Number(false),     python: '0.0' },
  'null':      { number: Number(null),      python: 'TypeError' },  // 🐛 0
  'undefined': { number: Number(undefined), python: '—' },          // NaN
  '[]':        { number: Number([]),        python: 'TypeError' },  // 🐛 0 ([] → '' → 0)
  '[7]':       { number: Number([7]),       python: 'TypeError' },  // 7 ([7] → '7' → 7)
  '{}':        { number: Number({}),        python: 'TypeError' },  // NaN
});

// El + unario hace lo mismo que Number():
console.log("+'42' →", +'42', "| +'' →", +'');

// parseInt/parseFloat leen el principio del texto y paran al primer carácter raro
// (se estudian en «Números, texto y colecciones»):
console.log("parseFloat('42px') →", parseFloat('42px')); // 42
```
