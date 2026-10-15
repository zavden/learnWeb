// REGISTRO DE PAQUETERÍAS (ejemplo 04 de «Integración»).
// Un solo Map para toda la aplicación: el módulo se evalúa una vez, así que
// todos los que lo importan comparten el mismo registro.
console.log('1. registry.js: registro vacío');

const carriers = new Map();

export function registerCarrier(carrier) {
  if (carriers.has(carrier.id)) throw new Error(`Paquetería repetida: ${carrier.id}`);
  carriers.set(carrier.id, Object.freeze(carrier));
}

export function carrierIds() {
  return [...carriers.keys()];
}

export function quoteAll(order) {
  return [...carriers.values()]
    .filter((carrier) => carrier.accepts(order))
    .map((carrier) => ({ id: carrier.id, label: carrier.label, cents: carrier.price(order) }))
    .sort((a, b) => a.cents - b.cents);
}
