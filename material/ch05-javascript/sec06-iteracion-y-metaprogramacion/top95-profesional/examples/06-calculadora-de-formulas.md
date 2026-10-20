---
example_description: "Una calculadora de fórmulas para una hoja de presupuesto, sin expresiones regulares ni eval: un tokenizador generador que lee carácter a carácter, un envoltorio con peek(), un parser descendente recursivo que produce un árbol, un evaluador con variables y funciones permitidas, errores con la columna marcada y un recorrido del árbol con yield*"
example_tags: "javascript|profesional|generadores|yield-star|parser|tokenizador|iteradores"
example_stage: professional
example_importance: important
console: true
---

# JavaScript

```javascript
// CALCULADORA DE FÓRMULAS para una hoja de presupuesto.
//
// Decisiones:
// - tokenize() es un GENERADOR que lee el texto carácter a carácter y entrega
//   tokens { type, value, column }. Es perezoso: el parser pide tokens según los
//   necesita, así que un error de sintaxis detiene la lectura en ese punto.
// - Lookahead envuelve cualquier iterador y añade peek() (mirar el siguiente
//   sin consumirlo), lo que el protocolo iterable no trae.
// - Parser descendente recursivo. Precedencias como en Python (-3 ^ 2 es -9 y
//   la potencia se asocia por la derecha):
//     expression := term (('+' | '-') term)*
//     term       := factor (('*' | '/' | '%') factor)*
//     factor     := '-' factor | power
//     power      := primary ('^' factor)?
//     primary    := número | nombre | nombre '(' argumentos ')' | '(' expression ')'
// - El resultado es un árbol (AST) que se evalúa con variables (un Map) y una
//   lista cerrada de funciones: nunca se ejecuta texto del usuario como código.
// - Los errores llevan la columna, que se marca con un ^ bajo la fórmula.
// - Un generador recursivo con yield* recorre el árbol (para saber qué
//   variables usa una fórmula).
//
// Alcance: módulos 1-6 (sin expresiones regulares).

class FormulaError extends Error {
  constructor(message, column) {
    super(message);
    this.name = 'FormulaError';
    this.column = column;
  }
}

const isDigit = (ch) => ch >= '0' && ch <= '9';
const isLetter = (ch) => (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_';
const OPERATORS = new Set(['+', '-', '*', '/', '%', '^', '(', ')', ',']);
const stats = { tokens: 0 };

// ── 1. Tokenizador: un generador ───────────────────────────────────────────
function* tokenize(source) {
  let i = 0;
  while (i < source.length) {
    const ch = source[i];
    const column = i + 1;
    if (ch === ' ') {
      i += 1;
      continue;
    }
    stats.tokens += 1;
    if (isDigit(ch) || ch === '.') {
      let end = i;
      while (end < source.length && (isDigit(source[end]) || source[end] === '.')) end += 1;
      const text = source.slice(i, end);
      if (Number.isNaN(Number(text))) throw new FormulaError(`número mal escrito «${text}»`, column);
      yield { type: 'number', value: Number(text), column };
      i = end;
    } else if (isLetter(ch)) {
      let end = i;
      while (end < source.length && (isLetter(source[end]) || isDigit(source[end]))) end += 1;
      yield { type: 'name', value: source.slice(i, end), column };
      i = end;
    } else if (OPERATORS.has(ch)) {
      yield { type: 'operator', value: ch, column };
      i += 1;
    } else {
      throw new FormulaError(`carácter inesperado «${ch}»`, column);
    }
  }
  yield { type: 'end', value: 'fin de la fórmula', column: source.length + 1 };
}

// ── 2. Un iterador con peek() ──────────────────────────────────────────────
class Lookahead {
  #iterator;
  #buffered = null;
  constructor(iterable) {
    this.#iterator = iterable[Symbol.iterator]();
  }
  peek() {
    this.#buffered ??= this.#iterator.next().value;
    return this.#buffered;
  }
  next() {
    const token = this.peek();
    this.#buffered = null;
    return token;
  }
  accept(value) { // consume el token si es ese operador
    if (this.peek().type === 'operator' && this.peek().value === value) return this.next();
    return null;
  }
  expect(value) {
    const token = this.next();
    if (token.type !== 'operator' || token.value !== value) {
      throw new FormulaError(`se esperaba «${value}» y llegó «${token.value}»`, token.column);
    }
    return token;
  }
}

// ── 3. Parser descendente recursivo → árbol ────────────────────────────────
function parseFormula(source) {
  const tokens = new Lookahead(tokenize(source));

  function expression() {
    let node = term();
    for (let op; (op = tokens.accept('+') ?? tokens.accept('-')); ) node = { type: 'binary', op: op.value, left: node, right: term() };
    return node;
  }
  function term() {
    let node = factor();
    for (let op; (op = tokens.accept('*') ?? tokens.accept('/') ?? tokens.accept('%')); ) {
      node = { type: 'binary', op: op.value, left: node, right: factor(), column: op.column };
    }
    return node;
  }
  function factor() {
    if (tokens.accept('-')) return { type: 'negate', value: factor() };
    return power();
  }
  function power() {
    const base = primary();
    return tokens.accept('^') ? { type: 'binary', op: '^', left: base, right: factor() } : base;
  }
  function primary() {
    const token = tokens.next();
    if (token.type === 'number') return { type: 'number', value: token.value };
    if (token.type === 'name') {
      if (!tokens.accept('(')) return { type: 'name', name: token.value, column: token.column };
      const args = [];
      if (!tokens.accept(')')) {
        do args.push(expression());
        while (tokens.accept(','));
        tokens.expect(')');
      }
      return { type: 'call', name: token.value, args, column: token.column };
    }
    if (token.type === 'operator' && token.value === '(') {
      const inner = expression();
      tokens.expect(')');
      return inner;
    }
    throw new FormulaError(`se esperaba un número, un nombre o «(» y llegó «${token.value}»`, token.column);
  }

  const tree = expression();
  const rest = tokens.next();
  if (rest.type !== 'end') throw new FormulaError(`sobra «${rest.value}»`, rest.column);
  return tree;
}

// ── 4. Evaluar con variables y funciones permitidas ────────────────────────
const FUNCTIONS = new Map([
  ['max', Math.max],
  ['min', Math.min],
  ['round', (value, decimals = 0) => Math.round(value * 10 ** decimals) / 10 ** decimals],
]);

function evaluate(node, variables) {
  switch (node.type) {
    case 'number': return node.value;
    case 'negate': return -evaluate(node.value, variables);
    case 'name':
      if (!variables.has(node.name)) throw new FormulaError(`variable desconocida «${node.name}»`, node.column);
      return variables.get(node.name);
    case 'call': {
      const fn = FUNCTIONS.get(node.name);
      if (!fn) throw new FormulaError(`función desconocida «${node.name}» (hay: ${[...FUNCTIONS.keys()].join(', ')})`, node.column);
      return fn(...node.args.map((arg) => evaluate(arg, variables)));
    }
    case 'binary': {
      const a = evaluate(node.left, variables);
      const b = evaluate(node.right, variables);
      if ((node.op === '/' || node.op === '%') && b === 0) throw new FormulaError('división entre cero', node.column);
      return { '+': a + b, '-': a - b, '*': a * b, '/': a / b, '%': a % b, '^': a ** b }[node.op];
    }
  }
}

// ── 5. Recorrer el árbol con un generador recursivo ────────────────────────
function* walk(node) {
  yield node;
  for (const child of [node.left, node.right, node.value, ...(node.args ?? [])]) {
    if (typeof child === 'object' && child !== null) yield* walk(child);
  }
}

// ── La hoja de presupuesto ─────────────────────────────────────────────────
const sheet = new Map([['subtotal', 12500], ['iva', 0.16], ['precio', 380], ['descuento', 45], ['unidades', 12], ['meses', 6]]);

const formulas = [
  'subtotal * (1 + iva)',
  'max(precio - descuento, 0) * unidades',
  'round(subtotal * (1 + iva) / meses, 2)',
  '2 ^ 3 ^ 2',
  '-3 ^ 2',
  '12 * (3 + )',
  'precio $ 2',
  'costo * 2',
  'raiz(subtotal)',
  'subtotal / (meses - 6)',
];

// 12500 * 1.16 da 14499.999999999998 (IEEE-754, lección «Números»): el resultado
// se muestra redondeado con Intl, como haría una hoja de cálculo.
const display = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 6 });

for (const source of formulas) {
  try {
    console.log(`✅ ${source} = ${display.format(evaluate(parseFormula(source), sheet))}`);
  } catch (error) {
    if (!(error instanceof FormulaError)) throw error;
    console.warn(`⛔ ${source}\n   ${' '.repeat(error.column - 1)}^ columna ${error.column}: ${error.message}`);
  }
}

const tree = parseFormula('max(precio - descuento, 0) * unidades');
console.log('árbol →', JSON.stringify(tree, (key, value) => (key === 'column' ? undefined : value)));
console.log('variables que usa →', [...new Set(walk(tree).filter((node) => node.type === 'name').map((node) => node.name))]);

stats.tokens = 0;
try {
  parseFormula('(1 + ) * precio * unidades * meses * iva');
} catch (error) {
  console.log(`tokens leídos hasta el error → ${stats.tokens} (el tokenizador se detuvo con el parser)`);
}
```
