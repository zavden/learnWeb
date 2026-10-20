---
example_description: "Tabla con el resultado de typeof para cada tipo primitivo y para objetos, comparado con type() de Python"
example_tags: "javascript|python|tipos|typeof"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// typeof valor devuelve un STRING con el nombre del tipo (columna «js»).
// La columna «python» es lo que daría type(valor).__name__ con el equivalente.
// Cada fila de la tabla lleva como nombre la expresión evaluada.
console.table({
  '42':             { js: typeof 42,             python: 'int' },
  '3.14':           { js: typeof 3.14,           python: 'float' },
  '10n':            { js: typeof 10n,            python: 'int' },
  "'hola'":         { js: typeof 'hola',         python: 'str' },
  'true':           { js: typeof true,           python: 'bool' },
  'undefined':      { js: typeof undefined,      python: '—' },
  "Symbol('id')":   { js: typeof Symbol('id'),   python: '—' },
  'null':           { js: typeof null,           python: 'NoneType' },
  '{ a: 1 }':       { js: typeof { a: 1 },       python: 'dict' },
  '[1, 2]':         { js: typeof [1, 2],         python: 'list' },
  'function () {}': { js: typeof function () {}, python: 'function' },
});

// Las 8 primeras filas son primitivos (7 tipos). Fíjate en tres cosas:
// - 42 y 3.14 son el mismo tipo: number.
// - null es un primitivo, pero typeof dice 'object' (🐛, siguiente ejemplo).
// - Los arrays también son 'object'; las funciones tienen su propio 'function'.

// typeof es un operador, no una función: no necesita paréntesis.
console.log('typeof typeof 42 →', typeof typeof 42); // 'string': typeof siempre devuelve texto
```
