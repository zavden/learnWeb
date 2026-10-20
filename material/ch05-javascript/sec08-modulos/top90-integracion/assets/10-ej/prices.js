// PRECIOS (ejercicio «Caza los bugs de módulos»).
const PRICES = { 'café de Chiapas': 21000, 'molinillo manual': 54900 };

export function priceOf(name) {
  return PRICES[name] ?? 0;
}
