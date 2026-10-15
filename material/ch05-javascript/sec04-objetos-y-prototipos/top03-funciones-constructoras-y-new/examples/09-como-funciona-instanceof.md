---
example_description: "instanceof busca F.prototype en la cadena del objeto; myInstanceOf lo reproduce y muestra sus sorpresas: no le importa quién creó el objeto y los primitivos dan false"
example_tags: "javascript|python|prototipos|instanceof|isinstance|isprototypeof"
example_stage: intermediate
example_importance: critical
console: true
---

# JavaScript

```javascript
// value instanceof F significa: «¿aparece F.prototype en la cadena de value?»
function myInstanceOf(value, Constructor) {
  // Los primitivos no tienen cadena propia: siempre false.
  if (value === null || (typeof value !== 'object' && typeof value !== 'function')) {
    return false;
  }
  const target = Constructor.prototype;
  for (let proto = Object.getPrototypeOf(value); proto !== null; proto = Object.getPrototypeOf(proto)) {
    if (proto === target) return true;
  }
  return false;
}

function Product(title) {
  this.title = title;
}
const lamp = new Product('Lámpara de mesa');

// Cada caso, con el instanceof real y con el nuestro:
const cases = {
  'lamp, Product': [lamp, Product],
  'lamp, Object': [lamp, Object],                        // Object.prototype está al final
  '[], Array': [[], Array],
  '[], Object': [[], Object],
  'Object.create(Product.prototype), Product': [Object.create(Product.prototype), Product],
  'Object.create(null), Object': [Object.create(null), Object],
  "'texto', String": ['texto', String],                   // primitivo
  'Product, Function': [Product, Function],               // las funciones son objetos
};
const rows = {};
for (const [label, [value, Constructor]] of Object.entries(cases)) {
  rows[label] = { instanceof: value instanceof Constructor, myInstanceOf: myInstanceOf(value, Constructor) };
}
console.table(rows);

// Sorpresa: a instanceof le da igual si Product se ejecutó. Un objeto creado
// con Object.create(Product.prototype) no tiene title, pero «es un Product».
// Y al revés: si cambias Product.prototype, los objetos viejos dejan de serlo
// (ejemplo 07).

// La misma pregunta, al revés: ¿está este objeto en la cadena de aquel?
console.log('Product.prototype.isPrototypeOf(lamp) →', Product.prototype.isPrototypeOf(lamp)); // true

// > Desde Python: isinstance(lamp, Product) mira si Product está en
//   type(lamp).__mro__. Aquí se recorre la cadena del OBJETO buscando el
//   OBJETO Product.prototype. (Symbol.hasInstance, que permite cambiar
//   instanceof, llega en el módulo «Iteradores, generadores y metaprogramación».)
```
