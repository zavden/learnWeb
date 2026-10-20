// WORKER DE MÓDULO (ejemplo 03): se crea con { type: 'module' }, así que puede
// usar import. Las rutas relativas se resuelven contra la URL de ESTE archivo.
import { formatMXN } from './money.js';

self.onmessage = (event) => {
  const total = event.data.reduce((sum, price) => sum + price, 0);
  self.postMessage(formatMXN(total));
};
