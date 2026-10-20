// PAGO CON TARJETA (ejemplo 02): un módulo que solo se descarga si alguien
// paga con tarjeta. El mensaje sale una vez: el módulo se evalúa una vez.
console.log('(evaluando card.js)');

export default {
  label: 'Tarjeta',
  pay(order, money) {
    return `cobrado con tarjeta **** 4242 · ${money(order.totalCents)}`;
  },
};
