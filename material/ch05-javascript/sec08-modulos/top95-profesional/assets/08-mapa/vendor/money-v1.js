// «PAQUETE» money, VERSIÓN 1.4 (ejemplo 08 de «Ejemplos profesionales»).
// API antigua: recibe pesos con decimales (un number) y no separa los miles.
export const VERSION = '1.4.0';

export function format(pesos) {
  return `$${pesos.toFixed(2)}`;
}
