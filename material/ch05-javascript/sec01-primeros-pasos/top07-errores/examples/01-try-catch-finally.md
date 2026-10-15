---
example_description: "El recorrido de try, catch y finally con y sin error, comparado con try/except/finally"
example_tags: "javascript|python|errores|try-catch|finally"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// try / catch / finally es el try / except / finally de Python.
function divide(a, b) {
  if (b === 0) {
    // throw es el raise de Python (lo verás en el ejemplo siguiente).
    throw new Error('No se puede dividir entre cero');
  }
  return a / b;
}

for (const divisor of [2, 0]) {
  console.group(`divide(10, ${divisor})`);
  try {
    const result = divide(10, divisor);
    console.log('try: resultado', result);      // solo si no hubo error
  } catch (error) {
    console.log('catch:', error.message);       // solo si hubo error
  } finally {
    console.log('finally: se ejecuta SIEMPRE'); // con error y sin error
  }
  console.groupEnd();
}

console.log('El script sigue después del try');

// Python:
// try:
//     result = divide(10, divisor)
//     print("try: resultado", result)
// except Exception as error:
//     print("except:", error)
// finally:
//     print("finally: se ejecuta SIEMPRE")
```
