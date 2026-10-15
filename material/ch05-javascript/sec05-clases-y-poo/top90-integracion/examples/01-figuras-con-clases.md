---
example_description: "El presupuesto de corte láser del módulo anterior escrito dos veces, con prototipos a mano y con class: el mismo resultado, y una tabla con lo que cambia (métodos no enumerables, estáticos heredados, registro de tipos)"
example_tags: "javascript|integracion|clases|herencia|super|static|polimorfismo"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// PRESUPUESTO DE CORTE LÁSER (integración del módulo «Objetos y prototipos»),
// escrito dos veces: A con constructoras y prototipos, B con class.
// Integra: class y campos («Clases»), getters y static privados («Encapsulación»),
// extends y super («Herencia con extends»), toString y polimorfismo («Polimorfismo…»).
const oneDecimal = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const describeShape = (shape) =>
  `${shape.label} «${shape.name}»: ${oneDecimal.format(shape.area())} cm², corte ${oneDecimal.format(shape.perimeter())} cm`;

// ── A. A mano ─────────────────────────────────────────────────────────
function inherit(Child, Parent) {
  Child.prototype = Object.create(Parent.prototype);
  Object.defineProperty(Child.prototype, 'constructor', { value: Child, writable: true, configurable: true });
}
function ProtoShape(name) { this.name = name; }
ProtoShape.prototype.label = 'figura';
ProtoShape.prototype.describe = function () { return describeShape(this); };
function ProtoCircle(name, radius) { ProtoShape.call(this, name); this.radius = radius; }
inherit(ProtoCircle, ProtoShape);
ProtoCircle.prototype.label = 'círculo';
ProtoCircle.prototype.area = function () { return Math.PI * this.radius ** 2; };
ProtoCircle.prototype.perimeter = function () { return 2 * Math.PI * this.radius; };
function ProtoRectangle(name, width, height) { ProtoShape.call(this, name); this.width = width; this.height = height; }
inherit(ProtoRectangle, ProtoShape);
ProtoRectangle.prototype.label = 'rectángulo';
ProtoRectangle.prototype.area = function () { return this.width * this.height; };
ProtoRectangle.prototype.perimeter = function () { return 2 * (this.width + this.height); };
function ProtoSquare(name, side) { ProtoRectangle.call(this, name, side, side); }
inherit(ProtoSquare, ProtoRectangle);
ProtoSquare.prototype.label = 'cuadrado';
ProtoSquare.prototype.describe = function () {
  return `${ProtoRectangle.prototype.describe.call(this)} (lado ${this.width} cm)`;
};

// ── B. Con class ──────────────────────────────────────────────────────
class Shape {
  static #types = new Map(); // registro de tipos para crear piezas desde JSON
  static register(type) {
    Shape.#types.set(type, this); // this = la subclase que se registra
  }
  static fromJSON({ type, ...data }) {
    const Type = Shape.#types.get(type);
    if (!Type) throw new TypeError(`Figura desconocida: «${type}»`);
    return Type.create(data);
  }
  constructor(name) {
    this.name = name;
  }
  get label() { return 'figura'; } // en el prototipo: no enumerable y de solo lectura
  describe() { return describeShape(this); }
  toString() { return `${this.constructor.name}(${this.name})`; }
}
class Circle extends Shape {
  static create({ name, radius }) { return new this(name, radius); }
  constructor(name, radius) { super(name); this.radius = radius; }
  get label() { return 'círculo'; }
  area() { return Math.PI * this.radius ** 2; }
  perimeter() { return 2 * Math.PI * this.radius; }
}
class Rectangle extends Shape {
  static create({ name, width, height }) { return new this(name, width, height); }
  constructor(name, width, height) { super(name); this.width = width; this.height = height; }
  get label() { return 'rectángulo'; }
  area() { return this.width * this.height; }
  perimeter() { return 2 * (this.width + this.height); }
}
class Square extends Rectangle {
  static create({ name, side }) { return new this(name, side); }
  constructor(name, side) { super(name, side, side); }
  get label() { return 'cuadrado'; }
  describe() { return `${super.describe()} (lado ${this.width} cm)`; }
}
Circle.register('circle');
Rectangle.register('rectangle');
Square.register('square');

// ── El mismo pedido con las dos versiones ─────────────────────────────
const protoPieces = [new ProtoRectangle('Tapa de caja', 30, 20), new ProtoSquare('Base', 20), new ProtoCircle('Esfera de reloj', 15)];
const orderJson = '[{"type":"rectangle","name":"Tapa de caja","width":30,"height":20},'
  + '{"type":"square","name":"Base","side":20},{"type":"circle","name":"Esfera de reloj","radius":15}]';
const classPieces = JSON.parse(orderJson).map((data) => Shape.fromJSON(data));

function quote(pieces) {
  const area = pieces.reduce((sum, piece) => sum + piece.area(), 0);      // polimorfismo:
  const cut = pieces.reduce((sum, piece) => sum + piece.perimeter(), 0);  // cada pieza el suyo
  const cents = Math.round(300 + area * 0.18 + cut * 0.5);
  return [...pieces.map((piece) => piece.describe()), `total → ${euros.format(cents / 100)}`];
}
console.log(quote(classPieces).join('\n'));
console.log('¿el mismo presupuesto con A y con B? →', quote(protoPieces).join() === quote(classPieces).join());
console.log(`plantilla → ${classPieces[1]}`);

// ── Lo que cambia ─────────────────────────────────────────────────────
const forIn = (obj) => {
  const keys = [];
  for (const key in obj) keys.push(key);
  return keys.join(', ');
};
console.table({
  'for…in de un cuadrado': { 'A. a mano': forIn(protoPieces[1]), 'B. class': forIn(classPieces[1]) },
  'estáticos heredados (Square → Rectangle)': {
    'A. a mano': Object.getPrototypeOf(ProtoSquare) === ProtoRectangle,
    'B. class': Object.getPrototypeOf(Square) === Rectangle,
  },
  '¿instanceof la base?': { 'A. a mano': protoPieces[1] instanceof ProtoShape, 'B. class': classPieces[1] instanceof Shape },
});
try {
  Shape.fromJSON({ type: 'triangle', name: 'Escuadra' });
} catch (error) {
  console.warn(`⛔ ${error.name}: ${error.message}`);
}
```
