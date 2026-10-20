---
example_description: "x instanceof C llama a C[Symbol.hasInstance](x): la versión heredada de Function.prototype recorre la cadena de prototipos y es de solo lectura (asignarla no hace nada); static [Symbol.hasInstance] la redefine, incluso para primitivos"
example_tags: "javascript|python|symbol|symbol-hasinstance|instanceof|prototipos"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// x instanceof C no es magia: el motor llama a C[Symbol.hasInstance](x).
function Product(title) {
  this.title = title;
}
const lamp = new Product('Lámpara de barro');

// Todas las funciones heredan la versión de Function.prototype, que recorre la
// cadena de prototipos (tu myInstanceOf de la lección «Funciones constructoras y new»).
console.log('instanceof →', lamp instanceof Product);
console.log('llamado a mano →', Product[Symbol.hasInstance](lamp));
console.log('¿propio de Product? →', Object.hasOwn(Product, Symbol.hasInstance));
console.log('descriptor heredado →', Object.getOwnPropertyDescriptor(Function.prototype, Symbol.hasInstance));

// 🤔 Es una propiedad heredada con writable: false, así que ASIGNAR no crea
//    una propia (en silencio, en un script clásico: lección «La cadena de prototipos»).
Product[Symbol.hasInstance] = () => false;
console.log('tras asignar →', lamp instanceof Product, '| ¿propio? →', Object.hasOwn(Product, Symbol.hasInstance));

// ✅ En una clase se redefine con static (que define la propiedad, no la asigna).
//    Y funciona hasta con primitivos, que no tienen cadena de prototipos propia.
class EvenNumber {
  static [Symbol.hasInstance](value) {
    return Number.isInteger(value) && value % 2 === 0;
  }
}
console.log('4 instanceof EvenNumber →', 4 instanceof EvenNumber);
console.log('7 y "4" →', 7 instanceof EvenNumber, '4' instanceof EvenNumber);

// Un «tipo» por FORMA (el duck typing de «Polimorfismo y protocolos»):
class Priced {
  static [Symbol.hasInstance](value) {
    return Number.isInteger(value?.cents) && value.cents >= 0;
  }
}
const items = [{ name: 'Atole', cents: 1800 }, { name: 'Muestra gratis' }, lamp];
console.log('instanceof Priced →', items.map((item) => `${item.name ?? item.title}: ${item instanceof Priced}`));

// Úsalo con mesura: quien lee «x instanceof Priced» espera una comprobación de
// cadena de prototipos, no una de forma.

// > Desde Python: es __instancecheck__, con una diferencia de sitio: Python lo
//   busca en la METACLASE (type(cls)), así que hace falta una metaclase o una
//   ABC con __subclasshook__; JavaScript lo busca en la propia clase (static).
```
