---
example_description: "super.metodo() busca desde el padre de la clase donde está escrito el método, no desde this: funciona en tres niveles, donde Object.getPrototypeOf(this) entraba en recursión, y también en los estáticos"
example_tags: "javascript|python|clases|herencia|super|recursion|static"
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
  static fromJSON(json) {
    return Object.assign(new this(), JSON.parse(json));
  }
}

class Book extends MediaItem {
  constructor(title, year, pages) {
    super(title, year);
    this.pages = pages;
  }
  describe() {
    return `${super.describe()}, ${this.pages} págs.`;
  }
}

class AudioBook extends Book {
  constructor(title, year, pages, narrator) {
    super(title, year, pages);
    this.narrator = narrator;
  }
  describe() {
    return `🎧 ${super.describe()}, narrado por ${this.narrator}`;
  }
  // super también funciona en los estáticos: busca en la clase padre.
  static fromJSON(json) {
    const audio = super.fromJSON(json); // MediaItem.fromJSON, con this = AudioBook
    audio.narrator ??= 'narrador desconocido';
    return audio;
  }
}

const audio = new AudioBook('Pedro Páramo', 1955, 124, 'Daniel Giménez Cacho');
console.log(audio.describe()); // combina los tres niveles

// Cuando Book.describe se ejecuta, this es audio (un AudioBook), pero super
// no mira this: mira dónde está ESCRITO el método. describe está escrito en
// Book.prototype, así que super.describe busca desde MediaItem.prototype.
// En la lección «Herencia prototípica», Object.getPrototypeOf(this).describe
// entraba aquí en recursión infinita: getPrototypeOf(audio) es siempre AudioBook.prototype.

// Equivalencia con el módulo anterior:
const viaSuper = Book.prototype.describe.call(audio);
const byHand = `${MediaItem.prototype.describe.call(audio)}, ${audio.pages} págs.`;
console.log('¿super = padre nombrado? →', viaSuper === byHand, '|', viaSuper);

const restored = AudioBook.fromJSON('{"title":"Aura","year":1962,"pages":60}');
console.log('fromJSON →', restored, '| instanceof AudioBook →', restored instanceof AudioBook);
console.log(restored.describe());

// > Desde Python: super().describe() hace lo mismo. Python resuelve super con
//   la clase donde está escrito el método (__class__) y el MRO de self; para
//   cadenas simples como esta, el resultado es idéntico.
```
