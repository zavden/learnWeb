// FORMATO — funciones puras (ejemplo 01 de «Ejemplos profesionales»).
// No conoce la tienda, no guarda estado y no toca el DOM: se puede usar y
// probar en cualquier parte.

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

export function formatPrice(cents) {
  return money.format(cents / 100);
}

export function formatCount(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`;
}
