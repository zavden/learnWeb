---
example_description: "El estrechamiento de una propiedad (if (order.coupon)) no llega dentro de un callback: TypeScript no sabe cuándo se ejecutará y la propiedad podría haber cambiado (TS18048). Copiar el valor a una const lo arregla"
example_tags: "typescript|estrechamiento|callbacks|closures|const|ts18048|bug"
example_stage: common-error
example_importance: important
console: true
---

# TypeScript

```typescript
type Order = { id: string; coupon?: string; items: string[] };

function labelItems(order: Order): string[] {
  if (order.coupon) {
    // Aquí order.coupon es string…
    console.log('cupón →', order.coupon.toUpperCase());
    // 🐛 …pero dentro del callback vuelve a ser string | undefined.
    //    TypeScript no sabe CUÁNDO se ejecutará la flecha, y para entonces
    //    alguien podría haber cambiado order.coupon.
    return order.items.map((item) => `${item} [${order.coupon.toUpperCase()}]`); // ❌ Error TS18048 a propósito
  }
  return order.items;
}
console.log(labelItems({ id: 'P-77', coupon: 'otono26', items: ['Tlayuda', 'Mezcal'] }));

// ✅ Copia el valor estrechado a una const: una const no puede cambiar, así
//    que el estrechamiento sí llega a los callbacks.
function labelItemsFixed(order: Order): string[] {
  const coupon = order.coupon;
  if (coupon) {
    return order.items.map((item) => `${item} [${coupon.toUpperCase()}]`);
  }
  return order.items;
}
console.log(labelItemsFixed({ id: 'P-78', coupon: 'otono26', items: ['Tasajo'] }));
```
