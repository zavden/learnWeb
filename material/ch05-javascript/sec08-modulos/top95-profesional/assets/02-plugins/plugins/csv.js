// PLUGIN «csv» (ejemplo 02): exporta los pedidos a CSV.
// No importa nada de la aplicación: todo lo que necesita llega en run().
console.log('(evaluando el plugin csv)');

function cell(value) {
  const text = String(value);
  return text.includes(',') || text.includes('"') ? `"${text.replaceAll('"', '""')}"` : text;
}

export default {
  id: 'csv',
  apiVersion: 2,
  run(orders) {
    const header = ['id', 'cliente', 'estado', 'total'];
    const rows = orders.map((order) => [order.id, order.customer, order.status, (order.cents / 100).toFixed(2)]);
    return [header, ...rows].map((row) => row.map(cell).join(',')).join('\n');
  },
};
