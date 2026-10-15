---
example_description: "Alternativas a enum que no generan código especial: una unión de literales (solo tipos) y un objeto as const del que se deriva la unión (existe en ejecución para iterar); los textos sueltos encajan porque son estructurales"
example_tags: "typescript|enum|tipos-literales|as-const|uniones|keyof"
example_stage: minimal
example_importance: important
console: true
---

# TypeScript

```typescript
// Alternativa 1: una unión de literales. Cero código en ejecución.
type Currency = 'MXN' | 'USD' | 'EUR';

function formatPrice(amount: number, currency: Currency): string {
  return `${amount.toFixed(2)} ${currency}`;
}
console.log(formatPrice(250, 'MXN')); // ✅ el texto vale directamente

// Alternativa 2: un objeto as const, si además necesitas los valores en
// ejecución (para recorrerlos, llenar un <select>…).
const ORDER_STATUS = {
  Pending: 'pending',
  Paid: 'paid',
  Shipped: 'shipped',
} as const;

// La unión de sus valores: 'pending' | 'paid' | 'shipped'.
// (keyof y typeof en un tipo son operadores de tipo: módulo 2.)
type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

function statusLabel(status: OrderStatus): string {
  return status === ORDER_STATUS.Paid ? 'pagado ✅' : `estado: ${status}`;
}

console.log(statusLabel(ORDER_STATUS.Paid)); // con el nombre, como un enum…
console.log(statusLabel('shipped')); // …o con el texto, que también encaja
console.log('todos →', Object.values(ORDER_STATUS)); // sin mapeo inverso ni sorpresas
```
