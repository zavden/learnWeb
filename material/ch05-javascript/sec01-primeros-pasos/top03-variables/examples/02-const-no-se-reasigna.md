---
example_description: "const impide reasignar la variable: =, += y ++ lanzan TypeError"
example_tags: "javascript|variables|const|typeerror"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// const declara una variable que NO se puede reasignar.
const greeting = 'Hola';
console.log('greeting →', greeting);

try {
  greeting = 'Adiós'; // ❌ reasignar una const
} catch (error) {
  console.log('greeting = … →', error.name, '|', error.message); // Assignment to constant variable.
}
console.log('greeting sigue siendo →', greeting);

// += y ++ también son reasignaciones.
const attempts = 0;
try {
  attempts++;
} catch (error) {
  console.log('attempts++ →', error.name, '|', error.message);
}

// const exige valor inicial: «const empty;» es un SyntaxError
// (rompería el script entero, por eso no está aquí).

// Regla del curso: const por defecto; let solo si vas a reasignar.
// Así, cuando ves un let, sabes que ese valor cambia más adelante.
```
