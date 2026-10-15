---
example_description: "Guardar en JSON y restaurar con sus prototipos el estado de un planificador de viajes: registro de tipos sin prototipo, objetos recreados sin ejecutar la constructora, referencias compartidas con $id/$ref, fechas y una defensa contra __proto__ en los datos"
example_tags: "javascript|profesional|serializacion|json|prototipos|seguridad"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// GUARDAR Y RESTAURAR OBJETOS CON TIPO: el estado de un planificador de viajes se
// guarda como texto JSON (en la app real, en localStorage) y se recupera con sus
// prototipos, sus métodos y sus referencias compartidas.
//
// Decisiones:
// - JSON solo conoce objetos planos: tras JSON.parse (o structuredClone) un objeto ya
//   no tiene su prototipo ni sus métodos, y las fechas vuelven como texto.
// - Los tipos se registran por nombre en un objeto SIN prototipo: unos datos con
//   "$type": "constructor" no encuentran la función Object heredada.
// - encode recorre el grafo (recursión) y marca cada objeto con tipo: { $type, $id }.
//   Un objeto que ya ha salido se escribe como { $ref: id }: el mismo viajero en tres
//   reservas se guarda una vez y vuelve compartido (JSON, a secas, lo triplicaría).
// - decode recrea cada objeto con Object.create(Type.prototype) y copia sus datos SIN
//   ejecutar la constructora: la constructora valida datos nuevos y lleva la cuenta de
//   altas; un objeto guardado ya pasó por ella.
// - Las propiedades se crean con defineProperty, nunca con =: una clave "__proto__" en
//   los datos cambiaría el prototipo del objeto (contaminación de prototipos).
// - Lo no enumerable (índices internos) no se guarda; un estático revive lo reconstruye.
//
// Alcance: módulos 1-4 (JSON, Date, Intl, recursión, prototipos, descriptores).

function extendPrototype(Type, members) {
  for (const [key, value] of Object.entries(members)) {
    Object.defineProperty(Type.prototype, key, { value, writable: true, enumerable: false, configurable: true });
  }
}
function inherit(Child, Parent) {
  Object.setPrototypeOf(Child.prototype, Parent.prototype);
}
const euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const dateTime = (date, timeZone) => new Intl.DateTimeFormat('es-ES', {
  weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', timeZone, timeZoneName: 'short',
}).format(date);

// ── Tipos del dominio ───────────────────────────────────────────────────
let travelersCreated = 0;
function Traveler(name, documentId) {
  if (!name || !documentId) throw new RangeError('viajero sin nombre o sin documento');
  travelersCreated += 1;
  this.name = name;
  this.documentId = documentId;
}

function Booking(code, priceCents, travelers) {
  this.code = code;
  this.priceCents = priceCents;
  this.travelers = travelers;
}
extendPrototype(Booking, {
  costCents() { return this.priceCents * this.travelers.length; },
  describe() { return `${this.code} · ${euros.format(this.costCents() / 100)}`; },
});

function Flight(code, priceCents, travelers, { from, to, departs, arrives }) {
  Booking.call(this, code, priceCents, travelers);
  Object.assign(this, { from, to, departs: new Date(departs), arrives: new Date(arrives) });
}
inherit(Flight, Booking);
extendPrototype(Flight, {
  describe() {
    return `✈️ ${this.from.code}→${this.to.code} ${dateTime(this.departs, this.from.timeZone)} → ${dateTime(this.arrives, this.to.timeZone)} · ${Booking.prototype.describe.call(this)}`;
  },
});

function Hotel(code, priceCents, travelers, { name, nights }) {
  Booking.call(this, code, priceCents, travelers);
  Object.assign(this, { name, nights });
}
inherit(Hotel, Booking);
extendPrototype(Hotel, {
  costCents() { return this.priceCents * this.nights; }, // por habitación y noche
  describe() { return `🏨 ${this.name}, ${this.nights} noches · ${Booking.prototype.describe.call(this)}`; },
});

function Trip(title, bookings) {
  this.title = title;
  this.bookings = bookings;
  Trip.revive(this);
}
// Un índice interno, NO enumerable: no se guarda, se reconstruye.
Trip.revive = function (trip) {
  Object.defineProperty(trip, '_byCode', { value: new Map(trip.bookings.map((booking) => [booking.code, booking])), configurable: true });
  return trip;
};
extendPrototype(Trip, {
  totalCents() { return this.bookings.reduce((sum, booking) => sum + booking.costCents(), 0); },
  travelers() { return [...new Set(this.bookings.flatMap((booking) => booking.travelers))]; },
  find(code) { return this._byCode.get(code); },
  describe() {
    return [`${this.title} · ${this.travelers().length} viajeros · ${euros.format(this.totalCents() / 100)}`, ...this.bookings.map((booking) => `  ${booking.describe()}`)].join('\n');
  },
});

// ── Serializador ────────────────────────────────────────────────────────
const registry = Object.create(null);
for (const Type of [Traveler, Booking, Flight, Hotel, Trip]) registry[Type.name] = Type;

function encode(value, ids = new Map()) {
  if (Array.isArray(value)) return value.map((item) => encode(item, ids));
  if (value instanceof Date) return { $date: value.toISOString() };
  if (typeof value !== 'object' || value === null) return value;
  const Type = Object.getPrototypeOf(value)?.constructor;
  const typeName = registry[Type?.name] === Type ? Type.name : undefined;
  if (typeName === undefined) return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, encode(item, ids)]));
  if (ids.has(value)) return { $ref: ids.get(value) };
  ids.set(value, ids.size + 1);
  const node = { $type: typeName, $id: ids.get(value) };
  for (const key of Object.keys(value)) node[key] = encode(value[key], ids); // solo propias y enumerables
  return node;
}

function decode(node, refs = new Map()) {
  if (Array.isArray(node)) return node.map((item) => decode(item, refs));
  if (typeof node !== 'object' || node === null) return node;
  if (Object.hasOwn(node, '$date')) return new Date(node.$date);
  if (Object.hasOwn(node, '$ref')) {
    if (!refs.has(node.$ref)) throw new RangeError(`referencia rota: $ref ${node.$ref}`);
    return refs.get(node.$ref);
  }
  const { $type, $id, ...data } = node;
  let target = {};
  if ($type !== undefined) {
    if (!Object.hasOwn(registry, $type)) throw new TypeError(`tipo desconocido en los datos: «${$type}»`);
    target = Object.create(registry[$type].prototype); // sin ejecutar la constructora
    refs.set($id, target);                              // antes que los hijos
  }
  for (const [key, value] of Object.entries(data)) {
    Object.defineProperty(target, key, { value: decode(value, refs), writable: true, enumerable: true, configurable: true });
  }
  const revive = $type !== undefined && Object.hasOwn(registry[$type], 'revive') ? registry[$type].revive : null;
  return revive ? revive(target) : target;
}

const save = (value) => JSON.stringify(encode(value));
const load = (text) => decode(JSON.parse(text));

// ── Un viaje ────────────────────────────────────────────────────────────
const MAD = { code: 'MAD', timeZone: 'Europe/Madrid' };
const MEX = { code: 'MEX', timeZone: 'America/Mexico_City' };
const elena = new Traveler('Elena Vidal', 'ES-48291736');
const tomas = new Traveler('Tomás Vidal', 'ES-50119284');
const trip = new Trip('Navidad en Ciudad de México', [
  new Flight('IB6401', 74900, [elena, tomas], { from: MAD, to: MEX, departs: '2026-12-18T12:05:00+01:00', arrives: '2026-12-18T17:10:00-06:00' }),
  new Hotel('HTL-88213', 13800, [elena, tomas], { name: 'Casa Roma Boutique', nights: 9 }),
  new Flight('IB6400', 69900, [elena, tomas], { from: MEX, to: MAD, departs: '2026-12-27T19:35:00-06:00', arrives: '2026-12-28T13:50:00+01:00' }),
]);
console.log(trip.describe());

console.group('🐛 JSON a secas');
const plain = JSON.parse(JSON.stringify(trip));
console.log('¿instanceof Trip? →', plain instanceof Trip, '| plain.totalCents →', typeof plain.totalCents);
console.log('fecha de salida →', typeof plain.bookings[0].departs, plain.bookings[0].departs);
console.log('¿viajero compartido? →', plain.bookings[0].travelers[0] === plain.bookings[1].travelers[0]); // copias
const cloned = structuredClone(trip);
console.log('structuredClone → ¿instanceof Trip?', cloned instanceof Trip, '| ¿Date?', cloned.bookings[0].departs instanceof Date);
console.groupEnd();

console.group('✅ Con el serializador');
const text = save(trip);
console.log(`guardado → ${text.length} caracteres: ${text.slice(0, 150)}…`);
const restored = load(text);
console.log('¿instanceof Trip, Flight y Booking? →', restored instanceof Trip, restored.bookings[0] instanceof Flight, restored.bookings[0] instanceof Booking);
console.log('¿Date? →', restored.bookings[0].departs instanceof Date, '| ¿viajero compartido? →', restored.bookings[0].travelers[0] === restored.bookings[2].travelers[0]);
console.log('¿índice reconstruido? →', restored.find('HTL-88213').name);
console.log('¿se ejecutó la constructora de Traveler? →', travelersCreated === 2 ? 'no: siguen siendo 2 altas' : 'sí');
console.log(restored.describe() === trip.describe() ? '✓ el viaje restaurado se describe igual que el original' : '✗ hay diferencias');
console.groupEnd();

console.group('Datos manipulados');
for (const payload of ['{"$type":"constructor","$id":1}', '{"$type":"Traveler","$id":1,"name":"Eva","documentId":"X","$extra":{"$ref":7}}']) {
  try {
    load(payload);
  } catch (error) {
    console.warn(`⛔ ${error.name}: ${error.message}`);
  }
}
const attack = '{"$type":"Traveler","$id":1,"name":"Eva","documentId":"ES-1","__proto__":{"isAdmin":true}}';
const naive = {};
for (const [key, value] of Object.entries(JSON.parse(attack))) naive[key] = value; // con =
console.log('🐛 con asignación → isAdmin:', naive.isAdmin);
const safe = load(attack);
console.log('✅ con defineProperty → isAdmin:', safe.isAdmin, '| ¿Traveler?', safe instanceof Traveler, '| __proto__ propia:', Object.hasOwn(safe, '__proto__'));
console.groupEnd();
```
