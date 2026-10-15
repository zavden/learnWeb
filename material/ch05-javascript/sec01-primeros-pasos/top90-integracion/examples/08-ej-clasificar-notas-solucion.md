---
example_description: "Solución: clasificar notas con datos sucios (== null, comprobar vacío antes de convertir, Number.isNaN, rangos)"
example_tags: "javascript|solucion|coercion|errores|if"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// SOLUCIÓN: clasificar notas con datos sucios.
// (function se estudia en «Funciones y ámbito»; aquí basta con la sintaxis básica.)

function gradeLabel(input) {
  // 1. Vacío. «input == null» cubre null y undefined a la vez (única excepción
  //    aceptada a ===). NO usamos !input: el 0 es falsy y es una nota válida.
  if (input == null || String(input).trim() === '') {
    throw new TypeError('Falta la nota');
  }

  // 2. Conversión explícita. Ya sabemos que no está vacío, así que Number()
  //    no puede convertir un campo vacío en un 0 falso.
  const score = Number(String(input).trim().replace(',', '.'));

  // 3. Validación. Number.isNaN(x) es true solo si x es NaN («Números»).
  if (Number.isNaN(score)) {
    throw new TypeError(`«${input}» no es una nota`);
  }
  if (score < 0 || score > 10) {
    throw new RangeError(`La nota ${score} está fuera de 0…10`);
  }

  // 4. Clasificación: de menor a mayor, cada else if ya sabe que no es menor.
  if (score < 5) {
    return 'Suspenso';
  } else if (score < 7) {
    return 'Aprobado';
  } else if (score < 9) {
    return 'Notable';
  } else {
    return 'Sobresaliente';
  }
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
