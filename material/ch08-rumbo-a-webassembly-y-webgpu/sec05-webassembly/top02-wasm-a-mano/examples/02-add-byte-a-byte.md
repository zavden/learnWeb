---
example_description: "El módulo add escrito byte a byte en un Uint8Array, con cada sección comentada (tipos, funciones, exportaciones, código); al llamarlo, i32 da la vuelta como | 0 y los argumentos pasan por ToInt32"
example_tags: "javascript|webassembly|wasm|bytes|secciones|i32|toint32|instantiate"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
//   (module
//     (func (export "add") (param i32 i32) (result i32)
//       local.get 0  local.get 1  i32.add))
const bytes = new Uint8Array([
  // cabecera: firma «\0asm» y versión 1
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
  // sección 1, TIPOS: 7 bytes · 1 tipo · func (0x60) · 2 parámetros: i32 i32 · 1 resultado: i32
  0x01, 0x07, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f,
  // sección 3, FUNCIONES: 2 bytes · 1 función · su tipo es el 0
  0x03, 0x02, 0x01, 0x00,
  // sección 7, EXPORTACIONES: 7 bytes · 1 exportación · nombre de 3 bytes «add» ·
  // es una función (0x00) · la número 0
  0x07, 0x07, 0x01, 0x03, 0x61, 0x64, 0x64, 0x00, 0x00,
  // sección 10, CÓDIGO: 9 bytes · 1 cuerpo · de 7 bytes · 0 grupos de variables locales
  0x0a, 0x09, 0x01, 0x07, 0x00,
  0x20, 0x00, // local.get 0   (el primer parámetro)
  0x20, 0x01, // local.get 1   (el segundo)
  0x6a,       // i32.add
  0x0b,       // end           (fin de la función: lo que quede en la pila es el resultado)
]);
console.log('bytes →', bytes.length, '| ¿válido? →', WebAssembly.validate(bytes));

// instantiate(bytes) compila e instancia de una vez, y devuelve las dos cosas.
const { module, instance } = await WebAssembly.instantiate(bytes);
console.log('¿Module e Instance? →', module instanceof WebAssembly.Module, instance instanceof WebAssembly.Instance);
const { add } = instance.exports;
console.log('add(2, 3) →', add(2, 3));

// Es una suma de i32 de verdad: al pasar de 2 ** 31 - 1, da la vuelta (como | 0).
console.log('add(2 ** 31 - 1, 1) →', add(2 ** 31 - 1, 1));
// Los argumentos se convierten con ToInt32 al entrar: 1.9 → 1 y '2' → 2.
console.log("add(1.9, '2') →", add(1.9, '2'));
// Como en cualquier función de JavaScript, los que sobran se ignoran y los que
// faltan llegan como undefined, que ToInt32 convierte en 0.
console.log('add(2, 3, 99) →', add(2, 3, 99), '| add(2) →', add(2));
```
