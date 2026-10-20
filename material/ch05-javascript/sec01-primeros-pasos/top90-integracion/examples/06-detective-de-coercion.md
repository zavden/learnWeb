---
example_description: "Una tabla que inspecciona valores difíciles: tipo real (null y arrays incluidos), truthy, Number(), String() y == frente a ==="
example_tags: "javascript|integracion|typeof|coercion|truthy|igualdad"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Integra: typeof y sus huecos (lección 4), las tres conversiones y == frente a === (5),
// for…in sobre un objeto (6).
// function: módulo «Funciones y ámbito»; objetos como datos: «Números, texto y colecciones».

// typeof «corregido»: distingue null y los arrays, que typeof confunde con 'object'.
function preciseType(value) {
  if (value === null) {
    return 'null';
  }
  if (Array.isArray(value)) {
    return 'array';
  }
  return typeof value;
}

function inspect(value) {
  return {
    type: preciseType(value),
    truthy: Boolean(value),
    'Number()': Number(value),
    'String()': String(value),
    '== 0': value == 0,
    '=== 0': value === 0,
  };
}

// Valores con trampa. La clave es cómo se escribe el valor en el código.
// ('0' va primero: las claves con forma de número se ordenan siempre delante.)
const samples = {
  '0': 0,
  "'0'": '0',
  "''": '',
  "' '": ' ',
  'false': false,
  "'false'": 'false',
  'null': null,
  'undefined': undefined,
  'NaN': NaN,
  '[]': [],
  '[0]': [0],
  '{}': {},
  '10n': 10n,
};

const report = {};
let looseOnly = '';
for (const label in samples) {
  const row = inspect(samples[label]);
  report[label] = row;
  if (row['== 0'] && !row['=== 0']) {
    looseOnly += ` ${label}`;
  }
}
console.table(report);

console.log('🐛 == 0 dice que sí, pero === 0 dice que no:' + looseOnly);
console.log('Conclusión: compara con === y convierte tú los tipos cuando haga falta.');
```
