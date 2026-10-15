---
example_description: "obj.constructor es una propiedad heredada del prototipo: sirve para crear «otro del mismo tipo» o para mostrar el nombre, pero se puede cambiar y no vale como comprobación de tipo"
example_tags: "javascript|python|prototipos|constructor|type"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
function Product(title, cents) {
  this.title = title;
  this.cents = cents;
}
const lamp = new Product('Lámpara de mesa', 2400);

// lamp no tiene constructor propio: lo hereda de Product.prototype.
console.log("¿propia? →", Object.hasOwn(lamp, 'constructor'));       // false
console.log('lamp.constructor === Product →', lamp.constructor === Product); // true
console.log('nombre →', lamp.constructor.name);                     // 'Product'

// Con los nativos pasa lo mismo:
console.log('[].constructor === Array →', [].constructor === Array);
console.log('({}).constructor === Object →', ({}).constructor === Object);

// Uso 1: crear OTRO objeto del mismo tipo sin saber cuál es.
function cloneWith(source, changes) {
  const copy = new source.constructor(); // Product, Booking, lo que sea
  return Object.assign(copy, source, changes);
}
const lampSale = cloneWith(lamp, { cents: 1990 });
console.log('lampSale →', lampSale); // Product {title: 'Lámpara de mesa', cents: 1990}
console.log('¿hereda de Product.prototype? →', Object.getPrototypeOf(lampSale) === Product.prototype); // true

// Uso 2: nombres en mensajes y registros.
console.log(`Guardado un ${lamp.constructor.name} con ${Object.keys(lamp).length} campos`);

// ⚠️ Pero es una propiedad normal (writable): se puede tapar o cambiar.
const fake = new Product('Imitación', 100);
fake.constructor = Date; // propia, sombrea a la heredada
console.log('fake.constructor.name →', fake.constructor.name); // 'Date'
console.log('fake instanceof Product →', fake instanceof Product); // true: instanceof no se deja engañar
// Para comprobar tipos, usa instanceof (ejemplo 09), no constructor.

// > Desde Python: lamp.constructor se parece a type(lamp) o lamp.__class__, y
//   lamp.constructor.name a type(lamp).__name__. Pero type() pregunta al
//   intérprete; constructor es solo una propiedad que cualquiera puede cambiar.
```
