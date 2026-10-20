---
example_description: "Lo que heredan todos los objetos desde Object.prototype; un toString propio en tu prototipo cambia cómo se convierte a texto, y Object.prototype.toString.call da la etiqueta de tipo"
example_tags: "javascript|python|prototipos|object-prototype|tostring|tipos"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Lo que hereda (casi) cualquier objeto: las propiedades de Object.prototype.
console.log('Object.prototype →', Object.getOwnPropertyNames(Object.prototype));
// constructor, hasOwnProperty, isPrototypeOf, propertyIsEnumerable, toString,
// toLocaleString, valueOf, __proto__ y cuatro métodos antiguos (__defineGetter__…)

// toString es lo que usa JavaScript al convertir un objeto en texto.
// El heredado de Object.prototype da el famoso '[object Object]':
function Money(cents, currency) {
  this.cents = cents;
  this.currency = currency;
}
const price = new Money(129900, 'MXN');
console.log('🐛 plantilla →', `Total: ${price}`); // 'Total: [object Object]'

// ✅ Un toString en Money.prototype sombrea al de Object.prototype:
Money.prototype.toString = function () {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: this.currency })
    .format(this.cents / 100);
};
console.log('✅ plantilla →', `Total: ${price}`);   // 'Total: $1,299.00'
console.log('✅ String(price) →', String(price));
console.log("✅ concatenación →", 'Precio: ' + price);
// (Los arrays y las fechas también tienen su propio toString: [1, 2] + '' da '1,2'.)

// El toString ORIGINAL, prestado con call, devuelve una etiqueta de tipo
// mucho más fina que typeof:
const tagOf = (value) => Object.prototype.toString.call(value);
console.table({
  '[]': { typeof: typeof [], tag: tagOf([]) },
  null: { typeof: typeof null, tag: tagOf(null) },
  'new Date()': { typeof: typeof new Date(0), tag: tagOf(new Date(0)) },
  '/a/': { typeof: typeof /a/, tag: tagOf(/a/) },
  'new Map()': { typeof: typeof new Map(), tag: tagOf(new Map()) },
  price: { typeof: typeof price, tag: tagOf(price) },
});
// (Symbol.toStringTag permite elegir esa etiqueta para tus tipos: lo verás en
// el módulo «Clases y POO».)

// > Desde Python: Money.prototype.toString es el __str__ de la clase. Y
//   Object.prototype es el object del que todo hereda (object.__str__,
//   object.__eq__…).
```
