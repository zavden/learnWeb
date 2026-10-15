// CATÁLOGO (ejemplo 01 de «Integración»): solo datos, sin lógica ni DOM.
// Congelado: nadie puede cambiar un precio por accidente desde otro módulo.
export const PRODUCTS = Object.freeze([
  Object.freeze({ sku: 'CAF-500', name: 'Café de Chiapas 500 g', cents: 21000 }),
  Object.freeze({ sku: 'MOL-001', name: 'Molinillo manual', cents: 54900 }),
  Object.freeze({ sku: 'TAZ-002', name: 'Taza de barro', cents: 12000 }),
  Object.freeze({ sku: 'FIL-100', name: 'Filtros de papel (100)', cents: 8500 }),
]);

export function findProduct(sku) {
  const product = PRODUCTS.find((item) => item.sku === sku);
  if (!product) throw new RangeError(`No existe el producto ${sku}`);
  return product;
}
