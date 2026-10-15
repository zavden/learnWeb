// ✅ EL MISMO WIDGET CON LA CACHÉ COMPARTIDA (ejemplo 05): también trae su
// copia del módulo (?v=1.4), pero la caché sale de globalThis.
import { priceCache } from '../shared-price-cache.js?v=1.4';

export async function bannerPrices(skus) {
  return Promise.all(skus.map((sku) => priceCache.get(sku)));
}

// Para que el ejemplo pueda comprobar que es la misma caché:
export { priceCache as bannerCache };
