---
example_description: "var ignora los bloques: su ámbito es la función entera y la variable del bucle sobrevive al bucle"
example_tags: "javascript|variables|var|ambito|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// 🐛 var no respeta los bloques { }: su ámbito es la FUNCIÓN que la contiene
// (o el script entero, si está fuera de cualquier función).
if (true) {
  var fromVar = 'soy var';
  let fromLet = 'soy let';
}
console.log('fromVar fuera del if →', fromVar); // 'soy var': se escapó del bloque
try {
  console.log(fromLet);
} catch (error) {
  console.log('fromLet fuera del if →', error.name, '|', error.message);
}

// El caso típico: la variable del bucle sobrevive al bucle.
for (var i = 0; i < 3; i++) {
  // cuerpo vacío
}
console.log('i después de un for con var →', i); // 3

// Lo único que frena a var es una función.
function setup() {
  var secret = 'solo dentro de setup';
  console.log('dentro de setup →', secret);
}
setup();
console.log('typeof secret fuera →', typeof secret); // 'undefined'

// Curiosidad: así funciona Python (ámbito de función). El problema es que en
// JavaScript las llaves PARECEN un límite y var no lo respeta.
// ✅ En código nuevo usa let y const; var solo aparece en código antiguo.
```
