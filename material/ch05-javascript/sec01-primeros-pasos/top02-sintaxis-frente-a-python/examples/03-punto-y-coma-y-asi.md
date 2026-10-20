---
example_description: "El punto y coma termina sentencias; si falta, la inserción automática (ASI) lo pone solo cuando la línea siguiente no puede continuar"
example_tags: "javascript|sintaxis|punto-y-coma|asi"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// El ; termina una sentencia (en Python lo hace el salto de línea).
// Con ; puedes poner dos sentencias en la misma línea:
console.log('uno'); console.log('dos');

// Si lo omites, el motor intenta ponerlo por ti al final de la línea:
// es la «inserción automática de punto y coma» (ASI).
const a = 1
const b = 2
console.log('a + b =', a + b)

// Regla clave: ASI solo pone ; si la línea siguiente NO puede continuar la actual.
// Por eso una expresión larga se puede partir en varias líneas sin problema:
const total =
  a +
  b +
  10;
console.log('total =', total); // 13

// En Python ocurre al revés: las líneas solo se unen dentro de ( [ { abiertos
// o con una barra invertida al final.
const sum = (a
  + b);
console.log('sum =', sum); // 3

// En este curso escribimos siempre ; para no depender de las reglas de ASI.
```
