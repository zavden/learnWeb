// CABECERA DE LA TIENDA (ejemplo 07): muestra cuántos productos hay.
// Importa el MISMO store.js que product-page.js: comparten el array items.
import { items } from './store.js';

export function badge() {
  return `🛒 ${items.length}`;
}
