---
example_description: "Un iterador con solo next() no entra en un for…of; con [Symbol.iterator]() { return this } sí. Así son los iteradores nativos, y por eso se puede escribir for (x of map.entries())"
example_tags: "javascript|python|iteradores|iterables|symbol-iterator"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Un iterador escrito a mano: un objeto con next().
function countdown(from) {
  let current = from;
  return {
    next() {
      return current > 0 ? { value: current--, done: false } : { value: undefined, done: true };
    },
  };
}

const plain = countdown(3);
console.log('next() funciona →', plain.next().value, plain.next().value);

// 🤔 Pero for…of no recibe iteradores: recibe ITERABLES (pide [Symbol.iterator]).
try {
  for (const n of countdown(3)) console.log(n);
} catch (error) {
  console.log('for…of →', error.name, '|', error.message);
}

// El truco estándar: el iterador también es iterable y se devuelve a sí mismo.
function iterableCountdown(from) {
  let current = from;
  return {
    next() {
      return current > 0 ? { value: current--, done: false } : { value: undefined, done: true };
    },
    [Symbol.iterator]() {
      return this; // «yo mismo soy mi iterador»
    },
  };
}

for (const n of iterableCountdown(3)) console.log('despegue en →', n);
console.log('spread →', [...iterableCountdown(5)]);

// Los iteradores nativos (map.entries(), array.values(), set.values()…) son así:
const flavors = new Set(['nuez', 'mamey', 'guanábana']);
const it = flavors.values();
console.log('iterador: it[Symbol.iterator]() === it →', it[Symbol.iterator]() === it);
console.log(
  'iterable: flavors[Symbol.iterator]() === flavors[Symbol.iterator]() →',
  flavors[Symbol.iterator]() === flavors[Symbol.iterator](),
);

// Por eso se puede recorrer el iterable o un iterador suyo:
for (const [i, flavor] of [...flavors].entries()) console.log(`${i + 1}. ${flavor}`);

// > Desde Python: igual. Un iterador de Python debe tener __iter__ que devuelve
//   self (iter(it) is it), y por eso puedes hacer for x in iter(lista).
```
