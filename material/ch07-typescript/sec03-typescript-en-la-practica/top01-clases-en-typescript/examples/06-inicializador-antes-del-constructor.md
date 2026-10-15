---
example_description: "Un campo con valor inicial que lee una parameter property da TS2729 y NaN: con los campos de ES2022 (useDefineForClassFields), los inicializadores se ejecutan ANTES de que el constructor asigne los parámetros. Solución: calcularlo en el constructor o con un getter"
example_tags: "typescript|clases|parameter-properties|inicializacion|usedefineforclassfields|ts2729|bug"
example_stage: common-error
example_importance: important
console: true
---

# TypeScript

```typescript
class Booking {
  total = this.nights * this.nightlyRate; // ❌ Error TS2729 a propósito (las dos propiedades): aún no tienen valor

  constructor(readonly guest: string, readonly nights: number, readonly nightlyRate: number) {}
}

// En compiled.js se ve el orden real: primero los campos (guest; nights;
// nightlyRate; total = this.nights * this.nightlyRate), después el constructor
// con this.guest = guest… Cuando se calcula total, nights es undefined.
const stay = new Booking('Lucía Méndez', 3, 1450);
console.log('🐛 total →', stay.total, '| nights →', stay.nights);

// ✅ 1. Calcularlo en el constructor, cuando los parámetros ya están asignados.
class FixedBooking {
  readonly total: number;

  constructor(readonly guest: string, readonly nights: number, readonly nightlyRate: number) {
    this.total = nights * nightlyRate;
  }
}
console.log('✅ constructor →', new FixedBooking('Lucía Méndez', 3, 1450).total);

// ✅ 2. Un getter: se calcula al leerlo, y sigue al día si nights cambia.
class LiveBooking {
  constructor(readonly guest: string, public nights: number, readonly nightlyRate: number) {}

  get total(): number {
    return this.nights * this.nightlyRate;
  }
}
const live = new LiveBooking('Iván Soto', 2, 1450);
live.nights = 4;
console.log('✅ getter →', live.total);
```
