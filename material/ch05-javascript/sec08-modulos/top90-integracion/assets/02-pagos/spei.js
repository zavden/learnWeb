// TRANSFERENCIA SPEI (ejemplo 02). Si nadie la elige, ni se descarga.
console.log('(evaluando spei.js)');

export default {
  label: 'Transferencia SPEI',
  pay(order, money) {
    return `transfiere ${money(order.totalCents)} a la CLABE 0021 8000 1234 5678 91`;
  },
};
