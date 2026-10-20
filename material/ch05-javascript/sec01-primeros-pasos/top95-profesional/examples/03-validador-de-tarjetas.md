---
example_description: "Validador de números de tarjeta: algoritmo de Luhn, detección de marca por prefijo y longitud, y enmascarado para no exponer el número"
example_tags: "javascript|profesional|validacion|luhn|seguridad|consola"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// VALIDADOR DE NÚMEROS DE TARJETA para una tienda que acepta Visa, Mastercard y
// American Express.
//
// - El algoritmo de Luhn (1954) detecta casi todas las erratas de un dígito y la
//   mayoría de los dígitos intercambiados. NO dice si la tarjeta existe ni si tiene
//   saldo: eso solo lo sabe el banco.
// - Seguridad: un número de tarjeta nunca se imprime completo, ni siquiera en la
//   consola. Todo lo que mostramos va enmascarado (•••• 1111).
// - Los números son los de PRUEBA públicos que usan las pasarelas de pago.
//
// Alcance: function se estudia en «Funciones y ámbito»; arrays, objetos y métodos de
// string (slice) en «Números, texto y colecciones».

function isDigit(ch) {
  return ch >= '0' && ch <= '9';
}

// '4111 1111-1111 1111' → '4111111111111111'. Admite espacios y guiones; nada más.
function extractDigits(input) {
  if (typeof input !== 'string') {
    throw new TypeError('el número de tarjeta debe llegar como texto');
  }
  let digits = '';
  for (const ch of input) {
    if (isDigit(ch)) {
      digits += ch;
    } else if (ch !== ' ' && ch !== '-') {
      throw new RangeError(`carácter no válido «${ch}»`);
    }
  }
  if (digits === '') {
    throw new RangeError('no hay ningún dígito');
  }
  return digits;
}

// Luhn: desde la derecha, se dobla un dígito sí y otro no; si al doblar pasa de 9,
// se le resta 9. El número es válido si la suma total es múltiplo de 10.
function passesLuhn(digits) {
  let sum = 0;
  let doubleIt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let value = Number(digits[i]);
    if (doubleIt) {
      value *= 2;
      if (value > 9) {
        value -= 9;
      }
    }
    sum += value;
    doubleIt = !doubleIt;
  }
  return sum % 10 === 0;
}

// Marca según el prefijo (IIN) y la longitud admitida para esa marca.
function detectBrand(digits) {
  const first2 = Number(digits.slice(0, 2));
  const first4 = Number(digits.slice(0, 4));
  const length = digits.length;

  if (digits[0] === '4' && (length === 13 || length === 16 || length === 19)) {
    return 'Visa';
  }
  if (((first2 >= 51 && first2 <= 55) || (first4 >= 2221 && first4 <= 2720)) && length === 16) {
    return 'Mastercard';
  }
  if ((first2 === 34 || first2 === 37) && length === 15) {
    return 'American Express';
  }
  return null;
}

function mask(digits) {
  return digits.length >= 4 ? `•••• ${digits.slice(-4)}` : '••••';
}

function checkCard(input) {
  let digits;
  try {
    digits = extractDigits(input);
  } catch (error) {
    if (error instanceof TypeError) {
      throw error; // fallo del programa: que suba
    }
    return { card: '—', brand: '—', valid: false, detail: error.message };
  }

  const card = mask(digits);
  const brand = detectBrand(digits);
  if (brand === null) {
    return { card: card, brand: '—', valid: false, detail: `marca no admitida o longitud incorrecta (${digits.length} dígitos)` };
  }
  if (!passesLuhn(digits)) {
    return { card: card, brand: brand, valid: false, detail: 'número mal escrito (falla el control de Luhn)' };
  }
  return { card: card, brand: brand, valid: true, detail: 'correcto' };
}

// ── Pruebas ─────────────────────────────────────────────────────────────

const inputs = [
  '4111 1111 1111 1111',
  '5555-5555-5555-4444',
  '2223 0031 2200 3222',
  '3782 822463 10005',
  '4111 1111 1111 1112', // un dígito cambiado
  '4111 1111 1111 111O', // una O en lugar de un 0: errata real
  '3782 822463 1000',    // le falta un dígito
  '6011 1111 1111 1117', // Discover: válida, pero esta tienda no la acepta
  '   ',
];

const rows = [];
for (const input of inputs) {
  rows.push(checkCard(input));
}
console.table(rows);
```
