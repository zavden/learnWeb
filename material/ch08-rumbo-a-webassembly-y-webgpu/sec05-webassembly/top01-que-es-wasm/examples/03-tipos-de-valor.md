---
example_description: "Los cuatro tipos de valor de WebAssembly en la frontera con JavaScript: i32 trunca y da la vuelta como | 0 (y convierte textos con ToInt32), f32 redondea como Math.fround, f64 es un number e i64 llega como BigInt"
example_tags: "javascript|webassembly|wasm|i32|i64|f32|f64|bigint|tipos"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Cuatro funciones que devuelven lo que reciben. Lo interesante es lo que le pasa al
// valor al ENTRAR en WebAssembly, que solo tiene cuatro tipos de número:
//   (module
//     (func (export "i32") (param i32) (result i32) local.get 0)
//     (func (export "i64") (param i64) (result i64) local.get 0)
//     (func (export "f32") (param f32) (result f32) local.get 0)
//     (func (export "f64") (param f64) (result f64) local.get 0))
const bytes = fromHex(`
  00 61 73 6d 01 00 00 00 01 15 04 60 01 7f 01 7f 60 01 7e 01 7e 60 01 7d
  01 7d 60 01 7c 01 7c 03 05 04 00 01 02 03 07 19 04 03 69 33 32 00 00 03
  69 36 34 00 01 03 66 33 32 00 02 03 66 36 34 00 03 0a 15 04 04 00 20 00
  0b 04 00 20 00 0b 04 00 20 00 0b 04 00 20 00 0b
`);
const { instance } = await WebAssembly.instantiate(bytes);
const { i32, i64, f32, f64 } = instance.exports;

// i32: entero de 32 bits. JavaScript lo convierte como los operadores de bits (| 0):
// quita los decimales, se queda con los 32 bits de abajo y lee el bit 31 como signo.
console.log('i32(3.9) →', i32(3.9), '| i32(-3.9) →', i32(-3.9));
console.log('i32(2 ** 32 + 7) →', i32(2 ** 32 + 7), '| i32(2 ** 31) →', i32(2 ** 31));
console.log("i32('12') →", i32('12'), "| i32('doce') →", i32('doce'), '(NaN se convierte en 0)');

// f64: un decimal de 64 bits, el mismo formato que un number. Entra y sale intacto.
// f32: 32 bits; se redondea al float32 más cercano, como Math.fround (lección «Float32 y precisión»).
console.log('f64(0.1) →', f64(0.1), '| f32(0.1) →', f32(0.1));
console.log('f32(16777217) →', f32(16777217), '| f32(1e40) →', f32(1e40));

// i64: un entero de 64 bits no cabe en un number, así que viaja como BigInt.
// (Su trampa, pasarle un number, está en la lección siguiente.)
console.log('i64(10n) →', i64(10n), '| typeof →', typeof i64(10n));

function fromHex(text) {
  return Uint8Array.from(text.trim().split(/\s+/), (pair) => parseInt(pair, 16));
}

// Python: es como pasar argumentos a una función de C con ctypes: c_int32(2 ** 32 + 7)
// también da 7, y c_float(0.1).value da 0.10000000149011612.
```
