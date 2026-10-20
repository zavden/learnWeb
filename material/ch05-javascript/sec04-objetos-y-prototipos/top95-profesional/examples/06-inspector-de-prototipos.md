---
example_description: "Un inspector de objetos que recorre la cadena de prototipos de cualquier valor y marca cada propiedad: propia o heredada, datos o accesor, enumerable, escribible, configurable, sombreada, y el estado de bloqueo del objeto"
example_tags: "javascript|profesional|prototipos|descriptores|introspeccion|depuracion"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// INSPECTOR DE PROTOTIPOS: recorre la cadena de cualquier valor y describe cada
// propiedad con sus atributos, como una versión en texto de lo que enseña la consola
// al expandir un objeto.
//
// Decisiones:
// - inspect() nunca LEE una propiedad de acceso: describe su get/set sin ejecutarlos
//   (podrían tener efectos o lanzar un error), igual que el (...) de la consola.
// - Marcas de cada propiedad: E enumerable, W escribible, C configurable (- si no lo
//   es; los accesores no tienen W). ⤷ «sombreada»: un eslabón más cercano al objeto
//   tiene la misma clave, así que esta no se ve al leer.
// - Claves de texto con getOwnPropertyNames y claves symbol con getOwnPropertySymbols
//   (los símbolos se estudian en el módulo «Iteradores, generadores y metaprogramación»).
// - Los prototipos nativos (Object.prototype, Array.prototype…) se resumen en una línea:
//   lo interesante suele ser lo tuyo. Se reconocen comparando con los objetos reales.
// - El nombre de un eslabón sale de su constructor solo si ese constructor lo reconoce
//   como su prototype (proto.constructor.prototype === proto).
// - Los primitivos se inspeccionan a través de su envoltorio, Object(valor), como hace
//   el motor al leer una propiedad.
//
// Alcance: módulos 1-4.

const NATIVE_PROTOTYPES = new Set([
  Object.prototype, Function.prototype, Array.prototype, String.prototype, Number.prototype,
  Boolean.prototype, Date.prototype, Map.prototype, Set.prototype, Error.prototype,
]);

function linkName(obj) {
  const ownConstructor = Object.getOwnPropertyDescriptor(obj, 'constructor')?.value;
  if (typeof ownConstructor === 'function' && ownConstructor.prototype === obj) return `${ownConstructor.name}.prototype`;
  return Object.getPrototypeOf(obj) === null ? '[Object: null prototype]' : '{…} (sin constructora)';
}

function preview(value) {
  if (typeof value === 'string') return `'${value}'`;
  if (typeof value === 'function') return `ƒ ${value.name}()`; // ƒ () si es anónima, como Chrome
  if (typeof value === 'symbol') return value.toString();
  if (Array.isArray(value)) return `Array(${value.length})`;
  if (typeof value === 'object' && value !== null) return Object.getPrototypeOf(value) === null ? '{…} sin prototipo' : `${value.constructor?.name ?? 'Object'} {…}`;
  return String(value);
}

function lockState(obj) {
  if (Object.isFrozen(obj)) return '🔒 congelado';
  if (Object.isSealed(obj)) return '🔏 sellado';
  if (!Object.isExtensible(obj)) return '⛔ no extensible';
  return 'extensible';
}

function ownKeys(obj) {
  return [...Object.getOwnPropertyNames(obj), ...Object.getOwnPropertySymbols(obj)];
}

function describeProperty(obj, key, shadowed) {
  const descriptor = Object.getOwnPropertyDescriptor(obj, key);
  const isData = Object.hasOwn(descriptor, 'value');
  const flags = [
    descriptor.enumerable ? 'E' : '-',
    isData ? (descriptor.writable ? 'W' : '-') : ' ',
    descriptor.configurable ? 'C' : '-',
  ].join('');
  const shown = isData ? preview(descriptor.value) : [descriptor.get && 'get', descriptor.set && 'set'].filter(Boolean).join(' + ') + ' (accesor)';
  const name = typeof key === 'symbol' ? `[${key.toString()}]` : key;
  return `${flags}  ${name.padEnd(16)} ${shown}${shadowed ? '   ⤷ sombreada' : ''}`;
}

function inspect(label, value) {
  const target = Object(value); // un primitivo, a través de su envoltorio
  const isPrimitive = target !== value;
  const counts = { propias: 0, heredadas: 0, accesores: 0, 'no enumerables': 0 };
  const seen = new Set();
  console.group(`▼ ${label}${isPrimitive ? ` (primitivo ${typeof value}: se inspecciona su envoltorio)` : ''} · ${lockState(target)}`);
  let openGroups = 1;
  for (let link = target, depth = 0; link !== null; link = Object.getPrototypeOf(link), depth += 1) {
    const keys = ownKeys(link);
    if (depth > 0 && NATIVE_PROTOTYPES.has(link)) {
      console.log(`[[Prototype]]: ${linkName(link)} · nativo: ${keys.length} propiedades (resumidas)`);
      keys.forEach((key) => seen.add(key));
      continue;
    }
    if (depth > 0) {
      // Cada eslabón, DENTRO del anterior: como [[Prototype]] en la consola.
      console.group(`[[Prototype]]: ${linkName(link)} · ${lockState(link)}`);
      openGroups += 1;
    }
    if (keys.length === 0) console.log('(ninguna propia)');
    for (const key of keys) {
      const descriptor = Object.getOwnPropertyDescriptor(link, key);
      console.log(describeProperty(link, key, seen.has(key)));
      counts[depth === 0 ? 'propias' : 'heredadas'] += 1;
      if (!Object.hasOwn(descriptor, 'value')) counts.accesores += 1;
      if (!descriptor.enumerable) counts['no enumerables'] += 1;
    }
    keys.forEach((key) => seen.add(key));
  }
  console.log('[[Prototype]]: null');
  for (; openGroups > 0; openGroups -= 1) console.groupEnd();
  return counts;
}

// ── Algunos valores para inspeccionar ───────────────────────────────────
function MediaItem(title, year) {
  this.title = title;
  this.year = year;
}
Object.defineProperties(MediaItem.prototype, {
  describe: { value: function describe() { return `${this.title} (${this.year})`; }, writable: true, configurable: true },
  age: { get() { return 2026 - this.year; }, configurable: true }, // accesor sin set
});
function Book(title, year, pages) {
  MediaItem.call(this, title, year);
  this.pages = pages;
}
Object.setPrototypeOf(Book.prototype, MediaItem.prototype);
Book.prototype.describe = function () { return `${MediaItem.prototype.describe.call(this)}, ${this.pages} págs.`; };
function AudioBook(title, year, pages, narrator) {
  Book.call(this, title, year, pages);
  this.narrator = narrator;
}
Object.setPrototypeOf(AudioBook.prototype, Book.prototype);
AudioBook.prototype.describe = function () { return `🎧 ${Book.prototype.describe.call(this)}`; };

const catalogId = Symbol('catalogId');
const audio = new AudioBook('Pedro Páramo', 1955, 124, 'Daniel Giménez Cacho');
Object.defineProperty(audio, '_loadedAt', { value: '2026-10-13T09:00:00Z' }); // interna: no enumerable, de solo lectura
audio[catalogId] = 'AUD-0042'; // clave symbol: no choca con ninguna clave de texto
Object.seal(audio);

const plan = Object.freeze({ name: 'Premium', priceCents: 1299 });
const dictionary = Object.create(null);
dictionary.__proto__ = 'una clave más';
dictionary.closure = 'función que recuerda su entorno';
const fromPrototype = Object.create(AudioBook.prototype); // nunca pasó por la constructora

const summary = {};
summary.audio = inspect('audio', audio);
summary['[7, 9.5]'] = inspect('[7, 9.5]', [7, 9.5]);
summary.plan = inspect('plan', plan);
summary.dictionary = inspect('dictionary', dictionary);
summary.Book = inspect('Book (la función)', Book);
summary["'Oaxaca'"] = inspect("'Oaxaca'", 'Oaxaca');
summary.fromPrototype = inspect('Object.create(AudioBook.prototype)', fromPrototype);
console.table(summary);

// Comprobación cruzada con el lenguaje: lo que el inspector marca como sombreado no se ve.
console.log('audio.describe() →', audio.describe());
console.log('audio.age (ejecuta el getter, que el inspector no ha tocado) →', audio.age);
console.log('¿instanceof AudioBook sin constructora? →', fromPrototype instanceof AudioBook, '| title →', fromPrototype.title);
```
