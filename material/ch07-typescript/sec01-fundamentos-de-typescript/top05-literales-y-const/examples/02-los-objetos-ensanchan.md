---
example_description: "Las propiedades de un objeto const se infieren ensanchadas (status: string, no 'paid'), porque const protege la variable, no sus propiedades: pasar order.status a una función que pide una unión de literales es TS2345. Se arregla anotando el objeto"
example_tags: "typescript|tipos-literales|ensanchamiento|const|objetos|ts2345|bug"
example_stage: common-error
example_importance: important
console: true
---

# TypeScript

```typescript
type OrderStatus = 'pending' | 'paid' | 'shipped';

function canShip(status: OrderStatus): boolean {
  return status === 'paid';
}

// 🐛 const protege la VARIABLE order, no sus propiedades: order.status puede
//    cambiar después, así que TypeScript lo ensancha a string (como un let).
const order = { id: 'P-501', status: 'paid' }; // { id: string; status: string }
console.log('🐛', canShip(order.status)); // ❌ Error TS2345 a propósito: string no es OrderStatus

// La prueba de que es string: cambiarlo a cualquier texto no da error.
order.status = 'perdido en la paquetería';
console.log('order.status →', order.status);

// ✅ Anota el objeto: status es OrderStatus desde la declaración.
type Order = { id: string; status: OrderStatus };
const typedOrder: Order = { id: 'P-502', status: 'paid' };
console.log('✅', canShip(typedOrder.status));
// (as const, en el ejemplo siguiente, es la otra solución.)
```
