---
example_description: "import type y { type X } solo traen tipos y desaparecen del JavaScript (mira compiled.js): de los tres import del ejemplo quedan dos líneas, y sin type Currency. TypeScript también borra un import normal cuyos nombres solo se usan como tipos"
example_tags: "typescript|modulos|import-type|borrado-de-tipos|declare-module|compiled-js"
example_stage: minimal
example_importance: important
console: true
---

# TypeScript

```typescript
// Usa assets/tienda/precios.js y assets/tienda/catalogo.js.
import { formatPrice, type Currency } from './tienda/precios.js'; // un valor y un tipo
import type { Product } from './tienda/catalogo.js'; // solo un tipo
import { CATALOG } from './tienda/catalogo.js'; // un valor

// Lo que dirían precios.d.ts y catalogo.d.ts (el verificador de LearnWeb no lee archivos).
declare module './tienda/precios.js' {
  export type Currency = 'MXN' | 'USD';
  export function formatPrice(cents: number, currency?: Currency): string;
}
declare module './tienda/catalogo.js' {
  export type Product = { sku: string; name: string; cents: number };
  export const CATALOG: readonly Product[];
}

const findProduct = (sku: string): Product | undefined => CATALOG.find((product) => product.sku === sku);

function priceTag(product: Product, currency: Currency = 'MXN'): string {
  return `${product.name} · ${formatPrice(product.cents, currency)}`;
}

const mole = findProduct('MOL-01');
console.log(mole ? priceTag(mole) : 'sin mole');
console.log(CATALOG.map((product) => priceTag(product)).join(' | '));

// En compiled.js: los dos `declare module`, Product, Currency y la línea entera de
// `import type` han desaparecido. Solo quedan los import que traen VALORES.
```
