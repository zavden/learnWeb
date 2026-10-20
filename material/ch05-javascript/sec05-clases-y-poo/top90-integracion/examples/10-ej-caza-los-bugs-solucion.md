---
example_description: "Solución: flecha en seatAll, el dato solo en el campo privado, super() antes que this, una plantilla en el ticket, el mixin como subclase y freeze solo cuando new.target es la propia clase"
example_tags: "javascript|solucion|clases|depuracion|bugs|herencia|mixins"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// SOLUCIÓN: la app de reservas de la fonda «La Esquina», sin sus seis bugs.
const money = (cents) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100);

// ── Encapsulación ───────────────────────────────────────────────────────
class Reservation {
  #guests = 2; // ✅ 2. sin el campo público guests, que tapaba al get/set

  constructor({ name, guests = 2 }) {
    this.name = name;
    this.guests = guests; // ahora sí pasa por el setter
  }
  get guests() {
    return this.#guests;
  }
  set guests(value) {
    const count = Number(value);
    if (!Number.isInteger(count) || count < 1 || count > 12) throw new RangeError(`Mesas de 1 a 12 personas: ${value}`);
    this.#guests = count;
  }
  describe() {
    return `${this.name} (${this.guests})`;
  }
}

// ── Herencia con extends ────────────────────────────────────────────────
class VipReservation extends Reservation {
  constructor(data) {
    super(data); // ✅ 3. super() antes de usar this
    this.vip = true;
  }
  describe() {
    return `${super.describe()} VIP`;
  }
}

// ── Clases ──────────────────────────────────────────────────────────────
class Restaurant {
  seated = [];
  seat(name) {
    this.seated.push(new Reservation({ name }));
  }
  seatAll(names) {
    names.forEach((name) => this.seat(name)); // ✅ 1. la flecha conserva this
    return this.seated.length;
  }
}

// ── Polimorfismo y protocolos ───────────────────────────────────────────
class Bill {
  constructor(cents) {
    this.cents = cents;
  }
  toString() {
    return money(this.cents);
  }
  valueOf() {
    return this.cents;
  }
  receipt() {
    return `Total: ${this}`; // ✅ 4. la plantilla pide texto: usa toString
  }
}

// ── Composición y mixins ────────────────────────────────────────────────
// ✅ 5. Un mixin como subclase: su super busca en la clase que recibe.
const Highlightable = (Base) =>
  class Highlightable extends Base {
    describe() {
      return `⭐ ${super.describe()}`;
    }
  };
class FeaturedReservation extends Highlightable(Reservation) {}

// ── Patrones de diseño ──────────────────────────────────────────────────
class Table {
  constructor(number) {
    this.number = number;
    if (new.target === Table) Object.freeze(this); // ✅ 6. solo la clase final congela
  }
}
class BoothTable extends Table {
  seats = 6;
  constructor(number) {
    super(number);
    if (new.target === BoothTable) Object.freeze(this);
  }
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, actual, expected) {
  if (actual === expected) {
    console.log('✓', description);
  } else {
    console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
  }
}
// Ejecuta fn y devuelve su resultado, o el nombre del error que lanza.
function attempt(fn) {
  try {
    return fn();
  } catch (error) {
    return error.name;
  }
}

check('sienta a toda la lista de espera', attempt(() => new Restaurant().seatAll(['Ana', 'Luis', 'Carmen'])), 3);
check('rechaza una mesa de 40', attempt(() => new Reservation({ name: 'Grupo', guests: 40 })), 'RangeError');
check('guarda el número validado', attempt(() => typeof new Reservation({ name: 'Ana', guests: '4' }).guests), 'number');
check('crea una reserva VIP', attempt(() => new VipReservation({ name: 'Iker', guests: 3 }).describe()), 'Iker (3) VIP');
check('imprime el ticket', attempt(() => new Bill(125000).receipt()), 'Total: $1,250.00');
check('destaca una reserva', attempt(() => new FeaturedReservation({ name: 'Lucía' }).describe()), '⭐ Lucía (2)');
check('crea una mesa de gabinete', attempt(() => new BoothTable(5).seats), 6);
check('las mesas normales siguen congeladas', Object.isFrozen(new Table(1)), true);
```
