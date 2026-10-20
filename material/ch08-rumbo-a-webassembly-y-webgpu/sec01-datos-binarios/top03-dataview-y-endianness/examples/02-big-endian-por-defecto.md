---
example_description: "DataView lee y escribe en big-endian si no le pasas el tercer argumento, mientras que los typed arrays usan el orden de la máquina (little-endian en todos los equipos actuales): los mismos bytes dan otro número"
example_tags: "javascript|python|dataview|endianness|little-endian|big-endian|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
const hex = (bytes) => Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join(' ');

// Un número de varios bytes se puede guardar en dos órdenes:
//   0x12345678 en big-endian:    12 34 56 78  (el byte «grande» primero, como lo escribimos)
//   0x12345678 en little-endian: 78 56 34 12  (el byte «pequeño» primero)

// Los typed arrays usan el orden de la máquina. Una prueba de dos bytes lo descubre:
const probe = new Uint8Array(new Uint16Array([1]).buffer);
console.log('Uint16Array [1] en bytes →', hex(probe), probe[0] === 1 ? '→ little-endian' : '→ big-endian');

const buffer = new ArrayBuffer(4);
const asUint32 = new Uint32Array(buffer);
const view = new DataView(buffer);

asUint32[0] = 0x12345678;
console.log('Uint32Array escribe →', hex(new Uint8Array(buffer))); // 78 56 34 12

// 🐛 DataView SIN tercer argumento lee en BIG-endian: los mismos bytes, otro número.
console.log('🐛 getUint32(0) →', view.getUint32(0).toString(16));        // 78563412
console.log('✅ getUint32(0, true) →', view.getUint32(0, true).toString(16)); // 12345678

// 🐛 Y al revés: DataView escribe en big-endian y el typed array lee en little-endian.
view.setUint16(0, 2026);
console.log('🐛 setUint16(0, 2026) → bytes', hex(new Uint8Array(buffer, 0, 2)), '→ Uint16Array lee', new Uint16Array(buffer)[0]);
view.setUint16(0, 2026, true);
console.log('✅ setUint16(0, 2026, true) → bytes', hex(new Uint8Array(buffer, 0, 2)), '→ Uint16Array lee', new Uint16Array(buffer)[0]);

// Regla: con DataView, escribe SIEMPRE el tercer argumento, aunque sea false:
// true = little-endian (BMP, WAV, ZIP, WebAssembly, búferes de la GPU)
// false = big-endian («orden de red»: PNG, JPEG, protocolos de red)
// Python: struct.unpack('<I', datos) es little-endian; '>I' (o '!I'), big-endian.
```
