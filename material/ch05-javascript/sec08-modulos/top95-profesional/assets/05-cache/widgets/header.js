// CABECERA (ejemplo 05): el total del carrito.
import { priceCache } from '../price-cache.js';

export async function cartTotal(skus) {
  const prices = await Promise.all(skus.map((sku) => priceCache.get(sku)));
  return prices.reduce((sum, cents) => sum + cents, 0);
}
