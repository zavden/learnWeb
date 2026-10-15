---
example_description: "Un tipo de plantilla (`${Size}-${Color}`) se escribe como un template literal de JavaScript, pero con tipos: con uniones dentro, produce todas las combinaciones; con as const, un template literal en ejecución tiene ese tipo"
example_tags: "typescript|template-literal-types|uniones|as-const|tipos-literales"
example_stage: minimal
example_importance: critical
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

const SIZES = ['S', 'M', 'L'] as const;
const COLORS = ['negro', 'arena'] as const;
type Size = (typeof SIZES)[number];
type Color = (typeof COLORS)[number];

// La misma sintaxis que un template literal, pero en un tipo: el resultado es un tipo literal.
type Greeting = `Hola, ${'Ana' | 'Iván'}`; // → 'Hola, Ana' | 'Hola, Iván'
// Con dos uniones, TODAS las combinaciones (3 tallas × 2 colores = 6):
type Sku = `${Size}-${Color}`;

type Checks = [
  Expect<Equal<Greeting, 'Hola, Ana' | 'Hola, Iván'>>,
  Expect<Equal<Sku, 'S-negro' | 'S-arena' | 'M-negro' | 'M-arena' | 'L-negro' | 'L-arena'>>,
];

// En ejecución, as const sobre un template literal le da el tipo de plantilla:
const allSkus = SIZES.flatMap((size) => COLORS.map((color) => `${size}-${color}` as const));
// allSkus: ('S-negro' | 'S-arena' | … )[]; sin as const sería string[].

const stock: Partial<Record<Sku, number>> = { 'M-negro': 4, 'L-arena': 1 };
for (const sku of allSkus) console.log(`${sku} → ${stock[sku] ?? 0} uds.`);
// stock['M-rojo'] sería un error: 'M-rojo' no es un Sku.
```
