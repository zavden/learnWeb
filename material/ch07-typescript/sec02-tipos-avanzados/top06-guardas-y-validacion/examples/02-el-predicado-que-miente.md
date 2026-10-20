---
example_description: "TypeScript se cree los predicados de tipo sin comprobarlos: un isProduct que solo mira si existe sku estrecha a Product un objeto con el precio en texto, y el fallo llega más tarde, en toFixed, sin un solo error rojo"
example_tags: "typescript|predicados-de-tipo|guardas|validacion|bug"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
type Product = { sku: string; name: string; price: number };

// 🐛 El predicado PROMETE «es un Product», pero solo comprueba que tenga sku.
function isProduct(value: unknown): value is Product {
  return typeof value === 'object' && value !== null && 'sku' in value;
}

function priceLabel(product: Product): string {
  return `${product.name}: $${product.price.toFixed(2)}`;
}

// Una respuesta del servidor con el precio como texto.
const received: unknown = JSON.parse('{"sku": "CHO-03", "name": "Chocolate de metate", "price": "95"}');

if (isProduct(received)) {
  // TypeScript se fía del predicado: aquí received es un Product… y no lo es.
  try {
    console.log(priceLabel(received));
  } catch (error) {
    console.log('🐛 predicado que miente →', String(error));
  }
}

// ✅ Un predicado debe comprobar TODO lo que promete (el cuerpo es tu responsabilidad):
function isProductStrict(value: unknown): value is Product {
  return typeof value === 'object' && value !== null &&
    'sku' in value && typeof value.sku === 'string' &&
    'name' in value && typeof value.name === 'string' &&
    'price' in value && typeof value.price === 'number' && Number.isFinite(value.price);
}
console.log('✅ ¿es un Product? →', isProductStrict(received));
```
