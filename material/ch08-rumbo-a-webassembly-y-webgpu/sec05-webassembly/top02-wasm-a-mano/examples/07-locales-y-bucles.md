---
example_description: "Una función con una variable local y un bucle, byte a byte: la declaración de locales (01 01 7f), block/loop con su tipo de bloque (40), br_if, br y end; suma las cifras de un número en como mucho 10 vueltas"
example_tags: "javascript|webassembly|wasm|locales|loop|br_if|opcodes|bytes"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// La suma de las cifras de un número (para un dígito de control, por ejemplo):
//   (func (export "digitSum") (param $n i32) (result i32) (local $sum i32)
//     block
//       loop
//         local.get $n  i32.eqz  br_if 1                    ;; n == 0 → salir del block
//         local.get $sum  local.get $n  i32.const 10  i32.rem_u  i32.add  local.set $sum
//         local.get $n  i32.const 10  i32.div_u  local.set $n
//         br 0                                              ;; otra vuelta
//       end
//     end
//     local.get $sum)
// Siempre termina: cada vuelta divide n entre 10, y un i32 tiene como mucho 10 cifras.
const bytes = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
  0x01, 0x06, 0x01, 0x60, 0x01, 0x7f, 0x01, 0x7f,        // tipo 0: (i32) → i32
  0x03, 0x02, 0x01, 0x00,                                // función 0: tipo 0
  0x07, 0x0c, 0x01, 0x08, 0x64, 0x69, 0x67, 0x69, 0x74, 0x53, 0x75, 0x6d, 0x00, 0x00, // «digitSum»
  0x0a, 0x26, 0x01, 0x24,                                // código: 38 bytes · 1 cuerpo de 36
  0x01, 0x01, 0x7f,       // locales: 1 grupo · de 1 variable · i32 → es la local 1 ($sum);
                          // la 0 es el parámetro $n: los parámetros van primero
  0x02, 0x40,             // block, sin resultado (40 = «vacío»)
  0x03, 0x40,             //   loop, sin resultado
  0x20, 0x00,             //     local.get 0
  0x45,                   //     i32.eqz           (¿es 0? deja 1 o 0)
  0x0d, 0x01,             //     br_if 1           (sí → al final del block)
  0x20, 0x01,             //     local.get 1
  0x20, 0x00,             //     local.get 0
  0x41, 0x0a,             //     i32.const 10
  0x70,                   //     i32.rem_u         (la última cifra)
  0x6a,                   //     i32.add
  0x21, 0x01,             //     local.set 1
  0x20, 0x00,             //     local.get 0
  0x41, 0x0a,             //     i32.const 10
  0x6e,                   //     i32.div_u         (quitar la última cifra)
  0x21, 0x00,             //     local.set 0       (un parámetro también se puede cambiar)
  0x0c, 0x00,             //     br 0              (al principio del loop)
  0x0b,                   //   end (del loop)
  0x0b,                   // end (del block)
  0x20, 0x01,             // local.get 1           (el resultado)
  0x0b,                   // end (de la función)
]);
const { instance } = await WebAssembly.instantiate(bytes);
const { digitSum } = instance.exports;
console.log('digitSum(2026) →', digitSum(2026));
console.log('digitSum(20261020) →', digitSum(20261020));
// i32.div_u y rem_u leen los bits SIN signo: -1 es 4294967295 (4+2+9+4+9+6+7+2+9+5).
console.log('digitSum(-1) →', digitSum(-1));
```
