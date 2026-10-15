---
example_description: "Un import sin declaraciones es any: formatPrice('165.00') compila en silencio y muestra $1.65 (un precio cien veces menor). Con las declaraciones del módulo (aquí, un bloque declare module que hace el papel de envios.d.ts), la misma clase de error sale en rojo (TS2345)"
example_tags: "typescript|modulos|import|any|declare-module|d-ts|ts2345|bug"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
// Usa assets/tienda/precios.js y assets/tienda/envios.js.
import { formatPrice } from './tienda/precios.js';
import { shippingCost } from './tienda/envios.js';

// Las declaraciones de envios.js. En un proyecto real irían en envios.d.ts, junto al
// .js; el verificador de LearnWeb no lee archivos, así que se escriben aquí.
declare module './tienda/envios.js' {
  export type Zone = 'local' | 'national';
  export function shippingCost(zone: Zone, weightGrams: number): number;
}

type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Checks = [
  Expect<Equal<typeof formatPrice, any>>, // sin declaraciones: any
  Expect<Equal<Parameters<typeof shippingCost>, [zone: 'local' | 'national', weightGrams: number]>>,
];

// 🐛 Un precio que llega como texto, en pesos, a una función que espera centavos:
console.log('🐛 formatPrice(«165.00») →', formatPrice('165.00')); // ningún error: formatPrice es any
console.log('✅ formatPrice(16500) →', formatPrice(16500));

// ✅ Con declaraciones, la misma clase de error se detecta al escribirla.
console.log('🐛 envío «nacional» →', shippingCost('nacional', 1200)); // ❌ Error TS2345 a propósito: no es una Zone
console.log('✅ envío national, 1.2 kg →', shippingCost('national', 1200));
```
