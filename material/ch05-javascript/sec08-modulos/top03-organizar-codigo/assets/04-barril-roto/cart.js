// CARRITO (ejemplo 04 de «Organizar el código»): exporta por defecto la clase.
export default class Cart {
  #count = 0;

  add() {
    this.#count += 1;
    return this;
  }

  get count() {
    return this.#count;
  }
}

export const MAX_ITEMS = 20;
