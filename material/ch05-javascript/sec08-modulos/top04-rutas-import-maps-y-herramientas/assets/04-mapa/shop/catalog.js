// CATÁLOGO (ejemplo 04). También usa el nombre «money»: el import map vale
// para TODOS los módulos de la página, no solo para el script principal.
import { formatPrice } from 'money';

const PRODUCTS = new Map([
  ['CAF-500', { name: 'Café de Chiapas 500 g', cents: 21000 }],
  ['MOL-001', { name: 'Molinillo manual', cents: 54900 }],
]);

export function describeProduct(sku) {
  const product = PRODUCTS.get(sku);
  return product ? `${product.name} · ${formatPrice(product.cents)}` : `${sku}: no existe`;
}
