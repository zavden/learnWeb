---
example_description: "keyof T da la unión de las claves de T como tipos literales ('name' | 'price' | 'stock'): una función que ordena por columna solo acepta columnas que existen (TS2345 con 'colour') y se actualiza sola si el tipo crece"
example_tags: "typescript|keyof|operadores-de-tipo|tipos-literales|ts2345"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

type Product = { name: string; price: number; stock: number };

// keyof T: la unión de las claves de T, cada una como tipo literal.
type ProductKey = keyof Product; // → 'name' | 'price' | 'stock'
type Checks = [Expect<Equal<ProductKey, 'name' | 'price' | 'stock'>>];

// Ordena por cualquier columna… siempre que exista.
function sortBy(items: Product[], key: ProductKey): Product[] {
  return [...items].sort((a, b) => (a[key] < b[key] ? -1 : a[key] > b[key] ? 1 : 0));
}

const products: Product[] = [
  { name: 'Mole negro', price: 165, stock: 12 },
  { name: 'Café de Chiapas', price: 210, stock: 0 },
  { name: 'Chocolate de metate', price: 95, stock: 30 },
];

console.log('por precio →', sortBy(products, 'price').map((p) => p.name));
console.log('por nombre →', sortBy(products, 'name').map((p) => p.name));
// ❌ Error TS2345 a propósito: Product no tiene colour (en ejecución, el orden no cambia).
console.log('🐛 por colour →', sortBy(products, 'colour').map((p) => p.name));

// Si mañana Product gana una propiedad (weight), ProductKey la incluye sin tocar nada.
```
