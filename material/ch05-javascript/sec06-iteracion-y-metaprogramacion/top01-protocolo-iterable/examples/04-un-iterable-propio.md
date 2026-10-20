---
example_description: "Una cola de pedidos hecha con una lista enlazada se vuelve iterable con [Symbol.iterator](): cada recorrido pide un iterador nuevo que empieza por la cabeza"
example_tags: "javascript|python|iterables|clases|lista-enlazada|symbol-iterator"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Cola de pedidos de una cafetería como LISTA ENLAZADA: cada nodo guarda un
// pedido y apunta al siguiente. Sin índices, el protocolo iterable es la
// forma natural de recorrerla.
class OrderQueue {
  #head = null;
  #tail = null;
  #size = 0;

  enqueue(order) {
    const node = { order, following: null };
    if (this.#tail) this.#tail.following = node;
    else this.#head = node;
    this.#tail = node;
    this.#size += 1;
    return this;
  }

  dequeue() {
    if (!this.#head) return undefined;
    const { order } = this.#head;
    this.#head = this.#head.following;
    if (!this.#head) this.#tail = null;
    this.#size -= 1;
    return order;
  }

  get size() {
    return this.#size;
  }

  // Cada llamada crea un iterador NUEVO con su propio cursor, que empieza en la
  // cabeza. (Dentro de next(), this es el iterador: por eso se copia la cabeza
  // a una variable antes.)
  [Symbol.iterator]() {
    let node = this.#head;
    return {
      next() {
        if (node === null) return { value: undefined, done: true };
        const { order } = node;
        node = node.following;
        return { value: order, done: false };
      },
    };
  }
}

const queue = new OrderQueue()
  .enqueue({ table: 4, drink: 'café de olla' })
  .enqueue({ table: 2, drink: 'chocolate' })
  .enqueue({ table: 7, drink: 'horchata' });

for (const { table, drink } of queue) console.log(`mesa ${table} → ${drink}`);
console.log('mesas →', Array.from(queue, (order) => order.table));
const [next, ...waiting] = queue;
console.log('siguiente →', next.drink, '| esperan →', waiting.length);

// Recorrer NO consume la cola: cada for…of empezó desde la cabeza.
console.log('size →', queue.size, '| otra vez →', [...queue].map((o) => o.drink).join(', '));

// dequeue sí la consume:
console.log('sale →', queue.dequeue().drink, '| quedan →', [...queue].map((o) => o.drink));

// > Desde Python: en Python escribirías __iter__ que devuelve un objeto con
//   __next__ (o, mejor, un generador: la lección siguiente acorta este método).
```
