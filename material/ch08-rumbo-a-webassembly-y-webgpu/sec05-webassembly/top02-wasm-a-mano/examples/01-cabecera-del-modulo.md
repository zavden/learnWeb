---
example_description: "El módulo más pequeño son 8 bytes: la firma «\\0asm» y la versión 1 en little-endian; se instancia y no exporta nada. Una firma o una versión equivocadas, un archivo cortado o un PNG dan CompileError con la posición del fallo (@+0, @+4…)"
example_tags: "javascript|webassembly|wasm|cabecera|bytes|compileerror|validate"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// El módulo más pequeño que existe: solo la cabecera.
const header = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, // la firma: un byte 0 y «asm» en ASCII
  0x01, 0x00, 0x00, 0x00, // la versión 1, un uint32 little-endian
]);
console.log('bytes →', header.length, '| ¿válido? →', WebAssembly.validate(header));

// Es un módulo vacío, pero es un módulo: se instancia y no exporta nada.
const { instance } = await WebAssembly.instantiate(header);
console.log('exportaciones →', Object.keys(instance.exports));

// Cuatro archivos que no son un módulo. El error dice qué esperaba, qué encontró
// y en qué byte se dio cuenta (detrás de «@+»).
const broken = [
  ['firma equivocada', [0x00, 0x01, 0x02, 0x03, 0x01, 0x00, 0x00, 0x00]],
  ['versión 2', [0x00, 0x61, 0x73, 0x6d, 0x02, 0x00, 0x00, 0x00]],
  ['cortado', [0x00, 0x61, 0x73, 0x6d, 0x01]],
  ['un PNG', [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]],
];
console.log('validate() de los cuatro →', broken.map(([, list]) => WebAssembly.validate(new Uint8Array(list))).join(' '));
for (const [label, list] of broken) {
  try {
    await WebAssembly.compile(new Uint8Array(list));
  } catch (error) {
    console.log(`${label} → ${error.name}: ${error.message}`);
  }
}

// Python: es la comprobación que harías con
//   data[:4] == b'\0asm' and int.from_bytes(data[4:8], 'little') == 1
```
