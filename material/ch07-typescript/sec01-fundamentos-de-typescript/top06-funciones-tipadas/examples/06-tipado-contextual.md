---
example_description: "Tipado contextual: los callbacks que pasas a filter, map, sort o a tus propias funciones reciben el tipo de sus parámetros del contexto, sin anotarlos; en tus funciones, anota el tipo del callback en el parámetro y quien llama lo aprovecha"
example_tags: "typescript|funciones|callbacks|tipado-contextual|inferencia"
example_stage: minimal
example_importance: important
console: true
---

# TypeScript

```typescript
type Review = { dish: string; stars: number; comment: string };

const reviews: Review[] = [
  { dish: 'Tlayuda', stars: 5, comment: 'Crujiente y generosa' },
  { dish: 'Mole negro', stars: 4, comment: 'Muy bueno, algo dulce' },
  { dish: 'Tasajo', stars: 3, comment: 'Le faltó sal' },
];

// 1. Ningún parámetro de estas flechas lleva anotación: r, a y b ya son
//    Review porque reviews es Review[] (tipado contextual).
const recommended = reviews.filter((r) => r.stars >= 4).map((r) => r.dish);
const byStars = [...reviews].sort((a, b) => a.stars - b.stars).map((r) => r.dish);
console.log('recomendados →', recommended);
console.log('de peor a mejor →', byStars);

// 2. En tus funciones, anota el tipo del CALLBACK en el parámetro…
function eachReview(list: Review[], callback: (review: Review, position: number) => void): void {
  list.forEach((review, index) => callback(review, index + 1));
}

// …y quien llama no necesita anotar nada: review es Review y position, number.
eachReview(reviews, (review, position) => {
  console.log(`${position}. ${review.dish} ${'★'.repeat(review.stars)} — ${review.comment}`);
});

// 3. Como en JavaScript, un callback puede usar menos parámetros de los que recibe:
eachReview(reviews.slice(0, 1), (review) => console.log('solo el primero →', review.dish));
```
