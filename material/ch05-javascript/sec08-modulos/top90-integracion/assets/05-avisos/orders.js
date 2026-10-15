// PEDIDOS (ejemplo 05 de «Integración»).
// ANTES, este archivo importaba notify() de notifications.js, y
// notifications.js importaba getOrder() de este: un ciclo. AHORA no importa
// a nadie: RECIBE la función que avisa (inyección de dependencias).
export function createOrderService({ notify }) {
  const orders = new Map([
    ['P-1042', { id: 'P-1042', customer: 'Mariana Gómez', email: 'mariana@example.com', status: 'pagado' }],
    ['P-1043', { id: 'P-1043', customer: 'Iker Salas', email: 'iker@example.com', status: 'pagado' }],
  ]);

  return {
    getOrder(id) {
      const order = orders.get(id);
      if (!order) throw new RangeError(`No existe el pedido ${id}`);
      return { ...order }; // una copia: el estado se cambia solo desde aquí
    },
    ship(id, trackingCode) {
      const order = orders.get(id);
      if (!order) throw new RangeError(`No existe el pedido ${id}`);
      order.status = 'enviado';
      order.trackingCode = trackingCode;
      notify(order.email, `Tu pedido ${id} va en camino (guía ${trackingCode})`);
    },
  };
}
