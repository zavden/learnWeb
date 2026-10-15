// CARRITO (ejemplo 08): código nuevo, importa «money» por su nombre.
// El import map de la página decide que «money» es la versión 2.
import { formatPrice, VERSION } from 'money';

export const MONEY = { version: VERSION, url: import.meta.resolve('money') };

export function cartLine(name, cents, quantity) {
  return `${quantity} × ${name} · ${formatPrice(cents * quantity)}`;
}
