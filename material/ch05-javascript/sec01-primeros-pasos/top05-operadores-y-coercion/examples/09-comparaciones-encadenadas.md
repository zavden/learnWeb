---
example_description: "18 <= age <= 65 no funciona como en Python; y null >= 0 es true aunque null == 0 sea false"
example_tags: "javascript|python|comparacion|coercion|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// 🐛 En Python, 18 <= age <= 65 es una comparación encadenada.
// En JavaScript se evalúa de izquierda a derecha y el booleano se convierte en número.
const age = 70;
console.log('18 <= age <= 65 →', 18 <= age <= 65); // true 🐛 (¡con 70!)
// Paso a paso: (18 <= 70) es true → true <= 65 → 1 <= 65 → true

console.log('3 > 2 > 1 →', 3 > 2 > 1); // false 🐛
// (3 > 2) es true → true > 1 → 1 > 1 → false

// ✅ Escribe las dos comparaciones unidas con &&.
console.log('18 <= age && age <= 65 →', 18 <= age && age <= 65); // false

// Dos strings se comparan alfabéticamente, carácter a carácter (igual que en Python):
console.log("'10' < '9' →", '10' < '9'); // true: '1' va antes que '9'
// …pero con un número de por medio, JavaScript convierte (Python lanzaría TypeError):
console.log("'10' < 9 →", '10' < 9);     // false: compara 10 < 9

// 🐛 Los relacionales (<, >=…) convierten null a 0; == no lo hace (regla 1 de ==).
console.log('null >= 0 →', null >= 0);   // true
console.log('null > 0 →', null > 0);     // false
console.log('null == 0 →', null == 0);   // false
```
