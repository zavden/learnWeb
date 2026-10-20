---
example_description: "Leer, añadir, cambiar y borrar propiedades; punto frente a corchetes; undefined en lugar de KeyError; in frente a Object.hasOwn"
example_tags: "javascript|python|objetos|propiedades|hasown"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Un objeto literal agrupa pares clave → valor: se parece a un dict de Python,
// pero las claves se escriben sin comillas si son nombres válidos.
const book = {
  title: 'Rayuela',
  author: 'Julio Cortázar',
  year: 1963,
  'reading-list': true, // con guion, la clave necesita comillas
};
console.log('book →', book);

// Leer: con punto (nombre fijo) o con corchetes (cualquier string, o una variable).
console.log('book.title →', book.title);
console.log("book['reading-list'] →", book['reading-list']);
const field = 'year';
console.log('book[field] →', book[field]); // book['year']

// Una clave que no existe da undefined, no KeyError…
console.log('book.isbn →', book.isbn); // undefined
// …así que el d.get('isbn', 'sin ISBN') de Python se escribe con ??:
console.log('book.isbn ?? … →', book.isbn ?? 'sin ISBN');

// Añadir, cambiar y borrar (el objeto es mutable aunque la variable sea const).
book.isbn = '978-84-376-0494-7';
book.year = 1963;
delete book['reading-list'];
console.log('tras los cambios →', book);

// ¿Existe la clave? in pregunta también por lo HEREDADO del prototipo…
console.log("'title' in book →", 'title' in book);           // true
console.log("'toString' in book →", 'toString' in book);     // true: heredado
// …Object.hasOwn solo mira las propiedades propias (el «'title' in d» de Python).
console.log("Object.hasOwn(book, 'title') →", Object.hasOwn(book, 'title'));       // true
console.log("Object.hasOwn(book, 'toString') →", Object.hasOwn(book, 'toString')); // false
// (Los prototipos y la herencia se estudian en «Objetos y prototipos».)
```
