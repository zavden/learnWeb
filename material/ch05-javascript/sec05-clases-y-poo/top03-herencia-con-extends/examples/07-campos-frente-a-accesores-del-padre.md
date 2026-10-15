---
example_description: "Un campo de la hija se define (no se asigna): tapa el setter del padre sin ejecutarlo y, al revés que this.x = …, no lo frena una propiedad heredada de solo lectura"
example_tags: "javascript|clases|herencia|campos|setters|freeze|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// ── 1. Un campo de la hija tapa el accesor del padre ──────────────────
class FormField {
  #value = '';
  changes = 0;
  get value() {
    return this.#value;
  }
  set value(text) {
    this.#value = String(text).trim(); // normaliza
    this.changes += 1;                 // y cuenta los cambios
  }
}

class EmailField extends FormField {
  value = ''; // 🐛 un «valor inicial»: define una propiedad PROPIA llamada value
}
const email = new EmailField();
email.value = '  ana.torres@example.com ';
console.log('🐛 campo →', JSON.stringify(email.value), '| changes →', email.changes); // sin trim, 0

class FixedEmailField extends FormField {
  constructor(initial = '') {
    super();
    this.value = initial; // ✅ asignación: la búsqueda encuentra el setter heredado
  }
}
const fixed = new FixedEmailField();
fixed.value = '  ana.torres@example.com ';
console.log('✅ asignación →', JSON.stringify(fixed.value), '| changes →', fixed.changes); // 2: constructor + esta

// ── 2. Una base congelada frena la asignación, pero no el campo ───────
class Theme {}
Object.assign(Theme.prototype, { mode: 'claro', fontSize: 16 }); // valores por defecto
Object.freeze(Theme.prototype); // nadie puede cambiar los valores por defecto

class AssignedDarkTheme extends Theme {
  constructor() {
    super();
    this.mode = 'oscuro'; // propiedad heredada de solo lectura: = no puede sombrearla
  }
}
try {
  new AssignedDarkTheme();
} catch (error) {
  // En el módulo anterior fallaba en silencio; el código de una clase es estricto.
  console.log('🐛 this.mode = … →', error.name, '|', error.message);
}

class DarkTheme extends Theme {
  mode = 'oscuro'; // ✅ un campo se define, como Object.defineProperty: no consulta la cadena
}
const dark = new DarkTheme();
console.log('✅ campo →', dark.mode, '| fontSize heredado →', dark.fontSize, '| base →', Theme.prototype.mode);

// Resumen: campo = Object.defineProperty(this, …): crea siempre la propia.
//          this.x = … = asignación: consulta la cadena (setters, solo lectura).
```
