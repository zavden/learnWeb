---
example_description: "Dinero sin errores de redondeo: convertir a céntimos con Math.round, operar con enteros y dividir solo al mostrar"
example_tags: "javascript|python|numeros|dinero|enteros|redondeo"
example_stage: intermediate
example_importance: critical
console: true
---

# JavaScript

```javascript
// Regla de oro con dinero: guarda y opera en CÉNTIMOS, que son enteros.
// Los enteros (hasta 2**53) son exactos: sumarlos y restarlos nunca pierde nada.

// 1. Pasar de euros a céntimos: con Math.round, nunca truncando.
console.log('1.15 * 100 →', 1.15 * 100);                               // 114.99999999999999
console.log('🐛 Math.floor(1.15 * 100) →', Math.floor(1.15 * 100));    // 114: falta un céntimo
console.log('✅ Math.round(1.15 * 100) →', Math.round(1.15 * 100));    // 115

// 2. Operar con enteros. (Arrays y objetos como datos: lecciones 3 y 4 del módulo.)
const cart = [
  { name: 'Cuaderno A5', priceCents: 115, quantity: 3 },
  { name: 'Bolígrafo azul', priceCents: 70, quantity: 10 },
  { name: 'Mochila', priceCents: 2499, quantity: 1 },
];
let subtotalCents = 0;
for (const item of cart) {
  subtotalCents += item.priceCents * item.quantity;
}
console.log('subtotal (céntimos) →', subtotalCents); // 3544

// 3. Los porcentajes producen decimales: redondea a céntimos en cuanto aparecen.
const vatCents = Math.round(subtotalCents * 0.21);
console.log('IVA 21 % (céntimos) →', vatCents);      // 744 (era 744.24)
const totalCents = subtotalCents + vatCents;

// 4. Divide entre 100 solo para MOSTRAR.
console.log('total →', (totalCents / 100).toFixed(2), '€'); // 42.88 €

// Repartir 100 € entre 3 personas sin perder ni inventar céntimos:
const billCents = 10000;
const shareCents = Math.floor(billCents / 3); // 3333
const leftoverCents = billCents % 3;          // 1 céntimo sobrante
console.log('primera persona →', shareCents + leftoverCents, '| las otras dos →', shareCents);
console.log('¿cuadra? →', shareCents + leftoverCents + shareCents * 2 === billCents); // true

// En Python usarías decimal.Decimal. JavaScript no tiene un tipo decimal propio:
// enteros de céntimos, BigInt para importes enormes, o una librería.
```
