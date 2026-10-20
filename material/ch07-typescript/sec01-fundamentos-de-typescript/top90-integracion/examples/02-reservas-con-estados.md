---
example_description: "Reservas de un hostal: las fechas como tupla readonly con nombres, el estado como unión discriminada (pendiente, confirmada, cancelada) y transiciones que devuelven una reserva nueva o lanzan un error si no están permitidas"
example_tags: "typescript|integracion|tuplas|readonly|uniones-discriminadas|never|inmutabilidad"
example_stage: intermediate
example_importance: important
console: true
---

# TypeScript

```typescript
// Fechas ISO 'AAAA-MM-DD': se comparan bien como texto (lección 2: tuplas).
type Stay = readonly [checkIn: string, checkOut: string];

// Cada estado con sus datos: una confirmada tiene habitación; una cancelada, motivo.
type BookingState =
  | { kind: 'pending'; holdUntil: string }
  | { kind: 'confirmed'; room: number }
  | { kind: 'cancelled'; reason: string };

type Booking = {
  readonly id: string;
  readonly guest: string;
  readonly stay: Stay;
  readonly state: BookingState;
};

function assertNever(value: never): never {
  throw new Error(`Estado no previsto: ${JSON.stringify(value)}`);
}

function nights([checkIn, checkOut]: Stay): number {
  return (Date.parse(`${checkOut}T00:00:00Z`) - Date.parse(`${checkIn}T00:00:00Z`)) / 86_400_000;
}

function overlaps(a: Stay, b: Stay): boolean {
  return a[0] < b[1] && b[0] < a[1];
}

// Las transiciones no cambian la reserva: devuelven otra (todo es readonly).
function confirmBooking(booking: Booking, room: number): Booking {
  if (booking.state.kind !== 'pending') {
    throw new Error(`${booking.id}: solo se confirma una reserva pendiente (está «${booking.state.kind}»)`);
  }
  return { ...booking, state: { kind: 'confirmed', room } };
}

function cancelBooking(booking: Booking, reason: string): Booking {
  if (booking.state.kind === 'cancelled') throw new Error(`${booking.id}: ya estaba cancelada`);
  return { ...booking, state: { kind: 'cancelled', reason } };
}

function describe(booking: Booking): string {
  const [checkIn, checkOut] = booking.stay;
  const head = `${booking.id} ${booking.guest} (${checkIn} → ${checkOut}, ${nights(booking.stay)} noches)`;
  const state = booking.state;
  switch (state.kind) {
    case 'pending':
      return `⏳ ${head}: pendiente hasta ${state.holdUntil}`;
    case 'confirmed':
      return `✅ ${head}: habitación ${state.room}`;
    case 'cancelled':
      return `✖️ ${head}: cancelada (${state.reason})`;
    default:
      return assertNever(state);
  }
}

const lucia: Booking = { id: 'R-301', guest: 'Lucía Méndez', stay: ['2026-12-20', '2026-12-23'], state: { kind: 'pending', holdUntil: '2026-11-30' } };
const diego: Booking = { id: 'R-302', guest: 'Diego Ríos', stay: ['2026-12-22', '2026-12-26'], state: { kind: 'pending', holdUntil: '2026-12-01' } };

console.log(describe(lucia));
console.log('¿se solapan? →', overlaps(lucia.stay, diego.stay));

const luciaConfirmed = confirmBooking(lucia, 4);
const diegoCancelled = cancelBooking(diego, 'cambio de planes');
console.log(describe(luciaConfirmed));
console.log(describe(diegoCancelled));
console.log('¿la original sigue pendiente? →', lucia.state.kind);

for (const attempt of [() => confirmBooking(diegoCancelled, 5), () => cancelBooking(diegoCancelled, 'otra vez')]) {
  try {
    attempt();
  } catch (error) {
    console.log('⛔', error instanceof Error ? error.message : String(error));
  }
}
```
