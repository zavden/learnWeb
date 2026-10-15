---
example_description: "Cada propiedad lleva tres atributos además de su valor (writable, enumerable, configurable); Object.getOwnPropertyDescriptor los enseña"
example_tags: "javascript|python|objetos|propiedades|descriptores"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Una propiedad no es solo «clave → valor»: lleva además tres interruptores
// (sus ATRIBUTOS). Object.getOwnPropertyDescriptor(obj, clave) los enseña todos.
const book = { title: 'Rayuela', year: 1963 };

console.log('book.title →', Object.getOwnPropertyDescriptor(book, 'title'));
//   value        → el valor guardado
//   writable     → ¿se puede cambiar el valor con una asignación?
//   enumerable   → ¿aparece al recorrer el objeto (Object.keys, for…in, JSON, spread)?
//   configurable → ¿se puede borrar la propiedad o cambiar sus atributos?
// Lo que creas con un literal o con una asignación tiene los tres a true.

// Las propiedades que trae el lenguaje suelen tener otros valores:
console.log('Math.PI →', Object.getOwnPropertyDescriptor(Math, 'PI'));
// writable: false → por eso Math.PI no se puede cambiar

const scores = [7, 9.5, 10];
console.log('scores.length →', Object.getOwnPropertyDescriptor(scores, 'length'));
// enumerable: false → por eso length no sale en Object.keys
console.log('Object.keys(scores) →', Object.keys(scores)); // ['0', '1', '2']

// En plural, Object.getOwnPropertyDescriptors devuelve todos a la vez
// (expándelo en la consola para ver cada uno).
console.log('todos →', Object.getOwnPropertyDescriptors(book));

// Solo las propiedades PROPIAS tienen descriptor; las que no existen o se
// heredan (como toString, lección «La cadena de prototipos») dan undefined.
console.log('book.isbn →', Object.getOwnPropertyDescriptor(book, 'isbn'));
console.log('book.toString →', Object.getOwnPropertyDescriptor(book, 'toString'));

// > Desde Python: vars(book) te daría los valores, pero un atributo de Python no
//   lleva interruptores propios: lo «especial» (solo lectura, calculado) vive en
//   la clase, con @property y otros descriptores.
```
