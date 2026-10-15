// FICHA DE PRODUCTO (ejemplo 07): el botón «Comprar» añade al carrito.
import { add } from './store.js';

export function buy(name) {
  return add(name);
}
