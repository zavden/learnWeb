// GENERADOR DE FACTURAS (ejemplo 01 de «Import dinámico»).
// Imagina que este archivo es grande (plantillas, tablas de impuestos…):
// por eso la página no lo importa al cargar, sino con import() cuando hace falta.
console.log('  (evaluando invoice.js)');

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

export function createInvoice(order) {
  return `Factura ${order.id} · ${order.customer} · ${money.format(order.totalCents / 100)}`;
}
