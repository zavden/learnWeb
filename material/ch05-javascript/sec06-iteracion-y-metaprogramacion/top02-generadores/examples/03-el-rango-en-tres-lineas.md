---
example_description: "El NumberRange de la lección «Polimorfismo y protocolos», con su iterador escrito a mano, frente al mismo rango con un método generador *[Symbol.iterator]() de tres líneas"
example_tags: "javascript|python|generadores|symbol-iterator|clases|iterables"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// ANTES (lección «Polimorfismo y protocolos»): el iterador escrito a mano.
class ManualRange {
  constructor(start, end, step = 1) {
    Object.assign(this, { start, end, step });
  }
  [Symbol.iterator]() {
    let current = this.start;
    const { end, step } = this;
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

// AHORA: un MÉTODO GENERADOR (asterisco delante del nombre). Cada llamada
// devuelve un generador nuevo, que ya es un iterador: el protocolo en 3 líneas.
class NumberRange {
  constructor(start, end, step = 1) {
    Object.assign(this, { start, end, step });
  }
  *[Symbol.iterator]() {
    for (let n = this.start; n <= this.end; n += this.step) yield n;
  }
}

const manual = new ManualRange(2, 10, 2);
const evens = new NumberRange(2, 10, 2);
console.log('a mano →', [...manual]);
console.log('generador →', [...evens]);
console.log('¿se recorre dos veces? →', [...evens].length, [...evens].length);

// Lo que el generador te da gratis y el iterador a mano no tenía:
const manualIt = manual[Symbol.iterator]();
const genIt = evens[Symbol.iterator]();
console.log('¿el iterador es iterable? →', typeof manualIt[Symbol.iterator], '|', genIt[Symbol.iterator]() === genIt);
console.log('¿tiene return()? →', typeof manualIt.return, '|', typeof genIt.return);
console.log('¿tiene helpers? →', typeof manualIt.map, '|', genIt.map((n) => n * 100).toArray());

// Las otras formas de escribir un generador:
const menu = {
  dishes: ['sopa de lima', 'cochinita pibil', 'marquesitas'],
  *[Symbol.iterator]() {                  // método generador en un literal
    for (const dish of this.dishes) yield `🍽️ ${dish}`;
  },
};
const shout = function* (words) {         // expresión de función generadora
  for (const word of words) yield word.toUpperCase();
};
console.log('literal →', [...menu]);
console.log('expresión →', [...shout(['hola', 'adiós'])]);
// (No existen las funciones flecha generadoras: «*() => {}» no es sintaxis válida.)

// > Desde Python: es el __iter__ con yield de toda la vida:
//   def __iter__(self):
//       n = self.start
//       while n <= self.end:
//           yield n
//           n += self.step
```
