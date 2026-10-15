// CARRITO (ejemplo 02 de «Módulos ES»).
// Un módulo puede tener UNA exportación por defecto (aquí, la clase)
// y todas las exportaciones con nombre que quiera (aquí, el límite).

export const MAX_ITEMS = 20;

export default class Cart {
  #lines = [];

  add(name, cents, quantity = 1) {
    if (this.count + quantity > MAX_ITEMS) {
      throw new RangeError(`Máximo ${MAX_ITEMS} productos por pedido`);
    }
    this.#lines.push({ name, cents, quantity });
    return this;
  }

  get count() {
    return this.#lines.reduce((sum, line) => sum + line.quantity, 0);
  }

  get totalCents() {
    return this.#lines.reduce((sum, line) => sum + line.cents * line.quantity, 0);
  }
}
