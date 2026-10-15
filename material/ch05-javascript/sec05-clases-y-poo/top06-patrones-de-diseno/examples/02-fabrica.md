---
example_description: "Una función fábrica crea objetos sin new ni this: reutiliza instancias de una caché, devuelve objetos congelados con funciones que se pueden pasar como callbacks y oculta qué se construye"
example_tags: "javascript|python|patrones|fabrica|closures|cache|intl"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
const cache = new Map(); // un formateador por combinación de idioma y moneda

// Fábrica: una función normal que decide CÓMO y CUÁNDO se crea el objeto.
function createPriceFormatter({ locale = 'es-MX', currency = 'MXN' } = {}) {
  const key = `${locale}|${currency}`;
  if (cache.has(key)) return cache.get(key); // new siempre crearía uno nuevo

  const numberFormat = new Intl.NumberFormat(locale, { style: 'currency', currency });
  // Sin this: las funciones usan variables del closure.
  const format = (cents) => numberFormat.format(cents / 100);
  const formatRange = (fromCents, toCents) => `${format(fromCents)} – ${format(toCents)}`;

  const formatter = Object.freeze({ locale, currency, format, formatRange });
  cache.set(key, formatter);
  return formatter;
}

const mexico = createPriceFormatter();
const spain = createPriceFormatter({ locale: 'es-ES', currency: 'EUR' });
const usa = createPriceFormatter({ locale: 'en-US', currency: 'USD' });

console.log('México →', mexico.format(129900), '| España →', spain.format(129900), '| EE. UU. →', usa.format(129900));
console.log('rango →', mexico.formatRange(49900, 129900));

// 1. Reutiliza: la misma combinación devuelve el MISMO objeto.
console.log('¿el mismo? →', createPriceFormatter() === mexico);

// 2. Sus funciones no dependen de this: se pueden pasar como callbacks.
const { format } = spain;
console.log('map(format) →', [990, 2450, 12000].map(format));

// 3. Congelado: nadie puede estropear un formateador compartido.
mexico.currency = 'USD';
console.log('currency tras asignar →', mexico.currency);

// Comparación con una clase: new PriceFormatter(…) crea siempre un objeto
// nuevo, obliga a escribir new y sus métodos pierden this al separarlos.
// A cambio, la clase comparte los métodos en el prototipo e instanceof funciona.

// > Desde Python: una función que devuelve objetos, a menudo con
//   @functools.cache para reutilizarlos; o un @classmethod como constructor
//   alternativo (los estáticos de la lección «Encapsulación»).
```
