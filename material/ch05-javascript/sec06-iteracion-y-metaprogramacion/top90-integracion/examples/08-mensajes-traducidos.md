---
example_description: "Una etiqueta de traducción: la clave del catálogo sale de los trozos de la plantilla, cada traducción puede reordenar los valores, el análisis se guarda en una caché por sitio del código (WeakMap con strings) y los valores se formatean con Intl o con un protocolo propio de clave symbol"
example_tags: "javascript|plantillas|tagged-templates|intl|symbol|weakmap|i18n|integracion"
example_stage: intermediate
example_importance: useful
console: true
---

# JavaScript

```javascript
// LOS MENSAJES DE UNA TIENDA EN ESPAÑOL Y EN INGLÉS con una etiqueta t`…`.
// Lecciones: plantillas etiquetadas (trozos = clave, valores = datos), el
// array strings como clave de caché, un protocolo propio con símbolo e Intl
// con idioma y zona horaria fijos.
const FORMAT = Symbol('i18n.format'); // protocolo: valor[FORMAT](locale) → texto

class Money {
  constructor(cents, currency) {
    Object.assign(this, { cents, currency });
  }
  [FORMAT](locale) {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: this.currency }).format(this.cents / 100);
  }
}

function plural(count, forms) { // forms: { 'es-MX': { one, other }, 'en-US': { … } }
  return {
    [FORMAT](locale) {
      const rule = new Intl.PluralRules(locale).select(count); // 'one' o 'other'
      return `${count} ${forms[locale][rule]}`;
    },
  };
}

const catalog = {
  'en-US': {
    'Hola, {0}: tu pedido de {1} llega el {2}.': 'Hi {0}! Your {1} order arrives on {2}.',
    'Llevas {0} en el carrito.': 'You have {0} in your cart.',
  },
};

// 'Hi {0}! Your {1}…' → ['Hi ', 0, '! Your ', 1, …] (texto y posiciones)
function parseMessage(message) {
  const parts = [];
  message.split('{').forEach((piece, i) => {
    if (i === 0) return parts.push(piece);
    const close = piece.indexOf('}');
    parts.push(Number(piece.slice(0, close)), piece.slice(close + 1));
  });
  return parts;
}

function formatValue(value, locale) {
  if (typeof value?.[FORMAT] === 'function') return value[FORMAT](locale);
  if (typeof value === 'number') return new Intl.NumberFormat(locale).format(value);
  if (value instanceof Date) {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeZone: 'America/Mexico_City' }).format(value);
  }
  return String(value);
}

let calls = 0;
let parses = 0;
const cache = new WeakMap(); // strings (un sitio del código) → Map(idioma → partes)

function translator(locale) {
  return function t(strings, ...values) {
    calls += 1;
    if (!cache.has(strings)) cache.set(strings, new Map());
    const byLocale = cache.get(strings);
    if (!byLocale.has(locale)) {
      parses += 1;
      const key = strings.reduce((text, part, i) => `${text}{${i - 1}}${part}`); // 'Hola, {0}: …'
      byLocale.set(locale, parseMessage(catalog[locale]?.[key] ?? key)); // sin traducción: el original
    }
    return byLocale.get(locale).map((part) => (typeof part === 'number' ? formatValue(values[part], locale) : part)).join('');
  };
}

const PRODUCT = { 'es-MX': { one: 'producto', other: 'productos' }, 'en-US': { one: 'item', other: 'items' } };
const order = {
  customer: 'Valeria',
  total: new Money(125050, 'MXN'),
  delivery: new Date('2026-10-16T17:00:00Z'), // un instante; se muestra en la zona de la tienda
};

for (const locale of ['es-MX', 'en-US']) {
  const t = translator(locale);
  console.group(locale);
  console.log(t`Hola, ${order.customer}: tu pedido de ${order.total} llega el ${order.delivery}.`);
  for (const count of [1, 3]) console.log(t`Llevas ${plural(count, PRODUCT)} en el carrito.`);
  console.log(t`Mensaje sin traducir: ${1234.5} puntos.`);
  console.groupEnd();
}
console.log('llamadas a t →', calls, '| mensajes analizados →', parses, '(uno por sitio del código e idioma)');
```
