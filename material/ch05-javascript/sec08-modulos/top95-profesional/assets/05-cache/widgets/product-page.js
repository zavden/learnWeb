// FICHA DE PRODUCTO (ejemplo 05).
import { priceCache } from '../price-cache.js';

export function productPrice(sku) {
  return priceCache.get(sku);
}
