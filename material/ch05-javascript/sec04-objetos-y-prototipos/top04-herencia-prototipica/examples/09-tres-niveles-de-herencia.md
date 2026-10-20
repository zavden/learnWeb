---
example_description: "Una jerarquía de tres niveles con constructoras: la cadena impresa, dónde se resuelve cada método (el «MRO» de JavaScript) y un describe que combina los tres niveles"
example_tags: "javascript|python|herencia|mro|prototipos|constructor"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// Helper para heredar: el patrón del ejemplo 02 en una función.
function inherit(Child, Parent) {
  Object.setPrototypeOf(Child.prototype, Parent.prototype);
}

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

function Book(title, year, pages) {
  MediaItem.call(this, title, year);
  this.pages = pages;
}
inherit(Book, MediaItem);
Book.prototype.describe = function () {
  return `${MediaItem.prototype.describe.call(this)}, ${this.pages} págs.`;
};
Book.prototype.readingHours = function () {
  return Math.round(this.pages / 40); // ~40 páginas por hora
};

function AudioBook(title, year, pages, narrator, minutes) {
  Book.call(this, title, year, pages);
  this.narrator = narrator;
  this.minutes = minutes;
}
inherit(AudioBook, Book);
AudioBook.prototype.describe = function () {
  return `🎧 ${Book.prototype.describe.call(this)}, narrado por ${this.narrator}`;
};
AudioBook.prototype.readingHours = function () {
  return Math.round(this.minutes / 60); // sobrescrito: duración real
};

const audio = new AudioBook('Pedro Páramo', 1955, 124, 'Daniel Giménez Cacho', 270);

// La cadena del objeto, con el nombre de cada prototipo:
const chain = [];
for (let proto = Object.getPrototypeOf(audio); proto !== null; proto = Object.getPrototypeOf(proto)) {
  chain.push(`${proto.constructor.name}.prototype`);
}
console.log('cadena →', [...chain, 'null'].join(' → '));

// Dónde se resuelve cada método: el primer eslabón que lo tiene como propio.
const resolution = {};
for (const method of ['describe', 'readingHours', 'age', 'toString']) {
  let owner = Object.getPrototypeOf(audio);
  while (!Object.hasOwn(owner, method)) owner = Object.getPrototypeOf(owner);
  resolution[method] = { 'se encuentra en': `${owner.constructor.name}.prototype` };
}
console.table(resolution);

console.log(audio.describe());                     // combina los tres niveles
console.log('readingHours →', audio.readingHours()); // 5: el de AudioBook
console.log('age(2026) →', audio.age(2026));         // 71: el de MediaItem
console.log('¿instanceof las tres? →',
  audio instanceof AudioBook, audio instanceof Book, audio instanceof MediaItem);

// > Desde Python: AudioBook.__mro__ sería (AudioBook, Book, MediaItem, object),
//   la misma lista. Diferencia: Python admite herencia múltiple y calcula ese
//   orden (C3); en JavaScript cada objeto tiene UN prototipo, así que la cadena
//   es siempre una línea recta.
```
