---
example_description: "-0 existe: === no lo distingue de 0, pero 1 / -0 es -Infinity y toFixed lo muestra como «-0»"
example_tags: "javascript|python|numeros|cero-negativo|object-is|bug"
example_stage: common-error
example_importance: useful
console: true
---

# JavaScript

```javascript
// IEEE-754 guarda el signo en un bit aparte, así que hay dos ceros: +0 y -0.
// Aparecen al multiplicar o redondear valores negativos muy pequeños:
console.log('0 * -5 →', 0 * -5);                       // -0
console.log('Math.round(-0.4) →', Math.round(-0.4));   // -0
// (La consola, como la de Chrome, sí distingue -0 y lo enseña con su signo.)

// 🐛 === no los distingue…
console.log('-0 === 0 →', -0 === 0); // true
// …pero no se comportan igual:
console.log('1 / 0 →', 1 / 0);       // Infinity
console.log('1 / -0 →', 1 / -0);     // -Infinity

// 🐛 Al pasarlo a texto, unas veces el signo desaparece y otras no:
console.log('String(-0) →', String(-0));              // '0'
console.log('`${-0}` →', `${-0}`);                    // '0'
console.log('(-0.04).toFixed(1) →', (-0.04).toFixed(1)); // '-0.0' ← aparece

// El caso real: una temperatura de -0.04 °C en un panel con un decimal.
const temperature = -0.04;
console.log('🐛 panel →', `${temperature.toFixed(1)} °C`); // '-0.0 °C'

// ✅ Object.is distingue -0 de 0 (y también dice que NaN es NaN).
console.log('Object.is(-0, 0) →', Object.is(-0, 0));       // false
console.log('Object.is(-0, -0) →', Object.is(-0, -0));     // true

// ✅ Para mostrar: redondea, vuelve a number y cambia -0 por 0 (-0 es falsy).
const rounded = Number(temperature.toFixed(1)) || 0;
console.log('✅ panel →', `${rounded.toFixed(1)} °C`);     // '0.0 °C'

// Python también tiene -0.0 (y str(-0.0) es '-0.0'); con int no existe.
```
