// 🐛 APLICACIÓN CON UNA RUTA MAL ESCRITA (ejemplo 03).
import { track } from './analytics.js'; // ✅ existe
import { formatPrice } from './format'; // 🐛 sin .js → 404

export function checkout(cents) {
  return `${track('checkout')} · ${formatPrice(cents)}`;
}
