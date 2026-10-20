---
example_description: "DataView lee y escribe cualquier tipo en cualquier posición de un búfer, sin alinear: un registro de 12 bytes de una estación meteorológica con un entero de 16 bits, un float32, dos bytes y una fecha de 32 bits"
example_tags: "javascript|python|dataview|struct|bytes|registro"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
const hex = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(' ');

// Una lectura de una estación meteorológica, en un formato binario de 12 bytes:
//   bytes 0-1   id de la estación      entero sin signo de 16 bits
//   bytes 2-5   temperatura (°C)       float32  ← empieza en el byte 2: sin alinear
//   byte  6     humedad (%)            entero sin signo de 8 bits
//   byte  7     ajuste del sensor      entero CON signo de 8 bits
//   bytes 8-11  fecha (s desde 1970)   entero sin signo de 32 bits
const buffer = new ArrayBuffer(12);
const view = new DataView(buffer);

// set<Tipo>(posición en bytes, valor, littleEndian). El tercer argumento: ejemplo siguiente.
view.setUint16(0, 517, true);
view.setFloat32(2, 21.5, true);
view.setUint8(6, 64);
view.setInt8(7, -3);
view.setUint32(8, 1791995400, true);
console.log('view →', view);
console.log('bytes →', hex(new Uint8Array(buffer)));

// get<Tipo>(posición, littleEndian) lee lo mismo de vuelta.
console.log('estación →', view.getUint16(0, true));
console.log('temperatura →', view.getFloat32(2, true));
console.log('humedad →', view.getUint8(6), '| ajuste →', view.getInt8(7));
console.log('el mismo byte 7 como Uint8 →', view.getUint8(7)); // 253: la vista elige cómo leer
console.log('fecha →', new Date(view.getUint32(8, true) * 1000).toISOString());

// Leer más allá del final lanza un RangeError (un typed array devolvería undefined).
try {
  view.getUint32(10, true); // necesita los bytes 10-13
} catch (error) {
  console.log('getUint32(10) →', error.name, '|', error.message);
}

// Python: struct.pack('<HfBbI', 517, 21.5, 64, -3, 1791995400) produce estos 12 bytes,
// y struct.unpack('<HfBbI', datos) los lee de vuelta.
```
