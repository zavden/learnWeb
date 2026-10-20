---
example_description: "Cómo ver los tipos que calcula TypeScript sin pasar el ratón por encima: Expect<Equal<A, B>> solo compila si A y B son exactamente el mismo tipo; una comprobación que falla da TS2344 en su línea"
example_tags: "typescript|tipos|comprobaciones-de-tipos|equal|expect|ts2344"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
// Herramienta de comprobación (cópiala tal cual; cómo funciona: lección 3).
// Expect<…> solo acepta true; Equal<A, B> es true si A y B son EXACTAMENTE el mismo tipo.
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

type Result<T> = { ok: true; value: T } | { ok: false; error: string };
type Size = 'S' | 'M' | 'L';

// Una lista de comprobaciones: si todas son ciertas, no hay ni un rojo.
type Checks = [
  Expect<Equal<Array<string>, string[]>>, // lección 1: el mismo tipo ✅
  Expect<Equal<Size, 'L' | 'M' | 'S'>>, // el orden de una unión no importa ✅
  Expect<Equal<Result<number>, { ok: true; value: number } | { ok: false; error: string }>>, // ✅
];

// Dos comprobaciones que fallan, para ver cómo es el error:
type ReadonlyCheck = Expect<Equal<string[], readonly string[]>>; // ❌ Error TS2344 a propósito: no son iguales
type SizeCheck = Expect<Equal<Size, string>>; // ❌ Error TS2344 a propósito: 'S' cabe en string, pero no es string

// Los tipos no imprimen nada: la consola enseña los VALORES que describen.
const sizes: Size[] = ['S', 'M'];
const parsed: Result<number> = { ok: true, value: 3 };
console.log('tallas →', sizes, '| resultado →', parsed);
// Las comprobaciones se borran por completo: mira la pestaña compiled.js.
```
