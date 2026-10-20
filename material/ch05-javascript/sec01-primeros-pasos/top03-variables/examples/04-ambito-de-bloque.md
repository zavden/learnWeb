---
example_description: "let y const solo existen dentro del bloque { } donde se declaran (en Python no hay ámbito de bloque)"
example_tags: "javascript|python|variables|ambito"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// let y const viven solo dentro del bloque { } donde se declaran.
const limit = 10;

if (limit > 5) {
  const message = 'creada dentro del if';
  console.log('dentro →', message, '| limit →', limit); // el bloque ve lo de fuera
}

try {
  console.log(message);
} catch (error) {
  console.log('fuera →', error.name, '|', error.message); // message is not defined
}

// La variable de un for con let tampoco existe fuera del bucle.
// (typeof devuelve el tipo de un valor; con una variable que no existe da 'undefined'.)
for (let i = 0; i < 2; i++) {
  console.log('vuelta', i);
}
console.log('typeof i fuera del for →', typeof i); // 'undefined'

// Un bloque suelto { } también crea ámbito: sirve para aislar variables auxiliares.
{
  const temp = 'auxiliar';
  console.log('temp dentro →', temp);
}
console.log('typeof temp fuera →', typeof temp); // 'undefined'

// Python no tiene ámbito de bloque:
// if limit > 5:
//     message = "creada dentro del if"
// print(message)   # funciona: la variable sigue viva después del if
```
