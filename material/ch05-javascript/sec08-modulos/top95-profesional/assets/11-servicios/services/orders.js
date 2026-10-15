// PEDIDOS (ejemplo 11): no importa ningún otro servicio; los recibe.
export function createOrderService(logger, clock, payments) {
  let next = 2041;
  return {
    place(customer, cents) {
      const paymentId = payments.charge(customer, cents);
      const order = { id: `P-${next++}`, customer, cents, paymentId, createdAt: clock().toISOString() };
      logger.info(`pedido ${order.id} creado`);
      return order;
    },
  };
}
