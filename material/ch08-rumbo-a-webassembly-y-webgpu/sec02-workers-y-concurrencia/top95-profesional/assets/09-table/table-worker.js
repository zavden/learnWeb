// WORKER DEL EJEMPLO 09 (de módulo): el catálogo entero vive aquí. La página pide
// «una vista» (filtro y orden) y luego tramos de filas: nunca recibe las 200 000.
import { generateCatalog, applyView, getRows } from './catalog.js';

const catalog = generateCatalog(200_000, 2026);
let order = new Uint32Array(0); // la vista actual (filtro y orden): la primera la pide la página
self.postMessage({ type: 'ready', total: catalog.count });

self.onmessage = (event) => {
  const { id, type } = event.data;
  if (type === 'view') {
    const start = performance.now();
    order = applyView(catalog, event.data.view);
    self.postMessage({ id, type: 'view', total: order.length, ms: performance.now() - start });
  } else if (type === 'rows') {
    self.postMessage({ id, type: 'rows', start: event.data.start, rows: getRows(catalog, order, event.data.start, event.data.count) });
  }
};
