// APLICACIÓN (ejemplo 01). Está en 01-rutas/, así que «./ui/receipt.js»
// es 01-rutas/ui/receipt.js.
import { receiptLine } from './ui/receipt.js';

export const HERE = import.meta.url.slice(import.meta.url.indexOf('01-rutas/'));

export function start() {
  return receiptLine('Café de Chiapas 500 g', 21000);
}
