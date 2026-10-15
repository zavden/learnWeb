---
example_description: "En Chrome, la memoria compartida de WebAssembly se puede crear aunque la página no esté aislada, y su búfer es un SharedArrayBuffer de verdad: se usa con vistas y con Atomics como cualquier búfer, pero no se transfiere ni se desconecta nunca"
example_tags: "javascript|sharedarraybuffer|atomics|webassembly|memoria|typed-arrays"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// No hay constructor global SharedArrayBuffer… pero en Chrome la memoria «compartible»
// de WebAssembly (módulo «WebAssembly») sí se puede crear, y su búfer ES uno.
// initial y maximum se cuentan en PÁGINAS de WebAssembly, de 64 KiB cada una.
const memory = new WebAssembly.Memory({ initial: 1, maximum: 1, shared: true });
const shared = memory.buffer;
console.log('tipo →', Object.prototype.toString.call(shared));
console.log('byteLength →', shared.byteLength, '(una página de 64 KiB)');

// Se lee y se escribe con vistas, como un ArrayBuffer (lección «ArrayBuffer y vistas»)…
const counters = new Int32Array(shared);
const bytes = new Uint8Array(shared);
counters[0] = 258; // 0x00000102
console.log('bytes[0], bytes[1] →', bytes[0], bytes[1], '(little-endian)');

// …y con Atomics: operaciones que ningún otro hilo puede partir por la mitad.
console.log('Atomics.add(counters, 0, 10) devuelve el valor ANTERIOR →', Atomics.add(counters, 0, 10));
console.log('Atomics.load(counters, 0) →', Atomics.load(counters, 0));

// La diferencia con un ArrayBuffer: un búfer compartido no se mueve ni se desconecta.
// Si dos hilos lo tienen, los dos ven LOS MISMOS bytes a la vez.
console.log('typeof shared.transfer →', typeof shared.transfer);
console.log('¿tiene la propiedad detached? →', 'detached' in shared);

// Aquí solo lo usa un hilo: el ejemplo siguiente muestra qué pasa al intentar compartirlo.
```
