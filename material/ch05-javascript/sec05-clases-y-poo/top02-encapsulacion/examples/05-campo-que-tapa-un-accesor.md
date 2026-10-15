---
example_description: "Un campo con el mismo nombre que un get/set crea una propiedad propia que tapa al accesor del prototipo: el setter nunca se ejecuta y la validación desaparece"
example_tags: "javascript|clases|campos|getters|setters|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
function looksLikeEmail(text) {
  const parts = text.split('@');
  return parts.length === 2 && parts[0] !== '' && parts[1].includes('.') && !text.includes(' ');
}

// 🐛 «Declarar» el dato como campo, además del get/set con el mismo nombre.
class BrokenSubscriber {
  email = ''; // parece documentación inofensiva…
  #email = '';

  constructor(email) {
    this.email = email; // …pero aquí ya existe una propiedad PROPIA email
  }

  get email() {
    return this.#email;
  }
  set email(value) {
    const clean = String(value).trim().toLowerCase();
    if (!looksLikeEmail(clean)) throw new TypeError(`Correo no válido: «${value}»`);
    this.#email = clean;
  }
}

// El campo se crea con «define» (como Object.defineProperty) ANTES del cuerpo del
// constructor. Después, this.email = … encuentra esa propiedad propia y la cambia:
// la búsqueda nunca llega al setter del prototipo.
const broken = new BrokenSubscriber('  Ana.Torres@Example.COM ');
console.log('🐛 sin normalizar →', JSON.stringify(broken.email));
broken.email = 'esto no es un correo';
console.log('🐛 sin validar →', broken.email);
console.log('🐛 descriptor propio →', Object.getOwnPropertyDescriptor(broken, 'email'));

// ✅ El dato vive solo en el campo privado; email es únicamente el accesor.
class Subscriber {
  #email = '';

  constructor(email) {
    this.email = email; // no hay propiedad propia: la búsqueda encuentra el setter
  }

  get email() {
    return this.#email;
  }
  set email(value) {
    const clean = String(value).trim().toLowerCase();
    if (!looksLikeEmail(clean)) throw new TypeError(`Correo no válido: «${value}»`);
    this.#email = clean;
  }
}

const fixed = new Subscriber('  Ana.Torres@Example.COM ');
console.log('✅ normalizado →', fixed.email);
try {
  fixed.email = 'esto no es un correo';
} catch (error) {
  console.log('✅ validado →', error.name, '|', error.message);
}
console.log('✅ propias →', Object.keys(fixed)); // []: email está en el prototipo
```
