---
example_description: "Un glosario de términos de JavaScript guardado en {}, en Object.create(null) y en un Map: claves fantasma heredadas, el __proto__ que cambia el prototipo y los límites de un objeto sin prototipo"
example_tags: "javascript|integracion|object-create-null|diccionarios|proto|map"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// GLOSARIO de este curso. Los términos llegan de un formulario, así que pueden
// ser cualquier texto… incluidos «constructor» o «__proto__», que son
// justamente términos de JavaScript. Tres diccionarios, la misma lógica.
// Integra: búsqueda en la cadena, in frente a hasOwn y Object.create(null)
// («La cadena de prototipos»), Object.prototype («Prototipos nativos») y Map.

const ENTRIES = [
  ['closure', { text: 'función que recuerda las variables de donde se creó', lesson: 'Closures' }],
  ['hoisting', { text: 'las declaraciones se procesan antes de ejecutar el código', lesson: 'Ámbito y hoisting' }],
  ['constructor', { text: 'propiedad que apunta a la función que creó el objeto', lesson: 'Funciones constructoras y new' }],
  ['__proto__', { text: 'getter/setter antiguo para el [[Prototype]]', lesson: 'La cadena de prototipos' }],
  ['prototype', { text: 'propiedad de las funciones: el prototipo de sus instancias', lesson: 'Funciones constructoras y new' }],
];

// La misma API sobre un objeto (con `in` o con hasOwn) y sobre un Map.
const objectStore = (dict, has) => ({
  has: (term) => has(dict, term),
  get: (term) => dict[term],
  set: (term, entry) => { dict[term] = entry; },
});
const mapStore = (map) => ({ has: (term) => map.has(term), get: (term) => map.get(term), set: (term, entry) => map.set(term, entry) });
const viaIn = (dict, term) => term in dict;

const naive = {};
const withHasOwn = {};
const clean = Object.create(null);
const map = new Map();
const stores = {
  '{} + in': objectStore(naive, viaIn),
  '{} + hasOwn': objectStore(withHasOwn, Object.hasOwn),
  'create(null)': objectStore(clean, viaIn),
  Map: mapStore(map),
};

// Alta: no se admiten términos repetidos.
const added = {};
for (const [name, store] of Object.entries(stores)) {
  added[name] = ENTRIES.map(([term, entry]) => {
    if (store.has(term)) return `${term} (repetido)`;
    store.set(term, entry);
    return term;
  }).join(', ');
}
console.table(added);
// 🐛 {} + in: «constructor» y «__proto__» ya «existían» (heredados).

// Consultas. La tabla también es un objeto sin prototipo: así la fila
// «__proto__» es una clave más (en {} cambiaría su prototipo).
const show = (value) => {
  if (value === undefined) return '—';
  if (typeof value === 'function') return '🐛 ƒ heredada';
  if (value === Object.prototype) return '🐛 Object.prototype';
  return value.lesson;
};
const lookups = Object.create(null);
for (const term of ['closure', 'constructor', '__proto__', 'toString']) {
  lookups[term] = {};
  for (const [name, store] of Object.entries(stores)) {
    lookups[term][name] = store.has(term) ? show(store.get(term)) : '—';
  }
}
console.table(lookups);

// 🐛 hasOwn arregla «constructor», pero no «__proto__»: como no era propia, la
// asignación siguió adelante, encontró el SETTER heredado de Object.prototype y
// CAMBIÓ EL PROTOTIPO del glosario en lugar de guardar el término.
console.log('🐛 Object.keys →', Object.keys(withHasOwn)); // 4: falta __proto__
console.log('🐛 su prototipo ahora es →', Object.getPrototypeOf(withHasOwn)); // ¡la definición!
console.log('🐛 withHasOwn.lesson →', withHasOwn.lesson);   // «heredada» de la definición
console.log('✅ Object.keys(clean) →', Object.keys(clean)); // las 5: __proto__ es una clave normal

// El precio de no tener prototipo: no hay métodos heredados.
try {
  console.log(`glosario: ${clean}`);
} catch (error) {
  console.warn('plantilla →', error.name, '|', error.message);
}
try {
  clean.hasOwnProperty('closure');
} catch (error) {
  console.warn('clean.hasOwnProperty →', error.name, '|', error.message);
}
console.log("Object.hasOwn(clean, 'closure') →", Object.hasOwn(clean, 'closure')); // las estáticas funcionan

// Object.groupBy también devuelve un objeto sin prototipo:
const byLesson = Object.groupBy(Object.keys(clean), (term) => clean[term].lesson);
console.log('agrupado →', byLesson);
console.log("¿'constructor' in byLesson? →", 'constructor' in byLesson); // false: no hay claves fantasma
```
