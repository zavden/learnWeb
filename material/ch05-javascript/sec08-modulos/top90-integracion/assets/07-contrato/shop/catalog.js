// CATÁLOGO (ejemplo 07).
const PRODUCTS = new Map([
  ['CAF-500', { name: 'Café de Chiapas 500 g', cents: 21000 }],
  ['MOL-001', { name: 'Molinillo manual', cents: 54900 }],
]);

export function findProduct(sku) {
  return PRODUCTS.get(normalizeSku(sku)) ?? null;
}

export function format(product) { // ⚠️ weight.js también exporta «format»
  return `${product.name} (${product.cents / 100} MXN)`;
}

// Interna: la usan los archivos de la carpeta, no debería ser pública.
export function normalizeSku(text) {
  return text.trim().toUpperCase();
}
