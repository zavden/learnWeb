---
example_description: "Una función de aserción (asserts value is T, asserts condition) lanza un error si la comprobación falla y, si vuelve, estrecha el tipo en el resto del bloque, sin if; como assert isinstance de Python con mypy"
example_tags: "typescript|python|funciones-de-asercion|asserts|estrechamiento|errores"
example_stage: minimal
example_importance: important
console: true
---

# TypeScript

```typescript
// «asserts value is NonNullable<T>»: si la función vuelve, value no es null ni undefined.
function assertDefined<T>(value: T, what: string): asserts value is NonNullable<T> {
  if (value === null || value === undefined) throw new Error(`Falta ${what}`);
}
// «asserts condition»: si vuelve, la condición era verdadera (y estrecha lo que diga).
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

type Booking = { guest: string; nights: number; coupon: string | null };

function confirmBooking(booking: Booking): string {
  assert(booking.nights > 0, 'Una reserva necesita al menos una noche');
  assertDefined(booking.coupon, 'el cupón');
  // Desde aquí, booking.coupon es string: sin if, sin !, sin as.
  return `✅ ${booking.guest}: ${booking.nights} noches, cupón ${booking.coupon.toUpperCase()}`;
}

const bookings: Booking[] = [
  { guest: 'Lucía Méndez', nights: 2, coupon: 'otono26' },
  { guest: 'Iván Soto', nights: 3, coupon: null },
  { guest: 'Ana Ruiz', nights: 0, coupon: 'otono26' },
];

for (const booking of bookings) {
  try {
    console.log(confirmBooking(booking));
  } catch (error) {
    console.log('⚠️', booking.guest, '→', error instanceof Error ? error.message : String(error));
  }
}
```
