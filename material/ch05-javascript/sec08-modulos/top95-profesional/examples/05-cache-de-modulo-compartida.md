---
example_description: "Una caché de precios como singleton de módulo: todos los widgets que la importan comparten una instancia y una petición por precio; una copia duplicada del módulo (otra URL) crea otra caché, y Symbol.for en globalThis la comparte entre copias"
example_tags: "javascript|profesional|modulos|cache|singleton|symbol|estado-compartido"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// UNA CACHÉ DE PRECIOS COMPARTIDA POR TODA LA PÁGINA.
//
// Archivos (assets/05-cache/):
//   price-service.js     → fetchPrice(sku) (30 ms), server.requests, changePrice()
//   create-cache.js      → createPriceCache(load): get(), invalidate(), stats
//   price-cache.js       → export const priceCache = createPriceCache(fetchPrice)
//   shared-price-cache.js→ la misma caché, guardada en globalThis[Symbol.for(…)]
//   widgets/header.js, product-page.js → usan price-cache.js
//   widgets/legacy-banner.js → 🐛 importa price-cache.js?v=1.4 (otra copia)
//   widgets/shared-banner.js → ✅ importa shared-price-cache.js?v=1.4
//
// Decisiones:
// - La lógica (create-cache.js) no tiene estado de módulo: es una fábrica.
//   La instancia única vive en un módulo aparte, price-cache.js, que se
//   evalúa una vez: eso ya es un singleton, sin clases ni static instance.
// - La caché guarda promesas: peticiones simultáneas del mismo precio, una.
// - Dos copias del mismo módulo (dos URLs, o dos versiones de un paquete en
//   node_modules) son dos módulos con dos estados: el «dual package hazard».
//   Symbol.for + globalThis es el último recurso para compartir entre copias.
//
// Alcance: módulos 1-8.
import { server, changePrice } from './05-cache/price-service.js';
import { priceCache, copyNumber } from './05-cache/price-cache.js';
import { cartTotal } from './05-cache/widgets/header.js';
import { productPrice } from './05-cache/widgets/product-page.js';
import { bannerPrices, bannerCopy } from './05-cache/widgets/legacy-banner.js';
import { priceCache as sharedCache } from './05-cache/shared-price-cache.js';
import { bannerPrices as sharedBannerPrices, bannerCache } from './05-cache/widgets/shared-banner.js';

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const formatPrice = (cents) => money.format(cents / 100);

console.group('▶ tres widgets piden precios a la vez');
const [total, coffee, mill] = await Promise.all([
  cartTotal(['CAF-500', 'MOL-001']),
  productPrice('CAF-500'),
  productPrice('MOL-001'),
]);
console.log('carrito →', formatPrice(total), '| café →', formatPrice(coffee), '| molinillo →', formatPrice(mill));
console.log('peticiones al servidor →', server.requests, '(una por precio distinto)');
console.log('caché →', priceCache.stats);
console.groupEnd();

console.group('▶ 🐛 un widget con su propia copia del módulo');
let before = server.requests;
await bannerPrices(['CAF-500', 'MOL-001']);
console.log('copia de la página →', copyNumber, '| copia del widget →', bannerCopy);
console.log('peticiones repetidas de precios que ya estaban en caché →', server.requests - before);
console.groupEnd();

console.group('▶ ✅ la caché compartida entre copias');
before = server.requests;
await sharedCache.get('TAZ-002');
await sharedBannerPrices(['TAZ-002']);
console.log('¿las dos copias usan el mismo objeto? →', sharedCache === bannerCache);
console.log('peticiones →', server.requests - before, '| caché compartida →', sharedCache.stats);
console.groupEnd();

console.group('▶ el precio del café cambia en el servidor');
changePrice('CAF-500', 22500);
console.log('sin invalidar →', formatPrice(await productPrice('CAF-500')), '(el valor de la caché)');
priceCache.invalidate('CAF-500');
console.log('tras invalidar →', formatPrice(await productPrice('CAF-500')));
console.groupEnd();

// > Desde Python: un módulo con un dict de nivel superior es el mismo
//   singleton (sys.modules garantiza una evaluación), y functools.cache
//   la versión para funciones. El «paquete duplicado» no existe en Python:
//   solo puede haber una versión de cada paquete instalada.
```
