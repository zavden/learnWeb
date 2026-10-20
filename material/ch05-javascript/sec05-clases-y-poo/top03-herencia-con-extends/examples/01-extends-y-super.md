---
example_description: "class Book extends MediaItem: super(…) ejecuta el constructor del padre y super.describe() reutiliza su método; la misma jerarquía del módulo anterior, sin escribir los enlaces a mano"
example_tags: "javascript|python|clases|herencia|extends|super"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
class MediaItem {
  constructor(title, year) {
    this.title = title;
    this.year = year;
  }
  describe() {
    return `${this.title} (${this.year})`;
  }
  age(currentYear) {
    return currentYear - this.year;
  }
}

// Un libro ES un MediaItem con páginas.
class Book extends MediaItem {
  constructor(title, year, pages) {
    super(title, year); // ① el constructor del padre (antes: MediaItem.call(this, …))
    this.pages = pages; //    y después, lo propio
  }
  // Sobrescribe describe y reutiliza la versión del padre.
  describe() {
    return `📖 ${super.describe()}, ${this.pages} págs.`; // antes: MediaItem.prototype.describe.call(this)
  }
}

const novel = new Book('Cien años de soledad', 1967, 471);
console.log('novel →', novel); // Book {title: …, year: 1967, pages: 471}
console.log(novel.describe());               // el de Book, que usa el de MediaItem
console.log('age(2026) →', novel.age(2026)); // heredado de MediaItem: 59
console.log('instanceof →', novel instanceof Book, novel instanceof MediaItem);
console.log('constructor →', novel.constructor.name);
// 👉 Expande novel: [[Prototype]] es Book.prototype (describe), y dentro
//    MediaItem.prototype (describe original, age). La cadena del módulo anterior.

// > Desde Python:
//   class Book(MediaItem):
//       def __init__(self, title, year, pages):
//           super().__init__(title, year)
//           self.pages = pages
//       def describe(self):
//           return f"📖 {super().describe()}, {self.pages} págs."
//   En JavaScript, super(…) llama al constructor y super.metodo() a un método:
//   no hay super().__init__ ni paréntesis tras super.
```
