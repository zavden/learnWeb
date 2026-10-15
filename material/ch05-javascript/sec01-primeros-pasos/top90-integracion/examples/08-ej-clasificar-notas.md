---
example_description: "Ejercicio: clasificar notas que llegan como número o como texto, con errores claros para lo vacío, lo no numérico y lo que está fuera de rango"
example_tags: "javascript|ejercicio|coercion|errores|if"
exercise: true
exercise_title: "Clasifica notas con datos sucios"
exercise_instructions: "Si la nota es null, undefined, '' o solo espacios, lanza TypeError('Falta la nota') || Convierte el valor a número aceptando la coma decimal ('6,5' es 6.5) || Lanza TypeError si no es un número y RangeError si está fuera de 0…10 || Devuelve 'Suspenso' (< 5), 'Aprobado' (< 7), 'Notable' (< 9) o 'Sobresaliente' || Ejecuta hasta que todas las comprobaciones salgan con ✓"
exercise_hints: "x == null es true para null y para undefined: es la única excepción aceptada a «usa siempre ===» || No uses if (!input): el 0 es una nota válida y es falsy || String(input) te deja tratar igual números y textos antes de llamar a trim() || Number('') es 0, así que comprueba el texto vacío ANTES de convertir"
exercise_solution_example: 08-ej-clasificar-notas-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
// EJERCICIO: completa gradeLabel(input) para que todas las comprobaciones salgan ✓.
// La nota llega de un formulario o de un archivo: puede ser un número o un texto.
// (function se estudia en «Funciones y ámbito»; aquí basta con la sintaxis básica.)

function gradeLabel(input) {
  // TODO 1: si input es null, undefined, '' o solo espacios → throw new TypeError('Falta la nota')

  // TODO 2: convierte input a número, aceptando la coma decimal ('6,5' → 6.5)

  // TODO 3: si no es un número → TypeError; si está fuera de 0…10 → RangeError

  // TODO 4: devuelve 'Suspenso', 'Aprobado', 'Notable' o 'Sobresaliente'
  return '';
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, actual, expected) {
  if (actual === expected) {
    console.log('✓', description);
  } else {
    console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
  }
}

// Devuelve el nombre del error que lanza gradeLabel(input), o 'sin error'.
function errorNameOf(input) {
  try {
    gradeLabel(input);
    return 'sin error';
  } catch (error) {
    return error.name;
  }
}

check('4.9 → Suspenso', gradeLabel(4.9), 'Suspenso');
check('0 → Suspenso (el 0 es una nota válida)', gradeLabel(0), 'Suspenso');
check("'0' → Suspenso", gradeLabel('0'), 'Suspenso');
check('5 → Aprobado', gradeLabel(5), 'Aprobado');
check("'6,5' → Aprobado", gradeLabel('6,5'), 'Aprobado');
check("' 7 ' → Notable", gradeLabel(' 7 '), 'Notable');
check("'8.99' → Notable", gradeLabel('8.99'), 'Notable');
check('9 → Sobresaliente', gradeLabel(9), 'Sobresaliente');
check('10 → Sobresaliente', gradeLabel(10), 'Sobresaliente');
check("'' lanza TypeError", errorNameOf(''), 'TypeError');
check("'   ' lanza TypeError", errorNameOf('   '), 'TypeError');
check('null lanza TypeError', errorNameOf(null), 'TypeError');
check('undefined lanza TypeError', errorNameOf(undefined), 'TypeError');
check("'siete' lanza TypeError", errorNameOf('siete'), 'TypeError');
check('11 lanza RangeError', errorNameOf(11), 'RangeError');
check('-1 lanza RangeError', errorNameOf(-1), 'RangeError');
```
