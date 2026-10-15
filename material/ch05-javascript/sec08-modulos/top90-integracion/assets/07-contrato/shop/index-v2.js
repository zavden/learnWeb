// ✅ VERSIÓN 2 DEL BARREL (ejemplo 07): la API pública, nombre a nombre.
export { formatPrice, addVat } from './money.js';
export { findProduct, format as formatProduct } from './catalog.js';
export { format as formatWeight } from './weight.js';
export { default as Cart, MAX_ITEMS } from './cart.js';
