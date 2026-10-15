---
example_description: "new.target vale la función llamada con new y undefined en una llamada normal: permite que una constructora detecte que la llamaron sin new"
example_tags: "javascript|prototipos|new|new-target|constructor"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// En la lección «La palabra clave this» viste el error de olvidar new: la
// constructora se ejecuta como llamada simple y escribe en window.
// Dentro de una función, new.target dice CÓMO la llamaron:
//   con new  → new.target es la función
//   sin new  → new.target es undefined
function whoCalls(label) {
  console.log(label, '→ new.target:', new.target === undefined ? 'undefined' : `ƒ ${new.target.name}`);
}
whoCalls('whoCalls()');         // undefined
new whoCalls('new whoCalls()'); // ƒ whoCalls

// Opción A: lanzar un error claro si falta new.
function Order(id, totalCents) {
  if (!new.target) {
    throw new TypeError('Order es una constructora: llámala con new Order(…)');
  }
  this.id = id;
  this.totalCents = totalCents;
}
try {
  Order('PED-0042', 3150);
} catch (error) {
  console.log('Order sin new →', error.name, '|', error.message);
}
console.log('new Order →', new Order('PED-0042', 3150));

// Opción B: arreglarlo en silencio, llamándose a sí misma con new.
function Tag(label) {
  if (!new.target) return new Tag(label);
  this.label = label.toLowerCase();
}
const tags = ['Oferta', 'Nuevo'].map((label) => Tag(label)); // sin new
console.log('tags →', tags); // [Tag, Tag]
console.log('¿Tag? →', tags[0] instanceof Tag); // true

// Las clases (módulo «Clases y POO») hacen la opción A por ti: llamar a una
// clase sin new lanza siempre «Class constructor … cannot be invoked without 'new'».
```
