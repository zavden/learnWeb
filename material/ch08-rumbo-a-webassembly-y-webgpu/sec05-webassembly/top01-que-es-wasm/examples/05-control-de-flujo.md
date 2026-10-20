---
example_description: "Control de flujo estructurado: if/else que deja un valor en la pila (max) y un bucle con block, loop y br_if (sumTo), con un límite fijo de vueltas porque la guarda de bucles de LearnWeb no vigila WebAssembly"
example_tags: "javascript|webassembly|wasm|if|loop|block|br_if|control-de-flujo"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Dos funciones con control de flujo. En WebAssembly no hay «goto»: hay bloques que
// se abren y se cierran (block, loop, if … end) y saltos a uno de ellos (br, br_if).
//   (module
//     (func (export "max") (param $a i32) (param $b i32) (result i32)
//       local.get $a  local.get $b  i32.gt_s        ;; ¿a > b? deja 1 o 0 en la pila
//       if (result i32)                             ;; el if consume ese 1 o 0
//         local.get $a
//       else
//         local.get $b
//       end)
//     (func (export "sumTo") (param $n i32) (result i32) (local $i i32) (local $sum i32)
//       local.get $n  i32.const 10000  i32.gt_u     ;; límite fijo: como mucho 10000 vueltas
//       if  i32.const 10000  local.set $n  end
//       block                                       ;; etiqueta 1 (desde dentro del loop)
//         loop                                      ;; etiqueta 0
//           local.get $i  local.get $n  i32.ge_u
//           br_if 1                                 ;; i >= n → salta al FINAL del block
//           local.get $i  i32.const 1  i32.add  local.set $i
//           local.get $sum  local.get $i  i32.add  local.set $sum
//           br 0                                    ;; salta al PRINCIPIO del loop
//         end
//       end
//       local.get $sum))
const bytes = fromHex(`
  00 61 73 6d 01 00 00 00 01 0c 02 60 02 7f 7f 01 7f 60 01 7f 01 7f 03 03
  02 00 01 07 0f 02 03 6d 61 78 00 00 05 73 75 6d 54 6f 00 01 0a 45 02 0f
  00 20 00 20 01 4a 04 7f 20 00 05 20 01 0b 0b 33 01 02 7f 20 00 41 90 ce
  00 4b 04 40 41 90 ce 00 21 00 0b 02 40 03 40 20 01 20 00 4f 0d 01 20 01
  41 01 6a 21 01 20 02 20 01 6a 21 02 0c 00 0b 0b 20 02 0b
`);
const { instance } = await WebAssembly.instantiate(bytes);
const { max, sumTo } = instance.exports;

console.log('max(3, 8) →', max(3, 8), '| max(-5, -9) →', max(-5, -9));
console.log('sumTo(10) →', sumTo(10), '| sumTo(100) →', sumTo(100));
// Con un n enorme, el límite corta en 10000 vueltas: 1 + 2 + … + 10000.
console.log('sumTo(1e9) →', sumTo(1e9));

// ¿Por qué el límite? LearnWeb para los bucles infinitos de JavaScript, pero no ve
// dentro de WebAssembly: un bucle sin fin aquí congelaría la pestaña. Todos los bucles
// de este módulo tienen un número de vueltas acotado.

function fromHex(text) {
  return Uint8Array.from(text.trim().split(/\s+/), (pair) => parseInt(pair, 16));
}
```
