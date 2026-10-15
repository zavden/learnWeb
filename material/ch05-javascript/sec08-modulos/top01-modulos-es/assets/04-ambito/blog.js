// MÓDULO DEL BLOG (ejemplo 04 de «Módulos ES»).
// Las mismas variables de nivel superior que shop.js, sin conflicto.

var visits = 0;
const title = 'Blog';

export function visit() {
  visits += 1;
  return `${title}: ${visits} visita(s)`;
}
