---
example_description: "Utilidades para uniones: Exclude<T, U> quita miembros, Extract<T, U> se queda con los que encajan (un miembro de una unión discriminada) y NonNullable<T> quita null y undefined"
example_tags: "typescript|tipos-de-utilidad|exclude|extract|nonnullable|uniones-discriminadas"
example_stage: minimal
example_importance: important
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled';
type Payment =
  | { kind: 'card'; last4: string }
  | { kind: 'cash'; amountGiven: number }
  | { kind: 'transfer'; reference: string };

// Exclude<T, U>: los miembros de T que NO son asignables a U.
type OpenStatus = Exclude<OrderStatus, 'shipped' | 'cancelled'>; // → 'pending' | 'paid'
// Extract<T, U>: los que SÍ lo son. Con una unión discriminada, saca un miembro por su kind.
type CardPayment = Extract<Payment, { kind: 'card' }>; // → { kind: 'card'; last4: string }
type Electronic = Exclude<Payment, { kind: 'cash' }>; // → tarjeta | transferencia
// NonNullable<T>: sin null ni undefined.
type Coupon = NonNullable<string | null | undefined>; // → string

type Checks = [
  Expect<Equal<OpenStatus, 'pending' | 'paid'>>,
  Expect<Equal<CardPayment, { kind: 'card'; last4: string }>>,
  Expect<Equal<Electronic['kind'], 'card' | 'transfer'>>,
  Expect<Equal<Coupon, string>>,
];

function maskCard(payment: CardPayment): string {
  return `•••• ${payment.last4}`;
}
function canCancel(status: OrderStatus): status is OpenStatus {
  return status === 'pending' || status === 'paid'; // predicado de tipo: lección 6
}

const payments: Payment[] = [
  { kind: 'card', last4: '4821' },
  { kind: 'cash', amountGiven: 500 },
];
for (const payment of payments) {
  console.log(payment.kind === 'card' ? maskCard(payment) : `pago: ${payment.kind}`);
}
const statuses: OrderStatus[] = ['pending', 'shipped', 'paid'];
console.log('se pueden cancelar →', statuses.filter(canCancel));
```
