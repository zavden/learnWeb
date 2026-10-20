---
example_description: "Los valores se escriben una vez y los tipos salen de ellos: (typeof SIZES)[number] da la unión de un array as const, keyof typeof SHIPPING las claves de un objeto y (typeof X)[keyof typeof X] sus valores"
example_tags: "typescript|typeof|keyof|tipos-indexados|as-const|uniones"
example_stage: minimal
example_importance: critical
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

// Un array as const: existe en ejecución (para recorrerlo) y da un tipo.
const SIZES = ['S', 'M', 'L', 'XL'] as const;
type Size = (typeof SIZES)[number]; // → 'S' | 'M' | 'L' | 'XL'
// typeof SIZES → readonly ['S', 'M', 'L', 'XL']; [number] → el tipo de cualquier elemento.

// Un objeto as const: sus claves con keyof typeof, sus valores con [keyof typeof …].
const SHIPPING = { local: 69, national: 189, pickup: 0 } as const;
type Zone = keyof typeof SHIPPING; // → 'local' | 'national' | 'pickup'
type ShippingCost = (typeof SHIPPING)[Zone]; // → 69 | 189 | 0

const ORDER_STATUS = { Pending: 'pending', Paid: 'paid', Shipped: 'shipped' } as const;
type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]; // → 'pending' | 'paid' | 'shipped'

type Checks = [
  Expect<Equal<Size, 'S' | 'M' | 'L' | 'XL'>>,
  Expect<Equal<Zone, 'local' | 'national' | 'pickup'>>,
  Expect<Equal<ShippingCost, 69 | 189 | 0>>,
  Expect<Equal<OrderStatus, 'pending' | 'paid' | 'shipped'>>,
];

function shirtLabel(size: Size, zone: Zone): string {
  return `Playera ${size} · envío ${zone}: $${SHIPPING[zone]}`;
}

for (const size of SIZES.slice(1, 3)) console.log(shirtLabel(size, 'national'));
console.log('estados →', Object.values(ORDER_STATUS));
// Añade 'XXL' a SIZES y Size cambia solo: la lista se escribe UNA vez.
```
