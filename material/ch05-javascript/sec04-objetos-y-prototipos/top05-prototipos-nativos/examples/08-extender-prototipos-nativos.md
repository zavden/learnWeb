---
example_description: "Añadir métodos a Array.prototype u Object.prototype los cuela en todos los for…in y en todos los objetos, y dos librerías pueden pisarse; la alternativa son funciones normales"
example_tags: "javascript|python|prototipos|nativos|monkey-patching|for-in|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// JavaScript te deja modificar los prototipos nativos. Es tentador:
// «quiero que todos los arrays tengan last()».

// 🐛 1. Lo añadido con una asignación es ENUMERABLE: aparece en cada for…in.
Array.prototype.last = function () {
  return this[this.length - 1];
};
const steps = ['Validar', 'Cobrar', 'Enviar'];
console.log('steps.last() →', steps.last()); // funciona…
for (const key in steps) {
  console.log('🐛 for…in →', key); // …pero cuela 'last' en todos los recorridos
}

// 🐛 2. En Object.prototype es aún peor: lo heredan TODOS los objetos.
Object.prototype.isEmpty = function () {
  return Object.keys(this).length === 0;
};
const order = { id: 'PED-0042', total: 3150 };
console.log("🐛 'isEmpty' in order →", 'isEmpty' in order);   // true
for (const key in order) {
  console.log('🐛 for…in de un objeto →', key);              // id, total, isEmpty
}

// 🐛 3. Dos «librerías» definen el mismo método de forma distinta: gana la
// última en cargarse, y el código que dependía de la primera se rompe en silencio.
String.prototype.capitalize = function () { // librería A: solo la primera letra
  return this.charAt(0).toUpperCase() + this.slice(1);
};
const titleA = 'el laberinto de la soledad'.capitalize();
String.prototype.capitalize = function () { // librería B: cada palabra
  return this.split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};
const titleB = 'el laberinto de la soledad'.capitalize(); // el mismo código, otro resultado
console.log('🐛 antes / después →', titleA, '|', titleB);

// Limpieza: deshacemos los cambios para no afectar al resto de la página.
delete Array.prototype.last;
delete Object.prototype.isEmpty;
delete String.prototype.capitalize;

// ✅ La alternativa: funciones normales que reciben el valor.
const last = (array) => array.at(-1);
const isEmpty = (object) => Object.keys(object).length === 0;
console.log('✅ last(steps) →', last(steps), '| isEmpty({}) →', isEmpty({}));
for (const key in steps) console.log('✅ for…in limpio →', key);

// > Desde Python: no puedes hacer list.last = … (TypeError: cannot set 'last'
//   attribute of immutable type 'list'). JavaScript sí te deja, y por eso la
//   regla es de disciplina: no toques lo que no es tuyo.
```
