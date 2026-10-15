// CARRITO (ejemplo 07): la clase es la exportación por defecto.
export const MAX_ITEMS = 20;

export default class Cart {
  #skus = [];

  add(sku) {
    this.#skus.push(sku);
    return this;
  }

  get size() {
    return this.#skus.length;
  }
}
