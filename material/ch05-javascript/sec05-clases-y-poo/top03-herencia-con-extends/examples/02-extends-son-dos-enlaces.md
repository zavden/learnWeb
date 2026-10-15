---
example_description: "extends crea los dos enlaces que hacías a mano: Child.prototype hereda de Parent.prototype (métodos) y Child hereda de Parent (estáticos), así que un estático con new this crea objetos de la subclase"
example_tags: "javascript|clases|herencia|extends|prototipos|static"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
class Account {
  constructor(owner, balanceCents = 0) {
    this.owner = owner;
    this.balanceCents = balanceCents;
  }
  available() {
    return this.balanceCents;
  }
  // Estático con new this: crea un objeto de la clase sobre la que se llama.
  static open(owner) {
    return new this(owner);
  }
}

class CreditAccount extends Account {
  limitCents = 500000;
  available() {
    return this.balanceCents + this.limitCents;
  }
}

// Enlace 1: los prototipos (métodos de las instancias).
console.log('① CreditAccount.prototype → Account.prototype:',
  Object.getPrototypeOf(CreditAccount.prototype) === Account.prototype);
// Enlace 2: las propias clases (estáticos). Antes: Object.setPrototypeOf(Child, Parent).
console.log('② CreditAccount → Account:', Object.getPrototypeOf(CreditAccount) === Account);
console.log('   y Account → Function.prototype:', Object.getPrototypeOf(Account) === Function.prototype);

// Gracias al enlace ②, CreditAccount.open existe (heredado), y como dentro
// de open this es CreditAccount, new this(…) crea una cuenta de crédito.
const card = CreditAccount.open('Diego Hernández');
console.log('card →', card);
console.log('¿instanceof CreditAccount? →', card instanceof CreditAccount);
console.log('available →', card.available()); // el sobrescrito: 500000
console.log("¿'open' es propia de CreditAccount? →", Object.hasOwn(CreditAccount, 'open')); // false: heredado

//   CreditAccount ──[[Prototype]]──► Account ──► Function.prototype   (estáticos: open)
//        │ .prototype                   │ .prototype
//        ▼                              ▼
//   CreditAccount.prototype ─────► Account.prototype ──► Object.prototype   (métodos)
//        ▲
//   card { owner, balanceCents, limitCents }

// Esto es lo que hacía el helper extend del módulo anterior:
//   Object.setPrototypeOf(Child.prototype, Parent.prototype);
//   Object.setPrototypeOf(Child, Parent);
```
