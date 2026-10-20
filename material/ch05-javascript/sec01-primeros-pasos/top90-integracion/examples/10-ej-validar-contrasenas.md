---
example_description: "Ejercicio: comprobar las reglas de una contraseña recorriendo sus caracteres con for…of y comparaciones de strings"
example_tags: "javascript|ejercicio|for-of|comparacion|errores"
exercise: true
exercise_title: "Valida contraseñas carácter a carácter"
exercise_instructions: "En checkPassword, lanza un TypeError si password no es un string || Marca length como true si tiene al menos 12 caracteres || Recorre los caracteres con for…of y marca digit, upper, lower y symbol según lo que encuentres || En isStrong, devuelve true solo si se cumplen todas las reglas || Ejecuta hasta que todas las comprobaciones salgan con ✓"
exercise_hints: "typeof password !== 'string' detecta todo lo que no es texto (también null) || Los strings se comparan por código de carácter: ch >= '0' && ch <= '9' es «es un dígito» || Un símbolo es un carácter que no es dígito, ni mayúscula, ni minúscula, ni espacio || Combina las cinco propiedades con &&"
exercise_solution_example: 10-ej-validar-contrasenas-solucion.md
example_stage: exercise
example_importance: important
console: true
---

# JavaScript

```javascript
// EJERCICIO: completa checkPassword y isStrong para que todas las comprobaciones salgan ✓.
// checkPassword devuelve un objeto con una propiedad booleana por regla:
//   length → al menos 12 caracteres
//   digit  → al menos un dígito (0-9)
//   upper  → al menos una mayúscula (A-Z)
//   lower  → al menos una minúscula (a-z)
//   symbol → al menos un carácter que no sea dígito, letra ni espacio
// Solo contamos letras sin tilde (A-Z, a-z): las letras internacionales y los
// emojis tienen sus trampas y se ven en «Números, texto y colecciones».
// (function se estudia en «Funciones y ámbito».)

function checkPassword(password) {
  // TODO 1: si password no es un string, lanza un TypeError.

  const rules = { length: false, digit: false, upper: false, lower: false, symbol: false };

  // TODO 2: comprueba la longitud (password.length).

  // TODO 3: recorre los caracteres con for…of y activa digit, upper, lower o symbol.

  return rules;
}

function isStrong(password) {
  const rules = checkPassword(password);
  // TODO 4: devuelve true solo si se cumplen las cinco reglas.
  return false;
}

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
function check(description, actual, expected) {
  if (actual === expected) {
    console.log('✓', description);
  } else {
    console.error('✗', description, '→ esperaba', expected, 'y obtuve', actual);
  }
}

function errorNameOf(value) {
  try {
    checkPassword(value);
    return 'sin error';
  } catch (error) {
    return error.name;
  }
}

check("length: 'corta' no llega a 12", checkPassword('corta').length, false);
check("length: 'una frase bastante larga' sí", checkPassword('una frase bastante larga').length, true);
check("digit: 'clave7' tiene un dígito", checkPassword('clave7').digit, true);
check("digit: 'clave' no tiene", checkPassword('clave').digit, false);
check("upper: 'Clave' tiene una mayúscula", checkPassword('Clave').upper, true);
check("upper: 'clave' no tiene", checkPassword('clave').upper, false);
check("lower: 'CLAVE' no tiene minúsculas", checkPassword('CLAVE').lower, false);
check("symbol: 'clave!' tiene un símbolo", checkPassword('clave!').symbol, true);
check("symbol: un espacio no cuenta como símbolo", checkPassword('clave larga').symbol, false);
check("isStrong('Tr3s-Tristes-Tigres') es true", isStrong('Tr3s-Tristes-Tigres'), true);
check("isStrong('trestristestigres') es false", isStrong('trestristestigres'), false);
check("isStrong('Tr3s-Tigres') es false (11 caracteres)", isStrong('Tr3s-Tigres'), false);
check('checkPassword(12345678) lanza TypeError', errorNameOf(12345678), 'TypeError');
check('checkPassword(null) lanza TypeError', errorNameOf(null), 'TypeError');
```
