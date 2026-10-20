---
example_description: "Un método copiado con Object.assign conserva el objeto donde se escribió: su super busca en el prototipo del mixin, no en el padre de la clase, y falla"
example_tags: "javascript|clases|mixins|super|homeobject|bug"
example_stage: common-error
example_importance: useful
console: true
---

# JavaScript

```javascript
class MediaItem {
  constructor(title) {
    this.title = title;
  }
  describe() {
    return this.title;
  }
}
class Book extends MediaItem {}

// 🐛 Un mixin que quiere ampliar describe con super.
const featured = {
  describe() {
    return `⭐ ${super.describe()}`; // super se fija AQUÍ: el objeto featured
  },
};
Object.assign(Book.prototype, featured);

const book = new Book('El llano en llamas');
try {
  console.log(book.describe());
} catch (error) {
  console.log('🐛 super en un mixin copiado →', error.name, '|', error.message);
}
// El método recuerda el objeto donde se ESCRIBIÓ (featured). Su super busca en
// el prototipo de featured, que es Object.prototype, y allí no hay describe.
// Copiarlo a Book.prototype no cambia ese objeto.
console.log('prototipo de featured →', Object.getPrototypeOf(featured) === Object.prototype);

// ✅ Con un mixin que es una SUBCLASE (ejemplo siguiente), super funciona:
const Featured = (Base) =>
  class Featured extends Base {
    describe() {
      return `⭐ ${super.describe()}`; // escrito en una clase que hereda de Base
    }
  };
class Magazine extends Featured(MediaItem) {}
console.log('✅ subclase mixin →', new Magazine('Artes de México').describe());
```
