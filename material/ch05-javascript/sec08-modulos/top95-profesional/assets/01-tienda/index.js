// LA API PÚBLICA DE LA TIENDA (ejemplo 01): lo que el resto de la aplicación
// puede usar, nombre a nombre. Si mañana store.js se parte en dos archivos,
// solo cambia esta lista.
export { createApi, ApiError } from './api.js';
export { createStore, cartLines, cartTotalCents } from './store.js';
export { mountShop } from './ui.js';
export { formatPrice, formatCount } from './format.js';
