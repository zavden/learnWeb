// 🐛 UNA PROMOCIÓN QUE «SOLO» QUERÍA PROBAR EL ENVÍO GRATIS (ejemplo 09).
// Cambia el objeto compartido: la caja de TODA la tienda lo nota.
import { settings } from './settings.js';

export function previewSummerPromo() {
  settings.freeShippingFromCents = 0;
  return 'vista previa de la promo de verano';
}
