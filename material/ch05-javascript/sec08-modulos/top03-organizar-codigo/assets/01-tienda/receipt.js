// TICKET (ejemplo 01): presentación. Recibe un carrito y devuelve líneas de
// texto; usa format.js para el formato. No cambia el carrito.
import { formatPrice, padLine } from './format.js';

export function renderReceipt(cart) {
  const lines = cart.lines().map(({ product, quantity }) =>
    padLine(`${quantity} × ${product.name}`, formatPrice(product.cents * quantity)));
  lines.push(padLine('TOTAL', formatPrice(cart.totalCents())));
  return lines;
}
