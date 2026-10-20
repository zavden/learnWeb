---
example_description: "Formateador de mensajes multilingüe: catálogo con plurales de Intl.PluralRules (el polaco tiene cuatro formas), ordinales, listas, monedas y fechas por mercado, idiomas de reserva y revisión del catálogo con Set"
example_tags: "javascript|profesional|intl|i18n|strings|set"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// MENSAJES MULTILINGÜES de una tienda que vende en cinco mercados.
//
// El error clásico: count === 1 ? 'producto' : 'productos'. Funciona en español y en
// inglés… y falla en polaco, que tiene CUATRO formas (1 produkt, 2 produkty,
// 5 produktów, 1,5 produktu), o en árabe, que tiene seis. La solución profesional:
// - Un CATÁLOGO de mensajes por idioma, con una variante por categoría de plural.
// - Intl.PluralRules elige la categoría ('one', 'few', 'many', 'other'…) del idioma.
// - Los valores ({count}, {total}, {date}, {people}) se formatean con Intl en el idioma
//   y la moneda de cada mercado, y se insertan en la plantilla.
// - Si falta un mensaje, se usa el del idioma de reserva (y se avisa).
//
// Alcance: function y las flechas, en «Funciones y ámbito».

const DEFAULT_LANGUAGE = 'en';

const MESSAGES = {
  es: {
    cartSummary: {
      one: 'Tienes {count} producto en la cesta ({total}).',
      other: 'Tienes {count} productos en la cesta ({total}).',
    },
    lowStock: { one: '¡Solo queda {count} unidad!', other: '¡Solo quedan {count} unidades!' },
    sharedWith: 'Lista de deseos compartida con {people}.',
    delivery: 'Llegará el {date}.',
    reviewRank: 'Es la {position}.ª reseña más útil.',
  },
  'es-MX': {
    cartSummary: {
      one: 'Tienes {count} producto en el carrito ({total}).',
      other: 'Tienes {count} productos en el carrito ({total}).',
    },
  },
  en: {
    cartSummary: {
      one: 'You have {count} item in your basket ({total}).',
      other: 'You have {count} items in your basket ({total}).',
    },
    lowStock: { one: 'Only {count} left!', other: 'Only {count} left!' },
    sharedWith: 'Wish list shared with {people}.',
    delivery: 'Arriving on {date}.',
    reviewRank: 'This is the {position} most helpful review.',
  },
  'en-US': {
    cartSummary: {
      one: 'You have {count} item in your cart ({total}).',
      other: 'You have {count} items in your cart ({total}).',
    },
  },
  pl: {
    cartSummary: {
      one: 'Masz {count} produkt w koszyku ({total}).',
      few: 'Masz {count} produkty w koszyku ({total}).',
      many: 'Masz {count} produktów w koszyku ({total}).',
      other: 'Masz {count} produktu w koszyku ({total}).',
    },
    lowStock: {
      one: 'Została tylko {count} sztuka!',
      few: 'Zostały tylko {count} sztuki!',
      many: 'Zostało tylko {count} sztuk!',
      other: 'Zostało tylko {count} sztuki!',
    },
    sharedWith: 'Lista życzeń udostępniona: {people}.',
    delivery: 'Dostawa: {date}.',
    // reviewRank no está traducido todavía: se usará el inglés.
  },
};

// Cada mercado: idioma, moneda y zona horaria.
const MARKETS = [
  { locale: 'es-ES', currency: 'EUR' },
  { locale: 'es-MX', currency: 'MXN' },
  { locale: 'en-US', currency: 'USD' },
  { locale: 'en-GB', currency: 'GBP' },
  { locale: 'pl-PL', currency: 'PLN' },
];

// ── Buscar el mensaje: es-MX → es → en ──────────────────────────────────

function lookup(locale, key) {
  const language = locale.split('-')[0];
  for (const candidate of [locale, language, DEFAULT_LANGUAGE]) {
    // Object.hasOwn: MESSAGES[candidate][key] no debe encontrar nada heredado.
    if (Object.hasOwn(MESSAGES, candidate) && Object.hasOwn(MESSAGES[candidate], key)) {
      if (candidate !== locale && candidate !== language) {
        console.warn(`[${locale}] falta «${key}»: se usa el de «${candidate}»`);
      }
      return { message: MESSAGES[candidate][key], language: candidate.split('-')[0] };
    }
  }
  throw new RangeError(`El mensaje «${key}» no existe en ningún idioma`); // fallo del programa
}

// ── Rellenar la plantilla: 'Hola {name}' + { name: 'Ana' } → 'Hola Ana' ─

function fill(template, values) {
  let result = '';
  let index = 0;
  while (index < template.length) {
    const open = template.indexOf('{', index);
    if (open === -1) {
      result += template.slice(index);
      break;
    }
    const close = template.indexOf('}', open);
    if (close === -1) throw new SyntaxError(`falta «}» en «${template}»`);
    const name = template.slice(open + 1, close);
    result += template.slice(index, open);
    // Un hueco sin valor se deja visible: mejor «{total}» que «undefined».
    result += Object.hasOwn(values, name) ? values[name] : `{${name}}`;
    index = close + 1;
  }
  return result;
}

// ── Formatear: elegir plural, formatear valores y rellenar ──────────────

function translate(market, key, params) {
  const { locale, currency } = market;
  const { message, language } = lookup(locale, key);

  // Valores formateados con el idioma y la moneda del MERCADO (aunque el texto sea de reserva).
  const values = {};
  if (params.count !== undefined) values.count = new Intl.NumberFormat(locale).format(params.count);
  if (params.totalCents !== undefined) {
    values.total = new Intl.NumberFormat(locale, { style: 'currency', currency }).format(params.totalCents / 100);
  }
  if (params.people !== undefined) values.people = new Intl.ListFormat(locale, { type: 'conjunction' }).format(params.people);
  if (params.date !== undefined) {
    // Fecha de calendario (medianoche UTC): se muestra en UTC para que no cambie de día.
    values.date = new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeZone: 'UTC' }).format(params.date);
  }
  if (params.position !== undefined) {
    values.position = language === 'en' ? englishOrdinal(params.position) : String(params.position);
  }

  // Mensaje con plurales: la categoría la decide el idioma del TEXTO que se va a usar.
  let template = message;
  if (typeof message === 'object') {
    const category = new Intl.PluralRules(language).select(params.count);
    template = message[category] ?? message.other; // categoría sin traducir → 'other'
  }
  return fill(template, values);
}

// 1st, 2nd, 3rd, 4th, 11th, 21st…: PluralRules con type 'ordinal'.
const ORDINAL_SUFFIXES = { one: 'st', two: 'nd', few: 'rd', other: 'th' };
const englishOrdinals = new Intl.PluralRules('en', { type: 'ordinal' });
function englishOrdinal(number) {
  return `${number}${ORDINAL_SUFFIXES[englishOrdinals.select(number)]}`;
}

// ── 🐛 El atajo que no sirve ────────────────────────────────────────────

const naiveForms = { singular: 'produkt', plural: 'produkty' };
for (const count of [1, 2, 5, 12, 22]) {
  const naive = count === 1 ? naiveForms.singular : naiveForms.plural;
  const right = translate(MARKETS[4], 'cartSummary', { count, totalCents: 0 }).split(' ')[2]; // 3.ª palabra
  const mark = naive === right ? '✓' : '🐛';
  console.log(`${String(count).padStart(2)}: count === 1 → ${naive.padEnd(9)} ${mark} · PluralRules → ${right}`);
}

// ── Los mensajes en cada mercado ────────────────────────────────────────

const deliveryDay = new Date('2026-11-04'); // solo fecha: medianoche UTC
for (const market of MARKETS) {
  console.group(market.locale);
  console.log(translate(market, 'cartSummary', { count: 1, totalCents: 1190 }));
  console.log(translate(market, 'cartSummary', { count: 3, totalCents: 123450 }));
  console.log(translate(market, 'lowStock', { count: 2 }));
  console.log(translate(market, 'sharedWith', { people: ['Ana', 'Kuba', 'Ola'] }));
  console.log(translate(market, 'delivery', { date: deliveryDay }));
  console.log(translate(market, 'reviewRank', { position: 2 }));
  console.groupEnd();
}

// ── Revisión del catálogo: claves y categorías de plural que faltan ─────

const referenceKeys = new Set(Object.keys(MESSAGES[DEFAULT_LANGUAGE]));
console.group('Revisión del catálogo');
for (const language of Object.keys(MESSAGES).filter((name) => !name.includes('-'))) {
  const missingKeys = referenceKeys.difference(new Set(Object.keys(MESSAGES[language])));
  if (missingKeys.size > 0) console.log(`${language}: sin traducir → ${[...missingKeys].join(', ')}`);

  const needed = new Set(new Intl.PluralRules(language).resolvedOptions().pluralCategories);
  for (const [key, message] of Object.entries(MESSAGES[language])) {
    if (typeof message !== 'object') continue;
    const missing = needed.difference(new Set(Object.keys(message)));
    if (missing.size > 0) console.log(`${language}.${key}: sin la categoría ${[...missing].join(', ')} (se usará 'other')`);
  }
}
console.groupEnd();
// En español, CLDR define 'many' para los millones exactos («1 millón de productos»):
console.log("PluralRules('es').select(1_000_000) →", new Intl.PluralRules('es').select(1_000_000));
```
