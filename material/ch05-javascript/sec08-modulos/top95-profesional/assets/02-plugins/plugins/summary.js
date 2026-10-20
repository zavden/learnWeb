// PLUGIN «summary» (ejemplo 02): totales por estado del pedido.
console.log('(evaluando el plugin summary)');

export default {
  id: 'summary',
  apiVersion: 2,
  run(orders, host) {
    const totals = Map.groupBy(orders, (order) => order.status);
    return [...totals].map(([status, list]) => {
      const cents = list.reduce((sum, order) => sum + order.cents, 0);
      return `${status}: ${list.length} · ${host.formatPrice(cents)}`;
    });
  },
};
