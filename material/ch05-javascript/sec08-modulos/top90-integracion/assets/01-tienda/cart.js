// CARRITO (ejemplo 01): el DUEÑO del estado del carrito.
// Nadie de fuera puede tocar lines: solo estas funciones lo cambian, y
// avisan a quien se haya suscrito (el patrón observador del módulo 5).
import { findProduct } from './products.js';

const lines = new Map(); // privado: sku → cantidad
const listeners = new Set();

// Un let exportado: quien lo importe verá siempre el valor actual (enlace
// vivo), también a través del barrel index.js. Solo este módulo lo cambia.
export let itemCount = 0;

export function addToCart(sku) {
  findProduct(sku); // valida que exista antes de cambiar nada
  lines.set(sku, (lines.get(sku) ?? 0) + 1);
  itemCount += 1;
  notify();
}

export function cartLines() {
  return [...lines].map(([sku, quantity]) => ({ ...findProduct(sku), quantity }));
}

export function cartTotalCents() {
  return cartLines().reduce((sum, line) => sum + line.cents * line.quantity, 0);
}

export function onCartChange(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener); // función para darse de baja
}

function notify() {
  for (const listener of [...listeners]) listener();
}
