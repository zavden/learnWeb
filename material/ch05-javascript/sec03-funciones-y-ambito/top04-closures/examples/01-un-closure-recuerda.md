---
example_description: "Una función creada dentro de otra recuerda las variables de su creadora aunque esta ya haya terminado; cada llamada crea un entorno nuevo"
example_tags: "javascript|python|closures|ambito|funciones"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// makeGreeter devuelve una FUNCIÓN que usa una variable local de makeGreeter.
function makeGreeter(greeting) {
  const punctuation = greeting === '¡Hola' ? '!' : '.';
  return (name) => `${greeting}, ${name}${punctuation}`;
}

const greetEs = makeGreeter('¡Hola');
const greetPt = makeGreeter('Olá');

// makeGreeter ya terminó… pero sus variables siguen vivas para la flecha que devolvió.
// Esa combinación de función + variables que recuerda es un CLOSURE (clausura).
console.log(greetEs('Marta')); // '¡Hola, Marta!'
console.log(greetPt('João'));  // 'Olá, João.'

// Cada LLAMADA a makeGreeter creó un ámbito NUEVO: greetEs y greetPt
// no comparten greeting ni punctuation.
console.log(greetEs('Iker'));  // '¡Hola, Iker!'

//   greetEs ──► (name) => …  ──recuerda──► { greeting: '¡Hola', punctuation: '!' }
//   greetPt ──► (name) => …  ──recuerda──► { greeting: 'Olá',   punctuation: '.' }

// No hace falta devolver la función: cualquier función que use variables de
// fuera es un closure. Los callbacks lo son constantemente:
function countLongWords(words, minLength) {
  // la flecha usa minLength, un parámetro de countLongWords
  return words.filter((word) => word.length >= minLength).length;
}
console.log('countLongWords →', countLongWords(['sol', 'montaña', 'río', 'cascada'], 5)); // 2

// En Chrome DevTools (abre el ejemplo con ↗), console.dir(greetEs) muestra
// esas variables en [[Scopes]] → Closure.
// > Desde Python: igual que una función anidada que usa variables de la exterior
//   (sus valores quedan en greet.__closure__).
```
