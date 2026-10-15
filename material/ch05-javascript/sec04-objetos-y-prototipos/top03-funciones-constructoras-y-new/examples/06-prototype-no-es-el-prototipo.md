---
example_description: "Product.prototype no es el [[Prototype]] de Product, sino el que reciben sus instancias; las instancias no tienen .prototype y los métodos puestos en Product no se heredan"
example_tags: "javascript|prototipos|prototype|getprototypeof|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
function Product(title, cents) {
  this.title = title;
  this.cents = cents;
}
Product.prototype.describe = function () {
  return `Producto: ${this.title}`;
};
const lamp = new Product('Lámpara de mesa', 2400);

// Dos cosas distintas con nombres casi iguales:
//   Product.prototype → una PROPIEDAD normal de la función Product
//   [[Prototype]]     → el enlace interno de un objeto (Object.getPrototypeOf)
//
//   Product (función) ──[[Prototype]]──► Function.prototype (call, apply, bind…)
//      │
//      └─ .prototype ──► Product.prototype { constructor, describe } ──► Object.prototype
//                               ▲
//   lamp { title, cents } ──────┘ [[Prototype]]

// 🐛 Confusión 1: «Product.prototype es el prototipo de Product».
console.log('🐛 ¿getPrototypeOf(Product) === Product.prototype? →',
  Object.getPrototypeOf(Product) === Product.prototype); // false
console.log('✅ el [[Prototype]] de Product es Function.prototype →',
  Object.getPrototypeOf(Product) === Function.prototype); // true: Product es una función
console.log('✅ Product.prototype es el [[Prototype]] de sus instancias →',
  Object.getPrototypeOf(lamp) === Product.prototype); // true

// 🐛 Confusión 2: buscar .prototype en una instancia.
console.log('🐛 lamp.prototype →', lamp.prototype); // undefined: solo las funciones lo tienen
console.log('✅ Object.getPrototypeOf(lamp) →', Object.getPrototypeOf(lamp)); // {constructor: ƒ, describe: ƒ}

// 🐛 Confusión 3: añadir un método a la FUNCIÓN en lugar de a su prototype.
Product.applyDiscount = function (percent) {
  this.cents = Math.round(this.cents * (1 - percent / 100));
};
try {
  lamp.applyDiscount(10); // la búsqueda pasa por Product.prototype, no por Product
} catch (error) {
  console.log('🐛 lamp.applyDiscount →', error.name, '|', error.message);
}

// ✅ Los métodos de las instancias van en Product.prototype.
Product.prototype.applyDiscount = Product.applyDiscount;
lamp.applyDiscount(10);
console.log('✅ tras applyDiscount →', lamp.cents); // 2160

// Lo que se pone en la propia función (Product.algo) no lo heredan las
// instancias: son funciones «estáticas», como Object.keys o Array.from.
```
