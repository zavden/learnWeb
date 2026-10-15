---
example_description: "Todo objeto tiene un enlace oculto, [[Prototype]], a otro objeto del que hereda; se ve expandiendo el objeto en la consola y se lee con Object.getPrototypeOf"
example_tags: "javascript|python|prototipos|consola|getprototypeof"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
const book = { title: 'Rayuela', year: 1963 };
console.log('book →', book);
// 👉 Expande book en la consola: después de
//    title y year aparece [[Prototype]]: Object.prototype. Expándelo también:
//    ahí están toString, hasOwnProperty, valueOf… los métodos que book
//    «tiene» sin haberlos escrito.

// [[Prototype]] es un enlace interno; Object.getPrototypeOf(obj) lo lee.
const proto = Object.getPrototypeOf(book);
console.log('¿es Object.prototype? →', proto === Object.prototype); // true

// toString no es de book: está en su prototipo, y book lo usa como suyo.
console.log('¿toString propia de book? →', Object.hasOwn(book, 'toString'));   // false
console.log('¿toString propia del prototipo? →', Object.hasOwn(proto, 'toString')); // true
console.log('¿la misma función? →', book.toString === Object.prototype.toString); // true
console.log('book.toString() →', book.toString()); // '[object Object]'

// El prototipo es un objeto normal… con su propio [[Prototype]]: null.
// Ahí termina la cadena.
console.log('prototipo de Object.prototype →', Object.getPrototypeOf(proto)); // null

// Un array tiene otro prototipo, Array.prototype (con map, filter, push…),
// cuyo prototipo es Object.prototype. Expándelo dos veces en la consola.
const tags = ['js', 'python'];
console.log('tags →', tags);
console.log('¿Array.prototype? →', Object.getPrototypeOf(tags) === Array.prototype); // true
console.log('¿y después Object.prototype? →', Object.getPrototypeOf(Array.prototype) === Object.prototype); // true

// La forma antigua de leerlo, book.__proto__, es un getter heredado de
// Object.prototype. Funciona, pero usa Object.getPrototypeOf.
console.log('book.__proto__ === proto →', book.__proto__ === proto);

// > Desde Python: es parecido a book.__class__, pero el prototipo no es una
//   clase: es un objeto normal, y la herencia va de objeto a objeto.
```
