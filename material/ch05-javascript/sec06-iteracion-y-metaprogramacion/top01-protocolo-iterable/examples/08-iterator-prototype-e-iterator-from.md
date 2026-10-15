---
example_description: "Los iteradores nativos heredan de Iterator.prototype, que les da [Symbol.iterator]() y helpers como map y take; un iterador literal no, pero Iterator.from lo envuelve y una clase puede extender Iterator"
example_tags: "javascript|iteradores|iterator-from|iterator-helpers|herencia"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// Iterator es un global del navegador (Chrome 122+): la «clase base» abstracta
// de todos los iteradores nativos.
const nativeIterators = {
  'array.values()': ['a'].values(),
  'map.keys()': new Map().keys(),
  'set.entries()': new Set().entries(),
  'string': 'abc'[Symbol.iterator](),
};
for (const [name, it] of Object.entries(nativeIterators)) {
  console.log(`${name} instanceof Iterator →`, it instanceof Iterator);
}

// De Iterator.prototype heredan el [Symbol.iterator]() { return this } del
// ejemplo anterior y los HELPERS (map, filter, take…, lección «Generadores»).
const drinks = ['café', 'té', 'atole'].values();
console.log('helpers →', drinks.map((drink) => drink.toUpperCase()).toArray());

// Un iterador escrito como objeto literal no hereda nada de eso:
function ticketNumbers(count) {
  let issued = 0;
  return {
    next() {
      return issued < count ? { value: ++issued, done: false } : { value: undefined, done: true };
    },
  };
}
const handMade = ticketNumbers(3);
console.log('literal →', handMade instanceof Iterator, '| map →', typeof handMade.map);

// ✅ Iterator.from(x) lo envuelve en un iterador «de verdad» (acepta también
//    cualquier iterable: Iterator.from(new Set([…])).
console.log('Iterator.from →', Iterator.from(ticketNumbers(3)).map((n) => `T-${n}`).toArray());

// ✅ Una clase que extiende Iterator solo escribe next(): lo demás lo hereda.
class Countdown extends Iterator {
  #left;
  constructor(from) {
    super();
    this.#left = from;
  }
  next() {
    return this.#left > 0 ? { value: this.#left--, done: false } : { value: undefined, done: true };
  }
}
const launch = new Countdown(6);
console.log('¿iterable? →', launch[Symbol.iterator]() === launch);
console.log('impares →', launch.filter((n) => n % 2 === 1).toArray());

// Iterator es abstracta: solo sirve como base.
try {
  new Iterator();
} catch (error) {
  console.log('new Iterator() →', error.name, '|', error.message);
}
// (Por eso nunca llames Iterator a una clase tuya: taparías este global.)
```
