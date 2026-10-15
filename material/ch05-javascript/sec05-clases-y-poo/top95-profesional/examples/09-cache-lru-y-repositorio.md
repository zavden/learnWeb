---
example_description: "Una caché LRU con Map (capacidad, caducidad con un reloj inyectado, estadísticas privadas, iterable) y un repositorio con caché como decorador: la misma interfaz que el repositorio real, al que envuelve, con invalidación al guardar"
example_tags: "javascript|profesional|clases|cache|map|composicion|polimorfismo"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// LA CAPA DE DATOS DE UNA TIENDA: no pedir al servidor lo que ya se pidió hace poco.
// - LRUCache: un Map recuerda el orden de inserción; al LEER una clave se borra y
//   se vuelve a insertar, así que la primera clave es siempre la menos usada
//   (Least Recently Used) y es la que sale cuando no cabe nada más.
// - El reloj se INYECTA (FakeClock): la caducidad se prueba sin esperar de verdad.
// - Repository es la interfaz; ApiRepository la implementa (simulando un servidor)
//   y CachedRepository la implementa ENVOLVIENDO a otro repositorio: el patrón
//   decorador, composición con la misma interfaz.
// En una app real, findById sería asíncrono (fetch): módulo 7 y capítulo 6.

class FakeClock {
  #now;
  constructor(isoInstant) { this.#now = Date.parse(isoInstant); }
  now() { return this.#now; }
  advance(seconds) { this.#now += seconds * 1000; }
}

class LRUCache {
  #entries = new Map(); // clave → { value, expiresAt }
  #capacity;
  #ttlMs;
  #clock;
  #stats = { hits: 0, misses: 0, evictions: 0, expirations: 0 };

  constructor({ capacity, ttlSeconds = Infinity, clock }) {
    if (!(Number.isInteger(capacity) && capacity > 0)) throw new RangeError(`Capacidad no válida: ${capacity}`);
    this.#capacity = capacity;
    this.#ttlMs = ttlSeconds * 1000;
    this.#clock = clock;
  }

  get(key) {
    const entry = this.#entries.get(key);
    if (entry && entry.expiresAt <= this.#clock.now()) {
      this.#entries.delete(key);
      this.#stats.expirations += 1;
    } else if (entry) {
      this.#entries.delete(key); // al final del Map: la más reciente
      this.#entries.set(key, entry);
      this.#stats.hits += 1;
      return entry.value;
    }
    this.#stats.misses += 1;
    return undefined;
  }

  set(key, value) {
    this.#entries.delete(key);
    this.#entries.set(key, { value, expiresAt: this.#clock.now() + this.#ttlMs });
    if (this.#entries.size > this.#capacity) {
      const oldest = this.#entries.keys().next().value; // la primera: la menos usada
      this.#entries.delete(oldest);
      this.#stats.evictions += 1;
    }
    return this;
  }

  delete(key) { return this.#entries.delete(key); }
  get size() { return this.#entries.size; }
  get stats() {
    const lookups = this.#stats.hits + this.#stats.misses;
    return { ...this.#stats, hitRate: lookups === 0 ? 0 : Math.round((this.#stats.hits / lookups) * 100) };
  }
  // Iterable: las claves de la menos a la más usada, sin tocar el orden.
  [Symbol.iterator]() {
    const keys = [...this.#entries.keys()];
    let index = 0;
    return { next: () => (index < keys.length ? { value: keys[index++], done: false } : { value: undefined, done: true }) };
  }
}

class NotFoundError extends Error {
  constructor(id) {
    super(`No existe el producto ${id}`);
    this.name = 'NotFoundError';
    this.id = id;
  }
}

class Repository {
  constructor() {
    if (new.target === Repository) throw new TypeError('Repository es una interfaz: usa una implementación');
  }
  findById() { throw new Error(`${this.constructor.name} debe implementar findById`); }
  save() { throw new Error(`${this.constructor.name} debe implementar save`); }
  findMany(ids) { return ids.map((id) => this.findById(id)); } // común a todas: usa el findById de cada una
}

class ApiRepository extends Repository {
  #server;
  requests = 0;
  constructor(records) {
    super();
    this.#server = new Map(records.map((record) => [record.id, record]));
  }
  findById(id) {
    this.requests += 1; // cada llamada sería una petición de red
    const record = this.#server.get(id);
    if (!record) throw new NotFoundError(id);
    return Object.freeze({ ...record }); // una copia congelada: nadie cambia el «servidor» por accidente
  }
  save(record) {
    this.requests += 1;
    this.#server.set(record.id, { ...record });
  }
}

class CachedRepository extends Repository {
  #inner;
  #cache;
  constructor(inner, cacheOptions) {
    super();
    this.#inner = inner; // TIENE un repositorio y se comporta como uno
    this.#cache = new LRUCache(cacheOptions);
  }
  findById(id) {
    const cached = this.#cache.get(id);
    if (cached !== undefined) return cached;
    const record = this.#inner.findById(id);
    this.#cache.set(id, record);
    return record;
  }
  save(record) {
    this.#inner.save(record);
    this.#cache.delete(record.id); // invalidar: la próxima lectura irá al servidor
  }
  get cache() { return this.#cache; }
}

// ── Una mañana de visitas a la tienda ─────────────────────────────────
const products = [
  { id: 'CAF-CHIA-500', name: 'Café de Chiapas 500 g', cents: 21000 },
  { id: 'CAF-VERA-250', name: 'Café de Veracruz 250 g', cents: 12900 },
  { id: 'MOL-RUTA-01', name: 'Molinillo manual Ruta', cents: 89900 },
  { id: 'TAZ-TALAV', name: 'Taza de talavera', cents: 34900 },
];
const clock = new FakeClock('2026-10-13T15:00:00Z');
const api = new ApiRepository(products);
const repository = new CachedRepository(api, { capacity: 3, ttlSeconds: 300, clock });
const money = (cents) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(cents / 100);
const time = new Intl.DateTimeFormat('es-MX', { timeStyle: 'short', timeZone: 'America/Mexico_City' });

// [segundos desde la visita anterior, producto]
const visits = [
  [0, 'CAF-CHIA-500'], [10, 'MOL-RUTA-01'], [5, 'CAF-CHIA-500'], [20, 'CAF-VERA-250'], [15, 'CAF-CHIA-500'],
  [10, 'MOL-RUTA-01'], [15, 'TAZ-TALAV'], [5, 'CAF-CHIA-500'], [20, 'CAF-VERA-250'], [400, 'CAF-CHIA-500'],
];
const rows = [];
for (const [seconds, id] of visits) {
  clock.advance(seconds);
  const before = api.requests;
  const product = repository.findById(id);
  rows.push({
    hora: time.format(clock.now()),
    producto: product.name,
    origen: api.requests > before ? '🌐 servidor' : '⚡ caché',
    'caché (de menos a más usada)': [...repository.cache].join(' · '),
  });
}
console.table(rows);
console.log('peticiones al servidor →', api.requests, 'de', visits.length, '| estadísticas →', repository.cache.stats);

// Guardar invalida: la siguiente lectura trae el precio nuevo.
const before = repository.findById('TAZ-TALAV');
repository.save({ ...before, cents: 29900 });
console.log(`precio de la taza → ${money(before.cents)} → ${money(repository.findById('TAZ-TALAV').cents)}`);

// findMany es de la clase base, y funciona con las dos implementaciones (polimorfismo).
console.log('findMany →', repository.findMany(['CAF-VERA-250', 'MOL-RUTA-01']).map((p) => p.name));
for (const attempt of [() => repository.findById('CAF-OAXA-500'), () => new Repository(), () => new LRUCache({ capacity: 0, clock })]) {
  try {
    attempt();
  } catch (error) {
    console.warn(`⛔ ${error.name}: ${error.message}`);
  }
}
```
