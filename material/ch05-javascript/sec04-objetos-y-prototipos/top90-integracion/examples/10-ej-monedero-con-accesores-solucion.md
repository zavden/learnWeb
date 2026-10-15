---
example_description: "Solución: currency con defineProperty, internos no enumerables y propios, un setter que valida y guarda en _owner, balance como getter sin setter y withdraw que comprueba el saldo"
example_tags: "javascript|solucion|getters|setters|defineproperty|prototipos"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// SOLUCIÓN: el monedero de una app de pagos.
const money = (cents) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100);

function Wallet(owner, currency) {
  // De solo lectura pero visible: writable y configurable quedan a false.
  Object.defineProperty(this, 'currency', { value: currency, enumerable: true });
  // Internos: propios, escribibles y no enumerables (enumerable queda a false).
  Object.defineProperties(this, {
    _owner: { value: '', writable: true },
    _balanceCents: { value: 0, writable: true },
    movements: { value: [], writable: true }, // un array NUEVO para cada monedero
  });
  this.owner = owner; // pasa por el setter: ya existen los internos
}

Object.defineProperties(Wallet.prototype, {
  owner: {
    get() { return this._owner; },
    set(value) {
      const trimmed = String(value).trim();
      if (trimmed.length < 3) throw new RangeError(`Titular no válido: «${value}»`);
      this._owner = trimmed; // en _owner: this.owner llamaría otra vez al setter
    },
  },
  balance: {
    get() { return money(this._balanceCents); }, // sin set: de solo lectura
  },
});

Wallet.prototype.deposit = function (cents) {
  this._balanceCents += cents;
  this.movements.push(cents);
  return this;
};
Wallet.prototype.withdraw = function (cents) {
  if (cents > this._balanceCents) throw new RangeError(`Saldo insuficiente: ${this.balance}`);
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
