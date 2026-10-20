---
example_description: "Un WebAssembly.Module es código compilado y sin estado; cada WebAssembly.Instance tiene el suyo: dos taquillas creadas del mismo módulo reparten sus turnos por separado, como dos objetos de una misma clase"
example_tags: "javascript|webassembly|wasm|module|instance|compile|global|python"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Un dispensador de turnos: una variable global del módulo y una función que la sube.
//   (module
//     (global $last (mut i32) (i32.const 0))       ;; el último turno repartido
//     (func (export "nextTicket") (result i32)
//       global.get $last  i32.const 1  i32.add  global.set $last
//       global.get $last))
const bytes = fromHex(`
  00 61 73 6d 01 00 00 00 01 05 01 60 00 01 7f 03 02 01 00 06 06 01 7f 01
  41 00 0b 07 0e 01 0a 6e 65 78 74 54 69 63 6b 65 74 00 00 0a 0d 01 0b 00
  23 00 41 01 6a 24 00 23 00 0b
`);

// 1. Compilar UNA vez: el resultado es un Module, código máquina sin estado.
const module = await WebAssembly.compile(bytes);
console.log('exporta →', WebAssembly.Module.exports(module).map((entry) => `${entry.name} (${entry.kind})`).join(', '));

// 2. Instanciar tantas veces como haga falta. Con un Module (en lugar de bytes),
//    instantiate() devuelve directamente la Instance.
const counterA = await WebAssembly.instantiate(module);
const counterB = await WebAssembly.instantiate(module);
console.log('¿son instancias? →', counterA instanceof WebAssembly.Instance, counterB instanceof WebAssembly.Instance);

// 3. Cada instancia tiene SU global $last: los turnos no se mezclan.
const ticketsA = [counterA.exports.nextTicket(), counterA.exports.nextTicket(), counterA.exports.nextTicket()];
console.log('taquilla A →', ticketsA.join(', '));
console.log('taquilla B →', counterB.exports.nextTicket());
console.log('¿la misma función? →', counterA.exports.nextTicket === counterB.exports.nextTicket);

function fromHex(text) {
  return Uint8Array.from(text.trim().split(/\s+/), (pair) => parseInt(pair, 16));
}

// Python: el Module es como una clase y cada Instance, un objeto con sus propios
// atributos. El código se compila una sola vez; el estado es de cada instancia.
```
