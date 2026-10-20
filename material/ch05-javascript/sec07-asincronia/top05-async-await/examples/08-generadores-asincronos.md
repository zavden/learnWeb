---
example_description: "Generadores asíncronos: el paginador por cursores del módulo 6 con una API que devuelve promesas; async function* pide cada página con await, yield* aplana, for await…of recorre (y break cierra el generador, finally incluido) y Symbol.asyncIterator hace recorrible una clase"
example_tags: "javascript|python|async|generadores-asincronos|for-await|symbol-asynciterator|paginacion"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// El paginador del módulo 6 (top95, «paginador con cursores»), con la API
// ASÍNCRONA que prometía: function* pasa a async function*, cada petición
// lleva un await y se recorre con for await…of. Lo demás no cambia.
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class ApiError extends Error {
  constructor(status, message) {
    super(`${status} ${message}`);
    this.name = 'ApiError';
    this.retryable = status === 503;
  }
}

const STATUSES = ['pagado', 'enviado', 'enviado', 'cancelado'];
const ORDERS = Array.from({ length: 23 }, (_, i) => ({ id: `P-${1001 + i}`, status: STATUSES[(i * 3) % 4] }));
const api = {
  requests: 0,
  failures: new Set([2]), // la petición n.º 2 falla UNA vez (servidor saturado)
  async listOrders({ cursor = null, limit = 5 } = {}) {
    this.requests += 1;
    await wait(20); // la «red»
    if (this.failures.delete(this.requests)) throw new ApiError(503, 'Servicio no disponible');
    const start = cursor === null ? 0 : ORDERS.findIndex((order) => `after:${order.id}` === cursor) + 1;
    const items = ORDERS.slice(start, start + limit);
    return { items, nextCursor: start + limit < ORDERS.length ? `after:${items.at(-1).id}` : null };
  },
};

// Pide una página SOLO cuando el consumidor llega a ella.
async function* pages(source, { cursor = null, label }) {
  let pagesRead = 0;
  try {
    do {
      let page;
      for (let attempt = 1; ; attempt++) {
        try {
          page = await source.listOrders({ cursor });
          break;
        } catch (error) {
          if (!error.retryable || attempt === 3) throw error;
          console.log(`  ↻ ${error.message}: reintento`);
        }
      }
      pagesRead += 1;
      yield page;
      cursor = page.nextCursor;
    } while (cursor !== null);
  } finally {
    console.log(`  (${label}: ${pagesRead} página(s) leída(s))`); // también tras un break
  }
}

async function* items(source, options) {
  for await (const page of pages(source, options)) yield* page.items; // yield* de un array
}

// Una clase recorrible con for await…of: su método [Symbol.asyncIterator].
class OrderHistory {
  constructor(source) { this.source = source; }
  [Symbol.asyncIterator]() { return items(this.source, { label: 'historial' }); }
}

async function main() {
  console.log('▶ los 3 primeros pedidos cancelados');
  const found = [];
  for await (const order of items(api, { label: 'búsqueda' })) {
    if (order.status === 'cancelado') found.push(order.id);
    if (found.length === 3) break; // cierra el generador: se ejecuta su finally
  }
  console.log('  resultado →', found, '| peticiones →', api.requests, '(una falló y se reintentó)');

  console.log('▶ el historial completo, con Symbol.asyncIterator');
  api.requests = 0;
  let count = 0;
  for await (const order of new OrderHistory(api)) count += 1;
  console.log('  pedidos →', count, '| peticiones →', api.requests);

  console.log('▶ Array.fromAsync: todas las páginas en un array');
  api.requests = 0;
  const allPages = await Array.fromAsync(pages(api, { label: 'exportación' }));
  console.log('  tamaños →', allPages.map((page) => page.items.length), '| peticiones →', api.requests);
}
main();

// > Desde Python: async def con yield es un generador asíncrono, y async for
//   lo recorre; [Symbol.asyncIterator] es __aiter__. Array.fromAsync
//   (Chrome 121) es [x async for x in agen].
```
