---
example_description: "Un predicado de tipo (value is Size) convierte una función que devuelve boolean en un estrechamiento reutilizable: isSize deja usar un texto como talla y isProduct un unknown como producto. Para comprobaciones simples, TypeScript 5.5+ infiere el predicado solo"
example_tags: "typescript|python|predicados-de-tipo|guardas|estrechamiento|unknown"
example_stage: minimal
example_importance: critical
console: true
---

# TypeScript

```typescript
const SIZES = ['S', 'M', 'L'] as const;
type Size = (typeof SIZES)[number];
type Product = { sku: string; price: number };

// Sin predicado, devolver boolean no estrecha nada fuera de la función.
function isSizeBoolean(value: string): boolean {
  return (SIZES as readonly string[]).includes(value); // includes de una tupla as const no acepta string: de ahí el as
}
// Con «value is Size», true significa «value es un Size» para quien llama.
function isSize(value: string): value is Size {
  return (SIZES as readonly string[]).includes(value);
}

function priceFor(size: Size): number {
  return { S: 199, M: 219, L: 239 }[size];
}

for (const input of ['M', 'XL']) {
  // if (isSizeBoolean(input)) priceFor(input) sería un error: input sigue siendo string.
  if (isSize(input)) console.log(`talla ${input} → $${priceFor(input)}`); // aquí input es Size
  else console.log(`«${input}» no es una talla`);
}

// Con unknown, el predicado reúne todas las comprobaciones en un sitio.
function isProduct(value: unknown): value is Product {
  return typeof value === 'object' && value !== null &&
    'sku' in value && typeof value.sku === 'string' &&
    'price' in value && typeof value.price === 'number';
}
const received: unknown = JSON.parse('{"sku": "MOL-01", "price": 165}');
if (isProduct(received)) console.log('producto →', received.sku, received.price.toFixed(2));

// TypeScript 5.5+ infiere el predicado en funciones sencillas sin anotación:
const isText = (value: unknown) => typeof value === 'string'; // (value: unknown) => value is string
console.log('textos →', ['MOL-01', 42, 'CAF-02', null].filter(isText).join(', '));
```
