// FORMATO COMPARTIDO (ejemplo 01 de «Rutas, import maps y herramientas»).
// HERE: la URL de ESTE archivo, desde la carpeta 01-rutas/ (import.meta.url
// es la URL completa del módulo; aquí se recorta para que se lea mejor).
export const HERE = import.meta.url.slice(import.meta.url.indexOf('01-rutas/'));

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

export function formatPrice(cents) {
  return money.format(cents / 100);
}
