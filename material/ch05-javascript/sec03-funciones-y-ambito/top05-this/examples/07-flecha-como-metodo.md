---
example_description: "Una flecha usada como método no recibe el objeto como this: usa el de fuera (window) y acaba creando una variable global con NaN"
example_tags: "javascript|this|flecha|metodos|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
const likes = {
  count: 0,
  // 🐛 Una FLECHA como método: su this NO es likes. Es el this del sitio donde
  // está escrito el objeto literal: el nivel superior del script → window.
  // (Las llaves de un objeto literal no crean ningún ámbito ni ningún this.)
  increment: () => {
    this.count += 1; // window.count = undefined + 1 → NaN
    return this.count;
  },
};

console.log('🐛 likes.increment() →', likes.increment()); // NaN
console.log('🐛 likes.count →', likes.count);             // 0: no se ha tocado
console.log('🐛 window.count →', window.count);           // NaN: ¡una global nueva!

// En un módulo (modo estricto, this del nivel superior = undefined), la misma
// línea lanzaría «Cannot read properties of undefined».

// ✅ Para métodos, usa la sintaxis de método (o function): this será el objeto
// que esté a la izquierda del punto.
const likesFixed = {
  count: 0,
  increment() {
    this.count += 1;
    return this.count;
  },
};
likesFixed.increment();
console.log('✅ likesFixed.increment() →', likesFixed.increment()); // 2

// Resumen de la lección en dos líneas:
//   método  → nombre() { … }   (this = el objeto)
//   callback dentro de un método → flecha   (this = el del método)
```
