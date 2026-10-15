---
example_description: "Un «class» hecho a mano: helpers para métodos no enumerables, herencia de prototipos y de estáticos, una guardia contra olvidar new y myNew, aplicados a cuentas bancarias"
example_tags: "javascript|integracion|constructoras|herencia|mynew|estaticos"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// UN «CLASS» HECHO A MANO: tres helpers que hacen lo que la sintaxis class del
// módulo siguiente hará por ti, aplicados a las cuentas de un banco.
// Integra: new, myNew e instanceof («Funciones constructoras y new»), herencia y
// setPrototypeOf al preparar («Herencia prototípica»), descriptores («Propiedades a fondo»).

// 1. Métodos NO enumerables, como los de class y los nativos.
function defineMethods(Type, methods) {
  for (const [name, fn] of Object.entries(methods)) {
    Object.defineProperty(Type.prototype, name, { value: fn, writable: true, enumerable: false, configurable: true });
  }
}

// 2. Dos cadenas, como `class Child extends Parent`: la de los prototipos (métodos
//    de las instancias) y la de las constructoras (métodos estáticos).
function extend(Child, Parent) {
  Object.setPrototypeOf(Child.prototype, Parent.prototype); // al preparar: aceptable, y conserva constructor
  Object.setPrototypeOf(Child, Parent);
}

// 3. new paso a paso (lección «Funciones constructoras y new»).
function myNew(Constructor, ...args) {
  const instance = Object.create(Constructor.prototype);
  const result = Constructor.apply(instance, args);
  return (typeof result === 'object' && result !== null) || typeof result === 'function' ? result : instance;
}

const money = (cents) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100);

function Account(owner, balanceCents = 0) {
  // Guardia contra olvidar new. No sirve new.target: la constructora hija llama a
  // Account.call(this, …) SIN new, y ahí new.target es undefined. (class resuelve
  // ese caso con super(), que verás en el módulo siguiente).
  if (!(this instanceof Account)) throw new TypeError('Account se crea con new');
  this.owner = owner;
  this.balanceCents = balanceCents;
}
defineMethods(Account, {
  available() { return this.balanceCents; },
  deposit(cents) { this.balanceCents += cents; return this; },
  withdraw(cents) {
    if (cents > this.available()) throw new RangeError(`${this.owner}: fondos insuficientes para ${money(cents)}`);
    this.balanceCents -= cents;
    return this;
  },
  describe() { return `${this.constructor.name} de ${this.owner}: ${money(this.balanceCents)}`; },
});
// Estático: se llama sobre la constructora, y su this es la constructora que lo llama.
Account.open = function (owner) {
  return new this(owner);
};

function CreditAccount(owner, balanceCents = 0, limitCents = 500000) {
  Account.call(this, owner, balanceCents);
  this.limitCents = limitCents;
}
extend(CreditAccount, Account);
defineMethods(CreditAccount, {
  available() { return this.balanceCents + this.limitCents; }, // sobrescrito: incluye el crédito
  describe() { return `${Account.prototype.describe.call(this)} (límite ${money(this.limitCents)})`; },
});

// ── Uso ─────────────────────────────────────────────────────────────────
const payroll = new Account('Valeria Ortiz', 1250000);
const card = CreditAccount.open('Diego Hernández'); // estático heredado: this = CreditAccount
card.deposit(80000).withdraw(320000); // puede quedar en negativo hasta el límite
console.log(payroll.describe());
console.log(card.describe());
try {
  card.withdraw(300000);
} catch (error) {
  console.warn(`⛔ ${error.message}`);
}

// ── Comprobaciones: lo mismo que hará class ─────────────────────────────
const keys = [];
for (const key in card) keys.push(key);
console.log('for…in →', keys); // solo datos: los métodos no son enumerables

// Comparación: métodos añadidos con una asignación SÍ salen en for…in.
function PlainAccount(owner) { this.owner = owner; }
PlainAccount.prototype.deposit = function () {};
const plainKeys = [];
for (const key in new PlainAccount('Ana')) plainKeys.push(key);
console.log('for…in con asignación →', plainKeys);

console.log('cadena de prototipos →', Object.getPrototypeOf(CreditAccount.prototype) === Account.prototype);
console.log('cadena de constructoras →', Object.getPrototypeOf(CreditAccount) === Account);
console.log('card.constructor →', card.constructor.name); // setPrototypeOf no lo pierde
console.log('¿instanceof las dos? →', card instanceof CreditAccount, card instanceof Account);

const viaMyNew = myNew(CreditAccount, 'Sofía Ramírez', 0, 200000);
console.log('myNew →', viaMyNew, '|', viaMyNew.describe());

try {
  Account('Sin new');
} catch (error) {
  console.warn(`⛔ sin new → ${error.name}: ${error.message}`);
}

// En el módulo «Clases y POO» todo esto será:
//   class Account { constructor(owner, balanceCents = 0) {…} available() {…} … static open(owner) {…} }
//   class CreditAccount extends Account { constructor(…) { super(owner, balanceCents); … } … }
```
