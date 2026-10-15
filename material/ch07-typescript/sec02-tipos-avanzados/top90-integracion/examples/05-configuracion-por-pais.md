---
example_description: "La configuración de una tienda que vende en tres países: as const satisfies comprueba cada país sin perder sus literales, keyof typeof e indexados sacan StoreId y Currency, un Record<StoreId, …> obliga a cubrir todos, y los precios por moneda son claves calculadas con una plantilla (priceMxn, priceUsd, priceEur)"
example_tags: "typescript|integracion|satisfies|keyof|typeof|tipos-indexados|template-literal-types|record|intl"
example_stage: intermediate
example_importance: important
console: true
---

# TypeScript

```typescript
type StoreConfig = { locale: string; currency: 'MXN' | 'USD' | 'EUR'; vat: number; freeShippingFrom: number };

// as const: literales exactos; satisfies: cada país tiene la forma de StoreConfig (lección 2).
const STORES = {
  mx: { locale: 'es-MX', currency: 'MXN', vat: 0.16, freeShippingFrom: 999 },
  us: { locale: 'en-US', currency: 'USD', vat: 0, freeShippingFrom: 60 },
  es: { locale: 'es-ES', currency: 'EUR', vat: 0.21, freeShippingFrom: 50 },
} as const satisfies Record<string, StoreConfig>;

type StoreId = keyof typeof STORES; // → 'mx' | 'us' | 'es'
type Currency = (typeof STORES)[StoreId]['currency']; // → 'MXN' | 'USD' | 'EUR'

// Record con una unión: si mañana se añade un país, esta tabla sale en rojo hasta completarla.
const SHIPPING_NOTE = {
  mx: 'Envío por paquetería en 2–4 días hábiles',
  us: 'Ships from Laredo, TX in 5–7 days',
  es: 'Envío desde Madrid en 3–5 días',
} satisfies Record<StoreId, string>;

// Un precio por moneda, con la clave calculada: priceMxn, priceUsd, priceEur (lección 5).
type PriceKey<C extends string> = `price${Capitalize<Lowercase<C>>}`;
type Product = { name: string } & { [C in Currency as PriceKey<C>]: number };

function priceKey<C extends Currency>(currency: C): PriceKey<C> {
  return `price${currency.charAt(0)}${currency.slice(1).toLowerCase()}` as PriceKey<C>;
}

const mole: Product = { name: 'Mole negro (500 g)', priceMxn: 165, priceUsd: 9.5, priceEur: 8.9 };
// Quitar priceEur de este objeto sería un error: Product exige las tres monedas.

function quote(product: Product, storeId: StoreId, quantity: number): string {
  const store = STORES[storeId];
  const subtotal = product[priceKey(store.currency)] * quantity;
  const shipping = subtotal >= store.freeShippingFrom ? 0 : store.currency === 'MXN' ? 99 : 6;
  const money = new Intl.NumberFormat(store.locale, { style: 'currency', currency: store.currency });
  const total = subtotal * (1 + store.vat) + shipping;
  return `${storeId} · ${quantity} × ${product.name} → ${money.format(total)} (${SHIPPING_NOTE[storeId]})`;
}

for (const storeId of Object.keys(STORES) as StoreId[]) console.log(quote(mole, storeId, 4));
console.log('claves de precio →', (['MXN', 'USD', 'EUR'] as const).map(priceKey).join(', '));
```
