// TRADUCCIONES (ejemplo 03 de «Integración»): el dueño del idioma actual.
// Cada catálogo es un JSON en locales/, importado con import() y
// with { type: 'json' } solo cuando se elige ese idioma.

export const SUPPORTED = ['es-MX', 'en-US'];

export let locale = null; // enlace vivo: quien lo importe ve el idioma actual
let messages = {};
let money = null;
export const loads = []; // registro de cargas { tag, catalog }, para el ejemplo

export async function setLocale(tag) {
  if (!SUPPORTED.includes(tag)) throw new RangeError(`Idioma no admitido: ${tag}`);
  const { default: catalog } = await import(`./locales/${tag}.json`, { with: { type: 'json' } });
  loads.push({ tag, catalog });
  messages = catalog;
  money = new Intl.NumberFormat(tag, { style: 'currency', currency: catalog.currency });
  locale = tag; // al final: si la carga falla, el idioma anterior sigue entero
}

// t('total', { amount: '$10.00' }) → «Total: $10.00». Sin expresiones
// regulares: split + join cambia cada {nombre} por su valor.
export function t(key, params = {}) {
  let text = messages[key] ?? key; // sin traducción: la clave, para que se note
  for (const [name, value] of Object.entries(params)) text = text.split(`{${name}}`).join(String(value));
  return text;
}

export function tCount(key, count) {
  return t(`${key}.${count === 1 ? 'one' : 'other'}`, { count });
}

export function formatPrice(cents) {
  return money.format(cents / 100);
}
