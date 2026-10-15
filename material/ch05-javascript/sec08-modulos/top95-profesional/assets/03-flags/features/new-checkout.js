// FUNCIÓN «new-checkout» (ejemplo 03): el pago en una sola página.
export default {
  label: 'Pago en una página',
  render(order) {
    return `💳 pagar ${order.total} en un solo paso`;
  },
};
