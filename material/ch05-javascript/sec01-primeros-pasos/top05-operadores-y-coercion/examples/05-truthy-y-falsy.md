---
example_description: "Solo 8 valores son falsy: [] y {} son truthy (al contrario que en Python), y también '0' y 'false'"
example_tags: "javascript|python|coercion|truthy|falsy|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// En un if (o con !, &&, ||) JavaScript convierte el valor a booleano.
// Solo hay 8 valores «falsy»; TODO lo demás es «truthy».
// Cada fila lleva como nombre el valor; la columna «python» es lo que daría
// bool() con el equivalente de Python.
console.table({
  '0':                  { boolean: Boolean(0),         python: 'False' },
  'false':              { boolean: Boolean(false),     python: 'False' },
  '-0':                 { boolean: Boolean(-0),        python: 'False' },
  '0n':                 { boolean: Boolean(0n),        python: 'False' },
  "''":                 { boolean: Boolean(''),        python: 'False' },
  'null':               { boolean: Boolean(null),      python: 'False (None)' },
  'undefined':          { boolean: Boolean(undefined), python: '—' },
  'NaN':                { boolean: Boolean(NaN),       python: "True (float('nan'))" },
  "'0'":                { boolean: Boolean('0'),       python: 'True' },
  "'false'":            { boolean: Boolean('false'),   python: 'True' },
  "' '":                { boolean: Boolean(' '),       python: 'True' },
  '[]':                 { boolean: Boolean([]),        python: 'False' }, // 🐛
  '{}':                 { boolean: Boolean({}),        python: 'False' }, // 🐛
  'new Boolean(false)': { boolean: Boolean(new Boolean(false)), python: '—' }, // 🐛 es un objeto
});

// 🐛 El caso que más duele viniendo de Python: un array vacío es truthy.
const cart = [];
if (cart) {
  console.log('🐛 if (cart) → entra aunque el carrito esté vacío');
}

// ✅ Pregunta por lo que de verdad quieres saber: la longitud.
if (cart.length === 0) {
  console.log('✅ cart.length === 0 → el carrito está vacío');
}
```
