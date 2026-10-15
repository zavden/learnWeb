---
example_description: "Partial<T> hace opcionales todas las propiedades (el cuerpo de un PATCH: solo lo que cambia) y Required<T> las hace obligatorias (las opciones con sus valores por defecto ya aplicados)"
example_tags: "typescript|python|tipos-de-utilidad|partial|required|patch"
example_stage: minimal
example_importance: critical
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

type Product = { id: number; name: string; price: number; stock: number };

// Partial<T>: todas las propiedades opcionales. Es el cuerpo de un PATCH:
// se envía solo lo que cambia.
type ProductPatch = Partial<Product>;
type Checks1 = [Expect<Equal<ProductPatch, { id?: number; name?: string; price?: number; stock?: number }>>];

function applyPatch(product: Product, patch: ProductPatch): Product {
  return { ...product, ...patch };
}

const mole: Product = { id: 7, name: 'Mole negro', price: 165, stock: 12 };
console.log('precio →', applyPatch(mole, { price: 175 }));
console.log('existencias →', applyPatch(mole, { stock: 0 }).stock);

// Required<T>: lo contrario, todas obligatorias (quita los ? y su undefined).
type ListOptions = { pageSize?: number; sortBy?: keyof Product; ascending?: boolean };
type Checks2 = [Expect<Equal<Required<ListOptions>, { pageSize: number; sortBy: keyof Product; ascending: boolean }>>];

const DEFAULT_LIST: Required<ListOptions> = { pageSize: 20, sortBy: 'name', ascending: true };

// Quien llama pasa lo que quiera; dentro, todo tiene valor (sin comprobar undefined).
function describeList(options: ListOptions = {}): string {
  const settings: Required<ListOptions> = { ...DEFAULT_LIST, ...options };
  return `${settings.pageSize} por página, por ${settings.sortBy} ${settings.ascending ? '↑' : '↓'}`;
}
console.log(describeList());
console.log(describeList({ sortBy: 'price', ascending: false }));
```
