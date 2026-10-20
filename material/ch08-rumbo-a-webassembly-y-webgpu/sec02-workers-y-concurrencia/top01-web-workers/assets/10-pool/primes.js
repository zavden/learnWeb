// CONTAR PRIMOS (ejemplo 10). Lo importan la página (la versión en el hilo
// principal) y cada worker del pool: el mismo código en los dos lados.

// División de prueba: ¿algún impar hasta la raíz cuadrada divide a n?
export function isPrime(n) {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let divisor = 3; divisor * divisor <= n; divisor += 2) {
    if (n % divisor === 0) return false;
  }
  return true;
}

// Cuántos primos hay en [from, to). Un trozo cuesta más cuanto más arriba está.
export function countPrimes(from, to) {
  let count = 0;
  for (let n = from; n < to; n++) {
    if (isPrime(n)) count++;
  }
  return count;
}
