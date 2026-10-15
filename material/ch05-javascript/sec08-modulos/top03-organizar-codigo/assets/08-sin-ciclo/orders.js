// PEDIDOS, SIN CICLO (ejemplo 08): depende de customers.js y de tax.js;
// customers.js ya no depende de este archivo.
import { customerName } from './customers.js';
import { withTax } from './tax.js';
console.log('  (evaluando orders.js)');

export function orderSummary(order) {
  return `${order.id} · ${customerName(order.customerId)} · $${(withTax(order.netCents) / 100).toFixed(2)}`;
}
