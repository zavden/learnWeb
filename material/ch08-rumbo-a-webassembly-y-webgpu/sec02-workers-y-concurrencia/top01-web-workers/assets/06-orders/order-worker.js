// WORKER DEL EJEMPLO 06 (de módulo): importa la MISMA clase que la página.
import { Order } from './order.js';

self.onmessage = (event) => {
  const { kind, order } = event.data;
  if (kind === 'instance') {
    // Llegó una instancia de Order… convertida en un objeto plano.
    const proto = Object.getPrototypeOf(order) === Object.prototype ? 'Object.prototype' : 'otro';
    self.postMessage(`🐛 instancia → prototipo: ${proto} · instanceof Order: ${order instanceof Order}
   claves → ${Object.keys(order).join(', ')} · total: ${order.total} · typeof pay: ${typeof order.pay}`);
  } else {
    // ✅ Datos planos → una instancia de verdad, con sus métodos y su campo privado.
    const rebuilt = Order.fromData(order);
    self.postMessage(`✅ datos + Order.fromData → instanceof Order: ${rebuilt instanceof Order} · total: ${rebuilt.total} · pagado: ${rebuilt.paid}`);
  }
};
