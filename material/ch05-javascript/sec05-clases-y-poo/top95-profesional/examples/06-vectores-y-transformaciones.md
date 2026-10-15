---
example_description: "Vectores, matrices afines y polígonos inmutables: campos privados, fábricas estáticas, Symbol.iterator para desestructurar, Symbol.toPrimitive que da texto pero prohíbe + y la misma matriz que escribe CSS con matrix()"
example_tags: "javascript|profesional|clases|inmutabilidad|symbol-toprimitive|symbol-iterator|geometria"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// GEOMETRÍA 2D PARA UN EDITOR DE DISEÑO: girar, escalar y mover una figura.
// - Vec2, Matrix2D y Polygon son objetos de valor: privados, congelados y con
//   operaciones que devuelven objetos nuevos.
// - Sin sobrecarga de operadores: v.plus(w) en lugar de v + w. Symbol.toPrimitive
//   da texto (plantillas, String) y lanza un error si alguien intenta sumar.
// - Symbol.iterator permite desestructurar: const [x, y] = v.
// - Matrix2D usa el orden de CSS: matrix(a, b, c, d, e, f) (capítulo de CSS, transform).
//   El eje y apunta hacia abajo, como en la pantalla: un ángulo positivo gira
//   en el sentido de las agujas del reloj.
const round = (n, digits = 2) => {
  const factor = 10 ** digits;
  const value = Math.round(n * factor) / factor;
  return Object.is(value, -0) ? 0 : value; // sin «-0» en la salida
};
const toRadians = (degrees) => (degrees * Math.PI) / 180;

class Vec2 {
  static EPSILON = 1e-9;
  #x;
  #y;

  constructor(x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) throw new TypeError(`Coordenadas no válidas: ${x}, ${y}`);
    this.#x = x;
    this.#y = y;
    Object.freeze(this);
  }
  static ZERO = new Vec2(0, 0); // los campos estáticos se evalúan con la clase ya definida
  static fromAngle(degrees, length = 1) {
    return new Vec2(Math.cos(toRadians(degrees)) * length, Math.sin(toRadians(degrees)) * length);
  }

  get x() { return this.#x; }
  get y() { return this.#y; }
  get length() { return Math.hypot(this.#x, this.#y); }

  plus(other) { return new Vec2(this.#x + other.x, this.#y + other.y); }
  minus(other) { return new Vec2(this.#x - other.x, this.#y - other.y); }
  scale(k) { return new Vec2(this.#x * k, this.#y * k); }
  dot(other) { return this.#x * other.x + this.#y * other.y; }
  normalize() {
    if (this.length < Vec2.EPSILON) throw new RangeError('El vector cero no tiene dirección');
    return this.scale(1 / this.length);
  }
  equals(other, epsilon = Vec2.EPSILON) {
    return other instanceof Vec2 && Math.abs(this.#x - other.x) <= epsilon && Math.abs(this.#y - other.y) <= epsilon;
  }

  [Symbol.iterator]() {
    const values = [this.#x, this.#y];
    let index = 0;
    return { next: () => (index < 2 ? { value: values[index++], done: false } : { value: undefined, done: true }) };
  }
  [Symbol.toPrimitive](hint) {
    if (hint === 'string') return `(${round(this.#x)}, ${round(this.#y)})`;
    throw new TypeError('Vec2 no se convierte a número: usa .length, .plus() o .equals()');
  }
  toJSON() { return [this.#x, this.#y]; }
}

// Matriz afín [a c e; b d f; 0 0 1]: punto' = (a·x + c·y + e, b·x + d·y + f).
class Matrix2D {
  #values;
  constructor(a, b, c, d, e, f) {
    this.#values = Object.freeze([a, b, c, d, e, f]);
    Object.freeze(this);
  }
  static IDENTITY = new Matrix2D(1, 0, 0, 1, 0, 0);
  static translation(tx, ty) { return new Matrix2D(1, 0, 0, 1, tx, ty); }
  static scaling(sx, sy = sx) { return new Matrix2D(sx, 0, 0, sy, 0, 0); }
  static rotation(degrees) {
    const cos = Math.cos(toRadians(degrees));
    const sin = Math.sin(toRadians(degrees));
    return new Matrix2D(cos, sin, -sin, cos, 0, 0);
  }
  // Girar alrededor de un punto: llevarlo al origen, girar, devolverlo.
  static rotationAround(degrees, center) {
    return Matrix2D.translation(-center.x, -center.y).then(Matrix2D.rotation(degrees)).then(Matrix2D.translation(center.x, center.y));
  }

  // this.then(next): primero this, después next (next × this).
  then(next) {
    const [a1, b1, c1, d1, e1, f1] = this.#values;
    const [a2, b2, c2, d2, e2, f2] = next.#values; // privado de otra matriz: permitido
    return new Matrix2D(
      a2 * a1 + c2 * b1, b2 * a1 + d2 * b1,
      a2 * c1 + c2 * d1, b2 * c1 + d2 * d1,
      a2 * e1 + c2 * f1 + e2, b2 * e1 + d2 * f1 + f2,
    );
  }
  apply(point) {
    const [a, b, c, d, e, f] = this.#values;
    return new Vec2(a * point.x + c * point.y + e, b * point.x + d * point.y + f);
  }
  get determinant() {
    const [a, b, c, d] = this.#values;
    return a * d - b * c;
  }
  inverse() {
    const det = this.determinant;
    if (Math.abs(det) < Vec2.EPSILON) throw new RangeError('La matriz no tiene inversa (determinante 0)');
    const [a, b, c, d, e, f] = this.#values;
    return new Matrix2D(d / det, -b / det, -c / det, a / det, (c * f - d * e) / det, (b * e - a * f) / det);
  }
  equals(other, epsilon = Vec2.EPSILON) {
    return other instanceof Matrix2D && this.#values.every((value, i) => Math.abs(value - other.#values[i]) <= epsilon);
  }
  toString() {
    return `matrix(${this.#values.map((value) => round(value, 4)).join(', ')})`; // listo para CSS
  }
  [Symbol.toPrimitive](hint) {
    if (hint === 'string') return this.toString();
    throw new TypeError('Matrix2D no admite operadores: usa .then()');
  }
}

class Polygon {
  #points;
  constructor(points) {
    if (points.length < 3) throw new RangeError('Un polígono necesita al menos 3 vértices');
    this.#points = Object.freeze([...points]);
    Object.freeze(this);
  }
  static rectangle(x, y, width, height) {
    return new Polygon([new Vec2(x, y), new Vec2(x + width, y), new Vec2(x + width, y + height), new Vec2(x, y + height)]);
  }
  get area() { // fórmula del área de Gauss («del cordón de zapato»)
    let twice = 0;
    this.#points.forEach((p, i) => {
      const q = this.#points[(i + 1) % this.#points.length];
      twice += p.x * q.y - q.x * p.y;
    });
    return Math.abs(twice) / 2;
  }
  get centroid() {
    return this.#points.reduce((sum, p) => sum.plus(p), Vec2.ZERO).scale(1 / this.#points.length);
  }
  transform(matrix) {
    return new Polygon(this.#points.map((point) => matrix.apply(point)));
  }
  equals(other, epsilon) {
    return other instanceof Polygon && [...other].every((point, i) => point.equals(this.#points[i], epsilon));
  }
  [Symbol.iterator]() {
    return this.#points.values(); // el iterador del array, tal cual
  }
}

// ── Una tarjeta de 120 × 80 que se gira 30° sobre su centro y se amplía ──
const card = Polygon.rectangle(0, 0, 120, 80);
const center = card.centroid;
const turn = Matrix2D.rotationAround(30, center);
const zoom = Matrix2D.translation(-center.x, -center.y).then(Matrix2D.scaling(2)).then(Matrix2D.translation(center.x, center.y));
const turned = card.transform(turn);
const turnedAndZoomed = card.transform(turn.then(zoom));

console.log(`centro → ${center} | ¿el giro lo deja en su sitio? →`, turn.apply(center).equals(center));
console.table([...card].map((point, i) => ({
  vértice: i + 1,
  original: `${point}`,
  girado: `${[...turned][i]}`,
  'girado y ×2': `${[...turnedAndZoomed][i]}`,
})));
console.log('áreas → original', round(card.area), '| girado', round(turned.area), '| ×2', round(turnedAndZoomed.area));
console.log('determinantes → giro', round(turn.determinant), '| giro y ×2', round(turn.then(zoom).determinant));
console.log(`CSS → transform: ${turn};`); // = transform-origin: 60px 40px; transform: rotate(30deg)
console.log('¿la inversa deshace el giro? →', turned.transform(turn.inverse()).equals(card, 1e-9));

const [x, y] = Vec2.fromAngle(60, 10); // desestructurar gracias a Symbol.iterator
console.log('fromAngle(60°, 10) →', round(x), round(y), '| JSON →', JSON.stringify({ center }));

for (const attempt of [() => center + center, () => Matrix2D.scaling(0).inverse(), () => Vec2.ZERO.normalize(), () => new Polygon([center])]) {
  try {
    attempt();
  } catch (error) {
    console.warn(`⛔ ${error.name}: ${error.message}`);
  }
}
```
