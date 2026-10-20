---
example_description: "typeof dentro de un tipo es de TypeScript: da el tipo de una variable o función (Settings sale del objeto de ajustes por defecto, Quote de lo que devuelve una función con ReturnType); typeof en una expresión sigue siendo el de JavaScript"
example_tags: "typescript|typeof|operadores-de-tipo|returntype|inferencia"
example_stage: minimal
example_importance: critical
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

// El valor existe primero; el tipo se saca de él para no escribirlo dos veces.
const DEFAULT_SETTINGS = { currency: 'MXN', taxRate: 0.16, freeShippingFrom: 999, showStock: true };
type Settings = typeof DEFAULT_SETTINGS;
// → { currency: string; taxRate: number; freeShippingFrom: number; showStock: boolean }

function quoteShipping(subtotal: number, zone: 'local' | 'national') {
  const cost = zone === 'local' ? 69 : 189;
  return { zone, cost: subtotal >= DEFAULT_SETTINGS.freeShippingFrom ? 0 : cost };
}
// typeof de una función da su tipo de función; ReturnType (lección 4) se queda con el retorno.
type QuoteFn = typeof quoteShipping; // → (subtotal: number, zone: 'local' | 'national') => { … }
type Quote = ReturnType<typeof quoteShipping>; // → { zone: 'local' | 'national'; cost: number }

type Checks = [
  Expect<Equal<Settings, { currency: string; taxRate: number; freeShippingFrom: number; showStock: boolean }>>,
  Expect<Equal<Quote, { zone: 'local' | 'national'; cost: number }>>,
  Expect<Equal<QuoteFn, (subtotal: number, zone: 'local' | 'national') => Quote>>,
];

const custom: Settings = { ...DEFAULT_SETTINGS, showStock: false };
const quote: Quote = quoteShipping(800, 'national');

// typeof en una EXPRESIÓN es el operador de JavaScript: un texto en ejecución.
console.log('typeof en ejecución →', typeof DEFAULT_SETTINGS, '|', typeof quoteShipping);
console.log('ajustes →', custom.currency, custom.showStock, '| envío →', quote);
```
