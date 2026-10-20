// CLIENTES, SIN CICLO (ejemplo 08): solo depende de tax.js.
import { TAX_RATE } from './tax.js';
console.log('  (evaluando customers.js)');

const CUSTOMERS = new Map([
  ['C-1', 'Mariana Gómez'],
  ['C-2', 'Iker Salas'],
]);

export const TAX_NOTE = `Precios con IVA (${Math.round(TAX_RATE * 100)} %)`;

export function customerName(id) {
  return CUSTOMERS.get(id) ?? 'cliente desconocido';
}
