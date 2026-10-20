// ✅ LOS MISMOS FORMATEADORES COMO EXPORTACIONES CON NOMBRE (ejemplo 10).
// Cada función sale con su nombre: se importa solo la que haga falta, el
// editor la autocompleta y un empaquetador puede descartar las que nadie usa.

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const weight = new Intl.NumberFormat('es-MX', { style: 'unit', unit: 'kilogram' });

export function formatPrice(cents) {
  return money.format(cents / 100);
}

export function formatWeight(grams) {
  return weight.format(grams / 1000);
}
