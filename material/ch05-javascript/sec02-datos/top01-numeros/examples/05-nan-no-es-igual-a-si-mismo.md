---
example_description: "NaN se contagia y no es igual a nada, ni a sí mismo: compara con Number.isNaN u Object.is"
example_tags: "javascript|python|numeros|nan|igualdad|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// NaN («Not a Number») es el resultado de una operación numérica sin sentido.
const pricesText = ['12.50', 'gratis', '8'];
const middle = Number(pricesText[1]);
console.log("Number('gratis') →", middle); // NaN

// NaN se contagia: cualquier cuenta con un NaN da NaN, sin lanzar ningún error.
const total = Number(pricesText[0]) + middle + Number(pricesText[2]);
console.log('total →', total); // NaN

// 🐛 NaN no es igual a nada… ni siquiera a sí mismo.
console.log('NaN === NaN →', NaN === NaN);         // false
console.log('total === NaN →', total === NaN);     // false: ¡esta comprobación nunca funciona!
console.log('total !== total →', total !== total); // true: es el único valor que no es igual a sí mismo

// No es un capricho de JavaScript: lo dice IEEE-754. En Python,
// float('nan') == float('nan') también es False.

// ✅ Las dos comprobaciones correctas:
console.log('Number.isNaN(total) →', Number.isNaN(total));     // true
console.log('Object.is(total, NaN) →', Object.is(total, NaN)); // true

// 🐛 indexOf busca con === y por eso no encuentra NaN…
const readings = [21.5, NaN, 19.8];
console.log('readings.indexOf(NaN) →', readings.indexOf(NaN));   // -1
// …pero includes usa otra igualdad (SameValueZero) que sí iguala NaN con NaN.
console.log('readings.includes(NaN) →', readings.includes(NaN)); // true
```
