// PEDIDOS (ejemplos 06 y 07 de «Organizar el código»).
// 🔁 Importa customers.js… y customers.js importa este archivo: un CICLO.
import { customerName } from './customers.js';
console.log('  (evaluando orders.js)');

export const TAX_RATE = 0.16;

export function orderSummary(order) {
  // customerName se usa DENTRO de una función: cuando se llame, customers.js
  // ya estará evaluado, sea cual sea el orden.
  const total = Math.round(order.netCents * (1 + TAX_RATE));
  return `${order.id} · ${customerName(order.customerId)} · $${(total / 100).toFixed(2)}`;
}
