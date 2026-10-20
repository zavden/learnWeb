---
example_description: "Funciones puras e impuras: mismo resultado para los mismos argumentos y sin efectos secundarios, frente a depender de variables externas o modificar el argumento"
example_tags: "javascript|python|funciones-puras|efectos-secundarios|inmutabilidad"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Una función PURA cumple dos condiciones:
//   1) con los mismos argumentos, devuelve SIEMPRE el mismo resultado;
//   2) no cambia nada fuera de ella (no tiene «efectos secundarios»).

// ✅ Pura: solo usa sus argumentos y devuelve un valor nuevo.
function lineTotal(cents, qty, discountRate) {
  return Math.round(cents * qty * (1 - discountRate));
}
console.log('lineTotal ×2 →', lineTotal(1250, 3, 0.1), lineTotal(1250, 3, 0.1)); // 3375 3375

// ❌ Impura (1): depende de una variable de fuera que puede cambiar.
let currentDiscount = 0.1;
function lineTotalWithGlobal(cents, qty) {
  return Math.round(cents * qty * (1 - currentDiscount));
}
console.log('antes →', lineTotalWithGlobal(1250, 3)); // 3375
currentDiscount = 0.25;
console.log('después →', lineTotalWithGlobal(1250, 3)); // 2813: mismos argumentos, otro resultado

// ❌ Impura (2): modifica el objeto que recibe.
function discountInPlace(cart, rate) {
  for (const line of cart.lines) {
    line.cents = Math.round(line.cents * (1 - rate));
  }
  return cart;
}

// ✅ Pura: devuelve un carrito NUEVO y deja el original como estaba.
function applyDiscount(cart, rate) {
  return {
    ...cart,
    lines: cart.lines.map((line) => ({ ...line, cents: Math.round(line.cents * (1 - rate)) })),
  };
}

const cart = { id: 'C-7', lines: [{ name: 'Libro', cents: 2000 }, { name: 'Funda', cents: 1200 }] };
const discounted = applyDiscount(cart, 0.1);
console.log('original →', cart.lines[0].cents, '| con descuento →', discounted.lines[0].cents); // 2000 | 1800

discountInPlace(cart, 0.1);
console.log('tras discountInPlace, original →', cart.lines[0].cents); // 1800: el original ya no existe

// Otros efectos secundarios: console.log, Math.random(), Date.now(), fetch o tocar
// la página. Un programa los necesita; la idea es reunirlos en pocos sitios y
// que los cálculos (lo difícil) sean puros: fáciles de probar y de reutilizar.
```
