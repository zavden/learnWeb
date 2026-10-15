---
example_description: "Sombreado: una variable o un parámetro interior con el mismo nombre tapa al exterior dentro de su ámbito, sin modificarlo"
example_tags: "javascript|ambito|sombreado|shadowing"
example_stage: minimal
example_importance: important
console: true
---

# JavaScript

```javascript
// SOMBREADO (shadowing): una declaración interior con el MISMO nombre que una
// exterior la TAPA dentro de su ámbito. La exterior sigue existiendo, intacta.
const label = 'global';

function showLabels() {
  const label = 'función';         // tapa a la global dentro de showLabels
  if (label.length > 0) {
    const label = 'bloque';        // tapa a la de la función dentro del if
    console.log('en el bloque →', label);   // 'bloque'
  }
  console.log('en la función →', label);    // 'función'
}
showLabels();
console.log('fuera →', label);              // 'global'

// Los PARÁMETROS también sombrean: aquí price es el parámetro, no la constante.
const price = 100;
function applyDiscount(price) {
  return price * 0.9;
}
console.log('applyDiscount(50) →', applyDiscount(50)); // 45, no 90
console.log('price global →', price);                  // 100

// El sombreado no es un error, y a veces es útil (un parámetro con el nombre
// natural). Pero obliga a quien lee a preguntarse «¿qué price es este?».
// Muchos equipos lo limitan con un linter (la regla no-shadow de ESLint).

// Un caso habitual: sombrear una variable de fuera dentro de un callback.
const items = ['té', 'café'];
items.forEach((items) => {
  // items aquí es UN elemento ('té'), no el array: el nombre engaña.
  console.log('dentro del callback, items →', items);
});
// ✅ Mejor: singular para el elemento, plural para la colección.
items.forEach((item) => console.log('item →', item));
```
