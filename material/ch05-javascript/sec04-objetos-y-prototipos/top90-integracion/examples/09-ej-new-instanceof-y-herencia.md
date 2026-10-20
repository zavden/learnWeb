---
example_description: "Ejercicio: implementar myNew, myInstanceOf, inherit y findOwner, las cuatro piezas que hay debajo de new, instanceof, la herencia y la búsqueda de propiedades"
example_tags: "javascript|ejercicio|mynew|instanceof|herencia|prototipos"
exercise: true
exercise_title: "Escribe new, instanceof y la herencia a mano"
exercise_instructions: "myNew(Constructor, ...args): crea un objeto enlazado a Constructor.prototype, llama a Constructor con ese this y los argumentos, y devuélvelo (salvo que la constructora devuelva un objeto o una función: entonces, eso) || myInstanceOf(value, Constructor): false para los primitivos y null; si no, recorre la cadena de value con Object.getPrototypeOf buscando Constructor.prototype || inherit(Child, Parent): haz que Child.prototype herede de Parent.prototype y restaura constructor como propiedad NO enumerable || findOwner(obj, key): devuelve el eslabón de la cadena (el propio obj incluido) que tiene key como propiedad PROPIA, o null si no la tiene ninguno || Ejecuta hasta que todas las comprobaciones salgan con ✓"
exercise_hints: "myNew: Object.create(Constructor.prototype) hace los pasos 1 y 2; Constructor.apply(instance, args), el 3 || El paso 4 mira el tipo del resultado: typeof 'object' (sin ser null) o typeof 'function' || myInstanceOf: un for con proto = Object.getPrototypeOf(proto) hasta llegar a null || inherit: Object.create(Parent.prototype) y después Object.defineProperty(Child.prototype, 'constructor', { value: Child, writable: true, configurable: true }) || findOwner: empieza en obj y sube mientras no tenga la clave como propia (Object.hasOwn)"
exercise_solution_example: 09-ej-new-instanceof-y-herencia-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
// EJERCICIO: completa las cuatro funciones hasta que todas las comprobaciones salgan ✓.
// Son las piezas que hay debajo de new, instanceof, la herencia y la lectura obj.key.

function myNew(Constructor, ...args) {
  // TODO 1: crea un objeto cuyo [[Prototype]] sea Constructor.prototype.
  // TODO 2: llama a Constructor con ese objeto como this y con args.
  // TODO 3: si devuelve un objeto (no null) o una función, devuelve eso; si no, el objeto creado.
  return {}; // ← provisional: un objeto vacío sin enlazar
}

function myInstanceOf(value, Constructor) {
  // TODO 4: primitivos y null → false.
  // TODO 5: recorre la cadena de value buscando Constructor.prototype.
  return false; // ← provisional
}

function inherit(Child, Parent) {
  // TODO 6: Child.prototype tiene que heredar de Parent.prototype.
  // TODO 7: restaura Child.prototype.constructor, no enumerable.
}

function findOwner(obj, key) {
  // TODO 8: devuelve el primer objeto de la cadena (empezando por obj) que tenga key como PROPIA.
  return null; // ← provisional
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
