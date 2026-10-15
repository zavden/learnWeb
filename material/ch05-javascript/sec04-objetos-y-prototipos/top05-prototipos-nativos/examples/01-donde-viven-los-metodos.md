---
example_description: "Un array solo tiene como propias sus posiciones y length: map, filter o push están en Array.prototype, igual que los métodos de tus constructoras"
example_tags: "javascript|python|prototipos|arrays|array-prototype"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
const scores = [7, 9.5, 10];

// Las propiedades PROPIAS de un array: sus posiciones y length. Nada más.
console.log('propias →', Object.getOwnPropertyNames(scores)); // ['0', '1', '2', 'length']
console.log("¿map es propia? →", Object.hasOwn(scores, 'map')); // false

// map, filter, push… viven en Array.prototype, el [[Prototype]] de todos los
// arrays. scores.map es la búsqueda de siempre: no está en scores, sí un
// eslabón más arriba.
console.log('scores.map === Array.prototype.map →', scores.map === Array.prototype.map); // true
console.log('[].push === scores.push →', [].push === scores.push); // true: una sola función para todos
// 👉 En la consola, expande scores y luego su [[Prototype]]:
//    Array.prototype, con todos los métodos de los arrays (en gris).
console.log('scores →', scores);

// Es exactamente el patrón de la lección «Funciones constructoras y new»:
// Array es una función constructora, y Array.prototype guarda los métodos.
console.log('typeof Array →', typeof Array); // 'function'
console.log('¿scores instanceof Array? →', scores instanceof Array); // true
console.log('scores.constructor === Array →', scores.constructor === Array); // true

// Son métodos normales con this: map usa como this el array de la izquierda.
const doubled = Array.prototype.map.call(scores, (score) => score * 2);
console.log('Array.prototype.map.call(scores, …) →', doubled); // [14, 19, 20]

// Y tienen los atributos de todo método nativo: no enumerables. Por eso un
// for…in sobre un array recorre las posiciones y no los métodos.
console.log('descriptor de map →', Object.getOwnPropertyDescriptor(Array.prototype, 'map'));

// Por eso MDN titula sus páginas «Array.prototype.map()»: es un método que
// está en Array.prototype y que usas como scores.map(…).
// > Desde Python: scores.append(4) es list.append(scores, 4); aquí,
//   scores.push(4) es Array.prototype.push.call(scores, 4).
```
