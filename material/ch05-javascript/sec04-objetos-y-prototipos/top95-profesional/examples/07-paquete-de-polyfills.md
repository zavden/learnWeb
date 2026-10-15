---
example_description: "Un paquete de siete polyfills (at, findLast, toSorted, with, Object.hasOwn, Object.groupBy) con detección por comportamiento, instalación no enumerable, un entorno antiguo simulado y un mini ejecutor de pruebas contra los métodos nativos"
example_tags: "javascript|profesional|polyfills|prototipos-nativos|pruebas|defineproperty"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// PAQUETE DE POLYFILLS con detección y pruebas, como los que se generan con core-js
// para los navegadores antiguos que una tienda online todavía tiene que soportar.
//
// Decisiones:
// - Cada polyfill es un registro: dónde va, con qué nombre, su implementación, una
//   detección por COMPORTAMIENTO (que exista no basta: puede estar mal) y sus casos de
//   prueba.
// - install(env) instala solo lo que falta o falla, con los atributos de un método
//   nativo (writable, configurable y NO enumerable), y devuelve un informe.
// - Chrome ya lo tiene todo, así que el paquete también se instala en un «entorno
//   antiguo» simulado: objetos vacíos que hacen de Array.prototype, String.prototype y
//   Object, uno de ellos con un `with` defectuoso de una librería vieja. El Chrome real
//   nunca se modifica.
// - Las implementaciones son genéricas (solo usan this.length y this[i]): se prueban
//   prestándolas con call sobre arrays y strings reales y se comparan, caso a caso, con
//   el método nativo, errores incluidos.
// - toSorted y with copian sin mutar; Object.groupBy devuelve un objeto sin prototipo,
//   como el nativo.
//
// Alcance: módulos 1-4. (for…of sobre iterables se estudia a fondo en el módulo 6.)

// ── Implementaciones ────────────────────────────────────────────────────
const toIndex = (value) => Math.trunc(Number(value)) || 0; // NaN, undefined y -0 → 0

function at(index) {
  let relative = toIndex(index);
  if (relative < 0) relative += this.length;
  return relative < 0 || relative >= this.length ? undefined : this[relative];
}
function findLast(predicate, thisArg) {
  if (typeof predicate !== 'function') throw new TypeError(`${String(predicate)} is not a function`);
  for (let index = this.length - 1; index >= 0; index -= 1) {
    if (predicate.call(thisArg, this[index], index, this)) return this[index];
  }
  return undefined;
}
function toSorted(compareFn) {
  if (compareFn !== undefined && typeof compareFn !== 'function') {
    throw new TypeError('The comparison function must be either a function or undefined');
  }
  const copy = [];
  for (let index = 0; index < this.length; index += 1) copy.push(this[index]); // huecos → undefined
  return copy.sort(compareFn);
}
function withAt(index, value) {
  let relative = toIndex(index);
  if (relative < 0) relative += this.length;
  if (relative < 0 || relative >= this.length) throw new RangeError(`Invalid index : ${index}`);
  const copy = [];
  for (let position = 0; position < this.length; position += 1) copy.push(position === relative ? value : this[position]);
  return copy;
}
function hasOwn(object, key) {
  if (object === null || object === undefined) throw new TypeError('Cannot convert undefined or null to object');
  return Object.prototype.hasOwnProperty.call(object, key); // prestado: no depende del objeto
}
function groupBy(items, callback) {
  const groups = Object.create(null);
  let index = 0;
  for (const item of items) {
    const key = String(callback(item, index));
    index += 1;
    if (!hasOwn(groups, key)) groups[key] = [];
    groups[key].push(item);
  }
  return groups;
}

// ── El registro ─────────────────────────────────────────────────────────
const POLYFILLS = [
  {
    name: 'Array.prototype.at', target: 'ArrayProto', key: 'at', impl: at,
    works: (fn) => fn.call([1, 2, 3], -1) === 3 && fn.call([1, 2, 3], 1.5) === 2,
    tests: [[['a', 'b', 'c'], 0], [['a', 'b', 'c'], -1], [['a', 'b', 'c'], 3], [['a', 'b', 'c'], -4], [['a', 'b', 'c'], '1'], [[]]],
  },
  {
    name: 'String.prototype.at', target: 'StringProto', key: 'at', impl: at,
    works: (fn) => fn.call('abc', -1) === 'c',
    tests: [['Oaxaca', -1], ['Oaxaca', 0], ['Oaxaca', 10], ['', 0]],
  },
  {
    name: 'Array.prototype.findLast', target: 'ArrayProto', key: 'findLast', impl: findLast,
    works: (fn) => fn.call([1, 2, 3], (n) => n < 3) === 2,
    tests: [[[5, 12, 8, 130, 44], (n) => n > 10], [[5, 8], (n) => n > 10], [[1, 2], 'no es función']],
  },
  {
    name: 'Array.prototype.toSorted', target: 'ArrayProto', key: 'toSorted', impl: toSorted,
    works: (fn) => {
      const original = [3, 1, 2];
      return fn.call(original).join() === '1,2,3' && original.join() === '3,1,2';
    },
    tests: [[[10, 9, 1]], [[10, 9, 1], (a, b) => a - b], [['ñu', 'oca', 'ave']], [[3, undefined, 1, , 2]], [[1], 'x']],
  },
  {
    name: 'Array.prototype.with', target: 'ArrayProto', key: 'with', impl: withAt,
    works: (fn) => fn.call([1, 2, 3], -1, 9).join() === '1,2,9',
    tests: [[[1, 2, 3], 0, 'x'], [[1, 2, 3], -1, 'x'], [[1, 2, 3], 3, 'x'], [[1, 2, 3], -4, 'x']],
  },
  {
    name: 'Object.hasOwn', target: 'ObjectCtor', key: 'hasOwn', impl: hasOwn, isStatic: true,
    works: (fn) => fn({ a: 1 }, 'a') && !fn({}, 'toString'),
    tests: [[{ a: 1 }, 'a'], [{}, 'toString'], [Object.create({ inherited: 1 }), 'inherited'], [[1], 'length'], [null, 'a']],
  },
  {
    name: 'Object.groupBy', target: 'ObjectCtor', key: 'groupBy', impl: groupBy, isStatic: true,
    works: (fn) => Object.getPrototypeOf(fn([1, 2], (n) => n)) === null,
    tests: [
      [[{ name: 'Té verde', type: 'té' }, { name: 'Café de Chiapas', type: 'café' }, { name: 'Rooibos', type: 'té' }], (product) => product.type],
      [[1, 2, 3, 4], (n, index) => (index % 2 ? 'impares' : 'pares')],
      [[], () => 'x'],
    ],
  },
];

// ── Instalación ─────────────────────────────────────────────────────────
function install(env) {
  const report = {};
  for (const polyfill of POLYFILLS) {
    const target = env[polyfill.target];
    const existing = target[polyfill.key];
    let status;
    if (typeof existing === 'function' && polyfill.works(existing)) {
      status = 'nativo correcto: no se toca';
    } else {
      status = typeof existing === 'function' ? '⚠️ existía pero fallaba: reemplazado' : 'instalado';
      Object.defineProperty(target, polyfill.key, { value: polyfill.impl, writable: true, enumerable: false, configurable: true });
    }
    report[polyfill.name] = status;
  }
  return report;
}

const chrome = { ArrayProto: Array.prototype, StringProto: String.prototype, ObjectCtor: Object };
const legacy = { ArrayProto: {}, StringProto: {}, ObjectCtor: {} };
legacy.ArrayProto.with = function (index, value) { // la «librería vieja»: sin negativos, y enumerable
  const copy = Array.from(this);
  copy[index] = value;
  return copy;
};
const installs = {};
const chromeReport = install(chrome);
const legacyReport = install(legacy);
for (const { name } of POLYFILLS) installs[name] = { Chrome: chromeReport[name], 'navegador antiguo': legacyReport[name] };
console.table(installs);

// ── Pruebas contra el nativo ────────────────────────────────────────────
function outcome(run) {
  try {
    const value = run();
    if (value === undefined) return 'undefined';
    if (typeof value === 'object' && value !== null && Object.getPrototypeOf(value) === null) return `sin prototipo ${JSON.stringify(value)}`;
    return JSON.stringify(value);
  } catch (error) {
    return `lanza ${error.name}`;
  }
}
let total = 0;
let failures = 0;
console.group('Pruebas (polyfill frente a nativo)');
for (const polyfill of POLYFILLS) {
  const native = chrome[polyfill.target][polyfill.key];
  const call = (fn, test) => (polyfill.isStatic ? fn(...test) : fn.call(...test));
  const failed = [];
  for (const test of polyfill.tests) {
    const expected = outcome(() => call(native, test));
    const actual = outcome(() => call(polyfill.impl, test));
    total += 1;
    if (expected !== actual) failed.push(`${JSON.stringify(test)}: nativo ${expected}, polyfill ${actual}`);
  }
  failures += failed.length;
  console.log(`${failed.length === 0 ? '✓' : '✗'} ${polyfill.name.padEnd(26)} ${polyfill.tests.length - failed.length}/${polyfill.tests.length}`);
  for (const line of failed) console.warn(`   ${line}`);
}
console.log(`${total} pruebas · ${failures} fallos`);
console.groupEnd();

// ── El entorno antiguo, ya con los polyfills ────────────────────────────
function legacyArray(...items) {
  const list = Object.create(legacy.ArrayProto);
  items.forEach((item, index) => { list[index] = item; });
  Object.defineProperty(list, 'length', { value: items.length }); // como en un array: no enumerable
  return list;
}
const steps = legacyArray('carrito', 'envío', 'pago', 'confirmación');
console.group('Uso en el navegador antiguo');
console.log('steps.at(-1) →', steps.at(-1));
console.log('steps.with(-1, "¡gracias!") →', steps.with(-1, '¡gracias!'));
console.log('steps.toSorted() →', steps.toSorted(), '| original →', steps[0]);
const keys = [];
for (const key in steps) keys.push(key);
console.log('for…in →', keys.join(','), '(ni un método: todos no enumerables)');
console.log('groupBy →', legacy.ObjectCtor.groupBy(['té', 'café', 'tisana', 'cacao'], (drink) => drink.length > 4 ? 'largas' : 'cortas'));
console.groupEnd();

// Auditoría: los atributos instalados coinciden con los del nativo.
const audit = {};
for (const polyfill of POLYFILLS) {
  const flags = (descriptor) => `${descriptor.writable ? 'W' : '-'}${descriptor.enumerable ? 'E' : '-'}${descriptor.configurable ? 'C' : '-'}`;
  const native = flags(Object.getOwnPropertyDescriptor(chrome[polyfill.target], polyfill.key));
  const installed = flags(Object.getOwnPropertyDescriptor(legacy[polyfill.target], polyfill.key));
  audit[polyfill.name] = { nativo: native, polyfill: installed, '¿igual?': native === installed ? '✓' : '✗' };
}
console.table(audit);
```
