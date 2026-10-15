---
example_description: "Mixins como funciones que reciben una clase y devuelven una subclase: se encadenan en extends, super funciona, cada uno puede tener campos y privados, y la cadena resultante es el «MRO» de la clase"
example_tags: "javascript|python|clases|mixins|extends|super|mro"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Un mixin: una función que recibe una clase base y devuelve una subclase de ella.
// Nómbrala (class Timestamped …) para que la cadena se lea bien en la consola.
const Timestamped = (Base) =>
  class Timestamped extends Base {
    #updatedAt = '2026-10-01T09:00:00Z'; // cada mixin puede tener sus campos y privados
    touch(isoInstant) {
      this.#updatedAt = isoInstant;
      return this;
    }
    get updatedAt() {
      return this.#updatedAt;
    }
  };

const Taggable = (Base) =>
  class Taggable extends Base {
    tags = new Set();
    tag(...names) {
      for (const name of names) this.tags.add(name.toLowerCase());
      return this;
    }
    describe() {
      // super funciona: este método está escrito en una clase que hereda de Base.
      return `${super.describe()} #${[...this.tags].join(' #')}`;
    }
  };

class Note {
  constructor(title) {
    this.title = title;
  }
  describe() {
    return `📝 ${this.title}`;
  }
}

// Se encadenan: Taggable(Timestamped(Note)) es una clase que hereda de otra…
class SmartNote extends Taggable(Timestamped(Note)) {}

const note = new SmartNote('Receta de chiles en nogada')
  .tag('Cocina', 'Puebla')
  .touch('2026-10-12T18:45:00Z');

console.log(note.describe());
console.log('updatedAt →', note.updatedAt);
console.log('note →', note); // 👉 expándelo: un [[Prototype]] por cada mixin

// La cadena: una línea recta, como el __mro__ de Python.
const chain = [];
for (let proto = Object.getPrototypeOf(note); proto !== null; proto = Object.getPrototypeOf(proto)) {
  chain.push(proto.constructor.name);
}
console.log('cadena →', chain.join(' → '), '| instanceof Note →', note instanceof Note);

// Los mismos mixins sirven para otra base sin relación:
class Photo {
  constructor(file) {
    this.file = file;
  }
  describe() {
    return `📷 ${this.file}`;
  }
}
class TaggedPhoto extends Taggable(Photo) {}
console.log(new TaggedPhoto('cholula.jpg').tag('Viajes').describe());

// > Desde Python: class SmartNote(Taggable, Timestamped, Note) tiene el MRO
//   (SmartNote, Taggable, Timestamped, Note, object): la misma línea.
```
