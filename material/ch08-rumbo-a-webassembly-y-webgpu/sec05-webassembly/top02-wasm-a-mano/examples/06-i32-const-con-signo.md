---
example_description: "🐛 El inmediato de i32.const es un LEB128 CON signo: escribir 64 como 41 40 devuelve -64, porque el bit 0x40 del último byte es el signo; 64 necesita dos bytes (41 c0 00). Tabla de constantes y un sleb() que las codifica bien"
example_tags: "javascript|webassembly|wasm|leb128|signo|i32-const|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// El máximo de entradas por pedido de una taquilla, escrito como constante:
//   (module (func (export "maxTickets") (result i32) i32.const 64))
const encoder = new TextEncoder();
function moduleReturning(constant) { // constant: los bytes del inmediato de i32.const
  const code = [0x41, ...constant, 0x0b]; // i32.const <inmediato>, end
  return new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
    0x01, 0x05, 0x01, 0x60, 0x00, 0x01, 0x7f,                         // tipo 0: () → i32
    0x03, 0x02, 0x01, 0x00,                                           // función 0: tipo 0
    0x07, 0x0e, 0x01, 0x0a, ...encoder.encode('maxTickets'), 0x00, 0x00,
    0x0a, code.length + 3, 0x01, code.length + 1, 0x00, ...code,      // los tamaños, calculados
  ]);
}

// 🐛 64 es 0x40, y parece que cabe en un byte… pero en LEB128 con signo el bit 0x40
//    del último byte es el signo, así que «40» solo significa -64.
// ✅ Para 64 hacen falta dos bytes: c0 (los 7 bits bajos, con «sigue») y 00.
for (const [label, constant] of [['🐛 41 40', [0x40]], ['✅ 41 c0 00', [0xc0, 0x00]]]) {
  const { instance } = await WebAssembly.instantiate(moduleReturning(constant));
  console.log(`${label} → maxTickets() = ${instance.exports.maxTickets()}`);
}

// LEB128 con signo: como el sin signo, pero se termina cuando lo que queda es todo
// ceros o todo unos Y el bit 0x40 del último byte ya dice el signo correcto.
function sleb(value) {
  const bytes = [];
  for (;;) {
    const byte = value & 0x7f;
    value >>= 7; // >> conserva el signo (lección «Bits y bytes»)
    const done = (value === 0 && (byte & 0x40) === 0) || (value === -1 && (byte & 0x40) !== 0);
    bytes.push(done ? byte : byte | 0x80);
    if (done) return bytes;
  }
}
const hex = (bytes) => bytes.map((byte) => byte.toString(16).padStart(2, '0')).join(' ');
console.log([63, 64, -1, -64, -65, 120, 128, 2026].map((n) => `${n} → ${hex(sleb(n))}`).join(' | '));

// Los tamaños, las cuentas y los índices usan LEB128 SIN signo, donde 64 sí es «40».
// Solo las constantes (i32.const, i64.const) llevan signo.
```
