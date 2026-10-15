// MÓDULO DE LA TIENDA (ejemplo 04 de «Módulos ES»).
// blog.js declara EXACTAMENTE las mismas variables de nivel superior y no
// chocan: cada módulo tiene su propio ámbito. Con dos <script> clásicos,
// el segundo «const title» sería un SyntaxError y los var se pisarían.

var visits = 0; // un var de nivel superior: en un módulo NO acaba en window
const title = 'Tienda';

export function visit() {
  visits += 1;
  return `${title}: ${visits} visita(s)`;
}
