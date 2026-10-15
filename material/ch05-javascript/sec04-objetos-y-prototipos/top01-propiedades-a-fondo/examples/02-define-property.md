---
example_description: "Object.defineProperty crea una propiedad eligiendo sus atributos; lo que no indicas vale false (solo lectura, invisible y fija)"
example_tags: "javascript|objetos|propiedades|defineproperty|descriptores"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// Object.defineProperty(obj, clave, descriptor) crea o modifica UNA propiedad
// eligiendo sus atributos. ⚠️ Al crearla, lo que no indiques vale false.
const order = { customer: 'Marta Ruiz' };

Object.defineProperty(order, 'id', { value: 'PED-0042' });
console.log('descriptor de id →', Object.getOwnPropertyDescriptor(order, 'id'));
// {value: 'PED-0042', writable: false, enumerable: false, configurable: false}

// La propiedad existe y se lee, pero no aparece al recorrer el objeto:
console.log('order.id →', order.id);
console.log('Object.keys(order) →', Object.keys(order)); // ['customer']
console.log('order →', order); // la vista previa solo muestra lo enumerable
// En la consola, expande order: id aparece en gris (no enumerable).

// Para una propiedad «normal», como las de un literal, hay que pedirlo todo:
Object.defineProperty(order, 'status', {
  value: 'pendiente',
  writable: true,
  enumerable: true,
  configurable: true,
});
console.log('con status →', order);

// Object.defineProperties define varias de golpe.
Object.defineProperties(order, {
  currency: { value: 'EUR', enumerable: true },        // visible, pero fija
  createdAt: { value: '2026-10-12T09:30:00Z' },        // invisible y fija
});
console.log('Object.keys(order) →', Object.keys(order)); // ['customer', 'status', 'currency']
console.log('order.createdAt →', order.createdAt);

// Sobre una propiedad que YA existe, defineProperty solo cambia lo que indicas:
Object.defineProperty(order, 'customer', { writable: false });
console.log('customer →', Object.getOwnPropertyDescriptor(order, 'customer'));
// {value: 'Marta Ruiz', writable: false, enumerable: true, configurable: true}
```
