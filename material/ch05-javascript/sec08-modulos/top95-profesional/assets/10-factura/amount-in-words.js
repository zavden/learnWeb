// IMPORTE CON LETRA (ejemplo 10 de «Ejemplos profesionales»).
// En una factura mexicana, el total se escribe también con letra:
// 1179.00 → «MIL CIENTO SETENTA Y NUEVE PESOS 00/100 M.N.».
// Es el tipo de módulo que no hace falta al cargar la página (solo al
// facturar): se carga con import() cuando alguien lo va a usar. Este pesa
// unos pocos KB; los de verdad (PDF, gráficas, editores) pesan cientos.

const UNITS = [
  '', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve',
  'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve',
  'veinte', 'veintiuno', 'veintidós', 'veintitrés', 'veinticuatro', 'veinticinco', 'veintiséis', 'veintisiete', 'veintiocho', 'veintinueve',
];
const TENS = ['', '', '', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
const HUNDREDS = ['', 'ciento', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

function below100(n) {
  if (n < 30) return UNITS[n];
  const tens = Math.floor(n / 10);
  const units = n % 10;
  return units === 0 ? TENS[tens] : `${TENS[tens]} y ${UNITS[units]}`;
}

function below1000(n) {
  if (n === 100) return 'cien';
  return [HUNDREDS[Math.floor(n / 100)], below100(n % 100)].filter(Boolean).join(' ');
}

// Delante de un sustantivo (mil, millones, pesos), «uno» pierde la o:
// veintiuno → veintiún pesos, ciento uno → ciento un pesos.
function shorten(words) {
  if (words.endsWith('veintiuno')) return `${words.slice(0, -'veintiuno'.length)}veintiún`;
  if (words.endsWith('uno')) return `${words.slice(0, -'uno'.length)}un`;
  return words;
}

function integerToWords(n) {
  if (n === 0) return 'cero';
  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor(n / 1000) % 1000;
  const rest = n % 1000;
  const parts = [];
  if (millions > 0) parts.push(millions === 1 ? 'un millón' : `${shorten(integerToWords(millions))} millones`);
  if (thousands > 0) parts.push(thousands === 1 ? 'mil' : `${shorten(below1000(thousands))} mil`);
  if (rest > 0) parts.push(below1000(rest));
  return parts.join(' ');
}

export function amountInWords(cents) {
  if (!Number.isSafeInteger(cents) || cents < 0) throw new RangeError(`Importe no válido: ${cents}`);
  const pesos = Math.floor(cents / 100);
  const centavos = String(cents % 100).padStart(2, '0');
  const exactMillions = pesos >= 1_000_000 && pesos % 1_000_000 === 0; // «un millón DE pesos»
  const unit = pesos === 1 ? 'peso' : 'pesos';
  return `${shorten(integerToWords(pesos))}${exactMillions ? ' de' : ''} ${unit} ${centavos}/100 M.N.`.toUpperCase();
}
