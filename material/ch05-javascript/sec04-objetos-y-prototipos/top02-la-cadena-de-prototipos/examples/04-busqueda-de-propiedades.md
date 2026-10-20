---
example_description: "Al leer una propiedad, el motor mira el objeto, luego su prototipo, luego el de este… hasta null; un método heredado recibe como this el objeto de la llamada"
example_tags: "javascript|python|prototipos|busqueda|this"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Tres objetos encadenados: novel → book → baseProduct → Object.prototype → null
const baseProduct = {
  currency: 'EUR',
  describe() {
    return `${this.title}: ${(this.cents / 100).toFixed(2)} ${this.currency}`;
  },
};
const book = Object.create(baseProduct);
book.category = 'libros';
book.vatRate = 0.04;

const novel = Object.create(book);
novel.title = 'Rayuela';
novel.cents = 2190;

// whereIs repite a mano lo que hace el motor al leer novel[key]: mira si la
// clave es PROPIA del objeto actual; si no, pasa a su prototipo; y así hasta null.
const names = new Map([
  [novel, 'novel'],
  [book, 'book'],
  [baseProduct, 'baseProduct'],
  [Object.prototype, 'Object.prototype'],
]);
function whereIs(obj, key) {
  const visited = [];
  for (let current = obj; current !== null; current = Object.getPrototypeOf(current)) {
    visited.push(names.get(current));
    if (Object.hasOwn(current, key)) return `${visited.join(' → ')} ✔`;
  }
  return `${visited.join(' → ')} → null: undefined`;
}

console.log('title    →', whereIs(novel, 'title'));
console.log('vatRate  →', whereIs(novel, 'vatRate'));
console.log('currency →', whereIs(novel, 'currency'));
console.log('toString →', whereIs(novel, 'toString'));
console.log('isbn     →', whereIs(novel, 'isbn'));
console.log('novel.isbn →', novel.isbn); // undefined: la búsqueda llegó a null

// ⚠️ La clave: describe se encuentra en baseProduct, pero se LLAMA como
// novel.describe(), así que this es novel (regla del método, lección «this»).
// Por eso el método compartido usa los datos de cada objeto.
console.log('novel.describe() →', novel.describe()); // 'Rayuela: 21.90 EUR'

// > Desde Python: novel.describe() busca primero en novel.__dict__ y luego en
//   la clase y su __mro__; al encontrar la función la llama con self = novel.
//   Aquí es igual, pero los eslabones son objetos, no clases.
```
