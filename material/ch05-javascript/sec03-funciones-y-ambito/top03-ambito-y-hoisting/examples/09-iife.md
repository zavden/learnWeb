---
example_description: "IIFE: una función que se ejecuta nada más definirse para crear un ámbito privado o calcular un valor en varias sentencias"
example_tags: "javascript|ambito|iife|funciones"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// IIFE (Immediately Invoked Function Expression): una expresión de función
// envuelta en paréntesis y llamada en el acto con ().
//   (function () { … })();
// Antes de let/const (2015) y de los módulos, era la ÚNICA forma de crear un
// ámbito privado: las variables de dentro no contaminan el ámbito global.
(function () {
  var widgetVersion = '2.4.1'; // var de una función: NO se cuelga de window
  const greeting = 'Widget cargado';
  console.log(greeting, widgetVersion);
})();

console.log('typeof greeting →', typeof greeting);             // 'undefined'
console.log('window.widgetVersion →', window.widgetVersion);   // undefined

// Hoy, para eso basta un bloque con let/const (o un módulo, módulo 8):
{
  const temporary = 'solo existe en el bloque';
  console.log(temporary);
}
console.log('typeof temporary →', typeof temporary); // 'undefined'

// Un uso que sigue vigente: calcular el valor de una const con varias sentencias
// (if, return…) sin dejar variables auxiliares sueltas.
const postalCode = '35002';
const shippingZone = (() => {
  const prefix = postalCode.slice(0, 2);
  if (prefix === '35' || prefix === '38') return 'Canarias';
  if (prefix === '07') return 'Baleares';
  return 'Península';
})();
console.log('shippingZone →', shippingZone); // 'Canarias'

// ⚠️ Recuerda la trampa de «Sintaxis frente a Python»: si la línea anterior
// no termina en ;, el ( de la IIFE se pega a ella como si fuera una llamada.
// Por eso verás IIFE escritas con un ; delante: ;(function () { … })();
```
