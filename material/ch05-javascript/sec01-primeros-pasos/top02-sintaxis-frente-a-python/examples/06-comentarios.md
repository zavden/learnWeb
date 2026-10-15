---
example_description: "Comentarios de línea, de bloque y de documentación (JSDoc), el equivalente de los docstrings"
example_tags: "javascript|python|comentarios|jsdoc"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// Comentario de una línea: dos barras. En Python sería #.

/* Comentario de bloque:
   puede ocupar varias líneas.
   No se puede anidar uno dentro de otro. */

/**
 * Comentario de documentación (JSDoc): el papel de un docstring.
 * El editor lo muestra al pasar el ratón por encima de la función.
 * @param {number} celsius - temperatura en grados Celsius
 * @returns {number} la temperatura en grados Fahrenheit
 */
function toFahrenheit(celsius) {
  return celsius * 9 / 5 + 32;
}

console.log('20 °C →', toFahrenheit(20), '°F'); // 68

// Un comentario de bloque también cabe en mitad de una línea:
const width = 100 /* px */ + 20;
console.log('width →', width); // 120

// Diferencia con Python: un docstring es un string que existe al ejecutar
// (f.__doc__). Un comentario JSDoc desaparece: el motor lo ignora por completo.
```
