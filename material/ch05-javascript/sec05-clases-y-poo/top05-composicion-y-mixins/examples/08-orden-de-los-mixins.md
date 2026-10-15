---
example_description: "El orden de los mixins decide quién gana cuando dos definen el mismo método; con super, cada mixin añade su parte y llama al siguiente (cooperación, como el super() de Python con varias bases)"
example_tags: "javascript|python|clases|mixins|super|mro|cooperacion"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
const looksLikeEmail = (text) => text.split('@').length === 2 && text.split('@')[1].includes('.');
const countDigits = (text) => [...text].filter((ch) => ch >= '0' && ch <= '9').length;

class Model {
  constructor(data) {
    Object.assign(this, data);
  }
  validate() {
    return []; // la base no encuentra problemas: los añaden los mixins
  }
  label() {
    return 'registro';
  }
}

// Cada mixin COOPERA: llama a super.validate() y añade su comprobación.
const WithEmail = (Base) =>
  class WithEmail extends Base {
    validate() {
      const problems = super.validate();
      if (!looksLikeEmail(this.email ?? '')) problems.push('correo no válido');
      return problems;
    }
    label() {
      return 'con correo'; // NO llama a super: compite en lugar de cooperar
    }
  };

const WithPhone = (Base) =>
  class WithPhone extends Base {
    validate() {
      const problems = super.validate();
      if (countDigits(this.phone ?? '') < 10) problems.push('teléfono no válido');
      return problems;
    }
    label() {
      return 'con teléfono';
    }
  };

class Contact extends WithPhone(WithEmail(Model)) {}
class Lead extends WithEmail(WithPhone(Model)) {} // los mismos mixins, al revés

const data = { email: 'ana@example', phone: '55 12' };
const contact = new Contact(data);
const lead = new Lead(data);

// validate coopera: se ejecutan TODAS las versiones, de la base hacia fuera.
console.log('Contact.validate →', contact.validate());
console.log('Lead.validate    →', lead.validate());

// label compite: gana el mixin de MÁS FUERA, el primero en la cadena.
console.log('Contact.label →', contact.label(), '| Lead.label →', lead.label());

const chainOf = (obj) => {
  const names = [];
  for (let p = Object.getPrototypeOf(obj); p !== Object.prototype; p = Object.getPrototypeOf(p)) {
    names.push(p.constructor.name);
  }
  return names.join(' → ');
};
console.log('cadena de Contact →', chainOf(contact));
console.log('cadena de Lead    →', chainOf(lead));

// Con Object.assign (ejemplo 05) no hay cadena: la última fuente pisa a la
// anterior sin avisar, y la versión pisada ya no se puede llamar.

// > Desde Python: class Contact(WithPhone, WithEmail, Model) tiene el MRO
//   Contact → WithPhone → WithEmail → Model, y super().validate() en cada
//   clase llama a la siguiente del MRO: la misma cooperación.
```
