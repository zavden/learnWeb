---
example_description: "Un programa pequeño con anotaciones de tipo: parámetros, retorno y un tipo de objeto con nombre; lo que va tras los dos puntos es TypeScript y el resto es JavaScript de siempre (comparación con las type hints de Python)"
example_tags: "typescript|python|anotaciones|tipos|introduccion"
example_stage: minimal
example_importance: critical
console: true
---

# TypeScript

```typescript
// TypeScript = JavaScript + tipos. Quita lo que va tras los «:» y el
// «type Product = …» y te queda JavaScript normal.

// Python: def format_price(cents: int, currency: str = "MXN") -> str:
function formatPrice(cents: number, currency: string = 'MXN'): string {
  return `$${(cents / 100).toFixed(2)} ${currency}`;
}

// Un tipo con nombre para los productos (la lección 3 lo explica a fondo).
// Python: class Product(TypedDict): title: str; cents: int; tags: list[str]
type Product = {
  title: string;
  cents: number;
  tags: string[]; // un array de strings
};

const coffee: Product = {
  title: 'Café de Chiapas',
  cents: 21000,
  tags: ['orgánico', 'en grano'],
};

function describe(product: Product): string {
  return `${product.title} · ${formatPrice(product.cents)} · ${product.tags.join(', ')}`;
}

console.log(describe(coffee));
console.log('en dólares →', formatPrice(1250, 'USD'));

// Sin anotación, TypeScript deduce el tipo del valor inicial (inferencia):
const bags = 3; // bags: number
const total = coffee.cents * bags; // total: number
console.log(`${bags} bolsas →`, formatPrice(total));

// Sin errores de tipos: el editor no marca nada en rojo.
// > Desde Python: es la misma idea que las type hints + mypy. Las anotaciones
//   no cambian lo que hace el programa; una herramienta las comprueba aparte.
```
