---
example_description: "Un monedero con saldo privado, un constructor que solo usa la fábrica estática, una jerarquía de errores propios con code y cause, comprobación de marca en las transferencias y una operación que se deshace si falla a medias"
example_tags: "javascript|integracion|clases|privados|static|errores|cause"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// UN MONEDERO DE UNA APP DE PAGOS.
// Integra: campos y métodos #privados, static, bloques static y #x in obj
// («Encapsulación»), errores propios con extends Error («Herencia con extends»)
// y getters de solo lectura.
const money = (cents) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100);

// ── Errores del dominio ───────────────────────────────────────────────
class WalletError extends Error {
  constructor(message, { code, ...options } = {}) {
    super(message, options); // options puede traer cause
    this.name = new.target.name;
    this.code = code;
  }
}
class InsufficientFundsError extends WalletError {
  constructor(owner, missingCents) {
    super(`${owner}: faltan ${money(missingCents)}`, { code: 'insufficient-funds' });
    this.missingCents = missingCents;
  }
}

// Convierte '1,250.50' en 125050 centavos; lanza RangeError si no puede.
function parseAmount(text) {
  const cents = Math.round(Number(String(text).replaceAll(',', '')) * 100);
  if (!Number.isFinite(cents) || cents <= 0) throw new RangeError(`«${text}» no es un importe`);
  return cents;
}

class Wallet {
  static #creating = false; // solo la fábrica puede llamar al constructor
  static #nextId = 1;
  #balanceCents = 0;
  #history = [];

  static open(owner) {
    const name = String(owner ?? '').trim();
    if (name.length < 3) throw new WalletError(`Titular no válido: «${owner}»`, { code: 'bad-owner' });
    Wallet.#creating = true;
    try {
      return new Wallet(name);
    } finally {
      Wallet.#creating = false;
    }
  }

  constructor(owner) {
    if (!Wallet.#creating) throw new TypeError('Usa Wallet.open(titular)');
    this.id = `W-${String(Wallet.#nextId++).padStart(3, '0')}`;
    this.owner = owner;
  }

  get balance() {
    return money(this.#balanceCents); // de solo lectura: no hay setter
  }

  #toCents(amount) {
    try {
      return parseAmount(amount);
    } catch (error) {
      throw new WalletError(`Importe no válido en ${this.id}`, { code: 'bad-amount', cause: error });
    }
  }

  deposit(amount) {
    const cents = this.#toCents(amount);
    this.#balanceCents += cents;
    this.#history.push(cents);
    return this;
  }

  withdraw(amount) {
    const cents = this.#toCents(amount);
    if (cents > this.#balanceCents) throw new InsufficientFundsError(this.owner, cents - this.#balanceCents);
    this.#balanceCents -= cents;
    this.#history.push(-cents);
    return this;
  }

  transferTo(other, amount) {
    if (typeof other !== 'object' || other === null || !(#balanceCents in other)) {
      throw new WalletError('El destino no es un monedero', { code: 'not-a-wallet' });
    }
    this.withdraw(amount); // si falla, no se ha tocado nada
    other.deposit(amount);
    return this;
  }

  toJSON() {
    return { id: this.id, owner: this.owner, balanceCents: this.#balanceCents, movements: this.#history.length };
  }
}

const ana = Wallet.open('  Ana Ruiz ').deposit('1,500.00');
const luis = Wallet.open('Luis Pérez');

const operations = [
  ['Ana transfiere 320.50 a Luis', () => ana.transferTo(luis, '320.50')],
  ['Luis retira 500', () => luis.withdraw('500')],
  ['Ana deposita «mil»', () => ana.deposit('mil')],
  ['Ana transfiere a un objeto parecido', () => ana.transferTo({ deposit() {} }, '10')],
  ['alta con titular vacío', () => Wallet.open(' ')],
  ['new Wallet sin la fábrica', () => new Wallet('Intrusa')],
];
for (const [label, run] of operations) {
  try {
    run();
    console.log(`✅ ${label}`);
  } catch (error) {
    if (!(error instanceof WalletError) && !(error instanceof TypeError)) throw error;
    const cause = error.cause ? ` | causa: ${error.cause.name}: ${error.cause.message}` : '';
    console.warn(`⛔ ${label} → ${error.name} [${error.code ?? 'sin código'}] ${error.message}${cause}`);
  }
}

console.log('saldos →', ana.balance, '|', luis.balance);
console.log('JSON →', JSON.stringify([ana, luis]));
console.log('Object.keys(ana) →', Object.keys(ana)); // el saldo no es una propiedad
ana.balance = '$1,000,000.00'; // getter sin setter: no cambia nada
console.log('¿instanceof? →', new InsufficientFundsError('x', 1) instanceof WalletError, '| saldo de Ana →', ana.balance);
```
