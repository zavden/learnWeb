---
example_description: "Un tipo condicional sobre un parámetro desnudo se reparte por cada miembro de una unión: ToArray<string | number> es string[] | number[], no (string | number)[], y un array mixto no encaja (TS2322). Con [T] extends [unknown] se desactiva"
example_tags: "typescript|tipos-condicionales|distributividad|uniones|ts2322|bug"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

// Parece «un array de T»…
type ToArray<T> = T extends unknown ? T[] : never;

// 🐛 …pero con una unión se aplica a CADA miembro por separado y une los resultados:
// ToArray<string | number> = ToArray<string> | ToArray<number> = string[] | number[]
type Codes = ToArray<string | number>;
type Checks1 = [Expect<Equal<Codes, string[] | number[]>>];

// Un array mixto (lo que querías) no encaja en ninguno de los dos:
const codes: Codes = ['MOL-01', 1043]; // ❌ Error TS2322 a propósito: string[] | number[] no admite mezclas
console.log('codes →', codes); // el código se ejecuta igual

// ✅ Envolver T en una tupla ([T]) desactiva el reparto: la unión se trata entera.
type ToArrayWhole<T> = [T] extends [unknown] ? T[] : never;
type MixedCodes = ToArrayWhole<string | number>; // → (string | number)[]
type Checks2 = [Expect<Equal<MixedCodes, (string | number)[]>>];
const mixed: MixedCodes = ['MOL-01', 1043]; // ✅
console.log('mixed →', mixed);

// El reparto también explica esto: con una unión, IsText da true | false, es decir, boolean.
type IsText<T> = T extends string ? true : false;
type Checks3 = [
  Expect<Equal<IsText<'MOL-01' | 1043>, boolean>>,
  Expect<Equal<IsText<string>, true>>,
];
console.log('tipos de los códigos →', mixed.map((code) => typeof code));
```
