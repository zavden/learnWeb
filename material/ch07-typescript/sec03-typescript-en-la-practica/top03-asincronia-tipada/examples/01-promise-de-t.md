---
example_description: "Una función async siempre devuelve una promesa: su tipo de retorno se escribe Promise<T> (anotarla como Product es TS1064). await quita el Promise, Awaited<T> hace lo mismo con los tipos, y sin anotación TypeScript infiere Promise<…> a partir de los return"
example_tags: "typescript|async|await|promise|awaited|returntype|ts1064"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

type Product = { sku: string; name: string; price: number };
const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

// ✅ El tipo de retorno de una función async es la PROMESA de un valor.
async function loadProduct(sku: string): Promise<Product> {
  await wait(20); // simula la red
  return { sku, name: 'Mole negro', price: 165 }; // se devuelve un Product: async lo envuelve
}

// 🐛 Anotar lo que se devuelve «por dentro» es un error: fuera, siempre es una promesa.
async function loadStock(sku: string): number { // ❌ Error TS1064 a propósito: debería ser Promise<number>
  await wait(10);
  return sku === 'MOL-01' ? 12 : 0;
}

// Sin anotación, TypeScript infiere Promise<…> a partir de los return.
async function loadReviews(sku: string) {
  await wait(30);
  return [{ sku, stars: 5, text: 'Como el de mi abuela' }];
}

type Review = { sku: string; stars: number; text: string };
type Checks = [
  Expect<Equal<ReturnType<typeof loadProduct>, Promise<Product>>>,
  Expect<Equal<ReturnType<typeof loadReviews>, Promise<Review[]>>>,
  Expect<Equal<Awaited<ReturnType<typeof loadReviews>>, Review[]>>, // Awaited: lo que da el await
  Expect<Equal<Awaited<Promise<Promise<number>>>, number>>, // desenvuelve todas las capas
];

const pending = loadProduct('MOL-01'); // Promise<Product>: aún no hay producto
console.log('sin await →', pending instanceof Promise);
const product = await pending; // Product
console.log('con await →', product.name, product.price);
console.log('existencias →', await loadStock('MOL-01'));
console.log('reseñas →', (await loadReviews('MOL-01')).length);
```
