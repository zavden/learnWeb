---
example_description: "Usar una clase antes de su línea lanza ReferenceError (zona muerta temporal), al contrario que una declaración function; también con extends y con typeof"
example_tags: "javascript|python|clases|hoisting|tdz|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Las declaraciones function se elevan enteras: se pueden llamar antes de su línea.
console.log('función antes de su línea →', formatPrice(2400)); // ✅

// 🐛 Las class se elevan como let y const: el nombre existe desde el principio
// del bloque, pero SIN inicializar (zona muerta temporal, TDZ).
try {
  const draft = new Invoice('F-2026-001');
  console.log(draft);
} catch (error) {
  console.log('🐛 new antes de la clase →', error.name, '|', error.message);
}

// 🐛 En la TDZ ni siquiera typeof es seguro (con un nombre inexistente, sí).
try {
  console.log(typeof Invoice);
} catch (error) {
  console.log('🐛 typeof en la TDZ →', error.name, '|', error.message);
}
console.log('typeof de un nombre que no existe →', typeof NotDeclaredAnywhere);

// 🐛 Lo mismo con extends: el padre tiene que estar definido ANTES que el hijo.
try {
  class CreditNote extends Receipt {}
} catch (error) {
  console.log('🐛 extends antes del padre →', error.name, '|', error.message);
}

function formatPrice(cents) {
  return `${(cents / 100).toFixed(2)} €`;
}

// ✅ Una función que USA la clase sí puede escribirse antes: lo que cuenta es
// cuándo se EJECUTA, y aquí se llama después de que la clase exista.
function createInvoice(number) {
  return new Invoice(number);
}

class Invoice {
  constructor(number) {
    this.number = number;
    this.lines = [];
  }
}
class Receipt {}

console.log('✅ después de la clase →', createInvoice('F-2026-002'));

// ✅ La regla práctica: declara las clases arriba (los padres antes que los
// hijos) y el código que las usa, debajo.
// > Desde Python: allí pasa lo mismo con clases Y funciones (NameError antes de
//   su línea). La sorpresa en JavaScript es que las funciones sí se elevan.
```
