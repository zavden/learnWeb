---
example_description: "as const convierte un literal en «todo literal y todo readonly», a cualquier profundidad: un array pasa a ser una tupla readonly de literales de la que se puede sacar la unión de sus valores; modificarlo es un error (TS2339, TS2540)"
example_tags: "typescript|as-const|tipos-literales|readonly|tuplas|ts2339|ts2540"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
// Sin as const: string[]. Con as const: readonly ['S', 'M', 'L'].
const SIZES = ['S', 'M', 'L'] as const;

// La unión de sus valores, sacada del propio array: 'S' | 'M' | 'L'.
// (typeof y [number] en un tipo son operadores de tipo: módulo 2.)
type Size = (typeof SIZES)[number];

function orderShirt(size: Size): string {
  return `playera talla ${size}`;
}
for (const size of SIZES) console.log(orderShirt(size)); // size es Size, no string

// En los objetos, as const llega a todos los niveles: literales y readonly.
const SHIPPING = {
  currency: 'MXN', // tipo 'MXN', no string
  zones: { local: 99, national: 189 }, // 99 y 189, readonly
} as const;
console.log(`envío local: $${SHIPPING.zones.local} ${SHIPPING.currency}`);

SIZES.push('XL'); // ❌ Error TS2339 a propósito: una tupla readonly no tiene push
SHIPPING.zones.local = 0; // ❌ Error TS2540 a propósito: readonly también en el nivel anidado

// Como readonly, as const solo existe para el verificador: en ejecución,
// el push y la asignación funcionan (para impedirlo, Object.freeze).
console.log('SIZES →', SIZES, '| local →', SHIPPING.zones.local);
```
