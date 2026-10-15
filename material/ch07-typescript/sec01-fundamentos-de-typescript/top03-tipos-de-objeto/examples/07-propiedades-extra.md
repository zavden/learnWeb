---
example_description: "La comprobación de propiedades extra solo se aplica a objetos literales «frescos»: una errata (giftwrap) en un literal es TS2561, pero el mismo objeto guardado antes en una variable pasa sin error y la opción se pierde"
example_tags: "typescript|objetos|propiedades-extra|tipado-estructural|ts2561|bug"
example_stage: common-error
example_importance: critical
console: true
---

# TypeScript

```typescript
type ShippingOptions = { express?: boolean; giftWrap?: boolean };

function shippingCost(options: ShippingOptions): number {
  let cost = 99;
  if (options.express) cost += 150;
  if (options.giftWrap) cost += 45;
  return cost;
}

// ✅ Un objeto literal escrito en la llamada es «fresco»: TypeScript comprueba
//    que no tenga propiedades de más, y así detecta la errata.
console.log('literal →', shippingCost({ express: true, giftwrap: true })); // ❌ Error TS2561 a propósito: es giftWrap

// 🐛 El MISMO objeto, guardado antes en una variable: ya no es fresco y la
//    propiedad de más se acepta. La errata pasa y el envoltorio no se cobra.
const options = { express: true, giftwrap: true };
console.log('🐛 variable →', shippingCost(options)); // 249 en vez de 294

// ✅ Anota la variable: el literal vuelve a comprobarse contra el tipo.
const typedOptions: ShippingOptions = { express: true, giftWrap: true };
console.log('✅ anotada →', shippingCost(typedOptions));
```
