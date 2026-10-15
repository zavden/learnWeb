// FORMATO (ejemplo 03). Existe como «format.js»; pedirlo como «./format»
// (sin extensión) da un 404: el navegador no prueba extensiones.
export function formatPrice(cents) {
  return `$${(cents / 100).toFixed(2)}`;
}
