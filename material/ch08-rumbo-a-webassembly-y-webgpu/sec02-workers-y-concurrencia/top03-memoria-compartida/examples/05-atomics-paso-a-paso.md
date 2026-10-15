---
example_description: "Las operaciones de Atomics sobre un Int32Array de memoria compartida, en un solo hilo: store y load, add y sub (que devuelven el valor anterior), exchange, compareExchange (solo escribe si el valor es el esperado) y and/or/xor para flags; solo con typed arrays de enteros"
example_tags: "javascript|atomics|sharedarraybuffer|compareexchange|concurrencia|bits"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Un pequeño «estado compartido» de una sala de conciertos, en memoria de WebAssembly:
// [0] entradas libres · [1] reservas · [2] flags de la sala · [3] versión del plano
const memory = new WebAssembly.Memory({ initial: 1, maximum: 1, shared: true });
const hall = new Int32Array(memory.buffer, 0, 4);
const FREE = 0;
const RESERVED = 1;
const FLAGS = 2;
const VERSION = 3;

// store y load: escribir y leer enteros de forma que ningún hilo vea medio valor.
console.log('store →', Atomics.store(hall, FREE, 120), '| load →', Atomics.load(hall, FREE));

// add y sub devuelven el valor ANTERIOR: quien los llama sabe qué había justo antes.
console.log('sub(4) devuelve →', Atomics.sub(hall, FREE, 4), '| ahora →', Atomics.load(hall, FREE));
console.log('add(4) devuelve →', Atomics.add(hall, RESERVED, 4), '| ahora →', Atomics.load(hall, RESERVED));

// exchange: escribe y devuelve lo que había.
console.log('exchange(7) devuelve →', Atomics.exchange(hall, VERSION, 7));

// compareExchange(vista, i, esperado, nuevo): escribe SOLO si el valor es el esperado.
// Devuelve el valor que había: si coincide con el esperado, la escritura se hizo.
console.log('compareExchange(7 → 8) devuelve →', Atomics.compareExchange(hall, VERSION, 7, 8), '| ahora →', Atomics.load(hall, VERSION));
console.log('compareExchange(7 → 9) devuelve →', Atomics.compareExchange(hall, VERSION, 7, 9), '| ahora →', Atomics.load(hall, VERSION));

// and, or y xor: flags (lección «Bits y bytes») que varios hilos pueden encender a la vez.
const SOLD_OUT = 0b001;
const DOORS_OPEN = 0b010;
Atomics.or(hall, FLAGS, DOORS_OPEN);
Atomics.or(hall, FLAGS, SOLD_OUT);
Atomics.and(hall, FLAGS, ~SOLD_OUT); // apaga «agotado»
console.log('flags →', Atomics.load(hall, FLAGS).toString(2).padStart(3, '0'));

// Atomics solo trabaja con typed arrays de ENTEROS.
try {
  Atomics.add(new Float32Array(memory.buffer, 16, 1), 0, 1);
} catch (error) {
  console.log(`${error.name}: ${error.message}`);
}
// Sin memoria compartida (un Int32Array normal) también funciona, pero no aporta nada:
// solo hay un hilo que pueda tocarlo.
```
