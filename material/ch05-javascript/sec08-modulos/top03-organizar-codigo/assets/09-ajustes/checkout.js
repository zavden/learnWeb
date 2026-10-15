// CAJA (ejemplo 09): calcula el envío con los ajustes compartidos.
import { settings } from './settings.js';

export function shippingCents(subtotalCents) {
  return subtotalCents >= settings.freeShippingFromCents ? 0 : settings.shippingCents;
}
