// EXPORTAR A PDF (ejemplo 02 de «Import dinámico»).
// Un módulo pesado que solo usa quien pulsa «Descargar PDF»: se carga la
// primera vez que hace falta y, como todo módulo, se evalúa una sola vez.
console.log('  (evaluando pdf-export.js: solo la primera vez)');

const LINES_PER_PAGE = 25;

export function renderPdf(order) {
  const pages = Math.ceil(order.lines / LINES_PER_PAGE);
  return { filename: `factura-${order.id}.pdf`, pages };
}
