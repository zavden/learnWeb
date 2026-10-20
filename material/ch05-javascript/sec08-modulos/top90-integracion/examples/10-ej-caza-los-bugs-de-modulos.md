---
example_description: "Ejercicio: seis funciones de una tienda con un bug de módulos cada una (el await que falta, la clave default, el JSON sin with, la ruta relativa dentro de un blob, el objeto exportado que se modifica y la carga sin alternativa)"
example_tags: "javascript|ejercicio|modulos|import-dinamico|bugs|json|blob"
exercise: true
exercise_title: "Caza los bugs de módulos"
exercise_instructions: "Cada función tiene un bug, y todos son del Bestiario de este módulo. Ninguno detiene el script: lee el ✗ de cada comprobación || 1. getVat: import() devuelve una promesa || 2. productSlug: slug.js solo tiene exportación por defecto || 3. catalogSize: falta algo para importar un JSON || 4. coffeePriceFromBlob: dentro de un blob no funcionan las rutas relativas (este script es un módulo: puedes usar import.meta) || 5. freeShippingPreview: no debe cambiar los ajustes de toda la tienda || 6. loadMessages: si el idioma no existe, debe usar el español || Ejecuta hasta que las ocho comprobaciones salgan ✓ (dos ya salen ✓ y deben seguir así)"
exercise_hints: "1: await import(…) || 2: const { default: slugify } = await import(…) || 3: import(ruta, { with: { type: 'json' } }) || 4: import.meta.resolve('./10-ej/prices.js') da la URL completa; escríbela dentro del texto del módulo || 5: { ...settings, freeShippingFromCents: 0 } crea un objeto nuevo || 6: un try/catch alrededor de la carga, y en el catch, la carga de es.json"
exercise_solution_example: 10-ej-caza-los-bugs-de-modulos-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
// EJERCICIO: seis bugs de módulos, uno por función. Arréglalos todos.
// Archivos que usa (assets/10-ej/):
//   tax.js       → export function vatFor(country)
//   slug.js      → export default function slugify(text)
//   catalog.json → { "products": [ … tres productos … ] }
//   prices.js    → export function priceOf(name)
//   settings.js  → export const settings = { … }; export function shippingFor(subtotal, rules)
//   messages/es.json, messages/en.json (no hay fr.json)
import { settings, shippingFor } from './10-ej/settings.js';

function moduleUrl(code) {
  return URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
}

// 1. El IVA de un país.
async function getVat(country) {
  const tax = import('./10-ej/tax.js');
  return tax.vatFor(country);
}

// 2. El slug de un producto para su URL.
async function productSlug(name) {
  const slugify = await import('./10-ej/slug.js');
  return slugify(name);
}

// 3. Cuántos productos hay en el catálogo.
async function catalogSize() {
  const { default: catalog } = await import('./10-ej/catalog.json');
  return catalog.products.length;
}

// 4. Un módulo generado al vuelo que usa prices.js.
async function coffeePriceFromBlob() {
  const url = moduleUrl(`import { priceOf } from './10-ej/prices.js';
export default priceOf('café de Chiapas');`);
  return (await import(url)).default;
}

// 5. Vista previa del envío con la promo «envío gratis».
function freeShippingPreview(subtotalCents) {
  const promo = settings;
  promo.freeShippingFromCents = 0;
  return shippingFor(subtotalCents, promo);
}

// 6. Los textos de un idioma.
async function loadMessages(lang) {
  const { default: messages } = await import(`./10-ej/messages/${lang}.json`, { with: { type: 'json' } });
  return messages;
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
