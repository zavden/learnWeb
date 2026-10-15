---
example_description: "Una función recursiva correcta también desborda la pila si los datos son grandes: sumar 100 000 números recursivamente falla; con un bucle, no"
example_tags: "javascript|python|recursion|stack-overflow|iteracion|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// Una suma recursiva PERFECTAMENTE CORRECTA: caso base y caso recursivo.
function sumRecursive(numbers, index = 0) {
  if (index === numbers.length) return 0;                   // caso base
  return numbers[index] + sumRecursive(numbers, index + 1); // un elemento menos
}

const small = Array.from({ length: 1000 }, (_, i) => i + 1); // 1, 2, …, 1000
console.log('suma de 1000 números →', sumRecursive(small));  // 500500

// 🐛 Con datos grandes, una llamada por elemento son demasiados marcos.
const big = Array.from({ length: 100_000 }, (_, i) => i + 1);
try {
  sumRecursive(big);
} catch (error) {
  console.log('🐛 100 000 números →', error.name, '|', error.message);
}

// ¿Cuántas llamadas caben? Depende del navegador y de cuánto ocupa cada marco
// (parámetros y variables locales). Medimos esta función mínima:
let depth = 0;
function dive() {
  depth += 1;
  dive();
}
try {
  dive();
} catch {
  console.log(`profundidad máxima aquí ≈ ${depth} llamadas (cambia con el navegador)`);
}

// ✅ Un bucle no apila nada: funciona con cualquier tamaño.
function sumIterative(numbers) {
  let total = 0;
  for (const n of numbers) total += n;
  return total;
}
console.log('✅ 100 000 números →', sumIterative(big)); // 5000050000

// Nota: el estándar de 2015 define la «optimización de llamadas en cola»
// (return f(x) sin trabajo pendiente no ocuparía marco), pero solo Safari la
// implementa (y solo en modo estricto). En Chrome y Firefox, una recursión en
// cola también desborda.
// > Desde Python: igual; Python tampoco optimiza las llamadas en cola.
```
