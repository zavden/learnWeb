---
example_description: "Las secciones de globales (6) y de inicio (8): una global mutable exportada llega a JavaScript como WebAssembly.Global, con su .value que se lee y se cambia desde los dos lados; la función de inicio se ejecuta sola al instanciar"
example_tags: "javascript|webassembly|wasm|global|start|secciones|bytes"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// Las existencias de un producto de la tienda:
//   (module
//     (global $stock (export "stock") (mut i32) (i32.const 0))
//     (func $restock  i32.const 120  global.set $stock)     ;; función 0
//     (func (export "sell") (param $units i32) (result i32) ;; función 1
//       global.get $stock  local.get $units  i32.sub  global.set $stock
//       global.get $stock)
//     (start $restock))                                     ;; se ejecuta al instanciar
const bytes = new Uint8Array([
  0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00,
  0x01, 0x09, 0x02, 0x60, 0x00, 0x00, 0x60, 0x01, 0x7f, 0x01, 0x7f,   // tipos: () → () y (i32) → i32
  0x03, 0x03, 0x02, 0x00, 0x01,                                       // funciones: tipo 0, tipo 1
  // sección 6, GLOBALES: 1 global · i32 · mutable (01) · valor inicial: i32.const 0, end
  0x06, 0x06, 0x01, 0x7f, 0x01, 0x41, 0x00, 0x0b,
  // sección 7: «stock» → global (03) 0 · «sell» → función (00) 1
  0x07, 0x10, 0x02, 0x05, 0x73, 0x74, 0x6f, 0x63, 0x6b, 0x03, 0x00, 0x04, 0x73, 0x65, 0x6c, 0x6c, 0x00, 0x01,
  // sección 8, INICIO: 1 byte · la función 0
  0x08, 0x01, 0x00,
  0x0a, 0x15, 0x02,
  0x07, 0x00, 0x41, 0xf8, 0x00, 0x24, 0x00, 0x0b,                     // i32.const 120 (f8 00: ¡120 > 63!), global.set 0
  0x0b, 0x00, 0x23, 0x00, 0x20, 0x00, 0x6b, 0x24, 0x00, 0x23, 0x00, 0x0b, // global.get 0, local.get 0, i32.sub…
]);
const { instance } = await WebAssembly.instantiate(bytes);
const { stock, sell } = instance.exports;

// Una global exportada no es un número: es un objeto con la propiedad value.
console.log('¿WebAssembly.Global? →', stock instanceof WebAssembly.Global, '| typeof →', typeof stock);
// Vale 120 aunque su valor inicial era 0: la función de inicio ya se ejecutó.
console.log('stock.value al instanciar →', stock.value);
console.log('sell(5) →', sell(5), '| stock.value →', stock.value);
// Al ser mutable, JavaScript también puede cambiarla, y WebAssembly ve el cambio.
stock.value = 200;
console.log('tras stock.value = 200 → sell(1) →', sell(1));
```
