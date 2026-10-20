---
example_description: "Remapear claves con as dentro de un tipo mapeado: devolver never borra la clave (NumericFields se queda con price y stock) y una plantilla la renombra (getName, getPrice; las plantillas se ven en la lección 5)"
example_tags: "typescript|tipos-mapeados|remapeo-de-claves|never|tipos-condicionales"
example_stage: minimal
example_importance: important
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

type Product = { sku: string; name: string; price: number; stock: number; organic: boolean };

// [K in keyof T as …]: la parte después de as decide el NOMBRE de la clave.
// Si da never, la clave desaparece: un filtro de propiedades.
type NumericFields<T> = { [K in keyof T as T[K] extends number ? K : never]: T[K] };
type ProductNumbers = NumericFields<Product>; // → { price: number; stock: number }

// Si da otro texto, la clave se renombra (los tipos de plantilla: lección 5).
type Getters<T> = { [K in keyof T as `get${Capitalize<K & string>}`]: () => T[K] };
type ProductGetters = Getters<Pick<Product, 'name' | 'price'>>; // Pick: lección 4
// → { getName: () => string; getPrice: () => number }

type Checks = [
  Expect<Equal<ProductNumbers, { price: number; stock: number }>>,
  Expect<Equal<ProductGetters, { getName: () => string; getPrice: () => number }>>,
];

const coffee: Product = { sku: 'CAF-02', name: 'Café de Chiapas', price: 210, stock: 8, organic: true };

// Para una gráfica solo sirven los campos numéricos:
const chartData: ProductNumbers = { price: coffee.price, stock: coffee.stock };
// Añadir name aquí sería un error: ProductNumbers no tiene esa clave.
const getters: ProductGetters = { getName: () => coffee.name, getPrice: () => coffee.price };

console.log('gráfica →', chartData);
console.log(getters.getName(), '→', getters.getPrice());
```
