// CATÁLOGO (ejemplo 01): los datos de los productos y cómo buscarlos.
// No depende de ningún otro módulo de la tienda.

const PRODUCTS = [
  { sku: 'CAF-500', name: 'Café de Chiapas 500 g', cents: 21000 },
  { sku: 'MOL-001', name: 'Molinillo manual', cents: 54900 },
  { sku: 'TAZ-002', name: 'Taza de barro', cents: 12000 },
];

export function findProduct(sku) {
  const product = PRODUCTS.find((item) => item.sku === sku);
  if (!product) throw new RangeError(`No existe el producto ${sku}`);
  return product;
}
