// FÓRMULAS DE LA HOJA (ejemplo 12): de un texto como «=MIN(B7+B8, B12+C12)» a un
// árbol (AST), las celdas que lee y su valor. Sin DOM ni mensajes: lo usa el worker.
//
// Gramática, de menor a mayor prioridad (como en Excel en español de México: los
// argumentos se separan con «,» y los decimales llevan punto):
//   suma      := producto (('+' | '-') producto)*
//   producto  := potencia (('*' | '/') potencia)*
//   potencia  := signo ('^' signo)*            ← como en Excel, =-2^2 da 4
//   signo     := ('-' | '+') signo | primario
//   primario  := número | celda | NOMBRE '(' argumentos ')' | '(' suma ')'
//   argumento := celda ':' celda | suma         ← los rangos, solo dentro de funciones
//
// Un valor es un número, un texto, null (celda vacía) o un error { error, message }:
// un objeto normal, para que viaje con postMessage sin perder nada.

export const ERRORS = {
  syntax: '#¡ERROR!',  // la fórmula está mal escrita
  name: '#¿NOMBRE?',   // una función que no existe
  value: '#¡VALOR!',   // un texto donde hacía falta un número
  div0: '#¡DIV/0!',
  ref: '#¡REF!',       // una celda fuera de la hoja
  num: '#¡NUM!',       // un resultado infinito
  cycle: '#¡CICLO!',   // una referencia circular
};
export const cellError = (code, message) => ({ error: code, message });
export const isError = (value) => typeof value === 'object' && value !== null && 'error' in value;

export class FormulaSyntaxError extends Error {
  name = 'FormulaSyntaxError';
}

// ── Referencias: «B12» ↔ columna 2, fila 12 ────────────────────────────────
export function parseRef(ref) {
  const [, letters, digits] = /^([A-Z]{1,2})(\d+)$/.exec(ref);
  const column = [...letters].reduce((total, letter) => total * 26 + letter.charCodeAt(0) - 64, 0);
  return { column, row: Number(digits) };
}
export const columnName = (column) => (column > 26 ? columnName(Math.floor((column - 1) / 26)) : '')
  + String.fromCharCode(65 + ((column - 1) % 26));
export function expandRange(from, to) {
  const a = parseRef(from);
  const b = parseRef(to);
  const refs = [];
  for (let row = Math.min(a.row, b.row); row <= Math.max(a.row, b.row); row++) {
    for (let column = Math.min(a.column, b.column); column <= Math.max(a.column, b.column); column++) {
      refs.push(columnName(column) + row);
    }
  }
  return refs;
}

// ── Análisis ────────────────────────────────────────────────────────────────
const TOKEN = /\s*(?:(?<number>\d+(?:\.\d+)?)|(?<name>[A-Z][A-Z0-9.]*)(?=\s*\()|(?<cell>[A-Z]{1,2}[1-9]\d{0,3})|(?<op>[-+*/^(),:]))/y;

function tokenize(text) {
  const tokens = [];
  TOKEN.lastIndex = 0;
  while (TOKEN.lastIndex < text.length) {
    const start = TOKEN.lastIndex;
    const match = TOKEN.exec(text);
    if (!match) {
      const char = text.slice(start).trim()[0];
      if (char === undefined) break; // solo quedaban espacios
      throw new FormulaSyntaxError(char === ';' ? 'los argumentos se separan con «,», no con «;»' : `no se esperaba «${char}»`);
    }
    const [kind] = Object.entries(match.groups).find(([, value]) => value !== undefined);
    tokens.push({ kind, text: match.groups[kind] });
  }
  return tokens;
}

// «=B2*(1-B3/100)» → { type: 'binary', op: '*', left: { type: 'cell', ref: 'B2' }, right: … }
export function parseFormula(source) {
  const tokens = tokenize(source.toUpperCase());
  let position = 0;
  const peek = () => tokens[position];
  const isOp = (text) => peek()?.kind === 'op' && peek().text === text;
  const expect = (text, message) => {
    if (!isOp(text)) throw new FormulaSyntaxError(message);
    position += 1;
  };

  function sum() {
    let node = product();
    while (isOp('+') || isOp('-')) {
      const op = tokens[position++].text;
      node = { type: 'binary', op, left: node, right: product() };
    }
    return node;
  }
  function product() {
    let node = power();
    while (isOp('*') || isOp('/')) {
      const op = tokens[position++].text;
      node = { type: 'binary', op, left: node, right: power() };
    }
    return node;
  }
  function power() {
    let node = sign();
    while (isOp('^')) {
      position += 1;
      node = { type: 'binary', op: '^', left: node, right: sign() };
    }
    return node;
  }
  function sign() {
    if (isOp('-') || isOp('+')) {
      const op = tokens[position++].text;
      return { type: 'unary', op, argument: sign() };
    }
    return primary();
  }
  function primary() {
    const token = tokens[position++];
    if (!token) throw new FormulaSyntaxError('la fórmula está incompleta');
    if (token.kind === 'number') return { type: 'number', value: Number(token.text) };
    if (token.kind === 'cell') {
      if (isOp(':')) throw new FormulaSyntaxError('un rango (como C12:C251) solo puede ir dentro de una función');
      return { type: 'cell', ref: token.text };
    }
    if (token.kind === 'name') {
      position += 1; // el «(»
      const args = [];
      if (!isOp(')')) {
        args.push(argument());
        while (isOp(',')) {
          position += 1;
          args.push(argument());
        }
      }
      expect(')', `falta el «)» de ${token.text}`);
      return { type: 'call', name: token.text, args };
    }
    if (token.text === '(') {
      const node = sum();
      expect(')', 'falta un «)»');
      return node;
    }
    throw new FormulaSyntaxError(`no se esperaba «${token.text}»`);
  }
  function argument() {
    const [first, colon, last] = tokens.slice(position, position + 3);
    if (first?.kind === 'cell' && colon?.text === ':') {
      if (last?.kind !== 'cell') throw new FormulaSyntaxError('un rango va de una celda a otra, como C12:C251');
      position += 3;
      return { type: 'range', from: first.text, to: last.text };
    }
    return sum();
  }

  if (tokens.length === 0) throw new FormulaSyntaxError('la fórmula está vacía');
  const tree = sum();
  if (position < tokens.length) throw new FormulaSyntaxError(`sobra «${tokens[position].text}»`);
  return tree;
}

// Las celdas que lee una fórmula, con los rangos ya desplegados.
export function collectRefs(node, refs = new Set()) {
  if (node.type === 'cell') refs.add(node.ref);
  else if (node.type === 'range') expandRange(node.from, node.to).forEach((ref) => refs.add(ref));
  else if (node.type === 'unary') collectRefs(node.argument, refs);
  else if (node.type === 'binary') {
    collectRefs(node.left, refs);
    collectRefs(node.right, refs);
  } else if (node.type === 'call') node.args.forEach((arg) => collectRefs(arg, refs));
  return refs;
}

// ── Evaluación ──────────────────────────────────────────────────────────────
// read(ref) da el valor de una celda (o #¡REF! si está fuera de la hoja).
function toNumber(value) {
  if (value === null) return 0; // una celda vacía cuenta como 0
  if (typeof value === 'string') return cellError(ERRORS.value, `«${value}» es un texto, no un número`);
  return value; // un número o un error, que sigue su camino
}

function arithmetic(op, a, b) {
  if (op === '/' && b === 0) return cellError(ERRORS.div0, 'división entre cero');
  const result = op === '+' ? a + b : op === '-' ? a - b : op === '*' ? a * b : op === '/' ? a / b : a ** b;
  return Number.isFinite(result) ? result : cellError(ERRORS.num, 'el resultado no es un número finito');
}

// Las funciones de rango ignoran textos y celdas vacías, como en Excel.
function numbersOf(args) {
  const numbers = [];
  for (const arg of args) {
    for (const value of arg.range ? arg.values : [toNumber(arg.value)]) {
      if (isError(value)) return value;
      if (typeof value === 'number') numbers.push(value);
    }
  }
  return numbers;
}
function scalars(name, args, count) {
  if (args.length !== count || args.some((arg) => arg.range)) {
    return cellError(ERRORS.value, `${name} recibe ${count} números`);
  }
  const values = args.map((arg) => toNumber(arg.value));
  return values.find(isError) ?? values;
}

const FUNCTIONS = {
  SUMA: (args) => {
    const numbers = numbersOf(args);
    return isError(numbers) ? numbers : numbers.reduce((total, n) => total + n, 0);
  },
  PROMEDIO: (args) => {
    const numbers = numbersOf(args);
    if (isError(numbers)) return numbers;
    return numbers.length === 0 ? cellError(ERRORS.div0, 'PROMEDIO sin ningún número') : numbers.reduce((t, n) => t + n, 0) / numbers.length;
  },
  MIN: (args) => {
    const numbers = numbersOf(args);
    return isError(numbers) ? numbers : numbers.length === 0 ? 0 : Math.min(...numbers);
  },
  MAX: (args) => {
    const numbers = numbersOf(args);
    return isError(numbers) ? numbers : numbers.length === 0 ? 0 : Math.max(...numbers);
  },
  // REDONDEAR(x, decimales): las mitades se alejan del cero, como en Excel.
  REDONDEAR: (args) => {
    const values = scalars('REDONDEAR', args, 2);
    if (isError(values)) return values;
    const [x, digits] = values;
    const factor = 10 ** Math.trunc(digits);
    return (Math.sign(x) * Math.round(Math.abs(x) * factor)) / factor;
  },
  // PAGO(tasa por periodo, periodos, monto): el pago fijo de un préstamo. Negativo,
  // como en Excel: es dinero que sale.
  PAGO: (args) => {
    const values = scalars('PAGO', args, 3);
    if (isError(values)) return values;
    const [rate, periods, amount] = values;
    if (periods <= 0) return cellError(ERRORS.num, 'PAGO necesita al menos un periodo');
    return rate === 0 ? -amount / periods : (-amount * rate) / (1 - (1 + rate) ** -periods);
  },
};

export function evaluate(node, read) {
  switch (node.type) {
    case 'number':
      return node.value;
    case 'cell':
      return read(node.ref);
    case 'unary': {
      const value = toNumber(evaluate(node.argument, read));
      return isError(value) || node.op === '+' ? value : -value;
    }
    case 'binary': {
      const left = toNumber(evaluate(node.left, read));
      if (isError(left)) return left;
      const right = toNumber(evaluate(node.right, read));
      return isError(right) ? right : arithmetic(node.op, left, right);
    }
    case 'call': {
      const fn = FUNCTIONS[node.name];
      if (!fn) return cellError(ERRORS.name, `no existe la función ${node.name}`);
      const args = node.args.map((arg) => (arg.type === 'range'
        ? { range: true, values: expandRange(arg.from, arg.to).map(read) }
        : { range: false, value: evaluate(arg, read) }));
      return fn(args);
    }
    default:
      throw new TypeError(`nodo desconocido: ${node.type}`);
  }
}
