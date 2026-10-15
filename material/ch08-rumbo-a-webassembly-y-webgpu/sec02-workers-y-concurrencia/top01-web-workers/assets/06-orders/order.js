// LA CLASE Order (ejemplo 06), compartida por la página y el worker: el CÓDIGO
// llega a cada lado con import; por mensajes solo viajan los DATOS.
export class Order {
  #paid = false; // campo privado: no es una propiedad, el clonado no lo ve

  constructor(code, lines) {
    this.code = code;
    this.lines = lines;
  }

  get total() { // getter del prototipo: tampoco viaja
    return this.lines.reduce((sum, line) => sum + line.price * line.qty, 0);
  }

  get paid() {
    return this.#paid;
  }

  pay() {
    this.#paid = true;
  }

  // Datos planos, aptos para postMessage (y para JSON)…
  toData() {
    return { code: this.code, lines: this.lines, paid: this.#paid };
  }

  // …y de vuelta a una instancia, al otro lado.
  static fromData(data) {
    const order = new Order(data.code, data.lines);
    if (data.paid) order.pay();
    return order;
  }
}
