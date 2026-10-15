---
example_description: "Los #privados no son propiedades: Object.freeze no los congela, el spread y JSON no los copian, y una copia con el mismo prototipo falla al usarlos"
example_tags: "javascript|clases|privados|freeze|copias|json|bug"
example_stage: common-error
example_importance: useful
console: true
---

# JavaScript

```javascript
class Counter {
  #value = 0;
  label;
  constructor(label) {
    this.label = label;
  }
  increment() {
    this.#value += 1;
    return this.#value;
  }
  get value() {
    return this.#value;
  }
}

// 🐛 1. Object.freeze congela las PROPIEDADES; #value no es una propiedad.
const visits = Object.freeze(new Counter('visitas'));
visits.label = 'otra cosa'; // propiedad congelada: no cambia (en silencio)
visits.increment();
visits.increment();
console.log('🐛 ¿congelado? →', Object.isFrozen(visits), '| label →', visits.label, '| value →', visits.value);

// 🐛 2. El spread y JSON solo ven las propiedades propias enumerables.
const spread = { ...visits };
console.log('🐛 spread →', spread, '| ¿tiene increment? →', typeof spread.increment);
console.log('🐛 JSON →', JSON.stringify(visits)); // {"label":"visitas"}: falta value

// 🐛 3. Una «copia» con el mismo prototipo tiene los métodos, pero no los privados.
const clone = Object.assign(Object.create(Counter.prototype), visits);
console.log('copia →', clone, '| instanceof →', clone instanceof Counter);
try {
  clone.increment();
} catch (error) {
  console.log('🐛 clone.increment() →', error.name, '|', error.message);
}

// ✅ Las copias de un objeto con privados las hace la propia clase, que sí los ve.
class SafeCounter {
  #value = 0;
  constructor(label, value = 0) {
    this.label = label;
    this.#value = value;
  }
  increment() {
    this.#value += 1;
    return this.#value;
  }
  clone() {
    return new SafeCounter(this.label, this.#value);
  }
  toJSON() {
    return { label: this.label, value: this.#value }; // JSON decide la clase
  }
}
const likes = new SafeCounter('me gusta', 41);
const copy = likes.clone();
copy.increment();
console.log('✅ original y copia →', JSON.stringify(likes), JSON.stringify(copy));
// (structuredClone, de la lección «JSON y copias», tampoco copia los privados ni
//  el prototipo: devuelve un objeto literal con las propiedades.)
```
