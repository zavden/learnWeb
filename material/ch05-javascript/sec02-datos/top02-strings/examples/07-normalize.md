---
example_description: "Dos «é» que se ven iguales pero no son ===: normalize('NFC') al recibir el texto y quitar tildes con NFD"
example_tags: "javascript|python|strings|unicode|normalize|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// En Unicode, «é» puede escribirse de dos formas que se VEN idénticas:
const composed = 'é';     // é como UN code point (forma NFC, «compuesta»)
const decomposed = 'é';  // e + acento agudo combinable (forma NFD, «descompuesta»)
console.log('se ven →', composed, decomposed);
console.log('length →', composed.length, decomposed.length); // 1 2

// 🐛 Para ===, son strings distintos.
console.log('composed === decomposed →', composed === decomposed); // false

// El caso real: un nombre tecleado en un formulario (normalmente NFC) frente al
// mismo nombre leído de un archivo de macOS o copiado de un PDF (a menudo NFD).
const typed = 'José';
const fromFile = 'José';
console.log('🐛 ¿mismo usuario? →', typed === fromFile);                  // false
console.log("🐛 fromFile.includes('é') →", fromFile.includes('é'));  // false

// ✅ normalize() lleva el texto a una forma canónica. Normaliza al RECIBIR datos.
// normalize() sin argumento equivale a normalize('NFC').
console.log('✅ ¿mismo usuario? →', typed.normalize() === fromFile.normalize()); // true

// Truco útil: quitar las tildes para buscar sin acentos. NFD separa cada letra
// de sus marcas, y una expresión regular (\p{M}: «marca combinable») las borra.
// (function se estudia en «Funciones y ámbito».)
function stripAccents(text) {
  return text.normalize('NFD').replace(/\p{M}/gu, '');
}
console.log('stripAccents →', stripAccents('Canción de cuna')); // 'Cancion de cuna'
console.log('🐛 también la ñ →', stripAccents('Año nuevo'));     // 'Ano nuevo': solo para buscar

// NFKC además unifica caracteres «de compatibilidad»: ligaduras, círculos, anchos.
console.log("'ﬁ①Ｈ'.normalize('NFKC') →", 'ﬁ①Ｈ'.normalize('NFKC')); // 'fi1H'

// Python tiene el mismo problema y la misma solución: unicodedata.normalize('NFC', s).
```
