---
example_description: "in busca en toda la cadena; Object.hasOwn solo en el objeto. Y por qué obj.hasOwnProperty() puede fallar: datos con esa clave u objetos sin prototipo"
example_tags: "javascript|python|prototipos|hasown|in|hasownproperty|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
const baseProduct = { currency: 'EUR' };
const mug = Object.create(baseProduct);
mug.title = 'Taza de cerámica';
mug.discount = undefined; // propia, aunque valga undefined

// in → ¿se encuentra la clave en la cadena?  hasOwn → ¿es propia del objeto?
// (obj.key !== undefined no sirve: falla con las que valen undefined.)
const check = (key) => ({
  in: key in mug,
  hasOwn: Object.hasOwn(mug, key),
  'mug[key] !== undefined': mug[key] !== undefined,
});
console.table({
  title: check('title'),       // propia
  discount: check('discount'), // propia con valor undefined
  currency: check('currency'), // heredada de baseProduct
  toString: check('toString'), // heredada de Object.prototype
  isbn: check('isbn'),         // no existe
});

// La forma antigua es el método heredado obj.hasOwnProperty(key). Funciona…
console.log("mug.hasOwnProperty('title') →", mug.hasOwnProperty('title')); // true

// …pero depende de que el objeto lo herede bien. 🐛 Dos casos en que falla:
const formData = { hasOwnProperty: 'sí', title: 'Encuesta' }; // datos de un formulario
try {
  formData.hasOwnProperty('title');
} catch (error) {
  console.log('🐛 clave que tapa el método →', error.name, '|', error.message);
}
const bare = Object.create(null); // un objeto SIN prototipo (lo verás en esta lección)
bare.title = 'Sin prototipo';
try {
  bare.hasOwnProperty('title');
} catch (error) {
  console.log('🐛 sin prototipo →', error.name, '|', error.message);
}

// ✅ Object.hasOwn (2022) es una función de Object, no un método heredado:
// funciona con cualquier objeto.
console.log('✅ Object.hasOwn(formData, …) →', Object.hasOwn(formData, 'title'));
console.log('✅ Object.hasOwn(bare, …) →', Object.hasOwn(bare, 'title'));

// > Desde Python: hasattr(obj, 'x') se parece a in (mira también la clase);
//   'x' in vars(obj) se parece a Object.hasOwn (solo la instancia).
```
