// WORKER DEL EJEMPLO 09 (de módulo): atiende peticiones { id, type, payload } y
// responde { id, ok: true, result } o { id, ok: false, error }. Unas tardan más
// que otras (aquí, simulado con setTimeout), así que las respuestas pueden
// llegar en otro orden: el id dice a qué petición pertenece cada una.
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const ZONES = {
  Yucatán: { base: 120, perKg: 30, lookupMs: 60 }, // la tarifa más lenta de consultar
  Puebla: { base: 60, perKg: 20, lookupMs: 10 },
};

const handlers = {
  async shipping({ state, kg }) {
    const zone = ZONES[state];
    if (!zone) throw new Error(`no enviamos a ${state}`);
    await sleep(zone.lookupMs);
    return zone.base + zone.perKg * kg;
  },
  async tax({ subtotal }) {
    return Math.round(subtotal * 0.16 * 100) / 100; // IVA del 16 %
  },
};

self.onmessage = async (event) => {
  const { id, type, payload } = event.data;
  try {
    const handler = handlers[type];
    if (!handler) throw new Error(`tipo de petición desconocido: ${type}`);
    self.postMessage({ id, ok: true, result: await handler(payload) });
  } catch (error) {
    // El error se atrapa AQUÍ y viaja como respuesta: el worker no «se cae».
    self.postMessage({ id, ok: false, error: error.message });
  }
};
