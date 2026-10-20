---
example_description: "Sumar 1/60 de segundo 216000 veces (una hora de animación a 60 fps) en float32 da 3597.2 segundos: los errores de redondeo se acumulan; en float64 casi no se notan; la suma de Kahan o calcular frame × dt lo corrigen"
example_tags: "javascript|float32|precision|suma|kahan|animacion|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Un reloj de animación que suma el tiempo de cada fotograma: 1/60 s, durante una hora.
const FRAMES = 60 * 60 * 60; // 216000 fotogramas
const dt = 1 / 60;
const dt32 = Math.fround(dt); // el mismo paso guardado en float32

// float64 (number): el error de cada suma es diminuto y casi no se acumula.
let clock64 = 0;
for (let frame = 0; frame < FRAMES; frame += 1) clock64 += dt;
console.log('float64 →', clock64);

// 🐛 float32: cada suma se redondea a 24 bits. Cuando el reloj crece, el paso de 0.0167 s
//    pierde cada vez más cifras al sumarse a un número grande… y el error se acumula.
let clock32 = 0;
for (let frame = 0; frame < FRAMES; frame += 1) clock32 = Math.fround(clock32 + dt32);
console.log('🐛 float32 →', clock32, `(se retrasa ${(3600 - clock32).toFixed(1)} s en una hora)`);

// ✅ 1. Suma de Kahan: guarda en `lost` lo que se perdió en cada suma y lo devuelve en la siguiente.
let kahan = 0;
let lost = 0;
for (let frame = 0; frame < FRAMES; frame += 1) {
  const step = Math.fround(dt32 - lost);
  const next = Math.fround(kahan + step);
  lost = Math.fround(Math.fround(next - kahan) - step); // lo que no cupo en `next`
  kahan = next;
}
console.log('✅ float32 con Kahan →', kahan);

// ✅ 2. Mejor aún: no acumular. Calcula el tiempo a partir del número de fotograma.
console.log('✅ FRAMES × dt en float32 →', Math.fround(FRAMES * dt));

// Python: sum() acumula en float64 como aquí, y math.fsum() es una suma exacta.
// numpy.float32 acumula como la versión 🐛.
```
