---
example_description: "console.log con varios argumentos y etiquetas: el print() del navegador"
example_tags: "javascript|consola|console.log"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// console.log es el print() de Python: escribe en la consola de la vista previa.
console.log('Hola desde JavaScript');

// Acepta varios argumentos y los separa con un espacio, igual que print(a, b).
console.log('Suma:', 2 + 3);

// Etiqueta cada valor para saber qué estás mirando.
// (const declara una variable: lo verás en la lección «Variables».)
const city = 'Lima';
const year = 2026;
console.log('city →', city, '| year →', year);

// Mira los colores: el texto suelto sale sin comillas y los números en otro color.
// El 5 y el '5' no son el mismo valor, aunque se lean igual.
console.log('número:', 5, '| texto:', '5');

// Dentro de un array los strings sí llevan comillas: así se distinguen.
console.log('array →', ['5', 5]);

// Sustituciones al estilo printf: %s texto, %d entero, %o objeto.
console.log('Vivo en %s desde hace %d años', city, 3);
```
