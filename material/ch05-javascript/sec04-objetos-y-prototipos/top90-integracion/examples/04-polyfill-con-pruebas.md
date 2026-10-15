---
example_description: "Un polyfill de Array.prototype.at hecho con cuidado: detección por existencia y por comportamiento, instalación no enumerable y una tabla de pruebas contra el método nativo"
example_tags: "javascript|integracion|polyfill|defineproperty|prototipos-nativos|pruebas"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// POLYFILL DE Array.prototype.at, con sus pruebas.
// Chrome ya tiene at(), así que simulamos dos navegadores antiguos con un
// «Array.prototype» de mentira: uno sin at() y otro donde una librería vieja
// instaló una versión defectuosa con una simple asignación.
// Integra: polyfills y métodos genéricos («Prototipos nativos»), defineProperty
// y enumerable («Propiedades a fondo»), for…in y la cadena («La cadena de prototipos»).

// La implementación: genérica, solo usa this.length y this[i].
function atPolyfill(index) {
  let relative = Math.trunc(Number(index)) || 0; // NaN, undefined y -0 → 0
  if (relative < 0) relative += this.length;     // -1 → el último
  if (relative < 0 || relative >= this.length) return undefined;
  return this[relative];
}

// La de la «librería vieja»: no admite negativos ni decimales.
function naiveAt(index) {
  return this[index];
}

// Detección por COMPORTAMIENTO: que exista no basta, tiene que funcionar.
function behavesWell(at) {
  const sample = { 0: 'a', 1: 'b', 2: 'c', length: 3 };
  return at.call(sample, -1) === 'c' && at.call(sample, 1.5) === 'b' && at.call(sample) === 'a';
}

function installAt(proto) {
  if (typeof proto.at === 'function' && behavesWell(proto.at)) return 'ya existe y funciona: no se toca';
  const replacing = typeof proto.at === 'function';
  Object.defineProperty(proto, 'at', {
    value: atPolyfill, writable: true, enumerable: false, configurable: true, // como un nativo
  });
  return replacing ? 'existía pero fallaba: reemplazado' : 'no existía: instalado';
}

// «Arrays» de un navegador simulado: objetos que heredan de su prototipo falso.
function legacyArray(proto, ...items) {
  const list = Object.create(proto);
  items.forEach((item, index) => { list[index] = item; });
  Object.defineProperty(list, 'length', { value: items.length }); // no enumerable, como en un array
  return list;
}
const keysOf = (list) => {
  const keys = [];
  for (const key in list) keys.push(key);
  return keys.join(',');
};

const oldBrowser = {};          // Array.prototype de 2020: sin at()
const oldWithLibrary = {};      // el mismo navegador + una librería de 2019:
oldWithLibrary.at = naiveAt;    // 🐛 asignación: at queda ENUMERABLE

const steps = legacyArray(oldWithLibrary, 'carrito', 'envío', 'pago');
console.log('🐛 for…in con la librería →', keysOf(steps)); // 0,1,2,at
console.log('🐛 steps.at(-1) con la librería →', steps.at(-1)); // undefined

console.log('Chrome         →', installAt(Array.prototype));
console.log('antiguo        →', installAt(oldBrowser));
console.log('con librería   →', installAt(oldWithLibrary));
console.log('✅ for…in →', keysOf(steps), '| steps.at(-1) →', steps.at(-1));
console.log('descriptor →', Object.getOwnPropertyDescriptor(oldWithLibrary, 'at'));

// Pruebas: cada caso, con el nativo (prestado con call) como referencia.
const sample = ['lunes', 'martes', 'miércoles'];
const cases = [[0], [2], [-1], [-3], [3], [-4], [1.7], [-1.5], ['1'], [], [NaN], [Infinity]];
const rows = {};
let passed = 0;
for (const args of cases) {
  const expected = Array.prototype.at.apply(sample, args);
  const actual = atPolyfill.apply(sample, args);
  const ok = Object.is(actual, expected);
  if (ok) passed += 1;
  const label = args.map((arg) => (typeof arg === 'string' ? `'${arg}'` : String(arg))).join();
  rows[`at(${label})`] = {
    nativo: expected, polyfill: actual, 'librería vieja': naiveAt.apply(sample, args), '¿igual?': ok ? '✓' : '✗',
  };
}
console.table(rows);
console.log(`polyfill: ${passed}/${cases.length} pruebas iguales al nativo`);

// Al ser genérico, funciona con cualquier array-like, como el nativo:
console.log("con 'Oaxaca' → polyfill:", atPolyfill.call('Oaxaca', -1), '| nativo:', Array.prototype.at.call('Oaxaca', -1));
```
