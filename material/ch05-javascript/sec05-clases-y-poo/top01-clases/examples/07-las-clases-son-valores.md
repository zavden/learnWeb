---
example_description: "Una clase es un valor: expresiones de clase, clases guardadas en un Map y pasadas a funciones para elegir con qué tipo crear cada objeto a partir de datos JSON"
example_tags: "javascript|python|clases|expresion-de-clase|valores|registro"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// Expresión de clase: la clase es el valor de una expresión, como una función.
const Point = class {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
};
console.log('Point.name →', Point.name); // 'Point': inferido de la variable
console.log('new Point(3, 4) →', new Point(3, 4));

// Como es un valor, se puede guardar en un Map: un registro de tipos.
class Circle {
  constructor({ radius }) {
    this.radius = radius;
  }
  area() {
    return Math.PI * this.radius ** 2;
  }
}
class Rectangle {
  constructor({ width, height }) {
    this.width = width;
    this.height = height;
  }
  area() {
    return this.width * this.height;
  }
}
const shapeTypes = new Map([
  ['circle', Circle],
  ['rectangle', Rectangle],
]);

// El campo "type" de cada objeto JSON decide qué clase se usa.
function createShape(data) {
  const Type = shapeTypes.get(data.type);
  if (!Type) throw new TypeError(`Tipo de figura desconocido: «${data.type}»`);
  return new Type(data);
}

const json = '[{"type":"circle","radius":2},{"type":"rectangle","width":3,"height":4}]';
for (const shape of JSON.parse(json).map(createShape)) {
  console.log(`${shape.constructor.name} → área ${shape.area().toFixed(2)}`);
}
try {
  createShape({ type: 'triangle' });
} catch (error) {
  console.warn(`⛔ ${error.message}`);
}

// Y se puede pasar a una función que crea varias instancias de cualquier tipo.
function createMany(Type, items) {
  return items.map((item) => new Type(item));
}
console.log('createMany →', createMany(Circle, [{ radius: 1 }, { radius: 5 }]));

// > Desde Python: igual que pasar una clase como argumento (las clases también
//   son objetos). La diferencia: en JavaScript hace falta new para instanciarla.
```
