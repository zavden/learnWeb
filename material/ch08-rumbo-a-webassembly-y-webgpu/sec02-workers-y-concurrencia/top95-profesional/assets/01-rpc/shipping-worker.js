// EL SERVICIO DE ENVÍOS (ejemplo 01, worker de módulo). Funciones normales; rpc.js
// se encarga de los mensajes, los ids, los errores y la cancelación.
import { exposeWorkerApi } from './rpc.js';

class ValidationError extends Error {
  name = 'ValidationError';
  constructor(message, field) {
    super(message);
    this.field = field;
  }
}

const RATES = {
  'Ciudad de México': { base: 90, perKg: 18 },
  Jalisco: { base: 110, perKg: 22 },
  'Nuevo León': { base: 120, perKg: 24 },
  Oaxaca: { base: 130, perKg: 26 },
  Yucatán: { base: 140, perKg: 28 },
};

// Una espera que se puede cancelar con la señal de la llamada.
function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(signal.reason);
    }, { once: true });
  });
}

exposeWorkerApi({
  quote(state, kg) {
    const rate = RATES[state];
    if (!rate) throw new ValidationError(`no enviamos a ${state}`, 'state');
    if (!(kg > 0 && kg <= 30)) throw new RangeError('el peso debe estar entre 0 y 30 kg');
    return { state, kg, total: rate.base + rate.perKg * Math.ceil(kg) }; // se cobra por kilo empezado
  },
  validatePostalCode(code) {
    if (!/^\d{5}$/.test(code)) throw new ValidationError('un código postal mexicano tiene 5 cifras', 'postalCode');
    return { code, zone: Number(code.slice(0, 2)) <= 16 ? 'centro' : 'resto del país' };
  },
  async monthlyReport(month) {
    await wait(1500, this.signal); // un informe lento (simulado: no gasta CPU)
    return { month, shipments: 1284, revenue: 214_380 };
  },
  states() {
    return Object.keys(RATES);
  },
});
