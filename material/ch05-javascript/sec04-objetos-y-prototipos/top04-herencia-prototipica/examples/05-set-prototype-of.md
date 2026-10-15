---
example_description: "Object.setPrototypeOf cambia el prototipo de un objeto ya creado; tiene límites (ciclos, objetos no extensibles) y un coste de rendimiento, así que solo se usa al preparar los prototipos"
example_tags: "javascript|herencia|setprototypeof|rendimiento|proto"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
const guestPermissions = {
  canRead: true,
  canComment: false,
  describe() {
    return `leer: ${this.canRead ? 'sí' : 'no'} · comentar: ${this.canComment ? 'sí' : 'no'}`;
  },
};
const memberPermissions = Object.create(guestPermissions);
memberPermissions.canComment = true;

// Un objeto ya creado y en uso…
const session = { user: 'marta_r' };
console.log('antes →', session.describe); // undefined

// …al que se le cambia el prototipo sobre la marcha.
Object.setPrototypeOf(session, memberPermissions);
console.log('después →', session.describe()); // 'leer: sí · comentar: sí'

// Límites: no se pueden crear ciclos…
try {
  Object.setPrototypeOf(guestPermissions, session); // session ya hereda de guestPermissions
} catch (error) {
  console.log('ciclo →', error.name, '|', error.message);
}
// …ni cambiar el prototipo de un objeto no extensible (preventExtensions, seal, freeze).
const frozen = Object.freeze({ user: 'admin' });
try {
  Object.setPrototypeOf(frozen, memberPermissions);
} catch (error) {
  console.log('congelado →', error.name, '|', error.message);
}

// ⚠️ Por qué evitarlo con objetos en uso: los motores optimizan el acceso a
// propiedades suponiendo que la cadena de un objeto no cambia. Cambiarla
// invalida esas optimizaciones, para ese objeto y para el código que lo usa.
// Y el código se vuelve difícil de seguir: el «tipo» del objeto cambia en mitad
// del programa. Mejor elegir el prototipo AL CREAR: Object.create(proto).

// ✅ Uso legítimo: al PREPARAR una herencia, antes de crear ningún objeto.
// Es una alternativa a Book.prototype = Object.create(…) que conserva constructor.
function MediaItem(title) {
  this.title = title;
}
MediaItem.prototype.describe = function () {
  return `«${this.title}»`;
};
function Book(title, pages) {
  MediaItem.call(this, title);
  this.pages = pages;
}
Object.setPrototypeOf(Book.prototype, MediaItem.prototype);
const novel = new Book('Pedro Páramo', 124);
console.log('novel.describe() →', novel.describe());
console.log('constructor intacto →', novel.constructor === Book); // true

// La forma antigua, obj.__proto__ = proto, hace lo mismo (es un setter de
// Object.prototype) y tiene los mismos problemas. Evítala.
```
