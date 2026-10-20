---
example_description: "El patrón clásico de herencia con funciones constructoras: Parent.call(this) para los datos, Object.create(Parent.prototype) para los métodos y constructor restaurado"
example_tags: "javascript|python|herencia|constructor|prototype|super"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// «Clase» base: cualquier elemento de una mediateca.
function MediaItem(title, year) {
  this.title = title;
  this.year = year;
}
MediaItem.prototype.describe = function () {
  return `${this.title} (${this.year})`;
};
MediaItem.prototype.age = function (currentYear) {
  return currentYear - this.year;
};

// «Clase» hija: un libro ES un MediaItem con páginas.
function Book(title, year, pages) {
  MediaItem.call(this, title, year); // ① los datos del padre, sobre ESTE objeto
  this.pages = pages;                 //    y después los propios
}
// ② Los métodos: Book.prototype debe heredar de MediaItem.prototype.
Book.prototype = Object.create(MediaItem.prototype);
// ③ Ese objeto nuevo no tiene constructor: lo restauramos (no enumerable).
Object.defineProperty(Book.prototype, 'constructor', {
  value: Book,
  writable: true,
  configurable: true,
});
// ④ Métodos propios y sobrescritos, que pueden llamar a la versión del padre.
Book.prototype.describe = function () {
  return `📖 ${MediaItem.prototype.describe.call(this)}, ${this.pages} págs.`;
};

const novel = new Book('Cien años de soledad', 1967, 471);
console.log('novel →', novel); // Book {title: …, year: 1967, pages: 471}
// 👉 Expande novel en la consola:
//    [[Prototype]]: Book.prototype → describe (el de Book), constructor
//      [[Prototype]]: MediaItem.prototype → describe (el original), age
//        [[Prototype]]: Object.prototype

console.log(novel.describe());                         // el de Book, que usa el de MediaItem
console.log('age(2026) →', novel.age(2026));           // heredado de MediaItem: 59
console.log('instanceof Book →', novel instanceof Book);           // true
console.log('instanceof MediaItem →', novel instanceof MediaItem); // true
console.log('constructor →', novel.constructor.name);  // 'Book' gracias a ③

// > Desde Python:
//   class Book(MediaItem):
//       def __init__(self, title, year, pages):
//           super().__init__(title, year)          ← ①
//           self.pages = pages
//       def describe(self):
//           return f"📖 {super().describe()}, …"   ← MediaItem.prototype.describe.call(this)
//   Los pasos ② y ③ los hace la palabra class; en JavaScript también (módulo siguiente).
```
