// 🐛 PUNTOS DE FIDELIDAD COMO SINGLETON DE MÓDULO (ejemplo 06).
// Cómodo de usar (import { earn } y listo), pero con dos dependencias
// escondidas: el Map de saldos (estado de módulo, compartido por todas las
// pruebas) y el reloj (importado: una prueba no puede cambiarlo).
import { now } from './clock.js';

const balances = new Map();

function isTuesdayInMexico(date) {
  return new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: 'America/Mexico_City' }).format(date) === 'Tue';
}

export function earn(customer, cents) {
  const points = Math.floor(cents / 1000) * (isTuesdayInMexico(now()) ? 2 : 1); // 1 punto por cada $10
  balances.set(customer, (balances.get(customer) ?? 0) + points);
  return points;
}

export function balance(customer) {
  return balances.get(customer) ?? 0;
}
