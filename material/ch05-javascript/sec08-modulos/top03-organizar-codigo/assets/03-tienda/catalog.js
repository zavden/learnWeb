// CATÁLOGO (ejemplo 03).
console.log('  (evaluando catalog.js)');

const PRODUCTS = new Map([
  ['CAF-500', { name: 'Café de Chiapas 500 g', cents: 21000 }],
  ['MOL-001', { name: 'Molinillo manual', cents: 54900 }],
]);

export function findProduct(sku) {
  return PRODUCTS.get(sku) ?? null;
}

// Exportada para que la usen otros archivos de la carpeta (los tests, por
// ejemplo), pero index.js NO la reexporta: no es parte de la API pública.
export function normalizeSku(text) {
  return text.trim().toUpperCase();
}
