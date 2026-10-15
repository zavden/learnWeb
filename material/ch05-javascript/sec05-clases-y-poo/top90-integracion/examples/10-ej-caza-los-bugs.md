---
example_description: "Ejercicio: la app de reservas de un restaurante tiene seis bugs, uno por cada lección del módulo (this perdido, un campo que tapa un setter, this antes de super, valueOf en una concatenación, super en un mixin copiado y freeze en el constructor del padre)"
example_tags: "javascript|ejercicio|clases|depuracion|bugs|herencia|mixins"
exercise: true
exercise_title: "Caza los seis bugs del restaurante"
exercise_instructions: "La app de reservas tiene seis bugs, uno en cada sección marcada con el nombre de una lección. Ninguno detiene el script: las comprobaciones atrapan los errores y los muestran como texto || Clases: seatAll pasa un método como callback y pierde this || Encapsulación: la validación del número de comensales no se ejecuta nunca || Herencia con extends: VipReservation no se puede crear || Polimorfismo y protocolos: el ticket se imprime con los centavos en lugar del precio || Composición y mixins: el mixin highlightable falla al llamar a super || Patrones de diseño: BoothTable no puede crear sus campos. La última comprobación ya sale ✓ y debe seguir así || Ejecuta hasta que todas las comprobaciones salgan ✓"
exercise_hints: "Un método pasado como valor (forEach(this.seat)) se llama sin objeto: usa una flecha o bind || Un campo con el mismo nombre que un get/set crea una propiedad propia que tapa al accesor: guarda el dato solo en el campo privado || En una clase hija, this no existe hasta que super(…) vuelve || 'Total: ' + bill usa valueOf; una plantilla usa toString || Un método copiado con Object.assign conserva su super: convierte el mixin en una función (Base) => class extends Base || Congela solo si new.target es la propia clase"
exercise_solution_example: 10-ej-caza-los-bugs-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
// EJERCICIO: la app de reservas de la fonda «La Esquina». Hay seis bugs, uno por
// lección. Encuéntralos y arréglalos hasta que todas las comprobaciones salgan ✓.
const money = (cents) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100);

// ── Encapsulación ───────────────────────────────────────────────────────
class Reservation {
  guests = 2;
  #guests = 2;

  constructor({ name, guests = 2 }) {
    this.name = name;
    this.guests = guests;
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
    this.vip = true;
    super(data);
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
    names.forEach(this.seat);
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
    return 'Total: ' + this;
  }
}

// ── Composición y mixins ────────────────────────────────────────────────
const highlightable = {
  describe() {
    return `⭐ ${super.describe()}`;
  },
};
class FeaturedReservation extends Reservation {}
Object.assign(FeaturedReservation.prototype, highlightable);

// ── Patrones de diseño ──────────────────────────────────────────────────
class Table {
  constructor(number) {
    this.number = number;
    Object.freeze(this);
  }
}
class BoothTable extends Table {
  seats = 6;
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
