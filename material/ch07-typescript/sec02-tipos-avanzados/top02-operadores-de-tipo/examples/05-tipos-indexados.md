---
example_description: "Tipos indexados: Order['status'] es el tipo de esa propiedad, se pueden encadenar (Order['customer']['address']), aceptan uniones de claves y Order['items'][number] es el tipo de los elementos de un array"
example_tags: "typescript|tipos-indexados|operadores-de-tipo|arrays"
example_stage: minimal
example_importance: important
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

type Order = {
  id: string;
  customer: { fullName: string; address: { city: string; zip: string } };
  items: { sku: string; qty: number; price: number }[];
  status: 'pending' | 'paid' | 'shipped';
};

// T['clave'] es el tipo de esa propiedad: como leer un valor, pero con tipos.
type OrderStatus = Order['status']; // → 'pending' | 'paid' | 'shipped'
type Address = Order['customer']['address']; // → { city: string; zip: string }
// T[number] es el tipo de los elementos de un array (de cualquier posición).
type OrderItem = Order['items'][number]; // → { sku: string; qty: number; price: number }
// Con una unión de claves, la unión de sus tipos.
type SkuOrQty = OrderItem['sku' | 'qty']; // → string | number

type Checks = [
  Expect<Equal<OrderStatus, 'pending' | 'paid' | 'shipped'>>,
  Expect<Equal<Address, { city: string; zip: string }>>,
  Expect<Equal<OrderItem, { sku: string; qty: number; price: number }>>,
  Expect<Equal<SkuOrQty, string | number>>,
];

// Funciones que trabajan con una parte del pedido, sin copiar su tipo:
const lineTotal = (item: OrderItem): number => item.qty * item.price;
const shippingLabel = (address: Address): string => `${address.city}, CP ${address.zip}`;
const isOpen = (status: OrderStatus): boolean => status !== 'shipped';

const order: Order = {
  id: 'P-3001',
  customer: { fullName: 'Lucía Méndez', address: { city: 'Oaxaca', zip: '68000' } },
  items: [
    { sku: 'MOL-01', qty: 2, price: 165 },
    { sku: 'CHO-03', qty: 3, price: 95 },
  ],
  status: 'paid',
};

console.log('total →', order.items.map(lineTotal).reduce((sum, value) => sum + value, 0));
console.log('envío →', shippingLabel(order.customer.address));
console.log('¿abierto? →', isOpen(order.status));
```
