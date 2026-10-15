---
example_description: "Un kit de colecciones al estilo de Python: Counter (una subclase de Map con mostCommon, elements y resta), defaultdict y árboles que se crean solos con Proxy, listas con índices negativos, IndexError y rebanadas como lista['1:6:2'], y namedtuple con desestructuración, with y Symbol.toStringTag"
example_tags: "javascript|profesional|python|proxy|generadores|symbol|colecciones|counter"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// COLECCIONES AL ESTILO DE PYTHON, aplicadas a un recetario de cocina mexicana.
//
// Decisiones:
// - Counter hereda de Map (lección «Herencia con extends»): get() devuelve 0 para
//   lo que falta, mostCommon(n) ordena, elements() es un GENERADOR que repite
//   cada clave tantas veces como cuenta, y subtract() devuelve un Counter nuevo.
// - defaultDict es un Proxy: crea las claves de texto que faltan al leerlas,
//   pero deja pasar los símbolos y toJSON, que lee el propio lenguaje. Con una
//   fábrica que se llama a sí misma sale el «árbol que se crea solo» de Python:
//   tree = lambda: defaultdict(tree).
// - pyList es un Proxy sobre un array: índices negativos, IndexError fuera de
//   rango, rebanadas con la sintaxis de Python como clave de texto
//   (temps['1:6:2'], temps['::-1']) y un `in` que busca valores.
// - namedTuple crea una clase de registros inmutables: campos con nombre,
//   desestructuración por posición (Symbol.iterator), with() para copias
//   modificadas, toString legible y Symbol.toStringTag.
//
// Alcance: módulos 1-6 (sin expresiones regulares).

// ── Counter ────────────────────────────────────────────────────────────────
class Counter extends Map {
  static from(iterable) {
    const counter = new Counter();
    for (const item of iterable) counter.set(item, counter.get(item) + 1);
    return counter;
  }
  get(key) {
    return super.get(key) ?? 0;
  }
  get total() {
    return this.values().reduce((sum, count) => sum + count, 0);
  }
  mostCommon(n = this.size) {
    return [...this].toSorted((a, b) => b[1] - a[1]).slice(0, n);
  }
  *elements() {
    for (const [key, count] of this) for (let i = 0; i < count; i++) yield key;
  }
  subtract(other) { // solo quedan los positivos, como el - de Counter
    const result = new Counter();
    for (const [key, count] of this) if (count - other.get(key) > 0) result.set(key, count - other.get(key));
    return result;
  }
  get [Symbol.toStringTag]() {
    return 'Counter';
  }
  toJSON() {
    return Object.fromEntries(this);
  }
}

// ── defaultdict y el árbol que se crea solo ────────────────────────────────
function defaultDict(factory) {
  return new Proxy({}, {
    get(target, key, receiver) {
      if (typeof key === 'string' && key !== 'toJSON' && !Object.hasOwn(target, key)) target[key] = factory();
      return Reflect.get(target, key, receiver);
    },
  });
}
const tree = () => defaultDict(tree);

// ── Listas con índices negativos y rebanadas ───────────────────────────────
class PyIndexError extends RangeError {
  constructor(index, length) {
    super(`list index out of range: ${index} (len ${length})`);
    this.name = 'IndexError';
  }
}

function sliceIndices(length, [startText, stopText, stepText]) {
  const step = stepText === undefined || stepText === '' ? 1 : Number(stepText);
  if (!Number.isInteger(step) || step === 0) throw new RangeError(`paso de rebanada no válido: ${stepText}`);
  const bound = (text, fallback) => {
    if (text === undefined || text === '') return fallback;
    let n = Number(text);
    if (!Number.isInteger(n)) throw new TypeError(`índice de rebanada no válido: ${text}`);
    if (n < 0) n += length;
    return step > 0 ? Math.min(Math.max(n, 0), length) : Math.min(Math.max(n, -1), length - 1);
  };
  const start = bound(startText, step > 0 ? 0 : length - 1);
  const stop = bound(stopText, step > 0 ? length : -1);
  const indices = [];
  for (let i = start; step > 0 ? i < stop : i > stop; i += step) indices.push(i);
  return indices;
}

const isIndex = (key) => typeof key === 'string' && key !== '' && Number.isInteger(Number(key));

function pyList(array) {
  const resolve = (target, key) => {
    const index = Number(key);
    const actual = index < 0 ? target.length + index : index;
    if (actual < 0 || actual >= target.length) throw new PyIndexError(index, target.length);
    return actual;
  };
  return new Proxy(array, {
    get(target, key, receiver) {
      if (typeof key === 'string' && key.includes(':')) {
        return pyList(sliceIndices(target.length, key.split(':')).map((i) => target[i]));
      }
      if (isIndex(key)) return target[resolve(target, key)];
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      if (isIndex(key) && Number(key) < 0) return Reflect.set(target, resolve(target, key), value);
      return Reflect.set(target, key, value, receiver);
    },
    // __contains__: busca VALORES. `24 in temps` llega como la clave '24' (in
    // convierte a texto), así que también se compara como texto.
    has: (target, key) => target.some((item) => item === key || String(item) === key),
  });
}

// ── namedtuple ─────────────────────────────────────────────────────────────
function namedTuple(typeName, fields) {
  const NamedTuple = class {
    constructor(...values) {
      if (values.length !== fields.length) throw new TypeError(`${typeName} espera ${fields.length} valores y recibió ${values.length}`);
      fields.forEach((field, i) => (this[field] = values[i]));
      Object.freeze(this);
    }
    static fields = Object.freeze([...fields]);
    *[Symbol.iterator]() {
      for (const field of fields) yield this[field];
    }
    with(changes) {
      return new NamedTuple(...fields.map((field) => (Object.hasOwn(changes, field) ? changes[field] : this[field])));
    }
    equals(other) {
      return other instanceof NamedTuple && fields.every((field) => Object.is(this[field], other[field]));
    }
    toString() {
      return `${typeName}(${fields.map((field) => `${field}=${JSON.stringify(this[field])}`).join(', ')})`;
    }
    get [Symbol.toStringTag]() {
      return typeName;
    }
  };
  Object.defineProperty(NamedTuple, 'name', { value: typeName });
  return NamedTuple;
}

// ── El recetario ───────────────────────────────────────────────────────────
const recipes = [
  { name: 'Mole poblano', region: 'Puebla', ingredients: ['chile ancho', 'chile mulato', 'chocolate', 'ajonjolí', 'tortilla'] },
  { name: 'Cochinita pibil', region: 'Yucatán', ingredients: ['achiote', 'naranja agria', 'cerdo', 'cebolla morada'] },
  { name: 'Pozole rojo', region: 'Guerrero', ingredients: ['maíz cacahuazintle', 'cerdo', 'chile guajillo', 'cebolla', 'orégano'] },
  { name: 'Chiles en nogada', region: 'Puebla', ingredients: ['chile poblano', 'nuez de Castilla', 'granada', 'cerdo'] },
  { name: 'Sopa de lima', region: 'Yucatán', ingredients: ['lima', 'pollo', 'tortilla', 'cebolla morada'] },
  { name: 'Tlayuda', region: 'Oaxaca', ingredients: ['tortilla', 'asiento', 'frijol', 'quesillo', 'tasajo'] },
];

console.group('Counter');
const usage = Counter.from(recipes.flatMap((recipe) => recipe.ingredients));
console.log('más usados →', usage.mostCommon(3).map(([item, count]) => `${item} ×${count}`).join(' · '));
console.log("get('azafrán') →", usage.get('azafrán'), '| total →', usage.total, '| etiqueta →', Object.prototype.toString.call(usage));
const needed = Counter.from(['tortilla', 'tortilla', 'cerdo', 'cebolla morada', 'cebolla morada', 'lima']);
const pantry = Counter.from(['tortilla', 'cerdo', 'cerdo', 'cebolla morada']);
const shopping = needed.subtract(pantry);
console.log('lista de la compra →', JSON.stringify(shopping), '| elements() →', [...shopping.elements()]);
console.groupEnd();

console.group('defaultdict');
const byRegion = defaultDict(() => []);
for (const recipe of recipes) byRegion[recipe.region].push(recipe.name);
console.log('por región →', JSON.stringify(byRegion));
const sales = tree(); // ventas[mes][sucursal][plato]
sales.octubre.Centro.pozole = 42;
sales.octubre.Centro.tlayuda = 18;
sales.octubre.Coyoacán.pozole = 35;
console.log('árbol →', JSON.stringify(sales));
console.groupEnd();

console.group('Listas al estilo de Python');
const temps = pyList([14, 17, 21, 24, 22, 19, 16]); // °C de lunes a domingo
console.log("temps[-1], temps['-3:'] →", temps[-1], [...temps['-3:']]);
console.log("temps['::-1'] →", [...temps['::-1']], "| temps['1:6:2'] →", [...temps['1:6:2']]);
console.log("temps['5:1:-2'] →", [...temps['5:1:-2']], "| temps[':-1'].length →", temps[':-1'].length);
console.log('24 in temps →', 24 in temps, '| 30 in temps →', 30 in temps);
temps[-1] = 18;
console.log('tras temps[-1] = 18 →', temps.join(', '));
for (const code of ['temps[7]', 'temps[-8]']) {
  try {
    console.log(code === 'temps[7]' ? temps[7] : temps[-8]);
  } catch (error) {
    console.warn(`⛔ ${code} → ${error.name}: ${error.message}`);
  }
}
console.groupEnd();

console.group('namedtuple');
const Store = namedTuple('Store', ['name', 'city', 'rating']);
const stores = [new Store('La Cocina de Doña Mary', 'Mérida', 4.8), new Store('El Rincón Poblano', 'Puebla', 4.5), new Store('Tlayudas Lupita', 'Oaxaca', 4.9)];
const best = stores.toSorted((a, b) => b.rating - a.rating)[0];
const [bestName, bestCity] = best; // desestructuración por posición
console.log(`la mejor → ${bestName}, en ${bestCity} | ${best}`);
const moved = best.with({ city: 'Ciudad de México' });
console.log('with →', String(moved), '| original intacto →', best.city, '| ¿congelado? →', Object.isFrozen(moved));
console.log('equals →', best.equals(new Store('Tlayudas Lupita', 'Oaxaca', 4.9)), '| campos →', Store.fields, '| clase →', Store.name);
try {
  new Store('Solo un nombre');
} catch (error) {
  console.warn(`⛔ ${error.name}: ${error.message}`);
}
console.groupEnd();
```
