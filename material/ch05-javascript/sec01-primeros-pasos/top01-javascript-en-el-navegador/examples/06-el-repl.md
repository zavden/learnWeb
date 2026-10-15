---
example_description: "La línea «>» de la consola es un REPL que ve las variables del ejemplo"
example_tags: "javascript|consola|repl"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Este ejemplo solo prepara unas variables para que juegues con ellas.
// Escribe en la línea «>» de la consola y pulsa Enter (↑ y ↓ recorren el historial):
//
//   price * quantity
//   greet('Grace')
//   price = 99
//   price * quantity
//
// Es el «>>>» de Python, pero dentro de la página: ve lo mismo que tu script.
let price = 12.5;
const quantity = 4;

// function y las plantillas `${}` se presentan en la lección 2 y se estudian
// en «Funciones y ámbito».
function greet(name) {
  return `Hola, ${name}`;
}

console.log('Listo. Prueba en la consola: price * quantity');

// Al editar el código, LearnWeb vuelve a ejecutar la página desde cero:
// la consola se vacía y price vuelve a valer 12.5.
```
