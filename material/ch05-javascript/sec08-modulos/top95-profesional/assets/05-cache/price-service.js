// «SERVIDOR» DE PRECIOS (ejemplo 05 de «Ejemplos profesionales»).
// Cuenta las peticiones para que el ejemplo pueda comprobar la caché.
const PRICES = new Map([['CAF-500', 21000], ['MOL-001', 54900], ['TAZ-002', 12000]]);
export const server = { requests: 0 };

export async function fetchPrice(sku) {
  server.requests += 1;
  await new Promise((resolve) => setTimeout(resolve, 30));
  if (!PRICES.has(sku)) throw new RangeError(`Sin precio para ${sku}`);
  return PRICES.get(sku);
}

export function changePrice(sku, cents) {
  PRICES.set(sku, cents);
}
