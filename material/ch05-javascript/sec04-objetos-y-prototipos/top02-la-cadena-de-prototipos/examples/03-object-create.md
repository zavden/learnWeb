---
example_description: "Object.create(proto) crea un objeto vacío cuyo [[Prototype]] es proto: varios objetos comparten así los métodos de uno solo"
example_tags: "javascript|python|prototipos|object-create|delegacion"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Un objeto con los métodos que queremos compartir.
const accountMethods = {
  deposit(cents) {
    this.balanceCents += cents;
    return this;
  },
  describe() {
    return `${this.owner}: ${(this.balanceCents / 100).toFixed(2)} €`;
  },
};

// Object.create(proto) crea un objeto VACÍO cuyo [[Prototype]] es proto.
const anaAccount = Object.create(accountMethods);
anaAccount.owner = 'Ana Torres';
anaAccount.balanceCents = 12000;

const luisAccount = Object.create(accountMethods);
luisAccount.owner = 'Luis Romero';
luisAccount.balanceCents = 4550;

anaAccount.deposit(2500);
console.log(anaAccount.describe());  // 'Ana Torres: 145.00 €'
console.log(luisAccount.describe()); // 'Luis Romero: 45.50 €'

// Los datos son PROPIOS de cada cuenta; los métodos, del prototipo común.
console.log('propias de anaAccount →', Object.keys(anaAccount)); // ['owner', 'balanceCents']
console.log('¿el mismo describe? →', anaAccount.describe === luisAccount.describe); // true: una sola función
console.log('¿prototipo? →', Object.getPrototypeOf(anaAccount) === accountMethods); // true

// En la consola, expande anaAccount: [[Prototype]] es accountMethods
// (la consola lo resume como {…}; expándelo para ver deposit y describe).
console.log('anaAccount →', anaAccount);

// El segundo argumento (opcional) define propiedades con descriptores,
// como Object.defineProperties (lección «Propiedades a fondo»):
const savings = Object.create(accountMethods, {
  owner: { value: 'Ana Torres', enumerable: true },
  balanceCents: { value: 50000, writable: true, enumerable: true },
});
console.log(savings.describe()); // 'Ana Torres: 500.00 €'

// En un literal, la clave especial __proto__ también fija el prototipo:
const quickAccount = { __proto__: accountMethods, owner: 'Iker Sanz', balanceCents: 0 };
console.log(quickAccount.describe()); // 'Iker Sanz: 0.00 €'

// > Desde Python: no hay equivalente directo. Lo más parecido sería que cada
//   instancia pudiera elegir de qué OBJETO hereda, sin clases de por medio.
```
