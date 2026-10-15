---
example_description: "JavaScript no tiene __add__ ni __eq__: a + b con objetos concatena o suma primitivos, === compara identidad (también en Set e includes) y <= puede ser true con == false; se usan métodos add y equals"
example_tags: "javascript|python|protocolos|operadores|igualdad|identidad|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
class Vector {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}
const a = new Vector(1, 2);
const b = new Vector(3, 4);

// 🐛 1. + no se puede redefinir: convierte los objetos a primitivo y suma o concatena eso.
console.log('🐛 a + b →', a + b); // '[object Object][object Object]'

// 🐛 2. Con valueOf, + suma NÚMEROS: el resultado ya no es un Vector.
class Money {
  constructor(cents) {
    this.cents = cents;
  }
  valueOf() {
    return this.cents;
  }
}
const sum = new Money(500) + new Money(250);
console.log('🐛 Money + Money →', sum, '| typeof →', typeof sum); // 750, un número

// 🐛 3. === y == entre objetos comparan IDENTIDAD (¿el mismo objeto?), nunca el contenido.
const x = new Money(500);
const y = new Money(500);
console.log('🐛 x === y →', x === y, '| x == y →', x == y);
console.log('🐛 pero x <= y && x >= y →', x <= y && x >= y); // <= y >= sí usan valueOf
console.log('🐛 new Set([x, y]).size →', new Set([x, y]).size, '| [x].includes(y) →', [x].includes(y));

// ✅ Métodos con nombre: explícitos y sin sorpresas.
class Vec {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  add(other) {
    return new Vec(this.x + other.x, this.y + other.y); // devuelve un Vec nuevo
  }
  equals(other) {
    return other instanceof Vec && this.x === other.x && this.y === other.y;
  }
  toString() {
    return `Vec(${this.x}, ${this.y})`;
  }
}
const p = new Vec(1, 2);
const q = new Vec(3, 4);
console.log('✅ p.add(q) →', `${p.add(q)}`);
console.log('✅ p.add(q).equals(new Vec(4, 6)) →', p.add(q).equals(new Vec(4, 6)));
// Para quitar duplicados por contenido, se usa una clave primitiva:
const unique = new Map([p, q, new Vec(1, 2)].map((v) => [`${v}`, v]));
console.log('✅ únicos por contenido →', [...unique.keys()]);

// > Desde Python: __add__, __eq__, __lt__ y __hash__ no tienen equivalente.
//   a + b y a == b funcionan con tus clases en Python; en JavaScript no.
```
