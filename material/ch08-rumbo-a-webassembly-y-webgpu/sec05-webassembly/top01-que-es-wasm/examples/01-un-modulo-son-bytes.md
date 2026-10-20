---
example_description: "Un módulo de WebAssembly entero son 41 bytes en un Uint8Array: la firma «\\0asm», la versión, WebAssembly.validate, WebAssembly.instantiate y la llamada a la función exportada add(2, 3)"
example_tags: "javascript|webassembly|wasm|bytes|instantiate|validate|wat"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Un módulo de WebAssembly es un archivo binario: estos 41 bytes son uno entero.
// En el formato de texto (WAT), el mismo módulo se lee así:
//   (module
//     (func (export "add") (param i32 i32) (result i32)
//       local.get 0
//       local.get 1
//       i32.add))
// La lección «WebAssembly a mano» los explica uno a uno; aquí basta con saber qué son.
const bytes = fromHex(`
  00 61 73 6d 01 00 00 00 01 07 01 60 02 7f 7f 01 7f 03 02 01 00 07 07 01
  03 61 64 64 00 00 0a 09 01 07 00 20 00 20 01 6a 0b
`);
console.log('bytes →', bytes.length);

// Los 4 primeros son la firma de todo archivo .wasm: un byte 0 y las letras «asm».
console.log('firma →', JSON.stringify(String.fromCharCode(...bytes.subarray(0, 4))));
// Los 4 siguientes, la versión del formato: un uint32 little-endian (lección «DataView y endianness»).
console.log('versión →', new DataView(bytes.buffer).getUint32(4, true));

// El navegador comprueba que el módulo es válido antes de ejecutar nada…
console.log('¿válido? →', WebAssembly.validate(bytes));
// …lo compila a código máquina y crea una instancia: el módulo listo para usar.
const { module, instance } = await WebAssembly.instantiate(bytes);
const { add } = instance.exports;
console.log('exporta →', WebAssembly.Module.exports(module).map((entry) => `${entry.name} (${entry.kind})`).join(', '));
console.log('typeof add →', typeof add);
console.log('add(2, 3) →', add(2, 3));

// Convierte '00 61 73 …' en bytes: cada pareja de cifras hexadecimales es un byte.
function fromHex(text) {
  return Uint8Array.from(text.trim().split(/\s+/), (pair) => parseInt(pair, 16));
}
```
