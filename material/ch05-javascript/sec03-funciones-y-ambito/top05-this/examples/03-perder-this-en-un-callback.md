---
example_description: "Al sacar un método del objeto (variable, callback, setTimeout) se convierte en una llamada simple y pierde su this; se arregla con una flecha o con bind"
example_tags: "javascript|python|this|callbacks|bind|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
const cart = {
  items: [],
  add(product) {
    this.items.push(product);
    console.log(`  añadido ${product} (en el carrito: ${this.items.length})`);
  },
};
cart.add('Taza'); // ✅ llamada como método: this es cart

// 🐛 1. Guardar el método en una variable: al llamarlo, no hay nada a la
// izquierda del punto → llamada simple → this es window, y window.items no existe.
const add = cart.add;
try {
  add('Plato');
} catch (error) {
  console.log('🐛 add suelto →', error.name, '|', error.message);
}

// 🐛 2. Pasarlo como callback: forEach lo llama como función simple.
try {
  ['Vaso', 'Jarra'].forEach(cart.add);
} catch (error) {
  console.log('🐛 forEach(cart.add) →', error.name, '|', error.message);
}

// 🐛 3. Con un temporizador el fallo puede ser SILENCIOSO: no hay error,
// solo un undefined donde esperabas un nombre. (setTimeout: módulo «Asincronía y event loop».)
const user = {
  firstName: 'Lucía',
  greet() {
    console.log(`Hola, ${this.firstName}`);
  },
};
setTimeout(user.greet, 100); // 🐛 'Hola, undefined' (window.firstName no existe)

// ✅ Solución 1: una flecha que llama al método CON su punto.
['Vaso', 'Jarra'].forEach((product) => cart.add(product));
setTimeout(() => user.greet(), 200); // 'Hola, Lucía'

// ✅ Solución 2: bind crea una copia de la función con this fijado.
setTimeout(user.greet.bind(user), 300); // 'Hola, Lucía'

// > Desde Python: f = obj.method crea un «bound method» que recuerda su self,
//   así que f() funciona. En JavaScript, cart.add es la función a secas:
//   el objeto se olvida en cuanto la separas del punto.
```
