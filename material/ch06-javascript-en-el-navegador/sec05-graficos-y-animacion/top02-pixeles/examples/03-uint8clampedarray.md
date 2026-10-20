---
example_description: "ImageData.data es un Uint8ClampedArray: guarda enteros de 0 a 255 y, al asignar, redondea (los empates, al par) y satura en los extremos. Un Uint8Array, en cambio, trunca y «da la vuelta»: 300 se guarda como 44 y el rojo brillante se vuelve oscuro"
example_tags: "javascript|uint8clampedarray|typed-arrays|pixeles|saturacion"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Arrays tipados: una lista de números de UN tipo fijo, en memoria contigua (capítulo 8).
const values = [1.5, 2.5, 0.5, 254.5, 300, -3];
console.log('valores →', values.join(', '));
console.log('Uint8ClampedArray →', Array.from(new Uint8ClampedArray(values)).join(', '));
console.log('Uint8Array →', Array.from(new Uint8Array(values)).join(', '));

// Clamped («con tope»): por encima de 255 se queda en 255; por debajo de 0, en 0.
// Los decimales se redondean, y los empates (x.5) van al par: 0.5 → 0, 1.5 → 2, 2.5 → 2.
// Uint8Array descarta los decimales y se queda con el resto de dividir entre 256: 300 → 44, -3 → 253.

// Por qué importa: subir el brillo de un rojo (#e11d48) sumando 60 a cada canal
const red = [225, 29, 72];
const brighter = red.map((v) => v + 60);
console.log('Array normal →', brighter.join(', '), '(285 no cabe en un byte)');
console.log('Uint8ClampedArray →', Array.from(Uint8ClampedArray.from(brighter)).join(', '), '✅ el rojo se satura');
console.log('Uint8Array →', Array.from(Uint8Array.from(brighter)).join(', '), '🐛 285 da la vuelta a 29: el rojo se vuelve azul oscuro');

// En un ImageData no hace falta Math.min ni Math.round: data[i] += 60 ya satura.
const pixel = new Uint8ClampedArray([225, 29, 72, 255]);
pixel[0] += 60;
pixel[1] -= 40;
console.log('data[0] += 60 y data[1] -= 40 →', Array.from(pixel).join(', '));
```
