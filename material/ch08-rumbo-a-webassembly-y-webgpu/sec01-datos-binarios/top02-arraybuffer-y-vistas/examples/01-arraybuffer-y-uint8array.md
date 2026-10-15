---
example_description: "Un ArrayBuffer son bytes sin más (no se pueden leer directamente); un Uint8Array es una vista que los lee y escribe como números de 0 a 255, de tamaño fijo y con casi todos los métodos de array"
example_tags: "javascript|python|arraybuffer|uint8array|typed-arrays|bytes"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Un ArrayBuffer es un bloque de bytes en memoria, todos a 0, y nada más.
const buffer = new ArrayBuffer(8);
console.log('buffer →', buffer);                // ArrayBuffer(8)
console.log('byteLength →', buffer.byteLength); // 8
// No tiene índices: buffer[0] busca una propiedad «0» que no existe.
console.log('buffer[0] →', buffer[0]);          // undefined

// Para leer y escribir se pone una VISTA encima. Con Uint8Array, cada casilla
// es un byte sin signo (de 0 a 255).
const bytes = new Uint8Array(buffer);
bytes[0] = 72;   // en decimal…
bytes[1] = 0x69; // …o en hexadecimal: es el mismo byte
bytes[7] = 255;
console.log('bytes →', bytes);
console.log('¿misma memoria? →', bytes.buffer === buffer); // true: la vista no copia nada

// Atajos que crean su propio búfer: a ceros, desde valores o desde un array.
console.log('new Uint8Array(3) →', new Uint8Array(3));
console.log('Uint8Array.of(3, 1, 4) →', Uint8Array.of(3, 1, 4));
console.log('new Uint8Array([10, 20]) →', new Uint8Array([10, 20]));

// Tamaño fijo: no hay push ni pop, y escribir fuera del rango no hace nada (ni avisa).
const levels = Uint8Array.of(3, 1, 4, 1, 5);
levels[10] = 9;
console.log('length →', levels.length, '| levels[10] →', levels[10]); // 5 | undefined
console.log('typeof levels.push →', typeof levels.push);               // undefined
// Los métodos que no cambian el tamaño sí están: at, includes, indexOf, forEach, join…
console.log('at(-1) →', levels.at(-1), '| includes(4) →', levels.includes(4), '| join →', levels.join('-'));
// Pero no es un Array:
console.log('Array.isArray(levels) →', Array.isArray(levels)); // false

// Python: es un bytearray de tamaño fijo (bytearray(8) también empieza a ceros).
```
