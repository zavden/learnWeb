---
example_description: "Calculadora de precios para dos mercados: IVA con funciones currificadas, cupones fabricados con closures, opciones con valores por defecto y formateadores Intl memoizados"
example_tags: "javascript|integracion|currying|memoizacion|closures|intl"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// CALCULADORA DE PRECIOS de una tienda que vende en España y en México.
// Integra: flechas y callbacks («Formas de función»), objeto de opciones con
// defaults («Parámetros»), fábricas y closures («Closures»), currying y
// memoización («Funciones de orden superior»).

const MARKETS = {
  ES: { locale: 'es-ES', currency: 'EUR', vat: { general: 0.21, books: 0.04, food: 0.1 } },
  MX: { locale: 'es-MX', currency: 'MXN', vat: { general: 0.16, books: 0, food: 0 } },
};
const CATALOG = [
  { sku: 'LIB-01', name: 'Novela gráfica', category: 'books', net: { ES: 2400, MX: 39900 } },
  { sku: 'CAF-02', name: 'Café de Veracruz 250 g', category: 'food', net: { ES: 890, MX: 16500 } },
  { sku: 'TAZ-03', name: 'Taza de cerámica', category: 'general', net: { ES: 1150, MX: 18900 } },
];

// memoize con clave configurable: por defecto, el JSON de los argumentos.
function memoize(fn, keyOf = (...args) => JSON.stringify(args)) {
  const cache = new Map();
  return (...args) => {
    const key = keyOf(...args);
    if (!cache.has(key)) cache.set(key, fn(...args));
    return cache.get(key);
  };
}

// Crear un Intl.NumberFormat cuesta: uno por mercado, reutilizado siempre.
let formattersCreated = 0;
const moneyFormatter = memoize((locale, currency) => {
  formattersCreated += 1;
  return new Intl.NumberFormat(locale, { style: 'currency', currency });
});

// Currying: mercado → categoría → precio neto → precio con IVA (en céntimos).
const grossPrice = (market) => (category) => (netCents) =>
  Math.round(netCents * (1 + MARKETS[market].vat[category]));
const formatMoney = (market) => (cents) =>
  moneyFormatter(MARKETS[market].locale, MARKETS[market].currency).format(cents / 100);

// Fábrica de cupones: cada cupón es un closure con su configuración.
function makeCoupon(code, rate, { minCents = 0, categories = [] } = {}) {
  const applies = (line) => categories.length === 0 || categories.includes(line.category);
  return (lines, subtotalCents) => {
    if (subtotalCents < minCents) return { code, cents: 0 };
    const base = lines.filter(applies).reduce((sum, line) => sum + line.grossCents, 0);
    return { code, cents: Math.round(base * rate) };
  };
}

function quote(cart, { market = 'ES', coupon = null } = {}) {
  const toGross = grossPrice(market);
  const lines = cart.map(({ sku, qty }) => {
    const product = CATALOG.find((item) => item.sku === sku);
    return { ...product, qty, grossCents: toGross(product.category)(product.net[market]) * qty };
  });
  const subtotal = lines.reduce((sum, line) => sum + line.grossCents, 0);
  const discount = coupon ? coupon(lines, subtotal) : { code: '—', cents: 0 };
  return { market, lines, subtotal, discount, total: subtotal - discount.cents };
}

function printQuote({ market, lines, subtotal, discount, total }) {
  const money = formatMoney(market);
  console.log(`▼ Presupuesto ${market}`);
  for (const line of lines) {
    console.log(`  ${line.qty} × ${line.name.padEnd(24)}${money(line.grossCents).padStart(12)}`);
  }
  console.log(`  ${'Subtotal'.padEnd(28)}${money(subtotal).padStart(12)}`);
  // Sin descuento, -0 se escribiría «-0,00 €» (lección «Números»): por eso el caso aparte.
  const discountText = discount.cents > 0 ? money(-discount.cents) : money(0);
  console.log(`  ${`Cupón ${discount.code}`.padEnd(28)}${discountText.padStart(12)}`);
  console.log(`  ${'TOTAL'.padEnd(28)}${money(total).padStart(12)}`);
}

const cart = [{ sku: 'LIB-01', qty: 1 }, { sku: 'CAF-02', qty: 3 }, { sku: 'TAZ-03', qty: 2 }];
const readingCoupon = makeCoupon('LECTURA10', 0.1, { categories: ['books'] });
const welcomeCoupon = makeCoupon('BIENVENIDA', 0.05, { minCents: 100000 });

printQuote(quote(cart, { coupon: readingCoupon }));
printQuote(quote(cart, { market: 'MX', coupon: welcomeCoupon }));
printQuote(quote(cart)); // sin opciones: España y sin cupón

// Los pasos intermedios del currying son funciones reutilizables:
const spanishBookPrice = grossPrice('ES')('books');
console.log('libros en España →', [1000, 2400, 3990].map(spanishBookPrice)); // [1040, 2496, 4150]
console.log('formateadores Intl creados →', formattersCreated); // 2, aunque se han usado decenas de veces
```
