---
example_description: "Un método de clase pasado como callback pierde this, que en el cuerpo estricto de la clase es undefined; soluciones: flecha al llamar, bind o un campo con una flecha (con su coste)"
example_tags: "javascript|python|clases|this|callbacks|bind|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
class Counter {
  count = 0;
  increment() {
    this.count += 1;
    return this.count;
  }
}

const clicks = new Counter();
clicks.increment(); // ✅ this = clicks

// 🐛 Pasar el método como valor lo separa del objeto. El cuerpo de la clase es
// estricto, así que en la llamada simple this es undefined (no window).
const handler = clicks.increment;
try {
  handler();
} catch (error) {
  console.log('🐛 método separado →', error.name, '|', error.message);
}
try {
  ['a', 'b'].forEach(clicks.increment);
} catch (error) {
  console.log('🐛 como callback →', error.name, '|', error.message);
}

// ✅ Solución 1: una flecha que llama al método con su punto.
['a', 'b'].forEach(() => clicks.increment());
// ✅ Solución 2: bind fija this.
const bound = clicks.increment.bind(clicks);
bound();
console.log('✅ clicks.count →', clicks.count); // 4

// ✅ Solución 3: un CAMPO con una flecha. El inicializador se ejecuta con
// this = la instancia, y la flecha lo captura para siempre.
class LikeCounter {
  count = 0;
  increment = () => {
    this.count += 1;
    return this.count;
  };
}
const likes = new LikeCounter();
const likeHandler = likes.increment;
likeHandler();
['a', 'b'].forEach(likes.increment);
console.log('✅ likes.count →', likes.count); // 3

// Su precio: increment ya no está en el prototype, sino en CADA objeto.
console.log('likes →', likes); // LikeCounter {count: 3, increment: ƒ}
console.log('¿increment compartido? →', likes.increment === new LikeCounter().increment); // false

// (En el capítulo 6 pasarás métodos a addEventListener: es el mismo problema.)
// > Desde Python: clicks.increment sería un «bound method» que recuerda su self.
```
