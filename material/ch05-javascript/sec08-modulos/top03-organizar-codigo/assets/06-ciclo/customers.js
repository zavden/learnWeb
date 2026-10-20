// CLIENTES (ejemplos 06 y 07): 🔁 importa orders.js, que importa este archivo.
import { TAX_RATE } from './orders.js';
console.log('  (evaluando customers.js)');

const CUSTOMERS = new Map([
  ['C-1', 'Mariana Gómez'],
  ['C-2', 'Iker Salas'],
]);

// 🐛 TAX_RATE se usa en el NIVEL SUPERIOR, al evaluar este módulo. Si
//    orders.js todavía no se ha evaluado, su const está en la zona muerta
//    temporal (TDZ) y esta línea lanza un ReferenceError.
export const TAX_NOTE = `Precios con IVA (${Math.round(TAX_RATE * 100)} %)`;

export function customerName(id) {
  return CUSTOMERS.get(id) ?? 'cliente desconocido';
}
