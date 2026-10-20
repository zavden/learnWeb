---
example_description: "Solución: await en import(), { default } para el export por defecto, with { type: 'json' }, import.meta.resolve dentro del blob, un objeto nuevo para la promo y un try/catch con el español como alternativa"
example_tags: "javascript|solucion|modulos|import-dinamico|bugs|json|blob"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// SOLUCIÓN: los seis bugs, arreglados (cada arreglo lleva un ✅).
import { settings, shippingFor } from './10-ej/settings.js';

function moduleUrl(code) {
  return URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
}

async function getVat(country) {
  const tax = await import('./10-ej/tax.js'); // ✅ await: el módulo, no su promesa
  return tax.vatFor(country);
}

async function productSlug(name) {
  const { default: slugify } = await import('./10-ej/slug.js'); // ✅ la clave default
  return slugify(name);
}

async function catalogSize() {
  const { default: catalog } = await import('./10-ej/catalog.json', { with: { type: 'json' } }); // ✅
  return catalog.products.length;
}

async function coffeePriceFromBlob() {
  const pricesUrl = import.meta.resolve('./10-ej/prices.js'); // ✅ URL completa, resuelta aquí
  const url = moduleUrl(`import { priceOf } from '${pricesUrl}';
export default priceOf('café de Chiapas');`);
  return (await import(url)).default;
}

function freeShippingPreview(subtotalCents) {
  const promo = { ...settings, freeShippingFromCents: 0 }; // ✅ un objeto nuevo
  return shippingFor(subtotalCents, promo);
}

async function loadMessages(lang) {
  try {
    const { default: messages } = await import(`./10-ej/messages/${lang}.json`, { with: { type: 'json' } });
    return messages;
  } catch { // ✅ un idioma que no existe: el español
    const { default: messages } = await import('./10-ej/messages/es.json', { with: { type: 'json' } });
    return messages;
  }
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
async function check(description, compute, expected) {
  let actual;
  try {
    const limit = new Promise((resolve) => setTimeout(resolve, 2000, '⏰ no terminó en 2 s'));
    actual = await Promise.race([compute(), limit]);
  } catch (error) {
    actual = `${error.name}: ${error.message}`;
  }
  if (actual === expected) console.log('✓', description);
  else console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
}

await check('1. getVat(\'MX\')', () => getVat('MX'), 0.16);
await check('2. productSlug(\'Café de Olla 500 g\')', () => productSlug('Café de Olla 500 g'), 'cafe-de-olla-500-g');
await check('3. catalogSize()', () => catalogSize(), 3);
await check('4. coffeePriceFromBlob()', () => coffeePriceFromBlob(), 21000);
await check('5. freeShippingPreview(50000) da envío gratis', async () => freeShippingPreview(50000), 0);
await check('5b. …sin cambiar el envío de la tienda', async () => shippingFor(50000), 14900);
await check('6. loadMessages(\'en\')', async () => (await loadMessages('en')).cartTitle, 'Your cart');
await check('6b. loadMessages(\'fr\') usa el español', async () => (await loadMessages('fr')).cartTitle, 'Tu carrito');
```
