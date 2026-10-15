---
example_description: "Tipos literales: un tipo con un único valor ('M', 5); unidos forman una lista cerrada de valores (tallas, puntuaciones) y cualquier otro valor es un error (TS2345); equivale a Literal de Python"
example_tags: "typescript|python|tipos-literales|uniones|literal|ts2345|ts2322"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
// Un tipo literal admite UN solo valor. Unidos, forman una lista cerrada.
type Size = 'S' | 'M' | 'L'; // Python: Literal["S", "M", "L"]
type Stars = 1 | 2 | 3 | 4 | 5; // también con números

function orderShirt(size: Size, quantity: number): string {
  return `${quantity} × playera talla ${size}`;
}

console.log(orderShirt('M', 2)); // ✅
console.log(orderShirt('XL', 1)); // ❌ Error TS2345 a propósito: 'XL' no está en la lista

function review(dish: string, stars: Stars): string {
  return `${dish}: ${'★'.repeat(stars)}${'☆'.repeat(5 - stars)}`;
}
console.log(review('Tlayuda', 5));
try {
  console.log(review('Tasajo', 6)); // ❌ Error TS2345 a propósito: 6 no es una puntuación válida
} catch (error) {
  console.log('⛔', String(error)); // 5 - 6 = -1 estrellas vacías: repeat(-1) lanza
}

// El editor autocompleta 'S', 'M' y 'L' al escribir la comilla, y una errata
// como 'm' (minúscula) también sería un error: los literales distinguen mayúsculas.
```
