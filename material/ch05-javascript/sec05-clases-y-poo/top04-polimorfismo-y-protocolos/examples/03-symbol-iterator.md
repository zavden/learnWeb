---
example_description: "Un método [Symbol.iterator]() que devuelve un objeto con next() hace que una clase propia funcione con for…of, spread, desestructuración, Array.from y Set; el __iter__/__next__ de Python"
example_tags: "javascript|python|protocolos|symbol-iterator|iterables|for-of"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Una serie de números: de start a end (incluido), de step en step.
class NumberRange {
  constructor(start, end, step = 1) {
    this.start = start;
    this.end = end;
    this.step = step;
  }

  // El protocolo iterable: un método con la clave Symbol.iterator (entre
  // corchetes: un nombre calculado) que devuelve un ITERADOR nuevo.
  [Symbol.iterator]() {
    let current = this.start;
    const { end, step } = this;
    // El iterador: un objeto con next(), que devuelve { value, done }.
    return {
      next() {
        if (current > end) return { value: undefined, done: true };
        const value = current;
        current += step;
        return { value, done: false };
      },
    };
  }
}

const evens = new NumberRange(2, 10, 2);

for (const n of evens) console.log('for…of →', n);
console.log('spread →', [...evens]);              // se puede recorrer otra vez:
const [first, second, ...rest] = evens;            // cada uso pide un iterador nuevo
console.log('desestructuración →', first, second, rest);
console.log('Array.from →', Array.from(evens, (n) => n * 10));
console.log('Set →', new Set(evens), '| Math.max →', Math.max(...evens));

// Lo que hace for…of por dentro:
const iterator = evens[Symbol.iterator]();
console.log('next() →', iterator.next(), iterator.next());

// Sin Symbol.iterator, el objeto no es iterable:
const plainRange = { start: 1, end: 3 };
try {
  for (const n of plainRange) console.log(n);
} catch (error) {
  console.log('objeto normal →', error.name, '|', error.message);
}

// > Desde Python:
//   def __iter__(self): return RangeIterator(...)   ← [Symbol.iterator]()
//   def __next__(self): ... raise StopIteration       ← next() → { value, done }
//   En vez de una excepción para terminar, JavaScript devuelve { done: true }.
//   Con un generador (function*, módulo «Iteradores, generadores y
//   metaprogramación») este método se escribe en tres líneas, como con yield.
```
