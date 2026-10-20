// CARRITO (ejemplo 02): importa api.js y config.js (que ya estará evaluado).
import { endpoint } from './api.js';
import { API_URL } from './config.js';
console.log('4. cart.js');
export function cartUrl(id) {
  return endpoint(`/carts/${id}`);
}
export const usesSameApi = API_URL.length > 0;
