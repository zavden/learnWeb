---
example_description: "Presupuesto de corte láser con una jerarquía de figuras: constructoras encadenadas en tres niveles, métodos compartidos y sobrescritos, constructor no enumerable y un toString propio"
example_tags: "javascript|integracion|constructoras|herencia|polimorfismo|prototipos"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// PRESUPUESTO DE CORTE LÁSER: un taller cobra el material (por cm²) y el corte
// (por cm de contorno). Cada pieza es una figura que sabe calcular su área y su
// perímetro.
// Integra: constructoras y new («Funciones constructoras y new»), el patrón de
// herencia y la llamada al padre («Herencia prototípica»), constructor no
// enumerable con defineProperty («Propiedades a fondo») y un toString propio
// («Prototipos nativos»).

// Pasos 2 y 3 del patrón: prototipo hijo que hereda + constructor restaurado.
function inherit(Child, Parent) {
  Child.prototype = Object.create(Parent.prototype);
  Object.defineProperty(Child.prototype, 'constructor', {
    value: Child, writable: true, enumerable: false, configurable: true,
  });
}

function Shape(name) {
  this.name = name; // datos: propios de cada pieza
}
Shape.prototype.label = 'figura'; // valor por defecto INMUTABLE: puede ir en el prototipo
Shape.prototype.area = function () { return 0; };
Shape.prototype.perimeter = function () { return 0; };
const oneDecimal = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
Shape.prototype.describe = function () {
  return `${this.label} «${this.name}»: ${oneDecimal.format(this.area())} cm², corte ${oneDecimal.format(this.perimeter())} cm`;
};
Shape.prototype.toString = function () { // sombrea el de Object.prototype
  return `${this.constructor.name}(${this.name})`;
};

function Circle(name, radius) {
  Shape.call(this, name); // paso 1: los datos del padre
  this.radius = radius;
}
inherit(Circle, Shape);
Circle.prototype.label = 'círculo';
Circle.prototype.area = function () { return Math.PI * this.radius ** 2; };
Circle.prototype.perimeter = function () { return 2 * Math.PI * this.radius; };

function Rectangle(name, width, height) {
  Shape.call(this, name);
  this.width = width;
  this.height = height;
}
inherit(Rectangle, Shape);
Rectangle.prototype.label = 'rectángulo';
Rectangle.prototype.area = function () { return this.width * this.height; };
Rectangle.prototype.perimeter = function () { return 2 * (this.width + this.height); };

// Un cuadrado ES un rectángulo con los lados iguales: tercer nivel de la cadena.
function Square(name, side) {
  Rectangle.call(this, name, side, side);
}
inherit(Square, Rectangle);
Square.prototype.label = 'cuadrado';
Square.prototype.describe = function () {
  // Nombra al padre: this.describe() se llamaría a sí mismo sin fin.
  return `${Rectangle.prototype.describe.call(this)} (lado ${this.width} cm)`;
};

// ── El pedido ───────────────────────────────────────────────────────────
const pieces = [
  new Rectangle('Tapa de caja', 30, 20),
  new Rectangle('Lateral', 30, 8),
  new Square('Base', 20),
  new Square('Posavasos', 9),
  new Circle('Esfera de reloj', 15),
];

// Polimorfismo: el mismo bucle llama al area/perimeter de cada tipo.
for (const piece of pieces) console.log(piece.describe());

const PRICES = Object.freeze({ materialPerCm2: 0.18, cutPerCm: 0.5, setup: 300 }); // céntimos
const areaTotal = pieces.reduce((sum, piece) => sum + piece.area(), 0);
const cutTotal = pieces.reduce((sum, piece) => sum + piece.perimeter(), 0);
const cents = Math.round(PRICES.setup + areaTotal * PRICES.materialPerCm2 + cutTotal * PRICES.cutPerCm);
const euros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
console.log(`material ${oneDecimal.format(areaTotal)} cm² · corte ${oneDecimal.format(cutTotal)} cm → ${euros.format(cents / 100)}`);

// ── Lo que hay debajo ───────────────────────────────────────────────────
const base = pieces[2];
console.log('base →', base); // expándelo: Square.prototype → Rectangle.prototype → Shape.prototype
console.log('propias de base →', Object.keys(base)); // solo datos; constructor no sale (no enumerable)
console.log(`plantilla → ${base}`); // usa nuestro toString: Square(Base)
console.log('¿instanceof Square, Rectangle, Shape? →',
  base instanceof Square, base instanceof Rectangle, base instanceof Shape);
console.log('¿un solo area para todos los rectángulos? →', pieces[0].area === pieces[2].area); // true

// Dónde se resuelve cada método para un cuadrado:
const resolution = {};
for (const key of ['describe', 'area', 'label', 'toString', 'hasOwnProperty']) {
  let owner = base;
  while (!Object.hasOwn(owner, key)) owner = Object.getPrototypeOf(owner);
  resolution[key] = { 'se encuentra en': owner === Object.prototype ? 'Object.prototype' : `${owner.constructor.name}.prototype` };
}
console.table(resolution);
```
