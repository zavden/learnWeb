---
example_description: "Record<K, V> es un objeto con claves K y valores V: con una unión de claves (Record<Size, number>) exige TODAS, así que olvidar la talla L es TS2741, y se puede recorrer con la seguridad de que no falta ninguna"
example_tags: "typescript|python|tipos-de-utilidad|record|uniones|ts2741"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

const SIZES = ['S', 'M', 'L'] as const;
type Size = (typeof SIZES)[number];

// Record<K, V>: un objeto cuyas claves son K y cuyos valores son V.
type SizePrices = Record<Size, number>;
type Checks = [Expect<Equal<SizePrices, { S: number; M: number; L: number }>>];

// Con una unión de claves, TODAS son obligatorias: es un tipo mapeado (lección 3).
const prices: SizePrices = { S: 199, M: 219, L: 239 };
const draftPrices: SizePrices = { S: 199, M: 219 }; // ❌ Error TS2741 a propósito: falta la talla L

// Recorrer la lista y leer el Record es seguro: cada talla tiene precio.
for (const size of SIZES) console.log(`playera ${size} → $${prices[size]}`);
console.log('🐛 borrador L →', draftPrices.L); // el error avisaba de este undefined

// También con valores más complejos: el horario de un museo, día por día.
type Day = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';
const hours: Record<Day, string | null> = {
  mon: null, // cerrado
  tue: '10–18', wed: '10–18', thu: '10–18', fri: '10–20', sat: '10–20', sun: '10–17',
};
console.log('lunes →', hours.mon ?? 'cerrado', '| viernes →', hours.fri);
```
