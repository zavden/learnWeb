---
example_description: "Contadores con closures: estado privado que solo se toca a través de las funciones devueltas, y contadores independientes entre sí"
example_tags: "javascript|python|closures|encapsulacion|estado"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// El ejemplo clásico de closure: un contador cuyo estado nadie puede tocar
// salvo a través de las funciones que devuelve.
function createCounter(start = 0, step = 1) {
  let count = start; // PRIVADA: no es propiedad de ningún objeto, solo variable local

  return {
    increment() {
      count += step;
      return count;
    },
    decrement() {
      count = Math.max(start, count - step); // nunca por debajo del inicio
      return count;
    },
    reset() {
      count = start;
      return count;
    },
    value() {
      return count;
    },
  };
}

const visitors = createCounter();
const tickets = createCounter(100, 5);

visitors.increment();
visitors.increment();
tickets.increment();
console.log('visitors →', visitors.value()); // 2
console.log('tickets →', tickets.value());   // 105: cada contador tiene SU count

console.log('decrement x3 →', visitors.decrement(), visitors.decrement(), visitors.decrement()); // 1 0 0

// Desde fuera no hay forma de leer ni cambiar count directamente:
console.log('visitors.count →', visitors.count);       // undefined
visitors.count = 999;                                   // crea otra propiedad, no toca la variable
console.log('visitors.value() →', visitors.value());   // 0
console.log('claves del objeto →', Object.keys(visitors));

// > Desde Python: harías una función con nonlocal count, o una clase con
//   self._count (privado solo por convención). Aquí la privacidad es REAL.
//   Las clases de JavaScript tienen campos #privados (módulo «Clases y POO»).
```
