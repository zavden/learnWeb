---
example_description: "Llamar a la versión del padre con this.metodo() u Object.getPrototypeOf(this) provoca recursión infinita; hay que nombrar el padre o usar super en métodos de literales"
example_tags: "javascript|herencia|super|recursion|this|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
const baseItem = {
  describe() {
    return this.title;
  },
};

// 🐛 Intento 1: this.describe() dentro de describe se llama A SÍ MISMO
// (la búsqueda empieza en this y encuentra este mismo método).
const badBook = Object.create(baseItem);
badBook.title = 'Rayuela';
badBook.describe = function () {
  return `📖 ${this.describe()}`;
};
try {
  badBook.describe();
} catch (error) {
  console.log('🐛 this.describe() →', error.name, '|', error.message);
}

// 🐛 Intento 2: «el prototipo de this». Parece funcionar…
const book = Object.create(baseItem);
book.title = 'Plantilla de libro';
book.describe = function () {
  return `📖 ${Object.getPrototypeOf(this).describe.call(this)}`;
};
console.log('book.describe() →', book.describe()); // getPrototypeOf(book) es baseItem ✔

// …hasta que otro objeto hereda de book. Ahora this es novel,
// getPrototypeOf(novel) es book, y book.describe se llama a sí mismo sin fin.
const novel = Object.create(book);
novel.title = 'Rayuela';
try {
  novel.describe();
} catch (error) {
  console.log('🐛 getPrototypeOf(this) →', error.name, '|', error.message);
}
//   novel.describe() → book.describe con this = novel
//     → getPrototypeOf(novel) = book → book.describe con this = novel → …

// ✅ Solución 1: nombrar explícitamente el objeto del que se hereda.
const goodBook = Object.create(baseItem);
goodBook.describe = function () {
  return `📖 ${baseItem.describe.call(this)}`;
};
const goodNovel = Object.create(goodBook);
goodNovel.title = 'Rayuela';
console.log('✅ padre explícito →', goodNovel.describe());

// ✅ Solución 2: super, en métodos abreviados de un literal. super busca a
// partir del prototipo del objeto donde está ESCRITO el método, no del de this.
const superBook = {
  __proto__: baseItem,
  describe() {
    return `📖 ${super.describe()}`;
  },
};
const superNovel = { __proto__: superBook, title: 'Rayuela' };
console.log('✅ super →', superNovel.describe());
// (super se estudia con las clases, en el módulo «Clases y POO».)
```
