---
example_description: "La zona muerta temporal (TDZ): let y const no se pueden leer antes de su declaración, ni siquiera con typeof"
example_tags: "javascript|python|variables|tdz|referenceerror|bug"
example_stage: common-error
example_importance: important
console: true
---

# JavaScript

```javascript
// let y const también se registran al principio de su bloque, pero SIN valor.
// Desde el inicio del bloque hasta su línea están en la «zona muerta temporal»
// (TDZ): leerlas ahí lanza ReferenceError.
try {
  console.log(level);
  let level = 3;
} catch (error) {
  console.log('1 →', error.name, '|', error.message); // Cannot access 'level' before initialization
}

// 🐛 La prueba de que se registran antes: la variable interior TAPA a la
// exterior desde el principio del bloque, antes incluso de su declaración.
const color = 'azul';
{
  try {
    console.log(color); // ¿'azul'? No: ya es el color de abajo, todavía en su TDZ
  } catch (error) {
    console.log('2 →', error.name, '|', error.message);
  }
  const color = 'rojo';
  console.log('3 → color interior:', color);
}
console.log('4 → color exterior:', color); // 'azul'

// 🐛 typeof no falla con nombres que no existen… pero sí en la TDZ.
console.log('5 → typeof neverDeclared:', typeof neverDeclared); // 'undefined'
try {
  console.log(typeof later);
  let later = 1;
} catch (error) {
  console.log('6 →', error.name, '|', error.message);
}

// Python tiene la misma idea con otro nombre (UnboundLocalError):
// color = "azul"
// def paint():
//     print(color)   # UnboundLocalError: la color local tapa a la global
//     color = "rojo"
```
