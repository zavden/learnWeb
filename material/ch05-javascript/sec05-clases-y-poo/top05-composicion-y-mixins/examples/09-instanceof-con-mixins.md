---
example_description: "obj instanceof UnMixin lanza TypeError porque el mixin es una función flecha sin prototype; asignarle Symbol.hasInstance falla en silencio y defineProperty con una marca lo arregla"
example_tags: "javascript|clases|mixins|instanceof|symbol-hasinstance|bug"
example_stage: common-error
example_importance: useful
console: true
---

# JavaScript

```javascript
const Archivable = (Base) =>
  class Archivable extends Base {
    archived = false;
    archive() {
      this.archived = true;
      return this;
    }
  };

class Invoice {
  constructor(number) {
    this.number = number;
  }
}
class ArchivableInvoice extends Archivable(Invoice) {}
const invoice = new ArchivableInvoice('F-2026-118');

// 🐛 1. Archivable es una flecha: no tiene prototype, e instanceof no sabe qué buscar.
try {
  console.log(invoice instanceof Archivable);
} catch (error) {
  console.log('🐛 instanceof un mixin →', error.name, '|', error.message);
}
// (Cada llamada a Archivable crea una clase NUEVA, así que tampoco habría una
//  única clase con la que comparar.)

// 🐛 2. Asignar Symbol.hasInstance no hace nada: la función HEREDA de
// Function.prototype un Symbol.hasInstance de solo lectura, y una propiedad
// heredada de solo lectura impide crear la propia con = (módulo anterior).
Archivable[Symbol.hasInstance] = () => true;
console.log('🐛 ¿se asignó? →', Object.hasOwn(Archivable, Symbol.hasInstance));

// ✅ Una marca (un símbolo) en el prototipo del mixin + defineProperty, que no
//    consulta la cadena.
const ARCHIVABLE = Symbol('Archivable');
const SafeArchivable = (Base) =>
  class Archivable extends Base {
    get [ARCHIVABLE]() {
      return true;
    }
    archived = false;
    archive() {
      this.archived = true;
      return this;
    }
  };
Object.defineProperty(SafeArchivable, Symbol.hasInstance, {
  value: (value) => value?.[ARCHIVABLE] === true,
});

class Contract {}
class ArchivableContract extends SafeArchivable(Contract) {}
console.log('✅ instanceof →', new ArchivableContract() instanceof SafeArchivable, new Contract() instanceof SafeArchivable);

// Muchas veces basta con duck typing: ¿tiene el método que necesito?
console.log('✅ duck typing →', typeof invoice.archive === 'function');
```
