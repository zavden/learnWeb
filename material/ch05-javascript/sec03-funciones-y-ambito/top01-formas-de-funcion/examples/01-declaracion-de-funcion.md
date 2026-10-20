---
example_description: "La declaración de función es el def de Python: parámetros, return, varios return y undefined cuando no hay return"
example_tags: "javascript|python|funciones|declaracion|return"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Declaración de función: la forma clásica, el def de Python.
//   def price_with_vat(net_cents, rate):      function priceWithVat(netCents, rate) {
//       return round(net_cents * (1 + rate))      return Math.round(netCents * (1 + rate));
//                                             }
function priceWithVat(netCents, rate) {
  return Math.round(netCents * (1 + rate));
}
console.log('priceWithVat(1000, 0.21) →', priceWithVat(1000, 0.21)); // 1210

// Puede haber varios return: el primero que se ejecuta termina la función.
function shippingCents(totalCents) {
  if (totalCents >= 5000) return 0; // envío gratis a partir de 50 €
  return 495;
}
console.log('shippingCents(6200) →', shippingCents(6200)); // 0
console.log('shippingCents(1800) →', shippingCents(1800)); // 495

// Sin return (o con un return a secas) la función devuelve undefined,
// el None de Python.
function printTotal(cents) {
  console.log('  Total:', (cents / 100).toFixed(2), '€');
}
const result = printTotal(1210);
console.log('printTotal devuelve →', result); // undefined

// Una función es un valor con propiedades: su nombre y cuántos parámetros declara.
console.log('priceWithVat.name →', priceWithVat.name);     // 'priceWithVat'
console.log('priceWithVat.length →', priceWithVat.length); // 2
console.log('typeof priceWithVat →', typeof priceWithVat); // 'function'

// Recuerda la trampa de «Sintaxis frente a Python»: no partas la línea después
// de return, o la función devolverá undefined (ASI pone un ; detrás de return).
```
