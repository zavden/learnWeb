// ANALÍTICA (ejemplo 02): importa config.js, que ya está evaluado: no se repite.
import { API_URL } from './config.js';
console.log('5. analytics.js');
export function track(event) {
  return `${event} → ${API_URL}/events`;
}
