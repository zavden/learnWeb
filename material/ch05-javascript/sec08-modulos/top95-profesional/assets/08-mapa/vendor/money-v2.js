// «PAQUETE» money, VERSIÓN 2.1 (ejemplo 08). API nueva e incompatible:
// recibe centavos (enteros, sin errores de redondeo) y usa Intl.
export const VERSION = '2.1.0';

export function formatPrice(cents, { locale = 'es-MX', currency = 'MXN' } = {}) {
  return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(cents / 100);
}
