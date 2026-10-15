// DINERO (ejemplo 05 de «Organizar el código»): exporta format.
export function format(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}
export const CURRENCY = 'MXN';
