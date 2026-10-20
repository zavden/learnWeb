// Un módulo JavaScript normal, sin tipos. Lo importan los ejemplos 1, 2 y 4.
// Los precios van en centavos (enteros), para que las sumas no pierdan céntimos.
export const VAT_RATE = 0.16;

const formatters = new Map();

export function formatPrice(cents, currency = 'MXN') {
  if (!formatters.has(currency)) {
    formatters.set(currency, new Intl.NumberFormat('es-MX', { style: 'currency', currency }));
  }
  return formatters.get(currency).format(cents / 100);
}

export function withVat(cents) {
  return Math.round(cents * (1 + VAT_RATE));
}
