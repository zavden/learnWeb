---
example_description: "Solución: Vehicle, Bike y EBike con class, extends, super, un campo trips, getters, el estático of heredado y la batería en un campo privado"
example_tags: "javascript|solucion|clases|herencia|refactorizar|privados|static"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// SOLUCIÓN: la flota de una empresa de alquiler de bicicletas, con class.

class Vehicle {
  trips = []; // un array nuevo para cada vehículo

  constructor(id, owner) {
    this.id = id;
    this.owner = owner;
  }

  static of(...args) {
    return new this(...args); // this = la clase sobre la que se llama (EBike.of → EBike)
  }

  addTrip(km) {
    if (!(km > 0)) throw new RangeError(`Kilómetros no válidos: ${km}`);
    this.trips.push(km);
    return this;
  }

  describe() {
    return `${this.id} de ${this.owner}`;
  }

  get totalKm() {
    return this.trips.reduce((sum, km) => sum + km, 0);
  }
}

class Bike extends Vehicle {
  constructor(id, owner, gears) {
    super(id, owner); // antes: Vehicle.call(this, id, owner)
    this.gears = gears;
  }

  describe() {
    return `${super.describe()}, ${this.gears} velocidades`;
  }
}

class EBike extends Bike {
  #batteryWh;

  constructor(id, owner, gears, batteryWh) {
    super(id, owner, gears);
    this.#batteryWh = batteryWh;
  }

  get rangeKm() {
    return Math.round(this.#batteryWh / 10); // ~10 Wh por kilómetro
  }

  describe() {
    return `${super.describe()}, batería ${this.#batteryWh} Wh`;
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

const ebike = new EBike('EB-07', 'Sofía Ramírez', 9, 600);
const bike = new Bike('BK-02', 'Mateo Cruz', 21);
ebike.addTrip(12.5).addTrip(30);
const forIn = [];
for (const key in ebike) forIn.push(key);

// Comportamiento: ya funciona y debe seguir funcionando.
check('describe en tres niveles', ebike.describe(), 'EB-07 de Sofía Ramírez, 9 velocidades, batería 600 Wh');
check('autonomía calculada', ebike.rangeKm, 60);
check('kilómetros totales', ebike.totalKm, 42.5);
check('addTrip valida', attempt(() => bike.addTrip(-3)), 'RangeError');
check('cada vehículo tiene sus viajes', `${ebike.trips.length} ${bike.trips.length}`, '2 0');
// Lo que gana la versión con class:
check('EBike es una class', String(EBike).startsWith('class'), true);
check('for…in solo lista datos', forIn.sort().join(','), 'gears,id,owner,trips');
check('los estáticos se heredan', Object.getPrototypeOf(EBike) === Bike, true);
check('EBike.of crea una EBike', attempt(() => EBike.of('EB-08', 'Lía Gómez', 8, 500) instanceof EBike), true);
check('la batería es privada', Object.keys(ebike).sort().join(','), 'gears,id,owner,trips');
```
