---
example_description: "La herencia es un enlace en vivo: un método añadido al prototipo después de crear los objetos aparece en todos, también en los de las «subclases»"
example_tags: "javascript|python|herencia|delegacion|monkey-patching"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
function MediaItem(title, year) {
  this.title = title;
  this.year = year;
}
function Book(title, year, pages) {
  MediaItem.call(this, title, year);
  this.pages = pages;
}
Object.setPrototypeOf(Book.prototype, MediaItem.prototype);

// Objetos creados ANTES de que existan los métodos:
const film = new MediaItem('Roma', 2018);
const novel = new Book('Rayuela', 1963, 600);
console.log('antes →', typeof film.describe, typeof novel.describe); // undefined undefined

// Se añade un método al prototipo base… y todos lo tienen al instante,
// porque cada lectura recorre la cadena en ese momento. No se copia nada.
MediaItem.prototype.describe = function () {
  return `${this.title} (${this.year})`;
};
console.log('después →', film.describe(), '|', novel.describe());

// Si Book añade su versión más tarde, sombrea a la de MediaItem solo para los libros.
Book.prototype.describe = function () {
  return `📖 ${MediaItem.prototype.describe.call(this)}`;
};
console.log('con el de Book →', film.describe(), '|', novel.describe());

// Y si se borra, la búsqueda vuelve a encontrar la de más arriba.
delete Book.prototype.describe;
console.log('tras delete →', novel.describe());

// Así funcionan los «polyfills» (lección «Prototipos nativos»): añaden a un
// prototipo nativo un método que el navegador aún no tiene, y todos los
// objetos existentes lo ganan.

// > Desde Python: igual que añadir un método a una clase en tiempo de ejecución
//   (MediaItem.describe = describe): las instancias existentes lo ven, porque
//   también buscan en la clase en cada acceso.
```
