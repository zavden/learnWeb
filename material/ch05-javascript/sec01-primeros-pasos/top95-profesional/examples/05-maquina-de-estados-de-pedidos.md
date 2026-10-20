---
example_description: "Ciclo de vida de pedidos como máquina de estados con tabla de transiciones, historial y eventos inválidos que no corrompen el estado"
example_tags: "javascript|profesional|maquina-de-estados|errores|objetos|consola"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// CICLO DE VIDA DE UN PEDIDO como máquina de estados.
//
//   pending ──pay──► paid ──ship──► shipped ──deliver──► delivered ──requestReturn──► returned
//      │               │
//      └──cancel──┐    └──cancel──┐
//                 ▼               ▼
//             cancelled       cancelled
//
// Decisiones de diseño:
// - Las transiciones válidas están en UNA tabla de datos (TRANSITIONS), no
//   repartidas en ifs: añadir un estado es añadir una línea.
// - applyEvent comprueba TODO antes de modificar nada: un evento inválido lanza un
//   error y el pedido queda exactamente como estaba.
// - Cada cambio queda en un historial (quién, qué, cuándo) para poder auditarlo.
//
// Alcance: function se estudia en «Funciones y ámbito»; arrays (push) y objetos en
// «Números, texto y colecciones».

const TRANSITIONS = {
  pending: { pay: 'paid', cancel: 'cancelled' },
  paid: { ship: 'shipped', cancel: 'cancelled' },
  shipped: { deliver: 'delivered' },
  delivered: { requestReturn: 'returned' },
  cancelled: {},
  returned: {},
};

const STATE_LABELS = {
  pending: 'pendiente de pago',
  paid: 'pagado',
  shipped: 'enviado',
  delivered: 'entregado',
  cancelled: 'cancelado',
  returned: 'devuelto',
};

function createOrder(id, customer) {
  return { id: id, customer: customer, state: 'pending', history: [] };
}

function applyEvent(order, event, time) {
  const allowed = TRANSITIONS[order.state];
  // typeof: TRANSITIONS[…][…] podría devolver una función heredada (toString…).
  const nextState = typeof allowed === 'object' ? allowed[event] : undefined;
  if (typeof nextState !== 'string') {
    throw new Error(`«${event}» no es posible en un pedido ${STATE_LABELS[order.state]}`);
  }
  // A partir de aquí ya no puede fallar nada: modificamos el pedido.
  order.history.push(`${time} ${order.state} → ${nextState} (${event})`);
  order.state = nextState;
}

// Eventos recibidos de la pasarela de pago, del almacén y de la web.
const timeline = [
  { orderId: 'A-1001', event: 'pay', time: '09:12' },
  { orderId: 'A-1002', event: 'ship', time: '09:15' },          // aún no está pagado
  { orderId: 'A-1001', event: 'ship', time: '11:40' },
  { orderId: 'A-1002', event: 'cancel', time: '12:03' },
  { orderId: 'A-1001', event: 'deliver', time: '17:25' },
  { orderId: 'A-1002', event: 'pay', time: '12:30' },           // ya está cancelado
  { orderId: 'A-1003', event: 'pay', time: '13:00' },           // pedido inexistente
  { orderId: 'A-1001', event: 'requestReturn', time: '19:02' },
  { orderId: 'A-1001', event: 'toString', time: '19:05' },      // evento malicioso
];

const orders = {
  'A-1001': createOrder('A-1001', 'Marta Ruiz'),
  'A-1002': createOrder('A-1002', 'Jorge Salas'),
};

console.group('Procesando eventos');
for (const entry of timeline) {
  const order = orders[entry.orderId];
  if (typeof order !== 'object') {
    console.warn(`${entry.time} ${entry.orderId}: pedido desconocido, evento ignorado`);
    continue;
  }
  try {
    applyEvent(order, entry.event, entry.time);
    console.log(`${entry.time} ${order.id}: ${entry.event} → ${STATE_LABELS[order.state]}`);
  } catch (error) {
    // El pedido no ha cambiado: avisamos y seguimos con el siguiente evento.
    console.warn(`${entry.time} ${order.id}: rechazado. ${error.message}`);
  }
}
console.groupEnd();

for (const id in orders) {
  const order = orders[id];
  console.group(`${order.id} · ${order.customer} · ${STATE_LABELS[order.state]}`);
  for (const line of order.history) {
    console.log(line);
  }
  console.groupEnd();
}
```
