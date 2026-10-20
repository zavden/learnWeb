---
example_description: "Recursión: una función que se llama a sí misma con un problema más pequeño hasta llegar al caso base; traza de factorial(4) con sangría"
example_tags: "javascript|python|recursion|caso-base|factorial"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Una función RECURSIVA se llama a sí misma. Necesita dos partes:
//   - CASO BASE: un problema tan pequeño que se resuelve sin llamarse;
//   - CASO RECURSIVO: reduce el problema y se llama con la versión más pequeña.
function factorial(n) {
  if (n <= 1) return 1;          // caso base
  return n * factorial(n - 1);   // caso recursivo: n - 1 está más cerca del caso base
}
console.log('factorial(5) →', factorial(5)); // 120

// La misma función, con una traza: cada nivel de sangría es un marco más en la pila.
function factorialTraced(n, depth = 0) {
  const pad = '  '.repeat(depth);
  console.log(`${pad}factorial(${n})`);
  if (n <= 1) {
    console.log(`${pad}= 1 (caso base)`);
    return 1;
  }
  const result = n * factorialTraced(n - 1, depth + 1);
  console.log(`${pad}= ${n} × factorial(${n - 1}) = ${result}`);
  return result;
}
factorialTraced(4);
// Primero se BAJA hasta el caso base (las llamadas se apilan) y después se
// SUBE multiplicando (cada llamada vuelve a la que la hizo).

// Otro clásico: sumar los dígitos de un número.
function digitSum(n) {
  if (n < 10) return n;                          // un solo dígito
  return (n % 10) + digitSum(Math.floor(n / 10)); // último dígito + el resto
}
console.log('digitSum(2026) →', digitSum(2026)); // 10

// > Desde Python: el código es idéntico:
//   def factorial(n):
//       if n <= 1: return 1
//       return n * factorial(n - 1)
```
