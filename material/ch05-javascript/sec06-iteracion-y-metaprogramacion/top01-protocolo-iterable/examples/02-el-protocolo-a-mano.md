---
example_description: "El protocolo a mano: [Symbol.iterator]() da un iterador y cada next() devuelve { value, done }; un for…of reescrito con while; el iter()/next()/StopIteration de Python"
example_tags: "javascript|python|iteradores|protocolo|next|for-of"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
const steps = ['moler el café', 'calentar el agua', 'filtrar'];

// Paso 1: el ITERABLE entrega un ITERADOR (como iter(steps) en Python).
const iterator = steps[Symbol.iterator]();

// Paso 2: cada next() devuelve un objeto { value, done } (como next(it)).
console.log('1 →', iterator.next());
console.log('2 →', iterator.next());
console.log('3 →', iterator.next());
console.log('4 →', iterator.next()); // terminado: done es true
console.log('5 →', iterator.next()); // y así para siempre: no lanza ningún error

// Con un Map, cada value es un par [clave, valor]:
const prices = new Map([['tamal', 25], ['atole', 18]]);
console.log('Map →', prices[Symbol.iterator]().next());

// Lo que hace for…of por dentro, escrito con while:
function forOf(iterable, body) {
  const it = iterable[Symbol.iterator](); // un iterador NUEVO cada vez
  while (true) {
    const result = it.next();
    if (result.done) break;              // la señal de fin es un dato, no un error
    body(result.value);
  }
}

forOf('olé', (char) => console.log('letra →', char));
forOf(prices, ([dish, pesos]) => console.log('plato →', dish, pesos));

// next() no tiene valor por defecto como next(it, default) de Python: al
// terminar, value es undefined (o el valor del return, lección «Generadores»).
const empty = new Set()[Symbol.iterator]();
console.log('Set vacío →', empty.next().value ?? 'sin valor');

// > Desde Python:
//   it = iter(steps)        ← steps[Symbol.iterator]()
//   next(it)                ← it.next().value
//   raise StopIteration     ← { value: undefined, done: true }
//   Python avisa del final con una EXCEPCIÓN; JavaScript, con done: true.
```
