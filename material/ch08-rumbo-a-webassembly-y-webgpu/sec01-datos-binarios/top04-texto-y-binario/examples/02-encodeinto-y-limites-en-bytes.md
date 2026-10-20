---
example_description: "encodeInto escribe UTF-8 dentro de un Uint8Array que ya existe y devuelve { read, written }; si no cabe, corta entre caracteres, mientras que cortar los bytes con slice puede partir una «ñ» y dejar un �"
example_tags: "javascript|textencoder|encodeinto|utf-8|limites|bytes"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Un formato binario con un campo de nombre de 12 bytes fijos (como el registro
// de la lección «DataView y endianness»). El nombre ocupa más de 12 bytes en UTF-8:
const fullName = 'Andrés Núñez';
console.log('length →', fullName.length, '| bytes UTF-8 →', encoder.encode(fullName).length); // 12 | 15

// 🐛 Cortar los bytes a ciegas puede partir un carácter de 2 bytes por la mitad:
const cut = encoder.encode(fullName).slice(0, 12);
console.log('🐛 slice(0, 12) →', decoder.decode(cut)); // la «ñ» partida sale como �

// ✅ encodeInto(texto, destino) escribe en un Uint8Array que ya existe, solo
// caracteres completos, y dice cuánto leyó (en unidades UTF-16) y cuánto escribió.
const record = new Uint8Array(16);
const nameField = record.subarray(4, 16); // los bytes 4-15 del registro: 12 bytes
const { read, written } = encoder.encodeInto(fullName, nameField);
console.log('✅ encodeInto →', { read, written });
console.log('✅ guardado →', decoder.decode(nameField.subarray(0, written)));
console.log('se quedó fuera →', fullName.slice(read)); // read sirve para seguir en otro trozo

// Con un texto que cabe, el resto del campo queda a 0 (sin tocar):
const shortField = new Uint8Array(12);
console.log(encoder.encodeInto('Rosa', shortField), shortField);

// Para qué sirve: escribir texto directamente en una memoria que ya existe, sin crear
// un Uint8Array intermedio. Es como se pasan strings a WebAssembly (módulo «WebAssembly»).
```
