// TICKET (ejemplo 01). Está en ui/, así que «../shared/format.js» sube a
// 01-rutas/ y entra en shared/: las rutas se resuelven contra ESTE archivo,
// no contra la página que lo usa.
import { formatPrice } from '../shared/format.js';

export const HERE = import.meta.url.slice(import.meta.url.indexOf('01-rutas/'));

// Un recurso que vive junto a este archivo: new URL(ruta, import.meta.url)
// da su URL completa, la use quien la use (para fetch, capítulo 6).
export const TEMPLATE_URL = new URL('./receipt-template.txt', import.meta.url).href;

export function receiptLine(name, cents) {
  return `${name}: ${formatPrice(cents)}`;
}
