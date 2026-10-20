// UN WORKER DEL POOL (ejemplo 10): recibe un trozo { index, from, to }, cuenta
// sus primos y devuelve { index, count }. El index dice qué trozo era.
import { countPrimes } from './primes.js';

self.onmessage = (event) => {
  const { index, from, to } = event.data;
  self.postMessage({ index, count: countPrimes(from, to) });
};
