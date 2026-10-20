---
example_description: "Math.round/floor/ceil/trunc frente al round() de Python, y toFixed: devuelve un string y redondea el valor binario"
example_tags: "javascript|python|numeros|redondeo|tofixed|math|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Cuatro formas de quitar los decimales (como math.floor, math.ceil e int en Python):
console.table({
  '2.5':  { round: Math.round(2.5),  floor: Math.floor(2.5),  ceil: Math.ceil(2.5),  trunc: Math.trunc(2.5) },
  '-2.5': { round: Math.round(-2.5), floor: Math.floor(-2.5), ceil: Math.ceil(-2.5), trunc: Math.trunc(-2.5) },
  '2.7':  { round: Math.round(2.7),  floor: Math.floor(2.7),  ceil: Math.ceil(2.7),  trunc: Math.trunc(2.7) },
  '-2.7': { round: Math.round(-2.7), floor: Math.floor(-2.7), ceil: Math.ceil(-2.7), trunc: Math.trunc(-2.7) },
});

// 🐛 Math.round lleva los .5 hacia +∞: Math.round(-2.5) es -2, no -3.
// Y el round() de Python es distinto: redondeo «bancario» (al par más cercano).
console.log('Math.round(2.5) →', Math.round(2.5), '| Python: round(2.5) → 2');
console.log('Math.round(3.5) →', Math.round(3.5), '| Python: round(3.5) → 4');

// toFixed(n) redondea a n decimales… y devuelve un STRING, pensado para mostrar.
const price = 3.14159;
console.log('price.toFixed(2) →', price.toFixed(2), '| typeof →', typeof price.toFixed(2));
console.log('🐛 price.toFixed(2) + 1 →', price.toFixed(2) + 1); // '3.141': concatena
const rounded = Number(price.toFixed(2));                        // ✅ de vuelta a number
console.log('✅ Number(price.toFixed(2)) →', rounded, '| typeof →', typeof rounded); // 3.14 'number'

// 🐛 toFixed redondea el valor guardado en binario, que no es el que escribiste:
console.log('(1.005).toFixed(2) →', (1.005).toFixed(2));        // '1.00', no '1.01'
console.log('1.005 guardado →', (1.005).toPrecision(20));       // 1.0049999999999998934
// (Python hace lo mismo: f"{1.005:.2f}" es '1.00'.)

// Redondear a 2 decimales y seguir con un number: Math.round(x * 100) / 100.
console.log('Math.round(3.14159 * 100) / 100 →', Math.round(3.14159 * 100) / 100); // 3.14
// Sirve para mostrar y para cálculos aproximados. Si cada céntimo cuenta,
// trabaja con enteros desde el principio (ejemplo 3).

// toPrecision(n) redondea a n cifras SIGNIFICATIVAS (también devuelve string):
console.log('(123.456).toPrecision(4) →', (123.456).toPrecision(4));       // '123.5'
console.log('(0.00012345).toPrecision(2) →', (0.00012345).toPrecision(2)); // '0.00012'
```
