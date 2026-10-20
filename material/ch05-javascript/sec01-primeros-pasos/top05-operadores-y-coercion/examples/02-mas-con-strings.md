---
example_description: "El + concatena en cuanto hay un string: '5' + 3 es '53' pero '5' - 3 es 2"
example_tags: "javascript|python|operadores|coercion|string|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// 🐛 + tiene dos trabajos: sumar números y concatenar strings.
// Si CUALQUIERA de los dos operandos es un string, concatena.
console.log("'5' + 3 →", '5' + 3);       // '53'
console.log("3 + '5' →", 3 + '5');       // '35'

// Los demás operadores aritméticos solo saben de números: convierten a number.
console.log("'5' - 3 →", '5' - 3);       // 2
console.log("'5' * '2' →", '5' * '2');   // 10

// Se evalúa de izquierda a derecha, así que el orden cambia el resultado.
console.log("1 + 2 + '3' →", 1 + 2 + '3'); // '33' (primero 1 + 2 = 3)
console.log("'1' + 2 + 3 →", '1' + 2 + 3); // '123'

// El caso real: lo que llega de un formulario, de la URL o de prompt() es texto.
const quantityFromInput = '2'; // el value de un <input> siempre es un string
console.log('🐛 cantidad + 1 →', quantityFromInput + 1);         // '21'

// ✅ Convierte a número ANTES de sumar.
console.log('✅ Number(cantidad) + 1 →', Number(quantityFromInput) + 1); // 3

// Python no adivina: '5' + 3 lanza TypeError. JavaScript convierte sin avisar
// (por eso se dice que Python tiene tipado «fuerte» y JavaScript «débil»).
```
