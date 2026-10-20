// EL TRABAJO DE PRUEBA (ejemplo 08): contar primos por división de prueba. Dos
// formas de hacerlo: de una vez, o por rebanadas que devuelven el control.
export function isPrime(n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let divisor = 3; divisor * divisor <= n; divisor += 2) {
    if (n % divisor === 0) return false;
  }
  return true;
}

export function countPrimes(from, to) {
  let count = 0;
  for (let n = from; n < to; n++) if (isPrime(n)) count++;
  return count;
}

// Por rebanadas de `budget` ms: tras cada una, `pause()` cede el turno (scheduler.yield,
// setTimeout…). El resultado es el mismo; el tiempo total, algo mayor.
export async function countPrimesInSlices(from, to, pause, budget = 8) {
  let count = 0;
  let n = from;
  while (n < to) {
    const sliceEnd = performance.now() + budget;
    while (n < to && performance.now() < sliceEnd) {
      const stop = Math.min(to, n + 2000); // mirar el reloj cada 2000 números, no en cada uno
      for (; n < stop; n++) if (isPrime(n)) count++;
    }
    await pause();
  }
  return count;
}
