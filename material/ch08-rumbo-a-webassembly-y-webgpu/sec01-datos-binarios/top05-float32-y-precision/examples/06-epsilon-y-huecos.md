---
example_description: "El épsilon de float32 es 2 ** -23 (unos 1.19e-7) frente a Number.EPSILON (2 ** -52); el siguiente float32 se obtiene sumando 1 a sus bits, y el hueco entre vecinos crece con el número: a 6371 km del origen, un float32 va de medio metro en medio metro"
example_tags: "javascript|float32|epsilon|precision|ulp|coordenadas|gpu"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Épsilon: la distancia entre 1 y el siguiente número representable.
const FLOAT32_EPSILON = 2 ** -23; // 23 bits de mantisa
console.log('épsilon float32 →', FLOAT32_EPSILON);        // ~7 cifras significativas
console.log('Number.EPSILON  →', Number.EPSILON, '| === 2 ** -52 →', Number.EPSILON === 2 ** -52); // ~16 cifras

// El siguiente float32: sumar 1 a sus bits (los floats positivos se ordenan como sus bits).
const floats = new Float32Array(1);
const bits = new Uint32Array(floats.buffer); // otra vista sobre los mismos 4 bytes
function nextFloat32(x) {
  floats[0] = x;
  bits[0] += 1;
  return floats[0];
}

// El hueco entre un float32 y el siguiente crece con su tamaño (siempre ~1e-7 del valor):
for (const x of [1, 1000, 100_000, 16_777_216, 6_371_000]) {
  const gap = nextFloat32(x) - Math.fround(x);
  console.log(`junto a ${String(x).padEnd(9)} → el siguiente float32 está a ${gap}`);
}

// El caso real: coordenadas en metros con el origen en el centro de la Tierra (radio 6371 km).
const position = 6_371_000.3; // un punto en la superficie, con precisión de 30 cm
console.log('🐛 en float32 →', Math.fround(position)); // 6371000.5: el medio metro más cercano
// Un objeto 3D que se mueve 30 cm salta de medio metro en medio metro: «tiembla».
// ✅ Los motores 3D restan un origen local (la cámara) en float64 ANTES de pasar a float32:
const cameraX = 6_370_990;
console.log('✅ relativo a la cámara →', Math.fround(position - cameraX)); // ~10.3, con precisión de micras
```
