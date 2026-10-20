---
example_description: "Llamar a una función constructora sin new: en modo no estricto escribe en window y devuelve undefined; en modo estricto lanza TypeError al instante"
example_tags: "javascript|this|new|modo-estricto|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
function Product(title, cents) {
  this.title = title;
  this.cents = cents;
}

// 🐛 Sin new es una LLAMADA SIMPLE. En modo no estricto, this es window:
// la función escribe sus propiedades en el objeto global y no devuelve nada.
const lamp = Product('Lámpara de mesa', 2400);
console.log('🐛 lamp →', lamp);                   // undefined
console.log('🐛 window.title →', window.title);   // 'Lámpara de mesa': una global
console.log('🐛 window.cents →', window.cents);   // 2400
// El error aparecerá mucho después, al usar lamp.title («Cannot read properties
// of undefined»), lejos de la línea que lo causó.

// ✅ El modo estricto convierte el descuido en un error inmediato:
// this es undefined, y asignarle una propiedad lanza TypeError en esta línea.
function StrictProduct(title, cents) {
  'use strict';
  this.title = title;
  this.cents = cents;
}
try {
  StrictProduct('Taza', 850);
} catch (error) {
  console.log('✅ estricto →', error.name, '|', error.message);
}
console.log('✅ con new →', new StrictProduct('Taza', 850));

// Por eso el modo estricto es una buena idea: los errores salen donde nacen.
// Está activado siempre en módulos y clases; y las clases (módulo «Clases y POO»)
// van más allá: llamarlas sin new lanza un error explícito.
```
