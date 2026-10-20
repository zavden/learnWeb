---
example_description: "filter con un predicado estrecha el array: desde TypeScript 5.5, x => x !== null se infiere como predicado y da Product[]; filter(Boolean) y una condición con && no, y siguen siendo (Product | null)[] hasta que escribes el predicado"
example_tags: "typescript|predicados-de-tipo|filter|arrays|null|inferencia"
example_stage: minimal
example_importance: critical
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

type Product = { sku: string; price: number };
// Un carrito con huecos: productos que ya no existen llegan como null.
const lines: (Product | null)[] = [
  { sku: 'MOL-01', price: 165 },
  null,
  { sku: 'MEZ-05', price: 540 },
];

// 1. TypeScript 5.5+ infiere el predicado (x): x is Product de esta flecha:
const products = lines.filter((line) => line !== null); // Product[]
// 2. filter(Boolean) quita los null en ejecución, pero el tipo no cambia:
const truthy = lines.filter(Boolean); // (Product | null)[]
// 3. Con && TypeScript no infiere nada: false no significa «es null».
const expensive = lines.filter((line) => line !== null && line.price > 200); // (Product | null)[]
// 4. Escrito a mano, el predicado vale siempre:
const expensiveFixed = lines.filter((line): line is Product => line !== null && line.price > 200); // Product[]

type Checks = [
  Expect<Equal<typeof products, Product[]>>,
  Expect<Equal<typeof truthy, (Product | null)[]>>,
  Expect<Equal<typeof expensive, (Product | null)[]>>,
  Expect<Equal<typeof expensiveFixed, Product[]>>,
];

console.log('total →', products.reduce((sum, product) => sum + product.price, 0));
console.log('caros →', expensiveFixed.map((product) => product.sku));
// expensive.map((p) => p.sku) sería un error TS18047 ('p' is possibly 'null').
console.log('mismo contenido →', expensive.length === expensiveFixed.length);
```
