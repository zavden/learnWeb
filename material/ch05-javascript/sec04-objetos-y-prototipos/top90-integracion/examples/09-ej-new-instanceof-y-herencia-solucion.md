---
example_description: "Solución: myNew con Object.create y apply, myInstanceOf recorriendo la cadena, inherit con constructor no enumerable y findOwner con Object.hasOwn"
example_tags: "javascript|solucion|mynew|instanceof|herencia|prototipos"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// SOLUCIÓN: las cuatro piezas que hay debajo de new, instanceof, la herencia y obj.key.

function myNew(Constructor, ...args) {
  const instance = Object.create(Constructor.prototype);   // pasos 1 y 2
  const result = Constructor.apply(instance, args);         // paso 3
  const returnedObject = (typeof result === 'object' && result !== null) || typeof result === 'function';
  return returnedObject ? result : instance;                // paso 4
}

function myInstanceOf(value, Constructor) {
  if (value === null || (typeof value !== 'object' && typeof value !== 'function')) return false;
  for (let proto = Object.getPrototypeOf(value); proto !== null; proto = Object.getPrototypeOf(proto)) {
    if (proto === Constructor.prototype) return true;
  }
  return false;
}

function inherit(Child, Parent) {
  Child.prototype = Object.create(Parent.prototype);
  Object.defineProperty(Child.prototype, 'constructor', {
    value: Child, writable: true, enumerable: false, configurable: true,
  });
  // Alternativa equivalente: Object.setPrototypeOf(Child.prototype, Parent.prototype),
  // que conserva el constructor original (lección «Herencia prototípica»).
}

function findOwner(obj, key) {
  for (let current = obj; current !== null; current = Object.getPrototypeOf(current)) {
    if (Object.hasOwn(current, key)) return current;
  }
  return null;
}

// ── Una jerarquía para probarlas (no hace falta tocarla) ────────────────
function Vehicle(owner, wheels) {
  this.owner = owner;
  this.wheels = wheels;
}
Vehicle.prototype.describe = function () { return `Vehículo de ${this.owner} (${this.wheels} ruedas)`; };
Vehicle.prototype.needsLicense = function () { return false; };

function Bike(owner) {
  Vehicle.call(this, owner, 2);
}
inherit(Bike, Vehicle);
Bike.prototype.describe = function () { return `Bicicleta de ${this.owner}`; };

function ElectricBike(owner, watts) {
  Bike.call(this, owner);
  this.watts = watts;
}
inherit(ElectricBike, Bike);
ElectricBike.prototype.describe = function () { return `${Bike.prototype.describe.call(this)}, eléctrica de ${this.watts} W`; };
ElectricBike.prototype.needsLicense = function () { return this.watts > 250; }; // más de 250 W: ciclomotor

function Draft(title) {
  return { title, status: 'borrador' }; // devuelve OTRO objeto
}
function Counter() {
  this.count = 0;
  return 42; // un primitivo: new lo ignora
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, actual, expected) {
  if (actual === expected) {
    console.log('✓', description);
  } else {
    console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
  }
}
// Ejecuta fn y devuelve su resultado, o el error como texto (así nada detiene el script).
function attempt(fn) {
  try {
    return fn();
  } catch (error) {
    return `${error.name}: ${error.message}`;
  }
}

const van = myNew(Vehicle, 'Ana Torres', 4);
check('myNew: los datos', JSON.stringify(van), '{"owner":"Ana Torres","wheels":4}');
check('myNew: el prototipo es Vehicle.prototype', Object.getPrototypeOf(van) === Vehicle.prototype, true);
check('myNew: hereda los métodos', attempt(() => van.describe()), 'Vehículo de Ana Torres (4 ruedas)');
check('myNew: constructora que devuelve un objeto', attempt(() => myNew(Draft, 'Informe').status), 'borrador');
check('myNew: constructora que devuelve un primitivo', attempt(() => myNew(Counter).count), 0);

const ebike = new ElectricBike('Leo Martín', 500);
check('myInstanceOf: ElectricBike y Vehicle', `${myInstanceOf(ebike, ElectricBike)} ${myInstanceOf(ebike, Vehicle)}`, 'true true');
check('myInstanceOf: Object está al final', myInstanceOf(ebike, Object), true);
check("myInstanceOf: 'texto' y new String('texto')", `${myInstanceOf('texto', String)} ${myInstanceOf(new String('texto'), String)}`, 'false true');
check('myInstanceOf: null, sin prototipo y Object.create(Bike.prototype)',
  `${myInstanceOf(null, Object)} ${myInstanceOf(Object.create(null), Object)} ${myInstanceOf(Object.create(Bike.prototype), Bike)}`,
  'false false true');

check('inherit: ebike es un Vehicle', ebike instanceof Vehicle, true);
check('inherit: constructor (=== Bike / enumerable / cadena)',
  `${Bike.prototype.constructor === Bike}/${Object.getOwnPropertyDescriptor(Bike.prototype, 'constructor')?.enumerable}/${Object.getPrototypeOf(Bike.prototype) === Vehicle.prototype}`,
  'true/false/true');
check('inherit: un método heredado de Vehicle', attempt(() => new Bike('Iker').needsLicense()), false);
check('inherit: describe combina dos niveles', attempt(() => ebike.describe()), 'Bicicleta de Leo Martín, eléctrica de 500 W');
check('inherit: el padre no se contamina', new Vehicle('Rosa', 4).describe(), 'Vehículo de Rosa (4 ruedas)');

check('findOwner: owner es propia', findOwner(ebike, 'owner') === ebike, true);
check('findOwner: describe está en ElectricBike.prototype', findOwner(ebike, 'describe') === ElectricBike.prototype, true);
check('findOwner: needsLicense de una Bike está en Vehicle.prototype', findOwner(new Bike('Iker'), 'needsLicense') === Vehicle.prototype, true);
check('findOwner: toString está en Object.prototype', findOwner(ebike, 'toString') === Object.prototype, true);
check('findOwner: una clave que no existe', attempt(() => findOwner(ebike, 'isbn')), null);
```
