---
example_description: "Un buffer circular de lecturas de un sensor: clase con campos privados, método generador values() como iterador, Symbol.toStringTag y Symbol.toPrimitive, y un Proxy que añade buffer[-1] enlazando los métodos al objetivo para no romper los #privados"
example_tags: "javascript|generadores|symbol|proxy|privados|colecciones|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// LAS ÚLTIMAS LECTURAS DE UN SENSOR DE HUMEDAD en un buffer circular: tamaño
// fijo, y cada lectura nueva sustituye a la más antigua.
// Lecciones: iterable con un método generador, símbolos bien conocidos y un
// Proxy (índices como los de Python) que respeta los #privados.
class RingBuffer {
  #items;
  #start = 0; // posición de la lectura más antigua
  #size = 0;

  constructor(capacity) {
    this.#items = new Array(capacity);
  }

  push(value) {
    const capacity = this.#items.length;
    this.#items[(this.#start + this.#size) % capacity] = value;
    if (this.#size < capacity) this.#size += 1;
    else this.#start = (this.#start + 1) % capacity; // se pisa la más antigua
    return this;
  }

  get size() {
    return this.#size;
  }

  at(index) {
    const i = index < 0 ? this.#size + index : index;
    if (i < 0 || i >= this.#size) return undefined;
    return this.#items[(this.#start + i) % this.#items.length];
  }

  *values() { // de la más antigua a la más reciente; el generador trae los helpers
    for (let i = 0; i < this.#size; i++) yield this.at(i);
  }

  [Symbol.iterator]() {
    return this.values();
  }

  [Symbol.toPrimitive](hint) { // número → la media; texto → un resumen
    const average = this.values().reduce((sum, v) => sum + v, 0) / this.#size;
    return hint === 'number' ? average : `${this.#size} lecturas, media ${average.toFixed(1)} %`;
  }

  get [Symbol.toStringTag]() {
    return 'RingBuffer';
  }
}

const humidity = new RingBuffer(5);
for (const reading of [61, 63, 64, 70, 68, 75, 73]) humidity.push(reading); // 7 lecturas, caben 5

console.log('en orden →', [...humidity]);
console.log('at(0), at(-1) →', humidity.at(0), humidity.at(-1));
console.log('plantilla →', `${humidity}`, '| ¿media ≥ 70? →', humidity >= 70);
console.log('subidas →', humidity.values().map((v, i) => (i === 0 ? '·' : v > humidity.at(i - 1) ? '↑' : '↓')).toArray().join(''));
console.log('etiqueta →', Object.prototype.toString.call(humidity));

// ── Índices como en Python: buffer[-1] con un Proxy ────────────────────────
function pythonIndexes(buffer) {
  return new Proxy(buffer, {
    get(target, key) {
      if (typeof key === 'string' && key !== '' && Number.isInteger(Number(key))) {
        return target.at(Number(key)); // '-1', '0', '2'… (las claves llegan como strings)
      }
      // Todo lo demás, leído y enlazado sobre el OBJETIVO: los métodos y getters
      // usan #privados, que el proxy no tiene (this debe ser el objetivo).
      const value = Reflect.get(target, key, target);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
}

const readings = pythonIndexes(humidity);
console.log('readings[-1], readings[0] →', readings[-1], readings[0]);
readings.push(81); // push llega enlazado al objetivo
console.log('tras push →', [...readings], '| size →', readings.size);
console.log('plantilla →', `${readings}`);

// Sin enlazar al objetivo, el getter size fallaría con el proxy como this:
const naive = new Proxy(humidity, {});
try {
  console.log(naive.size);
} catch (error) {
  console.log('🐛 proxy sin enlazar →', error.name, '|', error.message);
}
```
