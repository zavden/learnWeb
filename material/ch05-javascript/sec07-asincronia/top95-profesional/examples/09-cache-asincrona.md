---
example_description: "Una caché asíncrona de precios: guarda PROMESAS (cinco peticiones simultáneas comparten una sola carga), caduca con un TTL, sirve el valor viejo mientras recarga en segundo plano (stale-while-revalidate), no guarda los errores y expulsa la entrada menos usada; con un reloj inyectado, la salida es exacta"
example_tags: "javascript|profesional|async|cache|promesas|ttl|lru"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// UNA CACHÉ ASÍNCRONA para los precios de una tienda.
//
// Decisiones:
// - Se guardan PROMESAS, no valores: si cinco partes de la página piden el
//   mismo precio a la vez, todas reciben la misma promesa en vuelo y el
//   servidor recibe UNA petición (deduplicación).
// - Cada entrada vive ttlMs; después, durante staleMs, se sirve el valor viejo
//   AL MOMENTO y se recarga en segundo plano (stale-while-revalidate, como la
//   cabecera HTTP del mismo nombre). Pasado eso, se espera a la recarga.
// - Los errores no se guardan: una promesa rechazada se borra de la caché, y
//   la siguiente petición vuelve a intentarlo.
// - Como mucho maxEntries entradas: un Map recuerda el orden de inserción, así
//   que mover al final lo usado convierte la primera clave en la menos usada (LRU).
// - El reloj se inyecta (now). Aquí es un reloj falso que avanzamos a mano:
//   probar caducidades sin esperar y con resultados exactos.
//
// Alcance: módulos 1-7.

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class AsyncCache {
  #entries = new Map(); // clave → { promise, loadedAt, value, hasValue, refreshing }
  stats = { loads: 0, hits: 0, shared: 0, stale: 0, evicted: 0 };

  constructor({ load, ttlMs, staleMs = 0, maxEntries = 100, now = () => performance.now() }) {
    Object.assign(this, { load, ttlMs, staleMs, maxEntries, now });
  }

  get(key) {
    const entry = this.#entries.get(key);
    if (entry) {
      this.#touch(key, entry);
      const age = this.now() - entry.loadedAt;
      if (!entry.hasValue) { // todavía en vuelo: se comparte la misma promesa
        this.stats.shared += 1;
        return entry.promise;
      }
      if (age < this.ttlMs) {
        this.stats.hits += 1;
        return entry.promise;
      }
      if (age < this.ttlMs + this.staleMs) { // viejo pero aceptable: se sirve y se recarga
        this.stats.stale += 1;
        if (!entry.refreshing) this.#refresh(key, entry);
        return Promise.resolve(entry.value);
      }
    }
    return this.#loadInto(key).promise;
  }

  #loadInto(key) {
    this.stats.loads += 1;
    const entry = { loadedAt: this.now(), hasValue: false, refreshing: false };
    entry.promise = this.load(key).then((value) => {
      Object.assign(entry, { value, hasValue: true, loadedAt: this.now() });
      return value;
    }, (error) => {
      if (this.#entries.get(key) === entry) this.#entries.delete(key); // los errores no se guardan
      throw error;
    });
    this.#entries.set(key, entry);
    this.#evict();
    return entry;
  }

  #refresh(key, entry) {
    entry.refreshing = true;
    this.stats.loads += 1;
    this.load(key).then((value) => {
      Object.assign(entry, { value, loadedAt: this.now(), promise: Promise.resolve(value) });
    }, () => {
      // si la recarga falla, se sigue sirviendo el valor viejo hasta el siguiente intento
    }).finally(() => {
      entry.refreshing = false;
    });
  }

  #touch(key, entry) { // lo usado pasa al final: la primera clave es la menos usada
    this.#entries.delete(key);
    this.#entries.set(key, entry);
  }

  #evict() {
    while (this.#entries.size > this.maxEntries) {
      const oldest = this.#entries.keys().next().value;
      this.#entries.delete(oldest);
      this.stats.evicted += 1;
    }
  }

  keys() {
    return [...this.#entries.keys()];
  }
}

// ── El escenario ─────────────────────────────────────────────────────────
const clock = { time: 0, now: () => clock.time, advance(ms) { clock.time += ms; } };
const prices = { 'café de olla': 21000, cajeta: 9500, pozole: 18000, tamales: 6500 };
let serverCalls = 0;
let pozoleFailures = 1; // el primer intento de «pozole» falla
async function fetchPrice(product) {
  serverCalls += 1;
  await wait(20);
  if (product === 'pozole' && pozoleFailures-- > 0) throw new Error('502 al consultar pozole');
  return prices[product];
}

const cache = new AsyncCache({ load: fetchPrice, ttlMs: 60_000, staleMs: 30_000, maxEntries: 3, now: clock.now });
const money = (cents) => `$${(cents / 100).toFixed(2)}`;

async function main() {
  console.log('▶ cinco componentes piden el precio del café a la vez');
  const five = await Promise.all(Array.from({ length: 5 }, () => cache.get('café de olla')));
  console.log(`  precios → ${five.map(money).join(' ')} | peticiones al servidor → ${serverCalls}`);

  console.log('▶ un minuto después, el precio sube a $230.00');
  clock.advance(61_000);
  prices['café de olla'] = 23000;
  console.log('  respuesta inmediata (valor viejo) →', money(await cache.get('café de olla')), '| recargando en segundo plano');
  await wait(30); // la recarga termina
  console.log('  siguiente consulta →', money(await cache.get('café de olla')), '| peticiones →', serverCalls);

  console.log('▶ dos minutos sin consultas: ya no se sirve lo viejo');
  clock.advance(120_000);
  prices['café de olla'] = 24000;
  console.log('  espera a la recarga →', money(await cache.get('café de olla')), '| peticiones →', serverCalls);

  console.log('▶ un error no se guarda');
  try {
    await cache.get('pozole');
  } catch (error) {
    console.log('  ⛔', error.message);
  }
  console.log('  segundo intento →', money(await cache.get('pozole')));

  console.log('▶ como mucho 3 entradas (se va la menos usada)');
  await cache.get('cajeta');
  await cache.get('café de olla'); // se usa: pasa al final
  await cache.get('tamales');      // cuarta clave: sale la menos usada
  console.log('  claves →', cache.keys().join(', '));
  console.log('estadísticas →', cache.stats);
}
main();

// > Desde Python: functools.lru_cache no sirve para corrutinas (guardaría la
//   corrutina, que solo se puede esperar una vez). Guardar asyncio.Task en
//   un dict es el equivalente de guardar promesas: una Task sí se puede
//   esperar muchas veces.
```
