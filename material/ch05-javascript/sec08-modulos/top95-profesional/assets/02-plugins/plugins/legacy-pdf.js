// PLUGIN «legacy-pdf» (ejemplo 02): escrito para la versión 1 de la API del
// anfitrión. El anfitrión lo rechaza al cargarlo, antes de ejecutarlo.
console.log('(evaluando el plugin legacy-pdf)');

export default {
  id: 'legacy-pdf',
  apiVersion: 1,
  run(orders) {
    return `PDF con ${orders.length} pedidos`;
  },
};
