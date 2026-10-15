---
example_description: "En una clase hija, this no existe hasta que super() devuelve: usarlo antes, u olvidar super(), lanza ReferenceError; sin constructor propio, JavaScript escribe uno que pasa todos los argumentos"
example_tags: "javascript|python|clases|herencia|super|this|bug"
example_stage: common-error
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
}

// 🐛 1. Usar this antes de super(): en Python funcionaría (self ya existe).
class EarlyBook extends MediaItem {
  constructor(title, year, pages) {
    this.pages = pages; // ❌ todavía no hay objeto
    super(title, year);
  }
}
try {
  new EarlyBook('Rayuela', 1963, 600);
} catch (error) {
  console.log('🐛 this antes de super →', error.name, '|', error.message);
}

// 🐛 2. Olvidar super(): el error salta al terminar el constructor.
class ForgetfulBook extends MediaItem {
  constructor(title, year, pages) {
    this.pages = pages; // (sin super en ningún sitio)
  }
}
try {
  new ForgetfulBook('Rayuela', 1963, 600);
} catch (error) {
  console.log('🐛 sin super →', error.name, '|', error.message);
}

// ¿Por qué? En una clase HIJA, new no crea el objeto al empezar: lo crea el
// constructor de la clase BASE, al que se llega con super(). Hasta que super()
// vuelve, no hay nada a lo que this pueda apuntar. (Con las constructoras del
// módulo anterior, new creaba el objeto y Parent.call(this) solo lo rellenaba.)

// ✅ super() primero; después, this.
class Book extends MediaItem {
  constructor(title, year, pages) {
    // Antes de super se puede calcular y validar, siempre que no se use this:
    if (!Number.isInteger(pages) || pages <= 0) throw new RangeError(`Páginas no válidas: ${pages}`);
    super(title, year);
    this.pages = pages;
  }
}
console.log('✅ Book →', new Book('Rayuela', 1963, 600));

// ✅ Si la hija no necesita constructor, no lo escribas: JavaScript pone
//    constructor(...args) { super(...args); }
class Magazine extends MediaItem {
  issue = 1; // los campos de la hija se crean justo después de super()
}
console.log('✅ Magazine →', new Magazine('National Geographic', 2026));
```
