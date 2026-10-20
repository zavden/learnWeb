// CARRITO (ejemplo 03): una clase como exportación por defecto.
import { findProduct } from './catalog.js';
console.log('  (evaluando cart.js)');

export default class Cart {
  #skus = [];

  add(sku) {
    if (!findProduct(sku)) throw new RangeError(`No existe ${sku}`);
    this.#skus.push(sku);
    return this;
  }

  get totalCents() {
    return this.#skus.reduce((sum, sku) => sum + findProduct(sku).cents, 0);
  }
}
