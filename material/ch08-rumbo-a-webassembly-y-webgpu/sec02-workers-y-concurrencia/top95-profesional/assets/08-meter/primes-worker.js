// WORKER DEL EJEMPLO 08 (de módulo): la misma cuenta, en otro hilo.
import { countPrimes } from './primes.js';

self.onmessage = (event) => {
  const { from, to } = event.data;
  self.postMessage(countPrimes(from, to));
};
