---
example_description: "Varias vistas sobre el mismo ArrayBuffer: un Float32Array, un Uint16Array y un Uint8Array leen los mismos 8 bytes; cambiar un byte cambia el decimal que lo contiene"
example_tags: "javascript|python|arraybuffer|typed-arrays|float32array|memoria"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Ayudante: los bytes de una vista en hexadecimal ('00 00 c0 3f').
const hex = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(' ');

// Un búfer de 8 bytes y tres vistas encima. Ninguna copia nada: las tres miran
// los MISMOS 8 bytes, cada una a su manera.
const buffer = new ArrayBuffer(8);
const floats = new Float32Array(buffer); // 2 casillas de 4 bytes
const words = new Uint16Array(buffer);   // 4 casillas de 2 bytes
const bytes = new Uint8Array(buffer);    // 8 casillas de 1 byte

floats[0] = 1.5;
floats[1] = -2;
console.log('floats →', floats);
console.log('bytes  →', hex(bytes)); // así se guarda un float32 (lección 5)
console.log('words  →', words);

//   byte:     0  1  2  3   4  5  6  7
//   bytes:   00 00 c0 3f  00 00 00 c0
//   words:   [  0][16320] [  0][49152]
//   floats:  [    1.5   ] [    -2    ]
// Fíjate en el orden: 1.5 es 0x3fc00000, pero sus bytes salen al revés
// (00 00 c0 3f). Es el orden «little-endian»: lección siguiente.

// Escribir en una vista cambia lo que leen las otras:
bytes[3] = 0x40; // 3f → 40 en el byte más alto del primer float
console.log('tras bytes[3] = 0x40 → floats[0] =', floats[0]); // 6
words[3] = 0x3f80; // los dos bytes de arriba del segundo float
console.log('tras words[3] = 0x3f80 → floats[1] =', floats[1]); // 1

// Python: memoryview(bytearray(8)).cast('f') es una vista de float32 sobre los mismos bytes.
```
