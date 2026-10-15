---
example_description: "map(shout()) en vez de map(shout): con paréntesis pasas el resultado, no la función. Con setTimeout ni siquiera hay error"
example_tags: "javascript|funciones|callbacks|parentesis|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
function shout(text) {
  return text.toUpperCase() + '!';
}
const words = ['hola', 'adiós'];

// ✅ Sin paréntesis pasas LA FUNCIÓN: map la llamará con cada palabra.
console.log('map(shout) →', words.map(shout)); // ['HOLA!', 'ADIÓS!']

// 🐛 Con paréntesis, shout() se ejecuta AHORA, sin argumentos, antes de map.
// El error sale DENTRO de shout, lejos de la línea equivocada.
try {
  words.map(shout());
} catch (error) {
  console.log('🐛 map(shout()) →', error.name, '|', error.message);
}

// 🐛 Si la función no falla, map recibe su RESULTADO, que no es una función.
function defaultLabel() {
  return 'Sin título';
}
try {
  words.map(defaultLabel());
} catch (error) {
  console.log('🐛 map(defaultLabel()) →', error.name, '|', error.message);
}

// 🐛 El caso más traicionero: con un temporizador NO hay ningún error.
// (setTimeout(fn, ms) llama a fn pasados ms milisegundos; los temporizadores
// se estudian en el módulo «Asincronía y event loop».)
function remind() {
  console.log('⏰ recordatorio');
  // sin return → undefined
}
setTimeout(remind(), 300); // 🐛 remind se ejecuta YA; setTimeout recibe undefined
setTimeout(remind, 300);   // ✅ se ejecuta dentro de 300 ms
console.log('fin del script (el segundo ⏰ llega después)');

// Regla: si quieres que OTRO llame a tu función, pásala sin paréntesis.
// Si necesitas fijar argumentos, envuélvela en una flecha:
console.log('flecha →', words.map((word) => shout(`${word} a todos`)));
```
