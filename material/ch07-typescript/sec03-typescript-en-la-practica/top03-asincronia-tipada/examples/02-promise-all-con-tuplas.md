---
example_description: "Promise.all con un array literal devuelve una tupla con el tipo de cada posición ([Product, number, Review[]]), y con un array de promesas iguales, un array. Promise.allSettled da una unión discriminada por status, y su reason es any"
example_tags: "typescript|async|promise-all|allsettled|tuplas|uniones-discriminadas"
example_stage: minimal
example_importance: important
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

type Product = { sku: string; name: string; price: number };
type Review = { stars: number; text: string };
const wait = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const CATALOG: Record<string, Product> = {
  'MOL-01': { sku: 'MOL-01', name: 'Mole negro', price: 165 },
  'CAF-02': { sku: 'CAF-02', name: 'Café de Chiapas', price: 210 },
};
async function loadProduct(sku: string): Promise<Product> {
  await wait(20);
  const product = CATALOG[sku];
  if (!product) throw new Error(`No existe el producto ${sku}`);
  return product;
}
async function loadStock(sku: string): Promise<number> {
  await wait(30);
  return sku === 'MOL-01' ? 12 : 0;
}
async function loadReviews(): Promise<Review[]> {
  await wait(10);
  return [{ stars: 5, text: 'Como el de mi abuela' }, { stars: 4, text: 'Muy picante' }];
}

// Las tres a la vez; la desestructuración da a cada variable SU tipo.
const [product, stock, reviews] = await Promise.all([loadProduct('MOL-01'), loadStock('MOL-01'), loadReviews()]);
console.log(`${product.name} · $${product.price} · ${stock} en almacén · ${reviews.length} reseñas`);

// Con map, todas las promesas son del mismo tipo: el resultado es un array.
const pair = await Promise.all(['MOL-01', 'CAF-02'].map(loadProduct));
console.log('precios →', pair.map((item) => item.price));

type Checks = [
  Expect<Equal<typeof stock, number>>,
  Expect<Equal<typeof reviews, Review[]>>,
  Expect<Equal<typeof pair, Product[]>>,
];

// allSettled no rechaza nunca: cada resultado es { status: 'fulfilled'; value } o { status: 'rejected'; reason }.
const results = await Promise.allSettled([loadProduct('CAF-02'), loadProduct('XXX-99')]);
for (const result of results) {
  if (result.status === 'fulfilled') console.log('✅', result.value.name); // value: Product
  else console.log('⚠️', String(result.reason)); // reason: any, como el error de un catch sin strict
}
```
