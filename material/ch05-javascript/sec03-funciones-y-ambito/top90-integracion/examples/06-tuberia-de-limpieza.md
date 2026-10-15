---
example_description: "Limpieza de contactos importados con una tubería de funciones puras: pipe, funciones currificadas que pasan de un registro a una lista (mapEach, keepIf, uniqueBy) y tap para inspeccionar"
example_tags: "javascript|integracion|pipe|composicion|currying|funciones-puras"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// LIMPIEZA DE CONTACTOS importados de una hoja de cálculo.
// Integra: pipe y currying («Funciones de orden superior»), funciones puras y
// spread («Objetos literales»), Set («Map, Set y WeakMap»), métodos de string.
const pipe = (...fns) => (input) => fns.reduce((value, fn) => fn(value), input);

// Piezas para LISTAS, fabricadas a partir de piezas para UN registro (currying).
const mapEach = (fn) => (items) => items.map(fn);
const keepIf = (predicate) => (items) => items.filter(predicate);
const uniqueBy = (keyOf) => (items) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = keyOf(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};
// tap: deja pasar los datos sin tocarlos y deja ver cuántos llegan a ese punto.
const tap = (label) => (items) => {
  console.log(`  ${label.padEnd(22)} → ${items.length}`);
  return items;
};

// Piezas para UN registro: puras, cada una devuelve un objeto nuevo.
const trimFields = (contact) =>
  Object.fromEntries(Object.entries(contact).map(([key, value]) => [key, value.trim()]));
const lowerEmail = (contact) => ({ ...contact, email: contact.email.toLowerCase() });
const hasValidEmail = ({ email }) => {
  const at = email.indexOf('@');
  return at > 0 && at === email.lastIndexOf('@') && email.indexOf('.', at) > at + 1 && !email.includes(' ');
};
const SMALL_WORDS = new Set(['de', 'del', 'la', 'las', 'los', 'y']);
const titleCaseName = (contact) => ({
  ...contact,
  name: contact.name
    .toLowerCase()
    .split(' ')
    .filter((word) => word !== '')
    .map((word, i) => (i > 0 && SMALL_WORDS.has(word) ? word : word[0].toUpperCase() + word.slice(1)))
    .join(' '),
});
const normalizePhone = (contact) => {
  const digits = [...contact.phone].filter((char) => char >= '0' && char <= '9').join('');
  return { ...contact, phone: digits.length === 9 ? `+34 ${digits}` : digits === '' ? '—' : `+${digits}` };
};

const cleanContacts = pipe(
  tap('filas importadas'),
  mapEach(trimFields),
  mapEach(lowerEmail),
  keepIf(hasValidEmail),
  tap('con email válido'),
  mapEach(titleCaseName),
  mapEach(normalizePhone),
  uniqueBy((contact) => contact.email),
  tap('sin duplicados'),
);

const imported = [
  { name: '  maría josé DE LA fuente ', email: 'MJ.Fuente@Example.com ', phone: '612 34 56 78' },
  { name: 'ÁLVARO   ruiz', email: 'alvaro.ruiz@example.com', phone: '(+52) 55 1234 5678' },
  { name: 'Lucía Ortega', email: 'lucia@example', phone: '699-11-22-33' },
  { name: 'maria jose de la fuente', email: 'mj.fuente@example.com', phone: '' },
  { name: 'Iker Etxeberria', email: 'iker @example.com', phone: '688776655' },
  { name: 'ana torres y blanco', email: 'ana.torres@example.org', phone: ' 611 222 333' },
];

console.log('▶ tubería');
const contacts = cleanContacts(imported);
console.table(contacts);
console.log('¿datos de entrada intactos? →', imported[0].name === '  maría josé DE LA fuente '); // true

// Las piezas se recombinan en otra tubería sin escribir nada nuevo:
const emailsOnly = pipe(
  mapEach(trimFields),
  mapEach(lowerEmail),
  keepIf(hasValidEmail),
  mapEach((contact) => contact.email),
  uniqueBy((email) => email),
);
console.log('solo emails →', emailsOnly(imported));
```
