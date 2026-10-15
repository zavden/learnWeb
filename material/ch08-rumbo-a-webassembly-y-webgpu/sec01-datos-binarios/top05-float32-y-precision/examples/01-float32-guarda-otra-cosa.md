---
example_description: "Un Float32Array guarda 0.1 como 0.10000000149011612: al leerlo vuelve como number con otras cifras, así que f32[0] === 0.1 es false; se compara con Math.fround(0.1) o con una tolerancia de float32"
example_tags: "javascript|python|float32array|precision|ieee-754|comparar|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// Un Float32Array guarda cada número en 32 bits: 24 de precisión en vez de los 53 de un number.
const values = new Float32Array([0.1, 1 / 3]);
console.log(values); // Float32Array(2) [0.10000000149011612, 0.3333333432674408]

// 🐛 Al guardar, 0.1 se redondea al float32 más cercano. Al leer, ese valor vuelve como
//    number (float64) SIN perder nada… y por eso enseña las cifras que antes se ocultaban.
console.log('0.1 en float64 →', (0.1).toPrecision(17));       // 0.10000000000000001
console.log('0.1 en float32 →', values[0].toPrecision(17));   // 0.10000000149011612
console.log('values[0] === 0.1 →', values[0] === 0.1);        // false

// El caso real: un uniform de un shader (la opacidad de un material) que se guarda en un
// Float32Array para la GPU y luego se compara con el valor original.
const material = { opacity: 0.3 };
const uniforms = new Float32Array(4); // r, g, b, opacidad
uniforms[3] = material.opacity;
console.log('🐛 ¿opacidad sin cambios? →', uniforms[3] === material.opacity); // false: subirá otra vez

// ✅ 1. Compara con el mismo redondeo: Math.fround(x) es «x pasado por float32».
console.log('✅ uniforms[3] === Math.fround(0.3) →', uniforms[3] === Math.fround(material.opacity));
// ✅ 2. O con una tolerancia a la medida de float32 (unas 7 cifras significativas).
const closeEnough = (a, b) => Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(a), Math.abs(b));
console.log('✅ closeEnough →', closeEnough(uniforms[3], material.opacity));
// ✅ 3. Para mostrarlo, redondea a 7 cifras significativas (lo que float32 garantiza).
console.log('✅ para mostrar →', Number(uniforms[3].toPrecision(7))); // 0.3

// Python: float es float64, como number. struct.unpack('f', struct.pack('f', 0.1))[0]
// → 0.10000000149011612, y float(numpy.float32(0.1)) da lo mismo.
```
