---
example_description: "push/pop, unshift/shift y splice frente a append, pop, insert y del de Python; includes e indexOf"
example_tags: "javascript|python|arrays|push|splice|mutacion"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Una cola de pedidos de una cafetería.
const orders = ['café', 'té'];

// Al final: push (append) y pop (pop()).
const newLength = orders.push('chocolate'); // devuelve la NUEVA longitud, no el array
console.log('push →', newLength, orders);   // 3 ['café', 'té', 'chocolate']
const last = orders.pop();
console.log('pop →', last, orders);         // 'chocolate' ['café', 'té']

// Al principio: unshift (insert(0, x)) y shift (pop(0)).
orders.unshift('zumo');
console.log('unshift →', orders);           // ['zumo', 'café', 'té']
const first = orders.shift();
console.log('shift →', first, orders);      // 'zumo' ['café', 'té']

// En medio: splice(inicio, cuántos borrar, ...qué insertar). Devuelve lo borrado.
const menu = ['café', 'té', 'zumo', 'agua'];
const removed = menu.splice(1, 2);           // del menu[1:3]
console.log('splice(1, 2) →', removed, menu); // ['té', 'zumo'] ['café', 'agua']
menu.splice(1, 0, 'batido', 'horchata');     // menu[1:1] = ['batido', 'horchata']
console.log('splice(1, 0, …) →', menu);      // ['café', 'batido', 'horchata', 'agua']

// Buscar un valor: includes (el «in» de Python) e indexOf (index).
console.log("includes('agua') →", menu.includes('agua')); // true
console.log("indexOf('agua') →", menu.indexOf('agua'));   // 3
console.log("indexOf('té') →", menu.indexOf('té'));       // -1 (Python: ValueError)

// Vaciar: length = 0 (el clear() de Python). Afecta a todos los que vean este array.
menu.length = 0;
console.log('length = 0 →', menu); // []
```
