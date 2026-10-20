---
example_description: "Arrays tipados: number[] (o Array<number>), inferencia a partir de los elementos, un array vacío necesita anotación, push de un tipo equivocado es TS2345, y los callbacks de map reciben el tipo de los elementos"
example_tags: "typescript|arrays|inferencia|ts2345"
example_stage: common-error
example_importance: important
console: true
---

# TypeScript

```typescript
// «Array de números»: number[] es la forma habitual.
const prices: number[] = [45.5, 120, 89];
// Array<string> es lo mismo, escrito como tipo genérico (los genéricos: módulo 2).
const sizes: Array<string> = ['S', 'M', 'L'];

// Inferido a partir de los elementos:
const tags = ['vegano', 'sin gluten']; // string[]
// Con tipos mezclados, el tipo del elemento es una unión (lección 4):
const mixed = [3, 'docena']; // (string | number)[]

// Un array vacío necesita anotación: TypeScript no puede saber qué irá dentro.
const cart: string[] = [];
cart.push('Concha de chocolate');
cart.push(3); // ❌ Error TS2345 a propósito: cart es string[], no admite números

// Los callbacks reciben el tipo de los elementos sin anotarlo (p es number):
const withTax = prices.map((p) => Math.round(p * 1.16));

console.log('withTax →', withTax);
console.log('sizes →', sizes.join(' / '), '| tags →', tags.length, '| mixed →', mixed);
console.log('cart →', cart); // el 3 entró igual: el código se ejecuta
// > Desde Python: prices: list[float] = [45.5, 120, 89]
```
