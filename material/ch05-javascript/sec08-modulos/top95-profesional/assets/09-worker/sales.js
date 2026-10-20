// VENTAS SIMULADAS Y SU RESUMEN (ejemplo 09 de «Ejemplos profesionales»).
// Este módulo lo importan la página Y el worker: el mismo código en los dos
// sitios. Cada uno lo evalúa por su cuenta (cada uno tiene su propio mapa
// de módulos), y evaluatedIn dice dónde.
export const evaluatedIn = globalThis.constructor.name; // 'Window' o 'DedicatedWorkerGlobalScope'

const STATES = ['Ciudad de México', 'Jalisco', 'Nuevo León', 'Puebla', 'Yucatán', 'Chiapas', 'Veracruz', 'Oaxaca'];
const WEIGHTS = [30, 18, 16, 10, 7, 7, 7, 5]; // % de las ventas de cada estado

// Generador pseudoaleatorio con semilla (Park-Miller): la misma semilla da
// siempre las mismas ventas. Los productos (< 2^47) son enteros exactos.
function createRandom(seed) {
  let state = seed % 2147483647 || 1;
  return () => {
    state = (state * 48271) % 2147483647;
    return state / 2147483647;
  };
}

function pickState(random) {
  let roll = random() * 100;
  for (let index = 0; index < STATES.length; index++) {
    roll -= WEIGHTS[index];
    if (roll < 0) return STATES[index];
  }
  return STATES.at(-1);
}

export function* generateSales(count, seed) {
  const random = createRandom(seed);
  for (let index = 0; index < count; index++) {
    yield { state: pickState(random), cents: 9900 + Math.floor(random() * 150000) };
  }
}

export function aggregate(sales) {
  const totals = new Map();
  for (const sale of sales) {
    const entry = totals.get(sale.state) ?? { state: sale.state, count: 0, cents: 0 };
    entry.count += 1;
    entry.cents += sale.cents;
    totals.set(sale.state, entry);
  }
  return [...totals.values()].sort((a, b) => b.cents - a.cents);
}
