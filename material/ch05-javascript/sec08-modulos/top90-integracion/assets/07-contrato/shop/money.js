// DINERO (ejemplo 07 de «Integración»).
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

export function formatPrice(cents) {
  return money.format(cents / 100);
}

export function addVat(cents) {
  return Math.round(cents * 1.16);
}
