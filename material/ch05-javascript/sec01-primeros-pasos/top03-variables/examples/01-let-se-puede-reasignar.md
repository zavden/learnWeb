---
example_description: "let declara una variable reasignable; sin valor inicial vale undefined"
example_tags: "javascript|variables|let"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// let declara una variable que puedes reasignar.
let lives = 3;
console.log('vidas al empezar →', lives); // 3

lives = lives - 1;  // las asignaciones siguientes ya NO llevan let
console.log('tras un golpe →', lives);    // 2

lives += 5;
console.log('tras un bonus →', lives);    // 7

// Puedes declarar sin valor: vale undefined hasta que le asignes uno.
let winner;
console.log('winner sin asignar →', winner); // undefined
winner = 'Ada';
console.log('winner →', winner);

// La variable no tiene tipo fijo, igual que en Python: el tipo es del valor.
let data = 42;
data = 'cuarenta y dos';
console.log('data →', data);

// Python: lives = 3 crea la variable al asignar.
// JavaScript: la primera vez hay que DECLARARLA con let (o const).
// Declarar dos veces la misma variable con let en el mismo bloque es un
// SyntaxError (rompería el script entero, por eso no está aquí).
```
