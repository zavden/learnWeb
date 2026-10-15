---
example_description: "Una tubería de generadores asíncronos sobre una API paginada (el paginador del módulo 6, ya mayor): páginas con reintento, aplanar, filtrar, enriquecer con concurrencia limitada y en orden, agrupar en lotes y cortar con take; al cortar, return() cierra toda la cadena y cada finally lo registra"
example_tags: "javascript|profesional|async|generadores-asincronos|for-await|paginacion|concurrencia"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// EXPORTAR PEDIDOS A CONTABILIDAD, leyendo una API paginada.
//
// Decisiones:
// - Cada etapa es un generador asíncrono que consume otro: pages → flatten →
//   filter → mapConcurrent (enriquecer) → batch → take. pipe() las encadena.
//   Es la tubería perezosa del módulo 6 (helpers), versión asíncrona: los
//   helpers de iteradores aún no existen para iteradores asíncronos.
// - Nada se pide antes de tiempo: si el consumidor solo quiere 3 lotes, solo
//   se leen las páginas necesarias.
// - mapConcurrent enriquece hasta 3 pedidos a la vez pero los entrega EN
//   ORDEN: guarda las promesas en marcha en una cola y espera siempre a la
//   más antigua.
// - Los datos de cliente se piden una vez por cliente: una caché de PROMESAS
//   (dos pedidos del mismo cliente comparten la misma petición en vuelo).
// - Cortar (take, break, un error) llama a return() de la etapa de abajo, que
//   cierra la suya, y así hasta el origen: cada finally lo deja registrado.
//
// Alcance: módulos 1-7.

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const money = (cents) => pesos.format(cents / 100);

class ApiError extends Error {
  constructor(status, message) {
    super(`${status} ${message}`);
    this.name = 'ApiError';
    this.retryable = status === 503;
  }
}

// ── La API simulada: 57 pedidos de 9 clientes ────────────────────────────
const CUSTOMERS = ['Ana Ruiz', 'Luis Pérez', 'Sofía Ríos', 'Iván Mena', 'Elena Canul', 'Jorge Lara', 'Marta Gil', 'Joel Sanz', 'Carla Vidal'];
const STATUSES = ['pagado', 'pagado', 'enviado', 'pendiente', 'pagado', 'cancelado'];
const ORDERS = Array.from({ length: 57 }, (_, i) => ({
  id: `P-${2001 + i}`,
  customerId: `C-${(i * 4) % CUSTOMERS.length + 1}`,
  status: STATUSES[(i * 5) % STATUSES.length],
  totalCents: 40000 + ((i * 7919) % 160) * 1000,
}));

const api = {
  requests: 0,
  customerLookups: 0,
  failures: new Set([2]), // la petición n.º 2 de la lista falla una vez
  async listOrders({ cursor = 0, limit = 10 } = {}) {
    this.requests += 1;
    await wait(25);
    if (this.failures.delete(this.requests)) throw new ApiError(503, 'Servicio no disponible');
    const items = ORDERS.slice(cursor, cursor + limit);
    return { items, nextCursor: cursor + limit < ORDERS.length ? cursor + limit : null };
  },
  async getCustomer(id) {
    this.customerLookups += 1;
    await wait(15);
    const index = Number(id.slice(2)) - 1;
    return { id, name: CUSTOMERS[index], email: `${CUSTOMERS[index].split(' ')[0].toLowerCase()}@example.com` };
  },
};

// ── Las etapas ───────────────────────────────────────────────────────────
async function* pages(source, { label }) {
  let cursor = 0;
  let read = 0;
  try {
    while (cursor !== null) {
      let page;
      for (let attempt = 1; ; attempt++) {
        try {
          page = await source.listOrders({ cursor });
          break;
        } catch (error) {
          if (!error.retryable || attempt === 3) throw error;
          console.log(`  ↻ ${error.message}: reintento`);
          await wait(20);
        }
      }
      read += 1;
      yield page.items;
      cursor = page.nextCursor;
    }
  } finally {
    console.log(`  (${label}: ${read} página(s) leída(s), paginador cerrado)`);
  }
}

async function* flatten(source) {
  for await (const items of source) yield* items;
}

const filter = (predicate) => async function* (source) {
  for await (const item of source) if (predicate(item)) yield item;
};

const mapConcurrent = (limit, fn) => async function* (source) {
  const inFlight = []; // promesas en marcha, en orden de llegada
  for await (const item of source) {
    const promise = fn(item);
    promise.catch(() => {}); // si la tubería se corta, que su error no quede sin manejar
    inFlight.push(promise);
    if (inFlight.length >= limit) yield await inFlight.shift(); // siempre la más antigua
  }
  while (inFlight.length > 0) yield await inFlight.shift();
};

const batch = (size) => async function* (source) {
  let current = [];
  for await (const item of source) {
    current.push(item);
    if (current.length === size) {
      yield current;
      current = [];
    }
  }
  if (current.length > 0) yield current;
};

const take = (count) => async function* (source) {
  if (count <= 0) return;
  let taken = 0;
  for await (const item of source) {
    yield item;
    taken += 1;
    if (taken === count) return; // ← sale del for await: cierra la etapa de arriba
  }
};

const pipe = (source, ...stages) => stages.reduce((stream, stage) => stage(stream), source);

// Caché de PROMESAS por cliente: la segunda petición del mismo cliente reutiliza la primera.
function cachedLookup(lookup) {
  const cache = new Map();
  return (id) => {
    if (!cache.has(id)) cache.set(id, lookup(id));
    return cache.get(id);
  };
}

// ── Exportación ──────────────────────────────────────────────────────────
async function main() {
  const getCustomer = cachedLookup((id) => api.getCustomer(id));
  const enrich = async (order) => ({ ...order, customer: await getCustomer(order.customerId) });

  console.log('▶ 3 lotes de 4 pedidos pagados de más de $1,000');
  const sentBatches = [];
  const exportStream = pipe(
    pages(api, { label: 'exportación' }),
    flatten,
    filter((order) => order.status === 'pagado' && order.totalCents > 100000),
    mapConcurrent(3, enrich),
    batch(4),
    take(3),
  );
  for await (const orders of exportStream) {
    await wait(10); // la contabilidad inserta el lote
    sentBatches.push(orders);
    console.log(`  📤 lote ${sentBatches.length}: ${orders.map((order) => `${order.id} ${order.customer.name} ${money(order.totalCents)}`).join(' · ')}`);
  }
  const sentOrders = sentBatches.flat();
  console.log('  peticiones a la lista →', api.requests, '(una falló y se reintentó); la API tiene 6 páginas');
  console.log('  clientes consultados →', api.customerLookups, 'para', sentOrders.length, 'pedidos (caché de promesas)');
  console.log('  en el orden de la API →', sentOrders.every((order, i) => i === 0 || order.id > sentOrders[i - 1].id));

  console.log('▶ totales por estado (recorrido completo)');
  api.requests = 0;
  const totals = {};
  for await (const order of pipe(pages(api, { label: 'informe' }), flatten)) {
    totals[order.status] = (totals[order.status] ?? 0) + order.totalCents;
  }
  console.log(`  ${Object.entries(totals).map(([status, cents]) => `${status}: ${money(cents)}`).join(' · ')}`);
  console.log('  peticiones →', api.requests);
}
main();

// > Desde Python: cada etapa es un «async def … yield», y pipe es encadenar
//   llamadas: take(batch(...)). La caché de promesas equivale a guardar
//   asyncio.Task en un dict en vez de resultados.
```
