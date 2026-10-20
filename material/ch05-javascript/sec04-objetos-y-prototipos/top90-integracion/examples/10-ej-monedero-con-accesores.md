---
example_description: "Ejercicio: un monedero con propiedades de solo lectura, datos internos no enumerables, un setter que valida, un getter calculado y movimientos propios de cada cuenta"
example_tags: "javascript|ejercicio|getters|setters|defineproperty|prototipos"
exercise: true
exercise_title: "Un monedero con accesores"
exercise_instructions: "currency: créala con Object.defineProperty, de solo lectura pero enumerable (visible en Object.keys) || _owner, _balanceCents y movements: propiedades propias, escribibles y NO enumerables (Object.defineProperties); movements es un array nuevo para cada monedero || Borra la línea Wallet.prototype.movements = [] (el array compartido por todas las cuentas) || El setter de owner quita los espacios de los extremos y, si quedan menos de 3 caracteres, lanza un RangeError sin cambiar nada || Añade balance al prototipo: un getter sin setter que devuelva money(this._balanceCents) || withdraw lanza un RangeError, sin tocar el saldo ni los movimientos, si cents es mayor que el saldo || Ejecuta hasta que todas las comprobaciones salgan con ✓"
exercise_hints: "Object.defineProperty(this, 'currency', { value: currency, enumerable: true }): lo que no indicas vale false || Con defineProperties: { _owner: { value: '', writable: true }, … }; enumerable y configurable quedan a false || El setter guarda en this._owner: si asignas a this.owner, se llama a sí mismo sin fin || Un getter sin set es de solo lectura: asignarle algo no hace nada en un script clásico || Los datos de las propiedades internas tienen que existir ANTES de la línea this.owner = owner, que ya pasa por el setter"
exercise_solution_example: 10-ej-monedero-con-accesores-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
// EJERCICIO: el monedero de una app de pagos. Completa cada TODO hasta que todas
// las comprobaciones del final salgan ✓.
const money = (cents) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100);

function Wallet(owner, currency) {
  // TODO 1: de solo lectura pero visible en Object.keys → Object.defineProperty.
  this.currency = currency;
  // TODO 2: internos → propios, escribibles y NO enumerables (Object.defineProperties).
  //         movements también: un array nuevo para cada monedero.
  this._owner = '';
  this._balanceCents = 0;
  this.owner = owner; // pasa por el setter del prototipo
}

Object.defineProperties(Wallet.prototype, {
  owner: {
    get() { return this._owner; },
    set(value) {
      // TODO 3: quita los espacios de los extremos; con menos de 3 caracteres,
      //         lanza un RangeError (y no cambies nada).
      this._owner = value;
    },
  },
  // TODO 4: balance → un getter SIN setter que devuelva money(this._balanceCents).
});

// TODO 5: 🐛 este array lo comparten TODOS los monederos. Bórralo (ver TODO 2).
Wallet.prototype.movements = [];

Wallet.prototype.deposit = function (cents) {
  this._balanceCents += cents;
  this.movements.push(cents);
  return this;
};
Wallet.prototype.withdraw = function (cents) {
  // TODO 6: si cents es mayor que el saldo, lanza un RangeError sin tocar nada.
  this._balanceCents -= cents;
  this.movements.push(-cents);
  return this;
};
Wallet.prototype.toJSON = function () {
  return { owner: this.owner, currency: this.currency, balanceCents: this._balanceCents };
};

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, actual, expected) {
  if (actual === expected) {
    console.log('✓', description);
  } else {
    console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
  }
}
// Ejecuta fn y devuelve el nombre del error que lanza, o 'sin error'.
function errorName(fn) {
  try {
    fn();
    return 'sin error';
  } catch (error) {
    return error.name;
  }
}

const ana = new Wallet('  Ana Ruiz ', 'MXN');
const luis = new Wallet('Luis Pérez', 'MXN');
ana.deposit(150000).withdraw(24950);

check('Object.keys solo muestra currency', JSON.stringify(Object.keys(ana)), '["currency"]');
ana.currency = 'USD';
check('currency es de solo lectura', ana.currency, 'MXN');
check('el setter quita los espacios', ana.owner, 'Ana Ruiz');
check('un titular de 1 letra lanza RangeError', errorName(() => { luis.owner = ' L '; }), 'RangeError');
check('…y el titular no cambia', luis.owner, 'Luis Pérez');
check('balance formatea el saldo', ana.balance, '$1,250.50');
ana.balance = '$1,000,000.00';
check('balance no se puede asignar', ana.balance, '$1,250.50');
check('retirar más del saldo lanza RangeError', errorName(() => luis.withdraw(5000)), 'RangeError');
check('…y el saldo no cambia', luis.toJSON().balanceCents, 0);
check('cada monedero tiene sus movimientos', `${ana.movements.length} ${luis.movements.length}`, '2 0');
check("movements es propia", Object.hasOwn(ana, 'movements'), true);
check('JSON', JSON.stringify(ana), '{"owner":"Ana Ruiz","currency":"MXN","balanceCents":125050}');
```
