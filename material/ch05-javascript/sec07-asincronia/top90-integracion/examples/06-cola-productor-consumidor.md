---
example_description: "Una cola asíncrona con capacidad: el camarero (productor) espera con await cuando la cola está llena, los dos cocineros (consumidores) la recorren con for await…of gracias a un generador asíncrono, y cerrar la cola termina sus bucles"
example_tags: "javascript|python|async|cola|productor-consumidor|generadores-asincronos|for-await"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const DONE = Symbol('cola cerrada');

// Una cola con capacidad máxima. put() espera si está llena (contrapresión);
// take() espera si está vacía; close() despierta a los que esperan.
class AsyncQueue {
  #items = [];
  #takers = [];  // consumidores esperando un elemento (sus resolve)
  #putters = []; // productores esperando hueco (sus resolve)
  #closed = false;
  maxLength = 0;
  fullWaits = 0;

  constructor(capacity) {
    this.capacity = capacity;
  }
  async put(item) {
    if (this.#closed) throw new Error('la cola está cerrada');
    while (this.#items.length >= this.capacity) {
      this.fullWaits += 1;
      await new Promise((resolve) => this.#putters.push(resolve)); // espera hueco
    }
    const taker = this.#takers.shift();
    if (taker) {
      taker(item); // alguien esperaba: se lo damos en mano
    } else {
      this.#items.push(item);
      this.maxLength = Math.max(this.maxLength, this.#items.length);
    }
  }
  take() {
    if (this.#items.length > 0) {
      const item = this.#items.shift();
      this.#putters.shift()?.(); // queda un hueco: despierta a un productor
      return Promise.resolve(item);
    }
    if (this.#closed) return Promise.resolve(DONE);
    return new Promise((resolve) => this.#takers.push(resolve));
  }
  close() {
    this.#closed = true;
    for (const taker of this.#takers.splice(0)) taker(DONE);
  }
  async *[Symbol.asyncIterator]() { // ← para recorrerla con for await…of
    while (true) {
      const item = await this.take();
      if (item === DONE) return;
      yield item;
    }
  }
}

// La cocina de una fonda: un camarero toma 8 comandas (una cada 15 ms) y dos
// cocineros tardan 50 ms en cada plato. La barra solo admite 2 comandas.
const DISHES = ['enchiladas', 'pozole', 'chilaquiles', 'tamales', 'sopes', 'mole', 'tlayuda', 'pambazo'];
const queue = new AsyncQueue(2);
const taken = [];
const cookedBy = { Rosa: 0, Toño: 0 };

async function waiter() {
  for (let n = 1; n <= DISHES.length; n++) {
    await wait(15);
    await queue.put({ id: `C-${n}`, dish: DISHES[n - 1] }); // espera si la barra está llena
  }
  queue.close(); // no habrá más comandas
}

async function cook(name) {
  for await (const order of queue) { // termina solo cuando la cola se cierra y se vacía
    taken.push(order.id);
    await wait(50);
    cookedBy[name] += 1;
  }
}

async function main() {
  await Promise.all([waiter(), cook('Rosa'), cook('Toño')]);
  console.log('platos cocinados →', taken.length, 'de', DISHES.length);
  console.log('en orden de llegada →', taken.join(' '));
  console.log('cada comanda una sola vez →', new Set(taken).size === DISHES.length);
  console.log('la barra nunca pasó de 2 →', queue.maxLength <= 2);
  console.log('el camarero tuvo que esperar a que hubiera hueco →', queue.fullWaits > 0);
  console.log('los dos cocineros trabajaron →', cookedBy.Rosa > 0 && cookedBy.Toño > 0);
  console.log('al cerrar la cola, los for await terminaron (si no, no veríamos esto)');
}
main();

// > Desde Python: es asyncio.Queue(maxsize=2): await queue.put() espera si
//   está llena y await queue.get() si está vacía. Python 3.13 añadió
//   queue.shutdown(), el close() de esta clase.
```
