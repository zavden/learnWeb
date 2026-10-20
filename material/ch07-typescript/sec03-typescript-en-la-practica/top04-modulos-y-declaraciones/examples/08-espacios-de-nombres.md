---
example_description: "namespace es la forma de organizar el código que TypeScript tenía antes de los módulos ES: agrupa nombres bajo un objeto y, al contrario que import/export, genera código (mira en compiled.js la función que se ejecuta al momento y la variable global). En código nuevo se usan módulos"
example_tags: "typescript|namespace|modulos|compiled-js|historia"
example_stage: minimal
example_importance: useful
console: true
---

# TypeScript

```typescript
// Un espacio de nombres: todo lo exportado queda dentro del objeto Shipping.
namespace Shipping {
  export type Zone = 'local' | 'national';
  const BASE: Record<Zone, number> = { local: 59, national: 189 }; // sin export: privado

  export function cost(zone: Zone, weightGrams: number): number {
    return BASE[zone] + Math.max(0, Math.ceil(weightGrams / 1000) - 1) * 40;
  }
}

console.log('local, 800 g →', Shipping.cost('local', 800));
console.log('national, 2.5 kg →', Shipping.cost('national', 2500));
console.log('Shipping →', typeof Shipping, Object.keys(Shipping)); // existe en ejecución
// Mira compiled.js: `var Shipping; (function (Shipping) { … })(Shipping || (Shipping = {}));`.
// Ese código lo escribe TypeScript: un namespace NO se borra, como enum y las parameter properties.
```
