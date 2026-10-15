// API SIMULADA DE LA TIENDA (ejemplo 01).
// Una fábrica: quien la usa elige la latencia (y en las pruebas, otra API
// entera). Todo lo que devuelve son COPIAS: nadie de fuera puede cambiar los
// datos del «servidor».

const PRODUCTS = [
  { sku: 'CAF-500', name: 'Café de Chiapas 500 g', category: 'cafe', cents: 21000, stock: 12 },
  { sku: 'CAF-250', name: 'Café de Veracruz 250 g', category: 'cafe', cents: 13500, stock: 0 },
  { sku: 'MOL-001', name: 'Molinillo manual', category: 'equipo', cents: 54900, stock: 3 },
  { sku: 'PRE-350', name: 'Prensa francesa 350 ml', category: 'equipo', cents: 42900, stock: 5 },
  { sku: 'TAZ-002', name: 'Taza de barro', category: 'accesorios', cents: 12000, stock: 30 },
  { sku: 'FIL-100', name: 'Filtros de papel (100)', category: 'accesorios', cents: 8500, stock: 40 },
];

export class ApiError extends Error {
  constructor(message, { status, sku } = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.sku = sku;
  }
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function createApi({ latencyMs = 80 } = {}) {
  const stock = new Map(PRODUCTS.map((product) => [product.sku, product.stock]));
  let nextOrder = 2041;

  return {
    async listProducts({ category = 'all' } = {}) {
      await wait(latencyMs);
      return PRODUCTS
        .filter((product) => category === 'all' || product.category === category)
        .map((product) => ({ ...product, stock: stock.get(product.sku) }));
    },

    async placeOrder(lines) {
      await wait(latencyMs);
      for (const { sku, quantity } of lines) {
        const available = stock.get(sku) ?? 0;
        if (quantity > available) {
          throw new ApiError(`Solo quedan ${available} de ${sku}`, { status: 409, sku });
        }
      }
      for (const { sku, quantity } of lines) stock.set(sku, stock.get(sku) - quantity);
      return { orderId: `P-${nextOrder++}` };
    },
  };
}
