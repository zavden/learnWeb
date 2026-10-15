---
example_description: "Los símbolos bien conocidos son las claves con las que el lenguaje busca los protocolos: los nativos los usan (Array, Map, Date) y una clase propia se recorre, se convierte y se etiqueta con Symbol.iterator, Symbol.toPrimitive y Symbol.toStringTag"
example_tags: "javascript|python|symbol|protocolos|symbol-iterator|symbol-toprimitive|dunder"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Los símbolos bien conocidos son propiedades de la función Symbol.
const wellKnown = Object.getOwnPropertyNames(Symbol)
  .filter((name) => typeof Symbol[name] === 'symbol')
  .sort();
console.log(`${wellKnown.length} símbolos bien conocidos →`, wellKnown.join(', '));

// Los NATIVOS implementan sus protocolos con ellos, como tus clases:
console.log('Array.prototype[Symbol.iterator] === values →', Array.prototype[Symbol.iterator] === Array.prototype.values);
console.log('Map.prototype[Symbol.toStringTag] →', Map.prototype[Symbol.toStringTag]);
console.log('Date.prototype[Symbol.toPrimitive] →', typeof Date.prototype[Symbol.toPrimitive]);
console.log('Function.prototype[Symbol.hasInstance] →', typeof Function.prototype[Symbol.hasInstance]);
console.log('Array[Symbol.species] === Array →', Array[Symbol.species] === Array); // lección «Herencia con extends»

// Una clase propia que habla tres protocolos: el horario de una consulta médica.
class Timetable {
  #slots;
  constructor(doctor, slots) {
    this.doctor = doctor;
    this.#slots = slots;
  }
  *[Symbol.iterator]() {               // for…of, spread, Array.from…
    yield* this.#slots;
  }
  [Symbol.toPrimitive](hint) {         // plantillas, +, <, ==…
    return hint === 'number' ? this.#slots.length : `${this.doctor}: ${this.#slots.join(', ')}`;
  }
  get [Symbol.toStringTag]() {         // Object.prototype.toString
    return 'Timetable';
  }
}

const monday = new Timetable('Dra. Ramírez', ['09:00', '09:30', '11:00']);
console.log('spread →', [...monday]);
console.log('plantilla →', `${monday}`);
console.log('número de citas →', +monday, '| ¿más de 2? →', monday > 2);
console.log('etiqueta →', Object.prototype.toString.call(monday));

// Symbol.isConcatSpreadable decide si concat «abre» un objeto o lo mete entero.
const lateSlots = ['17:00', '17:30'];
console.log('concat →', JSON.stringify(['09:00'].concat(lateSlots)));
lateSlots[Symbol.isConcatSpreadable] = false;
console.log('concat sin abrir →', JSON.stringify(['09:00'].concat(lateSlots)));

// > Desde Python: son los métodos mágicos. Python busca __iter__ o __str__
//   por su NOMBRE; JavaScript busca la propiedad cuya clave es el símbolo,
//   así que tus métodos nunca chocan con los del lenguaje.
```
