---
example_description: "Uint8ClampedArray satura en lugar de dar la vuelta (300 → 255, -3 → 0) y redondea los .5 al par (1.5 → 2, 2.5 → 2), al revés que Math.round; es el tipo de los píxeles de un canvas"
example_tags: "javascript|python|typed-arrays|uint8clampedarray|redondeo|pixeles|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Uint8ClampedArray: un byte por elemento, pero lo que no cabe se queda en el borde.
const pixels = Uint8ClampedArray.of(10, 100, 200, 250);
const brighter = pixels.map((value) => value + 60);
console.log('✅ más claro →', brighter); // 255 es el máximo: nada da la vuelta
console.log('300 y -3 →', Uint8ClampedArray.of(300, -3)); // [255, 0]

// 🐛 Pero no convierte los decimales igual que Uint8Array ni igual que Math.round:
const values = [1.5, 2.5, 0.5, 254.5, 3.7];
console.log('valores           →', values);
console.log('Uint8Array        →', Uint8Array.from(values));        // trunca
console.log('Uint8ClampedArray →', Uint8ClampedArray.from(values)); // redondea, los .5 al PAR
console.log('Math.round        →', values.map(Math.round));         // los .5 hacia arriba

// El caso real: la media de dos píxeles para suavizar una imagen.
const left = 2;
const right = 3;
const average = (left + right) / 2; // 2.5
console.log('media con Math.round →', Math.round(average));                   // 3
console.log('media en Uint8ClampedArray →', Uint8ClampedArray.of(average)[0]); // 2
// Una prueba que compara tu filtro (con Math.round) con lo que guarda el canvas
// falla por 1 en los .5. ✅ Usa Math.round tú antes de guardar, o compara con
// tolerancia: las dos reglas son válidas, pero hay que elegir una.

// Este es el tipo de los píxeles de un canvas: ImageData.data es un
// Uint8ClampedArray (módulo «Gráficos y animación»).
// Python: round(2.5) → 2 también redondea al par, como Uint8ClampedArray.
```
