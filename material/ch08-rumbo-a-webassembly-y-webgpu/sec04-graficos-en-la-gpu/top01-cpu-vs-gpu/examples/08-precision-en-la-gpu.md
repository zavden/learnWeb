---
example_description: "Los float de un shader son float32: getShaderPrecisionFormat dice cuántos bits tiene cada precisión (en el Mac, highp, mediump y lowp son float32), y la propia GPU, leída con readPixels, confirma lo de la lección «Float32 y precisión»: 2 ** 24 + 1 === 2 ** 24 y 0.1 + 0.2 === 0.3, igual que Math.fround y al revés que JavaScript"
example_tags: "javascript|webgl|gpu|float32|precision|mediump|highp|readpixels"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Usa assets/gpu/probe.js (léelo con «Assets»): ejecuta un fragment shader en UN píxel y lo lee.
import { createProbe } from './gpu/probe.js';

const probe = createProbe();

// 1. ¿Qué es un float en esta GPU? rangeMax: el exponente más alto (2^127 ≈ 3.4e38);
//    precision: los bits de mantisa (23 → float32; un float16 tendría 10).
for (const name of ['highp', 'mediump', 'lowp']) {
  const { rangeMax, precision } = probe.precision(name);
  console.log(`${name.padEnd(7)} → hasta 2^${rangeMax}, ${precision} bits de mantisa`);
}

// 2. Una suma hecha POR LA GPU. Los tres números llegan como uniforms (así el compilador no
//    puede precalcular nada) y el píxel sale rojo si la igualdad se cumple, negro si no.
const SUM_TEST = `
  precision highp float;
  uniform float u_a, u_b, u_c;
  void main() {
    bool equal = u_a + u_b == u_c;
    gl_FragColor = vec4(equal ? 1.0 : 0.0, 0.0, 0.0, 1.0);
  }`;
const gpuSays = (a, b, c) => probe.run(SUM_TEST, { u_a: a, u_b: b, u_c: c })[0] === 255;
const fround32 = (a, b, c) => Math.fround(Math.fround(a) + Math.fround(b)) === Math.fround(c);

for (const [a, b, c] of [[2 ** 24, 1, 2 ** 24], [0.1, 0.2, 0.3]]) {
  console.log(`${a} + ${b} === ${c} → GPU: ${gpuSays(a, b, c)} · Math.fround: ${fround32(a, b, c)} · JavaScript: ${a + b === c}`);
}
probe.release();
// La GPU calcula como Math.fround (lección «Float32 y precisión»), no como un number de JavaScript.
```
