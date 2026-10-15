// REGISTRO DE MÉTODOS DE PAGO (ejemplo 02 de «Integración»).
// Cada método vive en su propio módulo y se carga con import() la primera
// vez que alguien lo elige. Cada import() lleva su ruta ESCRITA ENTERA (no
// calculada): así un empaquetador sabe qué archivos puede necesitar y hace
// uno aparte para cada método.
const LOADERS = {
  card: () => import('./card.js'),
  oxxo: () => import('./oxxo.js'),
  spei: () => import('./spei.js'),
};

export const PAYMENT_IDS = Object.keys(LOADERS);

export const loaded = new Set(); // qué métodos se han cargado ya (para el informe)

export async function loadPaymentMethod(id) {
  if (!Object.hasOwn(LOADERS, id)) throw new RangeError(`Método de pago no disponible: ${id}`);
  const { default: method } = await LOADERS[id](); // import() → espacio de nombres
  loaded.add(id);
  return method;
}
