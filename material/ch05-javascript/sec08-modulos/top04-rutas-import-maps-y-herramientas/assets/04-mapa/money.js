// DINERO (ejemplo 04 de «Rutas, import maps y herramientas»).
// La página lo importa con el nombre «money», sin ruta, gracias al import map.
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

export function formatPrice(cents) {
  return money.format(cents / 100);
}
