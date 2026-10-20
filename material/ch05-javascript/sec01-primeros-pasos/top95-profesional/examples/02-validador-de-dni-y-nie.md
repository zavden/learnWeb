---
example_description: "Validador de DNI y NIE españoles con letra de control: normalización, switch, % 23 y resultados con motivo"
example_tags: "javascript|profesional|validacion|dni|switch|consola"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// VALIDADOR DE DNI Y NIE (documentos de identidad de España).
//
// La letra final es un dígito de control: el número % 23 indica su posición en
// CONTROL_LETTERS. En el NIE, la letra inicial X, Y o Z se sustituye por 0, 1 o 2
// antes de calcular.
//
// Decisiones de diseño:
// - La entrada DEBE ser texto: un DNI guardado como número pierde los ceros
//   iniciales (00123456 → 123456). Si no es un string, es un error del programa
//   (TypeError), no un dato inválido.
// - Para datos inválidos no lanzamos: devolvemos { valid, kind, detail } con el
//   MOTIVO, que es lo que el formulario necesita mostrar.
//
// Alcance: function se estudia en «Funciones y ámbito»; objetos y métodos de
// string (toUpperCase, slice) en «Números, texto y colecciones».

const CONTROL_LETTERS = 'TRWAGMYFPDXBNJZSQVHLCKE';

function isDigit(ch) {
  return ch >= '0' && ch <= '9';
}

// '1234 5678-z' → '12345678Z': mayúsculas y sin los separadores habituales.
function normalizeId(input) {
  if (typeof input !== 'string') {
    throw new TypeError(`el documento debe ser texto, no ${input === null ? 'null' : typeof input}`);
  }
  let clean = '';
  for (const ch of input.toUpperCase()) {
    if (ch !== ' ' && ch !== '-' && ch !== '.') {
      clean += ch;
    }
  }
  return clean;
}

function validateSpanishId(input) {
  const id = normalizeId(input);

  if (id.length !== 9) {
    return { valid: false, kind: '?', detail: `debe tener 9 caracteres (tiene ${id.length})` };
  }

  // El primer carácter decide el tipo de documento.
  let kind = 'NIE';
  let digits;
  switch (id[0]) {
    case 'X':
      digits = '0';
      break;
    case 'Y':
      digits = '1';
      break;
    case 'Z':
      digits = '2';
      break;
    default:
      kind = 'DNI';
      digits = id[0];
  }
  digits += id.slice(1, 8);

  for (const ch of digits) {
    if (!isDigit(ch)) {
      return { valid: false, kind: kind, detail: `«${ch}» no es un dígito` };
    }
  }

  const letter = id[8];
  // Number(digits) es seguro: ya sabemos que son 8 dígitos (muy lejos de 2 ** 53).
  const expected = CONTROL_LETTERS[Number(digits) % 23];
  if (letter !== expected) {
    return { valid: false, kind: kind, detail: `la letra debería ser «${expected}», no «${letter}»` };
  }
  return { valid: true, kind: kind, detail: id };
}

// ── Pruebas con documentos de ejemplo (ficticios) ──────────────────────

const samples = [
  '12345678Z',
  ' 1234 5678-z ',
  '12345678A',
  'X1234567L',
  'Y1234567X',
  'Z7654321H',
  'X1234567A',
  '1234567Z',
  '12345A78Z',
  'W1234567L',
];

const results = {};
for (const sample of samples) {
  results[`«${sample}»`] = validateSpanishId(sample);
}
console.table(results);

// Un número en lugar de un texto es un fallo del programa, no del usuario:
try {
  validateSpanishId(12345678);
} catch (error) {
  console.log('❌', error.name, '|', error.message);
}
```
