---
example_description: "Por qué la GPU trabaja en float32: una malla de un millón de vértices ocupa 64 MB en float64 y 32 MB en float32, la memoria y el ancho de banda mandan, y 7 cifras bastan para posiciones locales y colores; así se prepara un Float32Array con los vértices de un triángulo"
example_tags: "javascript|gpu|float32array|webgl|webgpu|memoria|vertices"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Una malla 3D de un millón de vértices; cada vértice tiene 8 números:
// posición (x, y, z), normal (x, y, z) y coordenadas de textura (u, v).
const VERTICES = 1_000_000;
const NUMBERS_PER_VERTEX = 3 + 3 + 2;
for (const Type of [Float64Array, Float32Array]) {
  const bytes = VERTICES * NUMBERS_PER_VERTEX * Type.BYTES_PER_ELEMENT;
  const perSecond = (bytes * 60) / 1e9; // si se actualiza en cada fotograma, a 60 fps
  console.log(`${Type.name}: ${bytes / 1e6} MB por malla · ${perSecond.toFixed(2)} GB/s a 60 fps`);
}

// ¿Basta la precisión de float32? Depende de para qué:
// · posiciones en metros cerca del origen (una escena de 200 m): saltos de ~15 micras
const sceneEdge = 200.123456;
console.log('posición →', Math.fround(sceneEdge), `(error: ${Math.abs(Math.fround(sceneEdge) - sceneEdge).toExponential(1)} m)`);
// · colores de 0 a 1: el paso de un byte es 1/255 ≈ 0.0039; float32 es millones de veces más fino
const red = 200 / 255;
console.log('color 200/255 →', Math.fround(red), '→ byte', Math.round(Math.fround(red) * 255));

// Además, una GPU tiene miles de unidades de cálculo en float32; las de float64 son
// muchas menos o no existen (WGSL, el lenguaje de WebGPU, ni siquiera tiene f64).

// Así se prepara un triángulo para la GPU: 3 vértices × (x, y), en coordenadas de -1 a 1.
const triangle = new Float32Array([
  0.0, 0.5,   // arriba
  -0.5, -0.5, // abajo a la izquierda
  0.5, -0.5,  // abajo a la derecha
]);
console.log('triángulo →', triangle, '|', triangle.byteLength, 'bytes para la GPU');
// gl.bufferData(gl.ARRAY_BUFFER, triangle, gl.STATIC_DRAW) los sube a la GPU con WebGL
// (módulo «Gráficos en la GPU»); device.queue.writeBuffer(buffer, 0, triangle), con WebGPU.
```
