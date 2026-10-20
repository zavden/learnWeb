---
example_description: "Pick<T, K> se queda con unas propiedades (la ficha de un listado) y Omit<T, K> quita otras (el cuerpo de un POST, sin id ni fecha de alta); los dos salen del mismo tipo Product y cambian con él"
example_tags: "typescript|tipos-de-utilidad|pick|omit|readonly|api"
example_stage: minimal
example_importance: critical
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

// El producto tal como lo guarda el servidor.
type Product = { id: number; name: string; price: number; stock: number; createdAt: string };

// Pick<T, K>: solo esas claves. Para un listado bastan tres.
type ProductCard = Pick<Product, 'id' | 'name' | 'price'>;
// Omit<T, K>: todas MENOS esas. Al crear un producto, el id y la fecha los pone el servidor.
type NewProduct = Omit<Product, 'id' | 'createdAt'>;
// Readonly<T>: todas de solo lectura (superficial, como viste en la lección 3).
type SavedProduct = Readonly<Product>;

type Checks = [
  Expect<Equal<ProductCard, { id: number; name: string; price: number }>>,
  Expect<Equal<NewProduct, { name: string; price: number; stock: number }>>,
];

let nextId = 101;
function createProduct(input: NewProduct): SavedProduct {
  return { ...input, id: nextId++, createdAt: '2026-10-14' };
}
function toCard(product: Product): ProductCard {
  return { id: product.id, name: product.name, price: product.price };
}

const created = createProduct({ name: 'Café de Chiapas', price: 210, stock: 40 });
// createProduct({ id: 5, name: …, … }) sería un error: id no está en NewProduct (literal fresco).
console.log('creado →', created);
console.log('ficha →', toCard(created));
// created.price = 0 sería un error TS2540: es un SavedProduct (Readonly).
```
