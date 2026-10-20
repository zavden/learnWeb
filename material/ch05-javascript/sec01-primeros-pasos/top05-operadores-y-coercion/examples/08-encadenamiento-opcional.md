---
example_description: "?. evita el TypeError al leer propiedades de null o undefined, también con [] y con llamadas"
example_tags: "javascript|operadores|optional-chaining|typeerror"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
const order = {
  id: 17,
  customer: { name: 'Ada', address: null },
  items: ['café'],
};

// Sin ?. — leer una propiedad de undefined (o de null) lanza TypeError.
try {
  console.log(order.shipping.date);
} catch (error) {
  console.log('order.shipping.date →', error.name, '|', error.message);
}

// ✅ ?. corta la cadena y devuelve undefined si lo de su izquierda es null o undefined.
console.log('order.shipping?.date →', order.shipping?.date);                 // undefined
console.log('order.customer.address?.city →', order.customer.address?.city); // undefined
console.log('order.customer?.name →', order.customer?.name);                 // 'Ada'

// También con corchetes y con llamadas:
console.log('order.items?.[0] →', order.items?.[0]);   // 'café'
console.log('order.notify?.() →', order.notify?.());   // undefined: no existe, no se llama

// Junto con ?? da un valor por defecto:
const city = order.customer.address?.city ?? 'sin dirección';
console.log('city →', city);

// ⚠️ Úsalo donde un valor PUEDE faltar, no en todas partes: si algo que debería
// existir falta, es mejor que falle cerca del origen del problema.
```
