---
example_description: "El parámetro this (function describe(this: Product)) declara qué this espera una función: llamarla suelta es TS2684; una función que usa this sin declararlo es TS2683 (noImplicitThis); el parámetro this se borra del JavaScript"
example_tags: "typescript|funciones|this|noimplicitthis|ts2684|ts2683"
example_stage: common-error
example_importance: useful
console: true
---

# TypeScript

```typescript
type Product = { title: string; cents: number };

// this como primer «parámetro»: no es un parámetro real, solo dice qué this
// espera la función. Quien la llama sigue pasando 0 argumentos.
function describe(this: Product): string {
  return `${this.title}: $${(this.cents / 100).toFixed(2)}`;
}

const mug = { title: 'Taza de barro', cents: 18000, describe };
console.log('✅', mug.describe()); // this = mug, que tiene la forma de Product

// 🐛 Llamada suelta: this no es un Product.
try {
  console.log('🐛', describe()); // ❌ Error TS2684 a propósito: el this de la llamada es void
} catch (error) {
  // strict genera "use strict": en una llamada suelta, this es undefined.
  console.log('🐛', String(error));
}

// 🐛 Sin declarar this, con strict (noImplicitThis) es un error:
function badDescribe() {
  return this.title; // ❌ Error TS2683 a propósito: this sería any
}
console.log('🐛', badDescribe.call(mug));

// El parámetro this se borra: el JavaScript no lo tiene.
console.log(describe.toString());
```
