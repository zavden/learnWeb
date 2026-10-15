---
example_description: "Ejercicio: reescribir con class una jerarquía de tres niveles hecha con funciones constructoras, sin cambiar su comportamiento y ganando métodos no enumerables, estáticos heredados y un dato privado"
example_tags: "javascript|ejercicio|clases|herencia|refactorizar|privados|static"
exercise: true
exercise_title: "De constructoras a clases"
exercise_instructions: "El código usa funciones constructoras y prototipos, como en el módulo anterior, y funciona: las cinco primeras comprobaciones ya salen ✓ y deben seguir así || Reescribe Vehicle como class: constructor(id, owner), el campo trips = [], los métodos addTrip y describe, el getter totalKm y el estático of || Reescribe Bike con extends Vehicle: super(id, owner) antes de usar this, y describe con super.describe() || Reescribe EBike con extends Bike: guarda la batería en un campo privado #batteryWh, con el getter rangeKm y describe con super.describe() || Borra el código antiguo (las asignaciones a prototype, Object.create y defineProperty) || Ejecuta hasta que todas las comprobaciones salgan ✓"
exercise_hints: "Una clase puede tener campos (trips = []), métodos, get totalKm() { … } y static of(...args) { return new this(...args); } en el mismo bloque || En la clase hija, super(id, owner) sustituye a Vehicle.call(this, id, owner) y super.describe() a Vehicle.prototype.describe.call(this) || Un campo privado se declara arriba (#batteryWh;) y se asigna en el constructor después de super(…) || EBike.of funcionará solo: extends enlaza también las clases, así que los estáticos se heredan || Los métodos de class no son enumerables: por eso for…in dejará de listar describe y constructor"
exercise_solution_example: 08-ej-de-constructoras-a-clases-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
// EJERCICIO: la flota de una empresa de alquiler de bicicletas, escrita como en
// el módulo «Objetos y prototipos». Pásala a class sin cambiar lo que hace.

// TODO 1: reescribe Vehicle como class (constructor, campo trips, addTrip,
//         describe, get totalKm y static of).
function Vehicle(id, owner) {
  this.id = id;
  this.owner = owner;
  this.trips = [];
}
Vehicle.prototype.addTrip = function (km) {
  if (!(km > 0)) throw new RangeError(`Kilómetros no válidos: ${km}`);
  this.trips.push(km);
  return this;
};
Vehicle.prototype.describe = function () {
  return `${this.id} de ${this.owner}`;
};
Object.defineProperty(Vehicle.prototype, 'totalKm', {
  get() {
    return this.trips.reduce((sum, km) => sum + km, 0);
  },
});
Vehicle.of = function (...args) {
  return new this(...args);
};

// TODO 2: reescribe Bike con extends Vehicle, super(…) y super.describe().
function Bike(id, owner, gears) {
  Vehicle.call(this, id, owner);
  this.gears = gears;
}
Bike.prototype = Object.create(Vehicle.prototype);
Bike.prototype.constructor = Bike;
Bike.prototype.describe = function () {
  return `${Vehicle.prototype.describe.call(this)}, ${this.gears} velocidades`;
};

// TODO 3: reescribe EBike con extends Bike y la batería en un campo #batteryWh.
function EBike(id, owner, gears, batteryWh) {
  Bike.call(this, id, owner, gears);
  this._batteryWh = batteryWh;
}
EBike.prototype = Object.create(Bike.prototype);
EBike.prototype.constructor = EBike;
Object.defineProperty(EBike.prototype, 'rangeKm', {
  get() {
    return Math.round(this._batteryWh / 10); // ~10 Wh por kilómetro
  },
});
EBike.prototype.describe = function () {
  return `${Bike.prototype.describe.call(this)}, batería ${this._batteryWh} Wh`;
};

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
