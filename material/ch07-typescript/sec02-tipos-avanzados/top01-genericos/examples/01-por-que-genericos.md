---
example_description: "Una función que devuelve el primer elemento de cualquier lista: con any se pierde el tipo (y un fallo pasa sin rojo), con unknown hay que comprobarlo cada vez, y con un parámetro de tipo <T> la salida tiene el tipo de la entrada"
example_tags: "typescript|python|genericos|any|unknown|inferencia"
example_stage: minimal
example_importance: critical
console: true
---

# TypeScript

```typescript
// Dos listas de la tienda de discos, de tipos distintos.
const titles = ['Amor prohibido', 'Clandestino', 'Re'];
const prices = [349, 299, 410];

// 1. Con any acepta cualquier array… y devuelve any: el tipo se pierde.
function firstAny(items: any[]): any {
  return items[0];
}
// 2. Con unknown es seguro, pero hay que comprobar el tipo en cada uso.
function firstUnknown(items: unknown[]): unknown {
  return items[0];
}
// 3. Con un parámetro de tipo T, la salida tiene el tipo de la entrada.
function first<T>(items: T[]): T | undefined {
  return items[0];
}

const fromAny = firstAny(prices); // any: el verificador ya no mira nada
try {
  console.log(fromAny.toUpperCase()); // sin rojo en el editor…
} catch (error) {
  console.log('🐛 any →', String(error)); // …y falla al ejecutar
}

const fromUnknown = firstUnknown(titles); // unknown: hay que estrechar
if (typeof fromUnknown === 'string') console.log('unknown →', fromUnknown.toUpperCase());

const firstTitle = first(titles); // T = string → string | undefined
const firstPrice = first(prices); // T = number → number | undefined
console.log('✅ T = string →', firstTitle?.toUpperCase());
console.log('✅ T = number →', firstPrice?.toFixed(2));
// first(prices)?.toUpperCase() sería un error TS2339: TypeScript sabe que es un number.

// En ejecución, <T> no existe: mira la pestaña compiled.js.
console.log(first.toString().split('\n')[0]);
```
