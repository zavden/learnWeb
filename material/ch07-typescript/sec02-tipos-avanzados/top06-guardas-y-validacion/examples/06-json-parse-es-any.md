---
example_description: "JSON.parse devuelve any: JSON.parse(text) as Product[] es una promesa que nadie comprueba, y el fallo aparece lejos, en otra función. Guardar el resultado como unknown obliga a validarlo antes de usarlo (TS18046)"
example_tags: "typescript|json|any|unknown|as|validacion|ts18046|bug"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
type Product = { sku: string; price: number };

// Lo que llega del servidor: el tercer precio viene como texto.
const body = '[{"sku": "MOL-01", "price": 165}, {"sku": "CAF-02", "price": 210}, {"sku": "CHO-03", "price": "95"}]';

// 🐛 any + as: TypeScript acepta la afirmación sin mirar nada…
const products = JSON.parse(body) as Product[];

// …y el problema aparece en otro sitio, en una función que hace bien su trabajo.
function invoiceTotal(items: Product[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}
const total = invoiceTotal(products); // number, según TypeScript
console.log('🐛 total →', total, '| typeof →', typeof total); // 375 + '95' concatena

// ✅ unknown en la frontera: nada se puede usar hasta comprobarlo.
const data: unknown = JSON.parse(body);
console.log('elementos →', data.length); // ❌ Error TS18046 a propósito: data es unknown

function isProduct(value: unknown): value is Product {
  return typeof value === 'object' && value !== null &&
    'sku' in value && typeof value.sku === 'string' &&
    'price' in value && typeof value.price === 'number';
}
const checked = Array.isArray(data) ? data.filter(isProduct) : [];
console.log('✅ válidos →', checked.length, '| total →', invoiceTotal(checked).toFixed(2));
```
