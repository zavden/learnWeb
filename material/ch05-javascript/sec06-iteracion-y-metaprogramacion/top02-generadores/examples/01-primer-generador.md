---
example_description: "function* declara una función generadora: cada yield entrega un valor y pausa la función, con sus variables intactas, hasta el siguiente next(); el objeto generador es un iterador iterable"
example_tags: "javascript|python|generadores|yield|function-star|iteradores"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// function* (con asterisco) declara una FUNCIÓN GENERADORA. Cada yield entrega
// un valor y PAUSA la función, con sus variables intactas, hasta el próximo next().
function* brewCoffee(grams) {
  console.log(`  ☕ muelo ${grams} g de café`);
  yield 'molido';
  console.log('  🔥 caliento el agua a 92 °C');
  yield 'agua lista';
  console.log('  ⏳ filtro durante 4 minutos');
  yield 'filtrado';
  console.log('  ✅ la función llega a su final');
}

// Llamarla no ejecuta el cuerpo: devuelve un objeto GENERADOR, pausado al principio.
const steps = brewCoffee(30);
console.log('tipo →', Object.prototype.toString.call(steps));

// Cada next() reanuda la función hasta el siguiente yield (fíjate en el orden
// de los mensajes: el cuerpo y el código de fuera se turnan).
console.log('next() →', steps.next());
console.log('next() →', steps.next());
console.log('next() →', steps.next());
console.log('next() →', steps.next()); // sale del último yield y termina: done
console.log('next() →', steps.next()); // terminado para siempre

// Un generador es un iterador que también es iterable: entra en for…of,
// spread, desestructuración, Array.from…
for (const state of brewCoffee(15)) console.log('estado →', state);
const fresh = brewCoffee(20);
console.log('¿iterable de sí mismo? →', fresh[Symbol.iterator]() === fresh);

// > Desde Python: igual que una función con yield, con dos diferencias de
//   sintaxis: el asterisco de function* (en Python basta con que haya un
//   yield en el cuerpo) y next(gen) se escribe gen.next(), que devuelve
//   { value, done } en vez de lanzar StopIteration al final.
```
