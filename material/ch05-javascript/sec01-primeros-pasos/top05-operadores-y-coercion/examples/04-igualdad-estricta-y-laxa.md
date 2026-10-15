---
example_description: "Tabla de == frente a ===: la igualdad laxa convierte tipos y produce resultados absurdos"
example_tags: "javascript|coercion|igualdad|comparacion|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// === (estricta): mismo tipo Y mismo valor. Nunca convierte nada.
// == (laxa): si los tipos son distintos, CONVIERTE y después compara:
//   1. null == undefined es true (y no son == a nada más).
//   2. string frente a number → el string pasa a number.
//   3. boolean frente a otra cosa → el boolean pasa a number (true → 1, false → 0).
//   4. objeto frente a primitivo → el objeto pasa a primitivo ([] → '', [0] → '0').
console.table({
  "'1' vs 1":          { '==': '1' == 1,          '===': '1' === 1 },
  "0 vs ''":           { '==': 0 == '',           '===': 0 === '' },
  "0 vs '0'":          { '==': 0 == '0',          '===': 0 === '0' },
  "'' vs '0'":         { '==': '' == '0',         '===': '' === '0' },
  "false vs '0'":      { '==': false == '0',      '===': false === '0' },
  "false vs 'false'":  { '==': false == 'false',  '===': false === 'false' },
  'null vs undefined': { '==': null == undefined, '===': null === undefined },
  'null vs 0':         { '==': null == 0,         '===': null === 0 },
  'null vs false':     { '==': null == false,     '===': null === false },
  '[] vs false':       { '==': [] == false,       '===': [] === false },
  '[0] vs false':      { '==': [0] == false,      '===': [0] === false },
  'NaN vs NaN':        { '==': NaN == NaN,        '===': NaN === NaN },
});

// 🐛 == ni siquiera es transitiva: 0 == '' y 0 == '0', pero '' != '0'.
// 🐛 false == '0' es true, pero false == 'false' es false ('false' → NaN).
// NaN no es igual a nada, ni a sí mismo (ni con ==, ni con ===).

// ✅ Regla: usa SIEMPRE ===  (y !== para «distinto»).
// Única excepción aceptada: x == null, que es true para null y para undefined.
const missing = undefined;
console.log('missing == null →', missing == null); // true
```
