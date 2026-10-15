---
example_description: "Los métodos nativos son genéricos: con call se usan sobre objetos que no son del tipo, como array-likes y strings (y Array.from como alternativa moderna)"
example_tags: "javascript|python|prototipos|call|array-like|metodos-genericos"
example_stage: minimal
example_importance: useful
console: true
---

# JavaScript

```javascript
// Muchos métodos de Array.prototype no exigen un array: solo necesitan un this
// con length y posiciones 0, 1, 2… (un «array-like»).
const arrayLike = { 0: 'Lunes', 1: 'Martes', 2: 'Miércoles', length: 3 };
console.log('arrayLike.join →', arrayLike.join); // undefined: no es un array

// «Tomar prestado» el método: llamarlo con call y otro this (lección «this»).
console.log('join prestado →', Array.prototype.join.call(arrayLike, ' · '));
console.log('map prestado →', Array.prototype.map.call(arrayLike, (day) => day.slice(0, 3)));

// Un string también es array-like (posiciones + length):
const word = 'camino';
const reversed = Array.prototype.map.call(word, (letter) => letter.toUpperCase()).reverse().join('');
console.log('map sobre un string →', reversed); // 'ONIMAC'
console.log('¿todas vocales? →', Array.prototype.every.call('aeiou', (letter) => 'aeiou'.includes(letter)));

// arguments (lección «Parámetros») es el array-like clásico; en código antiguo
// verás Array.prototype.slice.call(arguments) para convertirlo en array.
function legacySum() {
  const numbers = Array.prototype.slice.call(arguments);
  return numbers.reduce((total, n) => total + n, 0);
}
console.log('legacySum(1, 2, 3) →', legacySum(1, 2, 3));

// ✅ Hoy lo habitual es convertir primero con Array.from (o con spread si es
// iterable) y usar los métodos con normalidad:
console.log('Array.from(arrayLike) →', Array.from(arrayLike).map((day) => day.toUpperCase()));

// Los métodos de String.prototype también se pueden pedir prestados:
console.log("String.prototype.toUpperCase.call('mañana') →", String.prototype.toUpperCase.call('mañana'));

// > Desde Python: es como llamar al método desde la clase, str.upper('mañana')
//   o list.append(lst, 4). La diferencia es que en JavaScript el método no
//   comprueba el tipo: le basta con que this «se parezca» a lo que espera.
```
