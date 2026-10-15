---
example_description: "Tres errores al heredar con constructoras: compartir el mismo prototype, usar new Parent() como prototipo y olvidar Parent.call(this)"
example_tags: "javascript|herencia|prototype|constructor|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
function MediaItem(title, year) {
  this.title = title;
  this.year = year;
  this.tags = []; // un array PROPIO por objeto
}
MediaItem.prototype.describe = function () {
  return `${this.title} (${this.year})`;
};

// 🐛 1. Podcast.prototype = MediaItem.prototype: no es herencia, es el MISMO objeto.
function Podcast(title, year, host) {
  MediaItem.call(this, title, year);
  this.host = host;
}
Podcast.prototype = MediaItem.prototype;
Podcast.prototype.play = function () { // ¡se añade a MediaItem.prototype!
  return `▶ ${this.title} con ${this.host}`;
};
const film = new MediaItem('Roma', 2018);
console.log('🐛 typeof film.play →', typeof film.play); // 'function': una película «se reproduce como podcast»
console.log('🐛 film instanceof Podcast →', film instanceof Podcast); // true

// 🐛 2. Book.prototype = new MediaItem(): ejecuta la constructora del padre una
// vez, sin argumentos, y sus datos acaban en el prototipo COMPARTIDO.
function Book(title, year, pages) {
  this.title = title; // copia a mano parte de lo que hacía MediaItem…
  this.year = year;
  this.pages = pages; // …y se olvida de tags
}
Book.prototype = new MediaItem();
const novel = new Book('Rayuela', 1963, 600);
const essay = new Book('El laberinto de la soledad', 1950, 351);
novel.tags.push('clásico');
console.log('🐛 essay.tags →', essay.tags); // ['clásico']: el array del prototipo
console.log('🐛 prototipo con datos →', Object.getPrototypeOf(novel)); // MediaItem {title: undefined, …}

// 🐛 3. Olvidar MediaItem.call(this, …): los datos del padre no se crean.
function Magazine(title, year, issue) {
  this.issue = issue;
}
Magazine.prototype = Object.create(MediaItem.prototype);
const magazine = new Magazine('Letras Libres', 2026, 312);
console.log('🐛 magazine.describe() →', magazine.describe()); // 'undefined (undefined)'

// ✅ El patrón correcto (ejemplo 02): Parent.call(this, …) en la constructora,
// Object.create(Parent.prototype) para el prototipo y constructor restaurado.
function Comic(title, year, artist) {
  MediaItem.call(this, title, year);
  this.artist = artist;
}
Comic.prototype = Object.create(MediaItem.prototype);
Object.defineProperty(Comic.prototype, 'constructor', { value: Comic, writable: true, configurable: true });
const comic = new Comic('Mafalda', 1964, 'Quino');
comic.tags.push('humor');
console.log('✅ comic →', comic.describe(), '| tags propias →', Object.hasOwn(comic, 'tags'));
```
