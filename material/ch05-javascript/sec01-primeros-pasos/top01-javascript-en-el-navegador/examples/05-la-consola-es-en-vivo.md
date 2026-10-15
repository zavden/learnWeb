---
example_description: "Al expandir un objeto la consola muestra su estado actual, no el del momento del log"
example_tags: "javascript|consola|referencias|depuracion"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// 🐛 La consola guarda una REFERENCIA al objeto, no una copia.
// La línea resumida se escribe en el momento del log, pero al expandir (▶)
// las propiedades se leen AHORA, después de todos los cambios.
const cart = { items: 1, total: 10 };
console.log('cart justo después de crearlo →', cart);

cart.items = 3;
cart.total = 30;
// Expande el log de arriba: el resumen dice items: 1, pero dentro verás items: 3.

// ✅ Si necesitas una «foto» del momento, conviértelo en texto al imprimir.
// JSON.stringify devuelve un string con el contenido actual
// (lo verás en «JSON y copias»).
const order = { status: 'pendiente' };
console.log('foto 1 →', JSON.stringify(order)); // {"status":"pendiente"}

order.status = 'enviado';
console.log('foto 2 →', JSON.stringify(order)); // {"status":"enviado"}
```
