// ✅ LA CACHÉ QUE SOBREVIVE A LAS COPIAS (ejemplo 05).
// Si el mismo paquete acaba dos veces en la página (dos versiones, dos URLs),
// cada copia del módulo crearía su propia caché. Aquí, la primera copia que
// se evalúa la guarda en globalThis con una clave Symbol.for (la misma en
// todas las copias, imposible de pisar por accidente), y las demás la usan.
// Es el último recurso: lo normal es que el empaquetador no duplique.
import { fetchPrice } from './price-service.js';
import { createPriceCache } from './create-cache.js';

const KEY = Symbol.for('cafe-la-huasteca.shared-price-cache');
globalThis[KEY] ??= createPriceCache(fetchPrice);

export const priceCache = globalThis[KEY];
