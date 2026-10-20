// LA API PÚBLICA DE LA TIENDA (ejemplo 01): el barrel que usa el resto de la
// aplicación. Lista explícita: sin «export *», sin sorpresas.
export { PRODUCTS, findProduct } from './products.js';
export { itemCount, addToCart, cartLines, cartTotalCents, onCartChange } from './cart.js';
export { formatPrice, plural } from './format.js';
// ui.js NO se reexporta: la interfaz usa la tienda, no al revés.
