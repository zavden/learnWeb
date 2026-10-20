// EL WORKER DE ESTADÍSTICAS (ejemplo 09). Es un worker de MÓDULO (se crea
// con { type: 'module' }), así que puede usar import como cualquier módulo.
// Corre en otra hebra: puede calcular durante cientos de milisegundos sin
// congelar la página. No tiene DOM; habla con la página por mensajes.
import { generateSales, aggregate, evaluatedIn } from './sales.js';

self.addEventListener('message', (event) => {
  const { id, count, seed } = event.data;
  try {
    const totals = aggregate(generateSales(count, seed));
    self.postMessage({ id, ok: true, totals, evaluatedIn });
  } catch (error) {
    self.postMessage({ id, ok: false, message: error.message });
  }
});
