---
example_description: "El ayudante «tipado» de muchos tutoriales, fetchJson<T>(url): Promise<T>, compila sin un solo error porque response.json() devuelve Promise<any>: el <T> es una aserción. Con un catálogo antiguo (precios en texto) el total concatena, y con un 404 la «lista de productos» es el objeto de error"
example_tags: "typescript|fetch|json|any|genericos|asercion|bug"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
// Usa assets/catalog-v1.json (ábrelo con «Assets»): un catálogo antiguo con los precios en texto.
type Product = { sku: string; name: string; price: number };

// 🐛 Parece tipado… pero json() devuelve Promise<any>, y any cabe en cualquier T.
async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  return response.json(); // lo mismo que `return (await response.json()) as T`
}

const catalog = await fetchJson<Product[]>('catalog-v1.json'); // «Product[]»: nadie lo ha mirado
const total = catalog.reduce((sum, product) => sum + product.price, 0);
console.log('🐛 total →', total, '| typeof →', typeof total);
try {
  console.log(catalog.map((product) => product.price.toFixed(2)));
} catch (error) {
  console.log('🐛', String(error));
}

// 🐛 Un 404 tampoco se nota: el cuerpo de error se convierte en la «lista».
const missing = await fetchJson<Product[]>('catalogo.json'); // errata en el nombre
console.log('🐛 404 →', missing, '| ¿array? →', Array.isArray(missing), '| length →', missing.length);

// No hay ningún error de tipos en todo el ejemplo: el siguiente lo arregla
// recibiendo unknown y comprobando la respuesta antes de devolver un T.
```
