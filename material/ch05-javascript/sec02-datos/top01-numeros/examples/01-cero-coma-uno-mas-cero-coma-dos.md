---
example_description: "0.1 + 0.2 no es 0.3: los decimales se guardan en binario y se redondean"
example_tags: "javascript|python|numeros|ieee-754|decimales|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// 🐛 El clásico: la suma de dos decimales «exactos» no da el resultado exacto.
console.log('0.1 + 0.2 →', 0.1 + 0.2);                 // 0.30000000000000004
console.log('0.1 + 0.2 === 0.3 →', 0.1 + 0.2 === 0.3); // false

// Causa: los number se guardan en binario (IEEE-754, 64 bits). 0.1 en binario es
// periódico (0.000110011001100…), como 1/3 en decimal (0.333…), y hay que cortarlo.
// toPrecision(20) enseña el valor que se guarda de verdad:
console.log('0.1 guardado →', (0.1).toPrecision(20));             // 0.10000000000000000555
console.log('0.2 guardado →', (0.2).toPrecision(20));             // 0.20000000000000001110
console.log('0.3 guardado →', (0.3).toPrecision(20));             // 0.29999999999999998890
console.log('0.1 + 0.2 guardado →', (0.1 + 0.2).toPrecision(20)); // 0.30000000000000004441

// El error se acumula: sumar 0.1 diez veces no da exactamente 1.
let total = 0;
for (let i = 0; i < 10; i++) {
  total += 0.1;
}
console.log('0.1 sumado 10 veces →', total);         // 0.9999999999999999
console.log('total === 1 →', total === 1);           // false

// No es un fallo de JavaScript: en Python, 0.1 + 0.2 == 0.3 también es False.
// Es el formato binario que usan la CPU y casi todos los lenguajes.

// ✅ 1. No compares decimales con ===: compara con un margen (ejemplo 2).
const difference = Math.abs(0.1 + 0.2 - 0.3);
console.log('diferencia < Number.EPSILON →', difference < Number.EPSILON); // true

// ✅ 2. Para mostrar, redondea al formatear (toFixed devuelve un string).
console.log('(0.1 + 0.2).toFixed(2) →', (0.1 + 0.2).toFixed(2)); // '0.30'

// ✅ 3. Para dinero, trabaja con enteros de céntimos (ejemplo 3).
```
