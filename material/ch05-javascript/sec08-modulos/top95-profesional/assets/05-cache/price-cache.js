// LA CACHÉ DE PRECIOS DE LA PÁGINA (ejemplo 05): un «singleton» de módulo.
// El módulo se evalúa una vez por URL, así que todos los que lo importan
// comparten ESTA caché, sin clases ni static instance.
import { fetchPrice } from './price-service.js';
import { createPriceCache } from './create-cache.js';

// Cuántas copias de este módulo se han evaluado en la página (para el
// ejemplo): Symbol.for da el MISMO símbolo en todas las copias.
const COPIES = Symbol.for('cafe-la-huasteca.price-cache.copies');
globalThis[COPIES] = (globalThis[COPIES] ?? 0) + 1;
export const copyNumber = globalThis[COPIES];

export const priceCache = createPriceCache(fetchPrice);
