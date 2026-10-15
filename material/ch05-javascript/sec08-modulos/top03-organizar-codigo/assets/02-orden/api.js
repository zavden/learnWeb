// CLIENTE DE LA API (ejemplo 02): importa config.js.
import { API_URL } from './config.js';
console.log('3. api.js');
export function endpoint(path) {
  return `${API_URL}${path}`;
}
