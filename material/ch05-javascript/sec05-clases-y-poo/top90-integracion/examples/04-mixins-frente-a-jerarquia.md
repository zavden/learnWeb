---
example_description: "Notas y contactos que necesitan ser observables y serializables: la jerarquía rígida duplica código y multiplica clases; dos mixins como subclases (con privados y super cooperativo) se aplican a las dos bases"
example_tags: "javascript|integracion|clases|mixins|composicion|super|observador"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// UNA APP DE NOTAS Y CONTACTOS: los dos tipos deben avisar de sus cambios
// (observables) y guardarse en JSON con su tipo (serializables).
// Integra: herencia y super («Herencia con extends»), mixins y composición
// («Composición y mixins»), privados, toJSON y el observador («Patrones de diseño»).

class Note {
  constructor({ title = '', body = '' } = {}) {
    this.title = title;
    this.body = body;
  }
  toJSON() {
    return { title: this.title, body: this.body };
  }
}
class Contact {
  constructor({ name = '', phone = '' } = {}) {
    this.name = name;
    this.phone = phone;
  }
  toJSON() {
    return { name: this.name, phone: this.phone };
  }
}

// 🐛 Con herencia: una subclase por combinación, y el mismo código copiado.
class SerializableNote extends Note {
  toJSON() { return { type: 'Note', ...super.toJSON() }; }
}
class ObservableSerializableNote extends SerializableNote {
  toJSON() { return { type: 'Note', ...super.toJSON() }; } // copia de lo de arriba…
}
// …y lo mismo otra vez para Contact. 2 bases × 4 combinaciones = 8 clases.
console.log('🐛 ¿el mismo toJSON? →', SerializableNote.prototype.toJSON === ObservableSerializableNote.prototype.toJSON);

// ✅ Mixins como subclases: cada capacidad una vez, para cualquier base.
const Observable = (Base) =>
  class Observable extends Base {
    #listeners = new Set(); // privado de CADA objeto: nada compartido

    onChange(listener) {
      this.#listeners.add(listener);
      return () => this.#listeners.delete(listener);
    }

    update(patch) {
      const unknown = Object.keys(patch).filter((key) => !Object.hasOwn(this, key));
      if (unknown.length > 0) throw new TypeError(`Campos desconocidos: ${unknown.join(', ')}`);
      const changes = Object.entries(patch).filter(([key, value]) => this[key] !== value);
      for (const [key, value] of changes) this[key] = value;
      if (changes.length > 0) {
        for (const listener of [...this.#listeners]) listener(this, Object.fromEntries(changes));
      }
      return this;
    }
  };

const Serializable = (Base) =>
  class Serializable extends Base {
    toJSON() {
      return { type: Base.name, ...super.toJSON() }; // coopera con el toJSON de la base
    }
    static fromJSON(json) {
      const { type, ...data } = JSON.parse(json);
      if (type !== Base.name) throw new TypeError(`Se esperaba ${Base.name} y llegó ${type}`);
      return new this(data);
    }
  };

class SmartNote extends Observable(Serializable(Note)) {}
class SmartContact extends Observable(Serializable(Contact)) {}

const note = new SmartNote({ title: 'Lista del súper', body: 'tortillas, aguacates' });
const contact = new SmartContact({ name: 'Iker Salas', phone: '+52 55 1234 5678' });

const log = (obj, changes) => console.log(`  ✎ ${obj.constructor.name}: ${JSON.stringify(changes)}`);
const stopLog = note.onChange(log);
contact.onChange(log);

note.update({ body: 'tortillas, aguacates, limones' });
note.update({ title: 'Lista del súper' }); // no cambia nada: no avisa
contact.update({ phone: '+52 55 8765 4321' });
stopLog();
note.update({ title: 'Súper del sábado' }); // ya nadie escucha a la nota
try {
  contact.update({ email: 'iker@example.com' });
} catch (error) {
  console.warn(`⛔ ${error.name}: ${error.message}`);
}

const saved = JSON.stringify(note);
console.log('JSON →', saved);
const restored = SmartNote.fromJSON(saved); // estático heredado del mixin; new this crea un SmartNote
console.log('restaurada →', restored, '| ¿instanceof Note? →', restored instanceof Note);

const chain = [];
for (let proto = Object.getPrototypeOf(contact); proto !== Object.prototype; proto = Object.getPrototypeOf(proto)) {
  chain.push(proto.constructor.name);
}
console.log('cadena de un contacto →', chain.join(' → '));
```
