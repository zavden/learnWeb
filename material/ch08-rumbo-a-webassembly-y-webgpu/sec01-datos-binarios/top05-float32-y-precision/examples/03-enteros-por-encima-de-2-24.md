---
example_description: "float32 solo guarda exactos los enteros hasta 2 ** 24 = 16777216: 16777217 se guarda como 16777216, un contador en un Float32Array se atasca, y una fecha en milisegundos pasada a la GPU como float32 salta de 2 en 2 minutos"
example_tags: "javascript|float32array|enteros|precision|gpu|u-time|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// float32 tiene 24 bits de precisión: los enteros son exactos solo hasta 2 ** 24.
// (Un number llega hasta 2 ** 53: lección «Números».)
console.log('2 ** 24 →', 2 ** 24);
const stored = Float32Array.of(16777215, 16777216, 16777217, 16777218, 16777219);
console.log('🐛 guardados →', stored); // los impares de arriba ya no caben

// 🐛 Un contador en un Float32Array deja de avanzar: 16777216 + 1 vuelve a ser 16777216.
const particleCount = Float32Array.of(16777214);
const seen = [];
for (let step = 0; step < 5; step += 1) {
  particleCount[0] += 1;
  seen.push(particleCount[0]);
}
console.log('🐛 contador →', seen);

// 🐛 El caso típico en gráficos: pasar la hora a un shader como float32.
//    Una fecha en milisegundos ronda 1.8e12, y ahí los float32 van de 131072 en 131072 ms.
const now = Date.UTC(2026, 9, 14, 16, 30, 0, 123);
console.log('Date en ms →', now, '| en float32 →', Math.fround(now));
console.log('🐛 un minuto después, ¿cambia? →', Math.fround(now + 60_000) !== Math.fround(now)); // false
// La animación se quedaría quieta 2 minutos y luego daría un salto.

// ✅ Enteros grandes, en typed arrays de enteros:
console.log('✅ Uint32Array →', Uint32Array.of(16777217)[0]);
// ✅ Para el tiempo, segundos desde que empezó la animación (números pequeños):
const start = now;
const elapsedSeconds = (now + 1500 - start) / 1000;
console.log('✅ u_time →', Math.fround(elapsedSeconds)); // 1.5: exacto
// Los shaders del módulo «Gráficos en la GPU» reciben así su uniform u_time.
```
