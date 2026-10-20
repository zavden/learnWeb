---
example_description: "Un decorador que cuenta llamadas y mide la profundidad de la pila: Fibonacci ingenuo frente a memoizado, un método recursivo que conserva this y un desbordamiento que no descuadra la cuenta gracias a finally"
example_tags: "javascript|integracion|recursion|decoradores|memoizacion|this"
example_stage: intermediate
example_importance: important
console: true
---

# JavaScript

```javascript
// PERFILADOR DE FUNCIONES RECURSIVAS: cuántas llamadas hacen y cuánta pila usan.
// Integra: decoradores y memoización («Funciones de orden superior»), contadores
// privados («Closures»), recursión y pila, this con apply («La palabra clave this»)
// y try/finally («Errores y excepciones»).
function profile(fn, label = fn.name) {
  let calls = 0;
  let depth = 0;    // marcos de esta función que hay AHORA en la pila
  let maxDepth = 0;
  function profiled(...args) {
    calls += 1;
    try {
      depth += 1;
      if (depth > maxDepth) maxDepth = depth;
      return fn.apply(this, args); // apply: si es un método, conserva su this
    } finally {
      depth -= 1; // se ejecuta SIEMPRE, también cuando fn lanza un error
    }
  }
  // Las funciones son objetos: se les pueden añadir propiedades.
  profiled.report = () => `${label}: ${calls} llamadas, profundidad máxima ${maxDepth}`;
  profiled.reset = () => {
    calls = 0;
    maxDepth = 0;
  };
  return profiled;
}
function memoize(fn) {
  const cache = new Map();
  return (n) => {
    if (!cache.has(n)) cache.set(n, fn(n));
    return cache.get(n);
  };
}

// 1) Fibonacci ingenuo. Reasignar la variable (let) hace que las llamadas
//    RECURSIVAS también pasen por el perfilador, como un decorador @ de Python.
let fib = (n) => (n < 2 ? n : fib(n - 1) + fib(n - 2));
fib = profile(fib, 'fib');
console.log('fib(20) →', fib(20), '·', fib.report());

// 2) Memoizado por dentro y perfilado por fuera: misma profundidad, muchas menos llamadas.
let fibMemo = (n) => (n < 2 ? n : fibMemo(n - 1) + fibMemo(n - 2));
fibMemo = profile(memoize(fibMemo), 'fibMemo');
console.log('fibMemo(20) →', fibMemo(20), '·', fibMemo.report());

// 3) Un MÉTODO recursivo: las flechas de reduce heredan this del método,
//    y apply se lo pasa al método original.
const thread = {
  title: '¿Qué tetera compro?',
  comments: [
    { author: 'Ana', replies: [{ author: 'Luis', replies: [{ author: 'Ana', replies: [] }] }] },
    { author: 'Marta', replies: [] },
    { author: 'Iker', replies: [{ author: 'Sara', replies: [] }, { author: 'Ana', replies: [] }] },
  ],
  countComments(list = this.comments) {
    return list.reduce((sum, comment) => sum + 1 + this.countComments(comment.replies), 0);
  },
};
thread.countComments = profile(thread.countComments, 'countComments');
console.log('comentarios →', thread.countComments(), '·', thread.countComments.report());

// 4) Un desbordamiento de pila no descuadra la cuenta, gracias al finally.
let countdown = (n) => (n === 0 ? 'despegue' : countdown(n - 1));
countdown = profile(countdown, 'countdown');
try {
  countdown(2.5); // nunca llega a 0 exacto
} catch (error) {
  console.log('countdown(2.5) →', error.name, '|', error.message);
}
countdown.reset();
console.log('countdown(5) →', countdown(5), '·', countdown.report());
// Sin el finally, depth se habría quedado en miles tras el error y la profundidad
// máxima de esta última llamada saldría disparatada.
```
