---
example_description: "El navegador valida el módulo entero antes de ejecutarlo: una función que promete un f64 y deja un i32, o un i32.add con un solo operando, dan CompileError con la posición del byte; validate() responde sin lanzar"
example_tags: "javascript|webassembly|wasm|validacion|compileerror|tipos|seguridad"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Tres versiones de una función. El navegador comprueba los TIPOS de cada instrucción
// antes de ejecutar nada: si algo no cuadra, el módulo no se compila.
const versions = [
  // 1. Promete un f64 y deja un i32 en la pila:
  //   (func (export "total") (param i32 i32) (result f64)
  //     local.get 0  local.get 1  i32.add)
  ['promete f64 y deja i32', `
    00 61 73 6d 01 00 00 00 01 07 01 60 02 7f 7f 01 7c 03 02 01 00 07 09 01
    05 74 6f 74 61 6c 00 00 0a 09 01 07 00 20 00 20 01 6a 0b`],
  // 2. i32.add necesita dos operandos en la pila, y solo hay uno:
  //   (func (export "add") (param i32 i32) (result i32)
  //     local.get 0  i32.add)
  ['a i32.add le falta un operando', `
    00 61 73 6d 01 00 00 00 01 07 01 60 02 7f 7f 01 7f 03 02 01 00 07 07 01
    03 61 64 64 00 00 0a 07 01 05 00 20 00 6a 0b`],
  // 3. ✅ Convierte la suma a f64 antes de devolverla (f64.convert_i32_s, el byte b7):
  //   (func (export "total") (param i32 i32) (result f64)
  //     local.get 0  local.get 1  i32.add  f64.convert_i32_s)
  ['✅ con f64.convert_i32_s', `
    00 61 73 6d 01 00 00 00 01 07 01 60 02 7f 7f 01 7c 03 02 01 00 07 09 01
    05 74 6f 74 61 6c 00 00 0a 0a 01 08 00 20 00 20 01 6a b7 0b`],
];

for (const [label, hexText] of versions) {
  const bytes = fromHex(hexText);
  // validate() solo responde true o false; no dice por qué.
  console.log(`${label} → ¿válido? ${WebAssembly.validate(bytes)}`);
  try {
    const module = await WebAssembly.compile(bytes);
    const { total } = new WebAssembly.Instance(module).exports;
    console.log('total(2, 3) →', total(2, 3));
  } catch (error) {
    // compile() sí lo dice, con la posición del byte culpable detrás de «@+».
    console.log(`${error.name}: ${error.message}`);
  }
}

function fromHex(text) {
  return Uint8Array.from(text.trim().split(/\s+/), (pair) => parseInt(pair, 16));
}

// En JavaScript, un fallo así aparecería al ejecutar esa línea (o nunca). En
// WebAssembly no llega a ejecutarse ninguna instrucción de un módulo inválido.
```
