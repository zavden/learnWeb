---
example_description: "Parámetros rest (...items) como el *args de Python, pero con un array de verdad; y spread (...array) para pasar un array como argumentos"
example_tags: "javascript|python|funciones|parametros|rest|spread"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// ...nombre recoge los argumentos restantes en un ARRAY (en Python, *args es una tupla).
function sum(...numbers) {
  console.log('  numbers →', numbers, '| ¿array?', Array.isArray(numbers));
  return numbers.reduce((total, n) => total + n, 0);
}
console.log('sum(1, 2, 3) →', sum(1, 2, 3)); // 6
console.log('sum() →', sum());               // 0: sin argumentos, un array vacío

// Se combina con parámetros normales, pero el rest va SIEMPRE el último.
// (function f(...items, last) {} es un SyntaxError.)
function logWithLevel(level, ...messages) {
  console.log(`[${level}]`, messages.join(' '));
}
logWithLevel('INFO', 'Pedido', 'A-301', 'enviado');
logWithLevel('WARN', 'Stock bajo');

// El camino inverso es SPREAD: ...array en una LLAMADA reparte el array
// en argumentos sueltos. En Python: f(*lista).
const temperatures = [18.5, 22.1, 19.8, 24.3];
console.log('Math.max(...temperatures) →', Math.max(...temperatures)); // 24.3
console.log('Math.max(temperatures) →', Math.max(temperatures));       // NaN: recibe UN array

const extra = [10, 20];
console.log('sum(1, ...extra, 5) →', sum(1, ...extra, 5)); // 36

// Spread y rest juntos: una función que reenvía todos sus argumentos a otra.
function sumAndLog(...args) {
  const result = sum(...args);
  console.log(`  sumAndLog(${args.join(', ')}) = ${result}`);
  return result;
}
sumAndLog(4, 5);

// > Desde Python: def total(*numbers) → function total(...numbers);
//   total(*lista) → total(...lista). Para **kwargs, JavaScript usa un objeto
//   de opciones (siguiente ejemplo).
```
