// CARRITO (ejemplo 01): el estado y las reglas del carrito.
// Depende del catálogo (para los precios), pero no sabe cómo se muestra nada.
import { findProduct } from './catalog.js';

export function createCart() {
  const quantities = new Map(); // sku → cantidad

  return {
    add(sku, quantity = 1) {
      findProduct(sku); // valida que exista
      quantities.set(sku, (quantities.get(sku) ?? 0) + quantity);
    },
    lines() {
      return [...quantities].map(([sku, quantity]) => ({ product: findProduct(sku), quantity }));
    },
    totalCents() {
      return this.lines().reduce((sum, line) => sum + line.product.cents * line.quantity, 0);
    },
  };
}
