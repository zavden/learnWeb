// DINERO (ejemplo 03 de «Organizar el código»).
console.log('  (evaluando money.js)');

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

export function formatPrice(cents) {
  return money.format(cents / 100);
}

export function addVat(cents) {
  return Math.round(cents * 1.16);
}
