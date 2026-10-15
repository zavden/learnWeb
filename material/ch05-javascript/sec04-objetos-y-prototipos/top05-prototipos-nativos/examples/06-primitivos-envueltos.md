---
example_description: "Un primitivo no es un objeto, pero 'a'.toUpperCase() funciona: el motor lo envuelve un instante en un String y busca en String.prototype; por eso no puede guardar propiedades"
example_tags: "javascript|python|prototipos|primitivos|autoboxing|modo-estricto"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
const city = 'oaxaca';

// city es un PRIMITIVO (lección «Tipos primitivos»): no es un objeto y no
// tiene propiedades. ¿De dónde sale entonces toUpperCase?
console.log('typeof city →', typeof city);                  // 'string'
console.log('city.toUpperCase() →', city.toUpperCase());     // 'OAXACA'

// Al leer una propiedad de un primitivo, el motor crea por un instante un
// objeto envoltorio (wrapper) —aquí, un String— cuyo [[Prototype]] es
// String.prototype, busca la propiedad ahí, la usa y tira el envoltorio.
console.log('¿String.prototype.toUpperCase? →', city.toUpperCase === String.prototype.toUpperCase); // true
console.log('getPrototypeOf(city) →', Object.getPrototypeOf(city) === String.prototype);            // true

// Lo mismo con números y booleanos:
console.log('(1234.5).toFixed(2) →', (1234.5).toFixed(2));   // Number.prototype.toFixed
console.log('true.toString() →', true.toString());            // Boolean.prototype.toString
// (Con un número entero escrito tal cual hacen falta paréntesis: 5.toFixed(2)
// es un error de sintaxis, porque el punto se lee como el decimal.)

// 🐛 Consecuencia: asignar una propiedad a un primitivo se la asigna al
// envoltorio temporal, que se tira en el acto. No queda nada.
city.population = 900000;
console.log('city.population →', city.population); // undefined

// En modo estricto, el intento lanza un error en lugar de perderse en silencio:
function tag(value) {
  'use strict';
  value.checked = true;
}
try {
  tag(city);
} catch (error) {
  console.log('estricto →', error.name, '|', error.message);
}

// null y undefined no tienen envoltorio ni prototipo: leer cualquier propiedad falla.
let missing = null;
try {
  missing.toUpperCase();
} catch (error) {
  console.log('null →', error.name, '|', error.message);
}
console.log('con ?. →', missing?.toUpperCase()); // undefined (lección «Operadores y coerción»)

// > Desde Python: allí todo es un objeto de verdad ((5).bit_length() no
//   envuelve nada: 5 ya es un int). En JavaScript, los primitivos solo se
//   «disfrazan» de objeto el tiempo justo de llamar al método.
```
