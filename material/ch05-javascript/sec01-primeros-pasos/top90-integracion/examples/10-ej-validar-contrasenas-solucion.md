---
example_description: "Solución: reglas de contraseña con typeof, for…of, comparaciones de caracteres y && para combinarlas"
example_tags: "javascript|solucion|for-of|comparacion|errores"
example_stage: final-solution
example_importance: important
console: true
---

# JavaScript

```javascript
// SOLUCIÓN: reglas de contraseña carácter a carácter.
// Solo contamos letras sin tilde (A-Z, a-z): las letras internacionales y los
// emojis tienen sus trampas y se ven en «Números, texto y colecciones».
// (function se estudia en «Funciones y ámbito».)

const MIN_LENGTH = 12;

function checkPassword(password) {
  // typeof descarta números, null, undefined… cualquier cosa que no sea texto.
  if (typeof password !== 'string') {
    throw new TypeError(`Se esperaba un string y llegó ${password === null ? 'null' : typeof password}`);
  }

  const rules = { length: password.length >= MIN_LENGTH, digit: false, upper: false, lower: false, symbol: false };

  // for…of recorre los caracteres del string (no los índices).
  for (const ch of password) {
    // Los strings se comparan por código de carácter: '0' < '1' < … < '9'.
    if (ch >= '0' && ch <= '9') {
      rules.digit = true;
    } else if (ch >= 'A' && ch <= 'Z') {
      rules.upper = true;
    } else if (ch >= 'a' && ch <= 'z') {
      rules.lower = true;
    } else if (ch !== ' ') {
      rules.symbol = true;
    }
  }

  return rules;
}

function isStrong(password) {
  const rules = checkPassword(password);
  return rules.length && rules.digit && rules.upper && rules.lower && rules.symbol;
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
