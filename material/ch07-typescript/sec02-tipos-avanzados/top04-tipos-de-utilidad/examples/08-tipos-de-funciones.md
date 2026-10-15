---
example_description: "Utilidades para funciones y clases: ReturnType (lo que devuelve, aquí una promesa), Awaited (lo que da la promesa), Parameters (los parámetros como tupla con nombres) e InstanceType (lo que crea una clase); una versión con registro acepta exactamente los mismos argumentos"
example_tags: "typescript|tipos-de-utilidad|returntype|parameters|awaited|instancetype|async"
example_stage: minimal
example_importance: important
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

let lastId = 40;
// Una función de una biblioteca de reservas: su tipo de retorno no tiene nombre.
async function createBooking(guest: string, nights: number, options: { breakfast?: boolean } = {}) {
  const nightly = options.breakfast ? 1450 : 1200;
  return { id: `R-${++lastId}`, guest, nights, total: nights * nightly };
}

type CreateResult = ReturnType<typeof createBooking>; // → Promise<{ id: string; … }>
type Booking = Awaited<CreateResult>; // → { id: string; guest: string; nights: number; total: number }
type CreateArgs = Parameters<typeof createBooking>; // → [guest: string, nights: number, options?: …]
type BookingOptions = CreateArgs[2]; // → { breakfast?: boolean } | undefined

type Checks = [
  Expect<Equal<Booking, { id: string; guest: string; nights: number; total: number }>>,
  Expect<Equal<CreateArgs, [guest: string, nights: number, options?: { breakfast?: boolean }]>>,
  Expect<Equal<BookingOptions, { breakfast?: boolean } | undefined>>,
];

// Una versión con registro que acepta EXACTAMENTE los mismos argumentos, sin copiar la firma:
async function createBookingLogged(...args: CreateArgs): Promise<Booking> {
  console.log('📝 reserva para', args[0], '·', args[1], 'noches');
  return createBooking(...args);
}

// InstanceType<C>: el tipo de lo que crea una clase con new.
class BookingBook {
  readonly entries: Booking[] = [];
}
type Book = InstanceType<typeof BookingBook>; // → BookingBook
const book: Book = new BookingBook();

book.entries.push(await createBookingLogged('Lucía Méndez', 2));
book.entries.push(await createBookingLogged('Iván Soto', 3, { breakfast: true }));
for (const entry of book.entries) console.log(`${entry.id} ${entry.guest} → $${entry.total}`);
```
