---
example_description: "never desaparece de las uniones (string | never es string), y por eso un tipo condicional que devuelve never para algunos miembros FILTRA la unión: así funcionan Exclude y Extract. Detalle: sobre never el condicional da never"
example_tags: "typescript|never|uniones|tipos-condicionales|distributividad|exclude"
example_stage: minimal
example_importance: important
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

// never es la unión vacía: añadirla no cambia nada.
type Checks1 = [Expect<Equal<'paid' | never, 'paid'>>];

type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled';

// Reparto (ejemplo anterior) + never = un filtro de uniones:
// cada miembro que cumple la condición se convierte en never… y desaparece.
type Without<T, U> = T extends U ? never : T;
type OnlyThese<T, U> = T extends U ? T : never;

type ActiveStatus = Without<OrderStatus, 'cancelled'>; // → 'pending' | 'paid' | 'shipped'
type ClosedStatus = OnlyThese<OrderStatus, 'shipped' | 'cancelled'>; // → 'shipped' | 'cancelled'

type Checks2 = [
  Expect<Equal<ActiveStatus, 'pending' | 'paid' | 'shipped'>>,
  Expect<Equal<ClosedStatus, 'shipped' | 'cancelled'>>,
  // Detalle: never es una unión de CERO miembros, así que el reparto no produce nada.
  Expect<Equal<Without<never, 'cancelled'>, never>>,
];

// Without y OnlyThese existen ya en TypeScript: se llaman Exclude y Extract (lección 4).
const ORDER_STATUSES: OrderStatus[] = ['pending', 'paid', 'shipped', 'cancelled'];
const active = ORDER_STATUSES.filter((status): status is ActiveStatus => status !== 'cancelled');
// (status is ActiveStatus: un predicado de tipo, lección 6)

function nextStep(status: ActiveStatus): string {
  return status === 'pending' ? 'cobrar' : status === 'paid' ? 'enviar' : 'esperar la entrega';
}
for (const status of active) console.log(`${status} → ${nextStep(status)}`);
```
