---
example_description: "Agenda que fusiona contactos de dos fuentes: duplicados por email con Map, el spread que copia undefined, orden con Intl.Collator, grupos por inicial y búsqueda sin tildes"
example_tags: "javascript|integracion|strings|map|objetos|intl"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// AGENDA: fusionar los contactos del móvil con los del correo.
// Integra: normalize, toLocaleUpperCase y búsqueda sin tildes («Strings»), spread y
// Object.entries/fromEntries («Objetos literales»), Map y Map.groupBy («Map y Set»),
// Intl.Collator e Intl.ListFormat («Strings», «Fechas e Intl»).
// (function se estudia en «Funciones y ámbito»; aquí basta con la sintaxis básica.)

const phoneContacts = [
  { name: 'Álvaro Ruiz', phone: '+34 600 111 222', email: 'alvaro.ruiz@example.com' },
  { name: 'Núria Puig', phone: '+34 600 333 444', email: 'nuria@example.com' },
  { name: 'José Martín', phone: '+34 611 222 333', email: 'JMartin@Example.com' },
  { name: 'ana torres', phone: '+34 622 444 555', email: 'ana.torres@example.com' },
  { name: 'Ñuño Campos', phone: '+34 633 555 666', email: 'nuno@example.com' },
];
const mailContacts = [
  // Nombre en NFD (e + tilde combinable) y sin teléfono: el campo existe pero vale undefined.
  { name: 'José Martín', email: ' jmartin@example.com', phone: undefined, company: 'Ferretería Martín' },
  { name: 'Andrés Gil', email: 'andres.gil@example.com' },
  { name: 'Zoe Navarro', email: 'zoe@example.com' },
  { name: 'Ana Torres', email: 'Ana.Torres@example.com', company: 'Estudio Torres' },
];

// La clave de un contacto es su email normalizado (sin espacios y en minúsculas).
function emailKey(contact) {
  return contact.email.trim().toLowerCase();
}

// 🐛 Fusionar con spread: una propiedad que vale undefined también se copia y pisa la buena.
const naive = { ...phoneContacts[2], ...mailContacts[0] };
console.log('🐛 teléfono de José →', naive.phone); // undefined: se perdió

// ✅ Quita antes las propiedades undefined (entries → filter → fromEntries).
function definedOnly(contact) {
  return Object.fromEntries(Object.entries(contact).filter(([, value]) => value !== undefined));
}
const byEmail = new Map();
for (const contact of [...phoneContacts, ...mailContacts]) {
  const key = emailKey(contact);
  const clean = { ...definedOnly(contact), name: contact.name.normalize(), email: key };
  byEmail.set(key, { ...byEmail.get(key), ...clean }); // spread de undefined no añade nada
}
console.log(`${phoneContacts.length + mailContacts.length} contactos → ${byEmail.size} sin duplicados`);
console.log('✅ José fusionado →', byEmail.get('jmartin@example.com'));

// Orden alfabético del español (las tildes no mandan, la ñ va tras la n).
const collator = new Intl.Collator('es', { sensitivity: 'base' });
const contacts = [...byEmail.values()].toSorted((a, b) => collator.compare(a.name, b.name));

// Grupos por inicial: «Á» va con la «A», pero la «Ñ» es una letra propia del alfabeto.
const VOWEL_WITHOUT_ACCENT = { Á: 'A', É: 'E', Í: 'I', Ó: 'O', Ú: 'U' };
function initialOf(name) {
  const first = [...name][0].toLocaleUpperCase('es'); // [...name]: por code points
  return VOWEL_WITHOUT_ACCENT[first] ?? first;
}
const list = new Intl.ListFormat('es', { type: 'conjunction' });
for (const [initial, group] of Map.groupBy(contacts, (contact) => initialOf(contact.name))) {
  console.log(`${initial}: ${list.format(group.map((contact) => contact.name))}`);
}

// Búsqueda sin tildes ni mayúsculas: «jose» encuentra «José».
function searchKey(text) {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase(); // \p{M}: marcas (regex)
}
const query = 'jose';
const found = contacts.filter((contact) => searchKey(contact.name).includes(searchKey(query)));
console.log(`«${query}» →`, found.map((contact) => `${contact.name} (${contact.phone ?? 'sin teléfono'})`));
```
