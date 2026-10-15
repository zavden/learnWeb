// MÓDULO COMPARTIDO (ejemplo 03): lo importa module-worker.js con import.
export function formatMXN(value) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(value);
}
