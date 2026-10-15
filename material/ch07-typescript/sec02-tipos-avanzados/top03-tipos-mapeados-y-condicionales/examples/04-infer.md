---
example_description: "infer captura una parte de un tipo dentro de un tipo condicional: el tipo de los elementos de un array, lo que devuelve una función y el valor de una promesa; así se nombra el tipo del menú que carga una función async"
example_tags: "typescript|infer|tipos-condicionales|promise|returntype"
example_stage: minimal
example_importance: critical
console: true
---

# TypeScript

```typescript
type Expect<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;

// «Si T es un array de algo, llama E a ese algo y devuélvelo.»
type ElementOf<T> = T extends readonly (infer E)[] ? E : never;
// «Si F es una función, llama R a lo que devuelve.»
type MyReturnType<F> = F extends (...args: any[]) => infer R ? R : never;
// «Si T es una promesa de algo, ese algo; si no, T tal cual.»
type Unwrap<T> = T extends Promise<infer V> ? V : T;

type Dish = { name: string; price: number; spicy: boolean };

function loadMenu(): Promise<Dish[]> {
  return new Promise((resolve) => {
    setTimeout(() => resolve([
      { name: 'Tlayuda', price: 120, spicy: false },
      { name: 'Mole negro', price: 165, spicy: true },
    ]), 50);
  });
}

// El tipo del menú, sacado de la función: sin escribirlo una segunda vez.
type LoadResult = MyReturnType<typeof loadMenu>; // → Promise<Dish[]>
type Menu = Unwrap<LoadResult>; // → Dish[]
type MenuItem = ElementOf<Menu>; // → Dish

type Checks = [
  Expect<Equal<LoadResult, Promise<Dish[]>>>,
  Expect<Equal<Menu, Dish[]>>,
  Expect<Equal<MenuItem, Dish>>,
  Expect<Equal<Unwrap<number>, number>>, // no es una promesa: rama del «si no»
  Expect<Equal<ElementOf<readonly ['S', 'M']>, 'S' | 'M'>>, // también con tuplas
];

const label = (dish: MenuItem): string => `${dish.name} $${dish.price}${dish.spicy ? ' 🌶️' : ''}`;
const menu: Menu = await loadMenu();
console.log(menu.map(label).join(' · '));
```
