---
example_description: "Float16Array y Math.f16round (en Chrome): decimales de 16 bits con unas 3 cifras significativas, enteros exactos solo hasta 2048 y un máximo de 65504 (65520 ya es Infinity); la mitad de memoria que float32, buenos para colores y pesos de redes neuronales, no para posiciones"
example_tags: "javascript|python|float16array|f16round|precision|gpu|half-float"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// float16 («media precisión»): 1 bit de signo, 5 de exponente y 10 de mantisa.
// En Chrome desde 2025: Float16Array, Math.f16round y DataView getFloat16/setFloat16.
console.log('Math.f16round(0.1) →', Math.f16round(0.1));       // ~3 cifras correctas
console.log('Math.fround(0.1)   →', Math.fround(0.1));         // ~7 cifras

// Los límites llegan enseguida:
const halves = Float16Array.of(1 / 3, 2049, 65504, 65520, 1e-8);
console.log('Float16Array →', halves);
// 1/3 con 3 cifras · 2049 ya no cabe (enteros exactos solo hasta 2048)
// 65504 es el máximo · 65520 se redondea a Infinity · 1e-8 es demasiado pequeño: 0

// Para qué sirve: valores acotados donde 3 cifras bastan. Un color HDR en 4 canales
// ocupa 8 bytes en float16 y 16 en float32, y sigue siendo más fino que un byte:
const color = [0.92, 0.55, 0.13, 1];
const color16 = Float16Array.from(color);
console.log('color en float16 →', color16, '|', color16.byteLength, 'bytes');
console.log('→ bytes 0-255 →', Array.from(color16, (channel) => Math.round(channel * 255)));
console.log('= los mismos bytes que en float64 →', color.map((channel) => Math.round(channel * 255)));

// 🐛 Para posiciones, no: una coordenada de 1234.5 m en float16 pierde el medio metro.
console.log('1234.5 en float16 →', Math.f16round(1234.5)); // 1234

// Los pesos de las redes neuronales y las texturas HDR se guardan en float16; WebGPU
// puede calcular en f16 si la GPU lo admite (extensión «shader-f16»).
// Python: numpy.float16(0.1) → 0.1 en pantalla, 0.0999755859375 por dentro.
```
