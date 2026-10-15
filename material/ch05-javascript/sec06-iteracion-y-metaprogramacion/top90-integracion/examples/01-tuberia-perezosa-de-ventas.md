---
example_description: "100 000 tickets de venta generados al vuelo con azar con semilla: una tubería perezosa con helpers frente a la versión con arrays (cuántos tickets llega a crear cada una) y tres utilidades propias con yield: chunk, windowed y zip"
example_tags: "javascript|generadores|iterator-helpers|perezoso|itertools|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// VENTAS DE UNA CADENA DE PANADERÍAS: 100 000 tickets que se generan al vuelo.
// Lecciones: generadores (perezosos y con return/finally), helpers de iteradores
// y el protocolo iterable (zip trabaja con iteradores a mano).

// Azar con semilla (Lehmer): los mismos números en cualquier navegador.
function createRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 48271) % 2147483647;
    return state / 2147483647;
  };
}

const STORES = ['Puebla', 'Oaxaca', 'Mérida', 'Querétaro'];
const PRODUCTS = [
  { name: 'concha', cents: 1400 },
  { name: 'pan de muerto', cents: 4500 },
  { name: 'rosca', cents: 38000 },
  { name: 'café de olla', cents: 3200 },
];
const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const money = (cents) => pesos.format(cents / 100);

let created = 0; // cuántos tickets llegan a CREARSE de verdad

function* sales(seed, count) {
  const random = createRandom(seed);
  for (let id = 1; id <= count; id++) {
    created += 1;
    const product = PRODUCTS[Math.floor(random() * PRODUCTS.length)];
    const units = 1 + Math.floor(random() * 6);
    const store = STORES[Math.floor(random() * STORES.length)];
    yield { id, store, product: product.name, units, cents: units * product.cents };
  }
}

// ── Utilidades propias (las de itertools que Iterator no trae) ──────────────
function* chunk(iterable, size) {          // itertools.batched
  let batch = [];
  for (const item of iterable) {
    batch.push(item);
    if (batch.length === size) {
      yield batch;
      batch = [];
    }
  }
  if (batch.length > 0) yield batch;
}

function* windowed(iterable, size) {       // ventana deslizante
  const recent = [];
  for (const item of iterable) {
    recent.push(item);
    if (recent.length > size) recent.shift();
    if (recent.length === size) yield [...recent];
  }
}

function* zip(...iterables) {              // zip(), que para en el más corto
  const iterators = iterables.map((iterable) => iterable[Symbol.iterator]());
  try {
    while (true) {
      const results = iterators.map((it) => it.next());
      if (results.some((result) => result.done)) return;
      yield results.map((result) => result.value);
    }
  } finally {
    for (const it of iterators) it.return?.(); // cierra los que no se agotaron
  }
}

function* ticketNumbers() {                // infinito
  let n = 1;
  while (true) yield `T-${String(n++).padStart(5, '0')}`;
}

// ── 1. La misma pregunta, en arrays y con helpers ──────────────────────────
// «Los 3 primeros tickets de $1,000 o más en Mérida».
const isBigInMerida = (sale) => sale.store === 'Mérida' && sale.cents >= 100_000;

created = 0;
const eager = Array.from(sales(42, 100_000)).filter(isBigInMerida).slice(0, 3);
console.log('arrays  →', eager.map((sale) => sale.id), '| tickets creados:', created);

created = 0;
const lazy = sales(42, 100_000).filter(isBigInMerida).take(3).toArray();
console.log('helpers →', lazy.map((sale) => sale.id), '| tickets creados:', created);
console.log('¿el mismo resultado? →', JSON.stringify(eager) === JSON.stringify(lazy));

// ── 2. chunk: total de cada lote de 1 000 tickets (solo los 3 primeros lotes)
created = 0;
const batchTotals = chunk(sales(7, 100_000), 1000)
  .take(3)
  .map((batch) => money(batch.reduce((sum, sale) => sum + sale.cents, 0)))
  .toArray();
console.log('lotes →', batchTotals, '| tickets creados:', created);

// ── 3. windowed: media móvil de unidades (ventanas de 3 tickets) ───────────
const movingAverage = windowed(sales(7, 100_000).map((sale) => sale.units), 3)
  .map((units) => (units.reduce((a, b) => a + b, 0) / units.length).toFixed(2))
  .take(5)
  .toArray();
console.log('media móvil →', movingAverage.join(' · '));

// ── 4. zip: numerar los tickets con un generador infinito ──────────────────
for (const [ticket, sale] of zip(ticketNumbers(), sales(7, 3))) {
  console.log(`${ticket} · ${sale.store} · ${sale.units} × ${sale.product} = ${money(sale.cents)}`);
}
```
