---
example_description: "Un paginador por cursores sobre una API simulada: un generador pide cada página solo cuando hace falta, aplana con yield*, reintenta los fallos transitorios, registra el cierre en un finally y guarda el cursor para reanudar; los helpers deciden cuántas peticiones se hacen"
example_tags: "javascript|profesional|generadores|yield-star|iterator-helpers|paginacion|api"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// EL HISTORIAL DE PEDIDOS DE UNA TIENDA, leído página a página de una API.
//
// Decisiones:
// - La API es SÍNCRONA y simulada: listOrders({ cursor, limit }) devuelve
//   { items, nextCursor }. En el módulo de asincronía la misma API devolverá
//   promesas, y pages() será un generador asíncrono recorrido con for await…of;
//   la estructura del código no cambia.
// - El cursor es OPACO: el cliente no lo interpreta, solo lo devuelve en la
//   petición siguiente. Es la paginación de casi todas las APIs modernas.
// - pages() es un generador: pide una página SOLO cuando el consumidor llega a
//   ella. items() aplana las páginas con yield*. Con helpers, filter().take(n)
//   hace solo las peticiones necesarias (el contador lo demuestra).
// - Los fallos transitorios (503) se reintentan hasta 3 veces; los demás se
//   propagan. El finally registra cuántas páginas leyó cada recorrido, también
//   cuando el consumidor sale antes de tiempo.
// - break cierra el generador: para reanudar más tarde se guarda el cursor
//   (un «punto de control») y se crea otro generador a partir de él.
//
// Alcance: módulos 1-6.

class ApiError extends Error {
  constructor(status, message) {
    super(`${status} ${message}`);
    this.name = 'ApiError';
    this.status = status;
    this.retryable = status === 503;
  }
}

// ── La API simulada: 47 pedidos generados con una fórmula fija ─────────────
const CUSTOMERS = ['Ana Ruiz', 'Luis Pérez', 'Sofía Ríos', 'Iván Mena', 'Elena Canul', 'Jorge Lara'];
const STATUSES = ['pagado', 'pagado', 'enviado', 'enviado', 'enviado', 'cancelado'];
const ORDERS = Array.from({ length: 47 }, (_, i) => ({
  id: `P-${1001 + i}`,
  customer: CUSTOMERS[(i * 5 + Math.floor(i / 4)) % CUSTOMERS.length],
  totalCents: 15000 + ((i * 7919) % 120) * 1000,
  status: STATUSES[(i * 7) % STATUSES.length],
}));

const api = {
  requests: 0,
  failures: new Set([3]), // la petición n.º 3 falla una vez (servidor saturado)
  listOrders({ cursor = null, limit = 10 } = {}) {
    this.requests += 1;
    if (this.failures.delete(this.requests)) throw new ApiError(503, 'Servicio no disponible');
    const start = cursor === null ? 0 : ORDERS.findIndex((order) => `after:${order.id}` === cursor) + 1;
    if (start === 0 && cursor !== null) throw new ApiError(400, `Cursor no válido: ${cursor}`);
    const items = ORDERS.slice(start, start + limit);
    const last = items.at(-1);
    return { items, nextCursor: start + limit < ORDERS.length ? `after:${last.id}` : null };
  },
};

// ── El paginador ───────────────────────────────────────────────────────────
function* pages(source, { cursor = null, limit = 10, label = 'recorrido' } = {}) {
  let pagesRead = 0;
  try {
    do {
      let page;
      for (let attempt = 1; ; attempt++) {
        try {
          page = source.listOrders({ cursor, limit });
          break;
        } catch (error) {
          if (!(error instanceof ApiError) || !error.retryable || attempt === 3) throw error;
          console.log(`  ↻ ${error.message}: reintento ${attempt} de 2`);
        }
      }
      pagesRead += 1;
      yield { cursor, nextCursor: page.nextCursor, items: page.items };
      cursor = page.nextCursor;
    } while (cursor !== null);
  } finally {
    console.log(`  (${label}: ${pagesRead} página(s) leída(s))`); // también tras un break o un find
  }
}

function* items(source, options) {
  for (const page of pages(source, options)) yield* page.items;
}

const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const money = (cents) => pesos.format(cents / 100);

// 1. Solo lo necesario: los 4 primeros pedidos cancelados de más de $500
//    (para llamar a esos clientes). Bastan 3 de las 5 páginas.
console.log('▶ 4 pedidos cancelados de más de $500');
api.requests = 0;
const toCall = items(api, { label: 'búsqueda' })
  .filter((order) => order.status === 'cancelado' && order.totalCents > 50000)
  .take(4)
  .map((order) => `${order.id} ${order.customer} ${money(order.totalCents)}`)
  .toArray();
console.log('  resultado →', toCall);
console.log('  peticiones →', api.requests, '(la tercera falló y se reintentó)');

// 2. Todo el historial: totales por estado.
console.log('▶ totales por estado (recorrido completo)');
api.requests = 0;
const totals = new Map();
for (const order of items(api, { label: 'informe' })) {
  const entry = totals.get(order.status) ?? { pedidos: 0, cents: 0 };
  entry.pedidos += 1;
  entry.cents += order.totalCents;
  totals.set(order.status, entry);
}
console.table(Object.fromEntries([...totals].map(([status, { pedidos, cents }]) => [status, { pedidos, total: money(cents) }])));
console.log('  peticiones →', api.requests);

// 3. Procesar por tandas y reanudar desde un punto de control.
console.log('▶ exportar 2 páginas ahora y el resto después');
let checkpoint = null;
for (const page of pages(api, { label: 'exportación, parte 1' }).take(2)) {
  console.log(`  exporto ${page.items[0].id}…${page.items.at(-1).id}`);
  checkpoint = page.nextCursor; // el cursor de la página SIGUIENTE
}
console.log('  punto de control guardado →', checkpoint);
const rest = pages(api, { cursor: checkpoint, label: 'exportación, parte 2' })
  .map((page) => `${page.items[0].id}…${page.items.at(-1).id}`)
  .toArray();
console.log('  parte 2 →', rest);

// 4. Un error que no es transitorio no se reintenta.
console.log('▶ un cursor manipulado');
try {
  pages(api, { cursor: 'after:P-9999', label: 'cursor malo' }).next();
} catch (error) {
  console.warn(`  ⛔ ${error.name}: ${error.message}`);
}
```
