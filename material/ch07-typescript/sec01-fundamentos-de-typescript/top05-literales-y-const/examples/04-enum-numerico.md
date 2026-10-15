---
example_description: "Un enum numérico genera un objeto real con mapeo inverso (OrderStatus[1] es 'Paid'); un literal fuera del enum es TS2322 desde TypeScript 5.0, pero un number cualquiera se acepta sin error y produce un estado sin nombre"
example_tags: "typescript|enum|mapeo-inverso|codigo-generado|ts2322|bug"
example_stage: common-error
example_importance: important
console: true
---

# TypeScript

```typescript
// Un enum numérico: los miembros valen 0, 1, 2, 3 (como enum.IntEnum en Python).
enum OrderStatus {
  Pending,
  Paid,
  Shipped,
  Delivered,
}

const paid = OrderStatus.Paid;
console.log('OrderStatus.Paid →', paid);
// A diferencia de los type, un enum EXISTE en ejecución: es un objeto.
console.log('OrderStatus →', OrderStatus);
// Mapeo inverso: del número al nombre.
console.log('OrderStatus[1] →', OrderStatus[1]);
console.log('claves →', Object.keys(OrderStatus).length); // 8, no 4: nombres Y números

let current: OrderStatus = OrderStatus.Shipped;
current = 7; // ❌ Error TS2322 a propósito: 7 no es ningún miembro del enum

// 🐛 Pero un number cualquiera (que no es un literal) se acepta sin error:
const fromApi: number = 9;
current = fromApi;
console.log('🐛 current →', current, '| nombre →', OrderStatus[current]);
```
