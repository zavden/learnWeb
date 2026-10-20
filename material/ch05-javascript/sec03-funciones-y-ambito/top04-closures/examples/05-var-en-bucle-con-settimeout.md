---
example_description: "El bug más famoso de JavaScript: var en un for con setTimeout imprime el último valor en cada vuelta; con let, cada vuelta tiene su variable"
example_tags: "javascript|closures|var|let|settimeout|bucles|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// setTimeout(fn, ms) programa fn para que se ejecute dentro de ms milisegundos,
// cuando el bucle (y todo el script) ya ha terminado. Los temporizadores y el
// event loop se estudian en el módulo «Asincronía y event loop».
const steps = ['Validar carrito', 'Cobrar', 'Enviar confirmación'];

// 🐛 Con var hay UNA sola variable i para todo el bucle (ámbito de función).
// Las tres flechas capturan ESA variable, y cuando se ejecutan, i ya vale 3.
for (var i = 0; i < steps.length; i++) {
  setTimeout(() => console.log(`🐛 var → paso ${i}:`, steps[i]), 50 * (i + 1));
}

// ✅ Con let, cada VUELTA del for tiene su propia variable j (una copia nueva
// con el valor de esa vuelta), y cada flecha captura la suya.
for (let j = 0; j < steps.length; j++) {
  setTimeout(() => console.log(`✅ let → paso ${j}:`, steps[j]), 300 + 50 * j);
}

console.log('Fin del script: los temporizadores todavía no se han ejecutado.');
console.log('i después del bucle →', i); // 3: var se escapó del for

// Salida:
//   Fin del script: …
//   i después del bucle → 3
//   🐛 var → paso 3: undefined   (×3)
//   ✅ let → paso 0: Validar carrito
//   ✅ let → paso 1: Cobrar
//   ✅ let → paso 2: Enviar confirmación
```
