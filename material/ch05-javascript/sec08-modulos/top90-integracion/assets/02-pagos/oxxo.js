// PAGO EN EFECTIVO EN TIENDAS OXXO (ejemplo 02).
console.log('(evaluando oxxo.js)');

export default {
  label: 'Efectivo en OXXO',
  pay(order, money) {
    return `ficha OXXO 9300-${order.id.slice(2)} · paga ${money(order.totalCents)} antes de 72 h`;
  },
};
