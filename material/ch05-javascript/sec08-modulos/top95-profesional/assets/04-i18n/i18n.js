// TRADUCCIONES (ejemplo 04 de «Ejemplos profesionales»).
//
// - negotiate() elige el mejor idioma disponible para una lista de
//   preferencias (como navigator.languages): primero la etiqueta exacta,
//   después el mismo idioma con otra región, y si no, el idioma por defecto.
// - Cada catálogo es un módulo que se carga con import() solo cuando hace
//   falta; las cargas se guardan como PROMESAS, así que dos peticiones
//   simultáneas del mismo idioma comparten una.
// - Cada idioma tiene UN traductor (también guardado como promesa), que
//   acumula los textos que le faltan.
// - t() elige la forma de plural con Intl.PluralRules (cada idioma tiene sus
//   reglas) y, si un texto falta, usa el del idioma por defecto y lo apunta
//   en missing para que alguien lo traduzca.
// - Fechas y precios con Intl, con zona horaria fija: el resultado no depende
//   del ordenador de quien mira.

const LOADERS = {
  'es-MX': () => import('./locales/es-MX.js'),
  'en-US': () => import('./locales/en-US.js'),
  'pt-BR': () => import('./locales/pt-BR.js'),
};

export const AVAILABLE = Object.keys(LOADERS);
export const DEFAULT_LOCALE = 'es-MX';
export const TIME_ZONE = 'America/Mexico_City';
export const stats = { loads: 0 };

export function negotiate(preferred, available = AVAILABLE, fallback = DEFAULT_LOCALE) {
  for (const tag of preferred) {
    if (available.includes(tag)) return tag;
    const { language } = new Intl.Locale(tag);
    const sameLanguage = available.find((candidate) => new Intl.Locale(candidate).language === language);
    if (sameLanguage) return sameLanguage;
  }
  return fallback;
}

const catalogs = new Map(); // locale → promesa del catálogo

function loadCatalog(locale) {
  if (!catalogs.has(locale)) {
    stats.loads += 1;
    catalogs.set(locale, LOADERS[locale]().then((namespace) => namespace.default));
  }
  return catalogs.get(locale);
}

function fill(template, params) {
  let text = template;
  for (const [name, value] of Object.entries(params)) text = text.split(`{${name}}`).join(String(value));
  return text;
}

const translators = new Map(); // locale → promesa del traductor (uno por idioma)

export function loadTranslator(locale) {
  if (!Object.hasOwn(LOADERS, locale)) return Promise.reject(new RangeError(`Idioma no disponible: ${locale}`));
  if (!translators.has(locale)) translators.set(locale, createTranslator(locale));
  return translators.get(locale);
}

async function createTranslator(locale) {
  const [catalog, fallback] = await Promise.all([loadCatalog(locale), loadCatalog(DEFAULT_LOCALE)]);
  const plurals = new Intl.PluralRules(locale);
  const money = new Intl.NumberFormat(locale, { style: 'currency', currency: catalog.currency });
  const dates = new Intl.DateTimeFormat(locale, { dateStyle: 'long', timeStyle: 'short', hourCycle: 'h23', timeZone: TIME_ZONE });
  const missing = new Set();

  function t(key, params = {}) {
    const fullKey = typeof params.count === 'number' ? `${key}.${plurals.select(params.count)}` : key;
    const template = catalog.messages[fullKey] ?? fallback.messages[fullKey];
    if (!(fullKey in catalog.messages)) missing.add(fullKey);
    return template === undefined ? `⟦${fullKey}⟧` : fill(template, params);
  }

  return Object.freeze({
    locale,
    t,
    formatPrice: (cents) => money.format(cents / 100),
    formatDate: (isoString) => dates.format(new Date(isoString)),
    missing: () => [...missing],
  });
}
