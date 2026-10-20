---
example_description: "Una flecha o expresión de función guardada en const no se puede llamar antes de su línea (TDZ); con var da «is not a function»"
example_tags: "javascript|hoisting|flecha|tdz|var|bug"
example_stage: common-error
example_importance: critical
console: true
---

# JavaScript

```javascript
// 🐛 Con una expresión de función (o una flecha) solo se eleva la VARIABLE,
// con las reglas de su const / let / var. La función llega al ejecutar su línea.

// const / let: la variable está en la zona muerta temporal hasta su línea.
try {
  console.log(slugify('Hola Mundo'));
} catch (error) {
  console.log('🐛 const + flecha →', error.name, '|', error.message);
}
const slugify = (text) => text.trim().toLowerCase().replaceAll(' ', '-');

// var: la variable existe desde el principio… valiendo undefined.
try {
  console.log(capitalize('lima'));
} catch (error) {
  console.log('🐛 var + function →', error.name, '|', error.message);
}
var capitalize = function (text) {
  return text[0].toUpperCase() + text.slice(1);
};

// ✅ Después de su línea, las dos funcionan.
console.log('slugify →', slugify('Hola Mundo'));  // 'hola-mundo'
console.log('capitalize →', capitalize('lima'));  // 'Lima'

// ✅ Lo que importa es CUÁNDO se ejecuta la llamada, no dónde está escrita.
// Una función puede mencionar una const de más abajo si se LLAMA después de
// que esa línea se haya ejecutado:
function makeBadge(fullName) {
  return `👤 ${formatName(fullName)}`; // formatName está más abajo…
}
const formatName = (text) => text.split(' ').map(capitalize).join(' ');
console.log('makeBadge →', makeBadge('ana maría lópez')); // …pero ya existe al llamar

// Resumen de lo que se eleva:
//   function f() {}        → la función entera (se puede llamar antes)
//   var f = function…      → la variable, con undefined («f is not a function»)
//   const/let f = …        → la variable, sin inicializar (ReferenceError, TDZ)
```
