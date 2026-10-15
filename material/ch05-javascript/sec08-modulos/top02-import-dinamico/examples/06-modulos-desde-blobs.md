---
example_description: "Varios «archivos» en un solo ejemplo: el código de cada módulo es un texto, un Blob le da una URL (blob:…) e import() lo carga; un módulo importa al otro por su URL completa"
example_tags: "javascript|modulos|import-dinamico|blob|object-url"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// Sin archivos en assets/: los dos módulos se crean aquí, a partir de textos.
// Así funcionan los «playgrounds» como LearnWeb o CodePen: el código que
// escribes es un texto, y el navegador necesita una URL para cargarlo.

function moduleUrl(code) {
  // Blob: datos en memoria con un tipo; createObjectURL les da una URL.
  return URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
}

// «Archivo» 1: los precios.
const pricesUrl = moduleUrl(`
export const PRICES = { 'café de Chiapas': 21000, 'molinillo manual': 54900 };
export function priceOf(name) { return PRICES[name] ?? 0; }
`);

// «Archivo» 2: el carrito. Importa el 1 por su URL COMPLETA, interpolada en
// el texto: dentro de un blob, una ruta como './prices.js' no funciona
// (ejemplo 07).
const cartUrl = moduleUrl(`
import { priceOf } from '${pricesUrl}';
export function totalCents(names) {
  return names.reduce((sum, name) => sum + priceOf(name), 0);
}
`);

console.log('¿es una URL de blob? →', cartUrl.startsWith('blob:'));
const { totalCents } = await import(cartUrl);
console.log('total →', totalCents(['café de Chiapas', 'café de Chiapas', 'molinillo manual']));

// Revocar libera la memoria del Blob. El módulo ya está en el mapa de
// módulos, así que lo importado sigue funcionando.
URL.revokeObjectURL(pricesUrl);
URL.revokeObjectURL(cartUrl);
console.log('después de revocar →', totalCents(['molinillo manual']));
```
