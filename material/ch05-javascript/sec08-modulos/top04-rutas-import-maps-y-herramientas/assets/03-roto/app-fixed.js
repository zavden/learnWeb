// ✅ LA MISMA APLICACIÓN CON LA RUTA COMPLETA (ejemplo 03).
import { track } from './analytics.js';
import { formatPrice } from './format.js';

export function checkout(cents) {
  return `${track('checkout')} · ${formatPrice(cents)}`;
}
