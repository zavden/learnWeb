---
example_description: "Heredar de Array regala toda su API, también la que rompe las reglas (splice, length = 0); una clase que envuelve un array privado expone solo lo que debe y mantiene el registro de solo añadir"
example_tags: "javascript|python|clases|composicion|encapsulacion|array"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Un registro de auditoría: solo se puede AÑADIR, nunca borrar ni reescribir.

// Con herencia: AuditLog ES un Array…
class InheritedAuditLog extends Array {
  record(action) {
    this.push(`${this.length + 1}. ${action}`);
    return this;
  }
}
const inherited = new InheritedAuditLog();
inherited.record('alta de Lucía Moreno').record('cambio de contraseña').record('baja de Pablo Ibáñez');

// …y hereda TODOS los métodos de Array, también los que rompen la regla:
inherited.splice(2, 1);           // borra la baja
inherited[0] = '1. (reescrito)';  // reescribe una entrada
console.log('🐛 heredado →', [...inherited]);
inherited.length = 0;             // lo vacía
console.log('🐛 tras length = 0 →', inherited.length, 'entradas');

// Con composición: AuditLog TIENE un array privado y decide su API.
class AuditLog {
  #entries = [];

  record(action) {
    this.#entries.push(Object.freeze({ n: this.#entries.length + 1, action }));
    return this;
  }
  get size() {
    return this.#entries.length;
  }
  // Delegamos en el array solo lo que queremos ofrecer:
  [Symbol.iterator]() {
    return this.#entries.values();
  }
  filter(predicate) {
    return this.#entries.filter(predicate); // devuelve un Array normal, sin sorpresas
  }
}

const log = new AuditLog();
log.record('alta de Lucía Moreno').record('cambio de contraseña').record('baja de Pablo Ibáñez');
log.length = 0; // solo crea una propiedad nueva: los datos están en #entries
console.log('✅ splice →', typeof log.splice, '| tras length = 0 →', log.size, 'entradas');
console.log('✅ for…of →', [...log].map((entry) => `${entry.n}. ${entry.action}`));
console.log('✅ filter →', log.filter((entry) => entry.action.startsWith('alta')).map((entry) => entry.action));

// > Desde Python: «composition over inheritance». Igual que envolver una list
//   en un atributo self._entries en vez de heredar de list.
```
