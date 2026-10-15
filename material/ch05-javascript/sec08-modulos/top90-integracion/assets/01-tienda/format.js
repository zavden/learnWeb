// FORMATO (ejemplo 01): funciones puras.
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

export function formatPrice(cents) {
  return money.format(cents / 100);
}

export function plural(count, singular, pluralForm) {
  return `${count} ${count === 1 ? singular : pluralForm}`;
}
