// 🐛 UN WIDGET ANTIGUO (ejemplo 05) que trae «su» copia del módulo de la
// caché: otra URL (?v=1.4, como si fuera otra versión del paquete), otro
// módulo, otra caché vacía. Sus peticiones no aprovechan nada.
import { priceCache, copyNumber } from '../price-cache.js?v=1.4';

export const bannerCopy = copyNumber;

export async function bannerPrices(skus) {
  return Promise.all(skus.map((sku) => priceCache.get(sku)));
}
