---
example_description: "🐛 Añadir tres bytes a una función sin actualizar los tamaños: el error aparece lejos de su causa (culpa a una sección «Type» que no existe), con un solo tamaño cambiado «fell off end», y con la sección contada de más «extends past end of the module»; solo con los dos tamaños bien funciona"
example_tags: "javascript|webassembly|wasm|leb128|tamanos|compileerror|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// El módulo add del ejemplo 02. Queremos que devuelva a + b + 1: tres bytes más en el
// cuerpo, i32.const 1 (41 01) e i32.add (6a), justo antes del end.
const original = fromHex(`
  00 61 73 6d 01 00 00 00 01 07 01 60 02 7f 7f 01 7f 03 02 01 00 07 07 01
  03 61 64 64 00 00 0a 09 01 07 00 20 00 20 01 6a 0b
`);
// Posiciones de los dos tamaños afectados (míralas en el volcado del ejemplo 03):
const CODE_SECTION_SIZE = 31; // 0a [09] …: el tamaño de la sección de código
const BODY_SIZE = 33;         // 0a 09 01 [07] …: el tamaño del cuerpo de la función
function plusOne(bodySize, sectionSize) {
  const bytes = [...original.subarray(0, 40), 0x41, 0x01, 0x6a, 0x0b]; // 40: donde estaba el end
  bytes[CODE_SECTION_SIZE] = sectionSize;
  bytes[BODY_SIZE] = bodySize;
  return new Uint8Array(bytes);
}

const attempts = [
  // 🐛 Los tamaños siguen diciendo 9 y 7: la sección de código «termina» antes de tiempo,
  //    y los bytes que sobran (01 6a 0b) se leen como OTRA sección: id 1, tamaño 0x6a = 106.
  ['🐛 sin tocar los tamaños', plusOne(0x07, 0x09)],
  // 🐛 El cuerpo dice 10, pero la sección sigue midiendo 9: el cuerpo no cabe en ella.
  ['🐛 solo el del cuerpo', plusOne(0x0a, 0x09)],
  // 🐛 La sección tiene 12 bytes (1 de cuenta + 1 de tamaño + 10 de cuerpo); contar uno
  //    de más es pedir un byte que no existe.
  ['🐛 la sección, uno de más', plusOne(0x0a, 0x0d)],
  ['✅ cuerpo 10 y sección 12', plusOne(0x0a, 0x0c)],
];
for (const [label, bytes] of attempts) {
  try {
    const module = await WebAssembly.compile(bytes);
    console.log(`${label} → add(2, 3) = ${new WebAssembly.Instance(module).exports.add(2, 3)}`);
  } catch (error) {
    console.log(`${label} → ${error.name}: ${error.message}`);
  }
}

function fromHex(text) {
  return Uint8Array.from(text.trim().split(/\s+/), (pair) => parseInt(pair, 16));
}

// La lección: un tamaño mal contado no falla donde está el error, sino donde el lector
// se pierde. No los cuentes a mano: el ejemplo siguiente los calcula.
```
