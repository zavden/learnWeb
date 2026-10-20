---
example_description: "Un compilador de bolsillo: una fórmula como (precio * cantidad) - descuento se analiza (tokens, análisis descendente recursivo), se convierte en instrucciones f64 de una máquina de pila, se empaqueta en un módulo con emit.js y se ejecuta; muestra el WAT generado, compara con evaluar la fórmula en JavaScript y señala los errores con su posición"
example_tags: "javascript|webassembly|wasm|compilador|parser|f64|maquina-de-pila|formularios"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main class="calculator">
  <h1>Una calculadora que compila</h1>
  <label for="formula">Fórmula (números, variables, + − × ÷ y paréntesis)</label>
  <input id="formula" maxlength="120" value="(precio * cantidad) - descuento" autocomplete="off" spellcheck="false" aria-describedby="error">
  <p id="error" class="error" aria-live="polite"></p>
  <div id="variables" class="variables"></div>
  <p class="result">Resultado: <output id="result" aria-live="polite">—</output></p>
  <details open>
    <summary>El WAT que genera</summary>
    <pre id="wat"></pre>
  </details>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
.calculator { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.75rem; }
label { display: block; font-size: 0.9rem; margin-block-end: 0.25rem; }
input { box-sizing: border-box; font: inherit; padding: 0.35rem 0.5rem; border: 1px solid #64748b; border-radius: 0.4rem; background: #ffffff; color: #1e293b; }
#formula { inline-size: 100%; font-family: Menlo, Consolas, monospace; }
input:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.error { min-block-size: 1.3em; margin: 0.3rem 0; color: #9f1239; font-size: 0.85rem; }
.variables { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; }
.variables input { inline-size: 7rem; }
.result { font-size: 1.1rem; }
output { font-weight: 700; }
pre { margin: 0.4rem 0 0; padding: 0.5rem; border-radius: 0.4rem; background: #0f172a; color: #e2e8f0; font-size: 0.8rem; overflow-x: auto; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background: #ffffff; font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
// Usa assets/wasm/emit.js (léelo con «Assets»).
import { encodeModule, op, f64Const, F64 } from './wasm/emit.js';

const F64_NEG = 0x9a; // f64.neg: no está en la tabla de emit.js
const OPCODES = { '+': op.f64_add, '-': op.f64_sub, '*': op.f64_mul, '/': op.f64_div };
const WAT_NAMES = { '+': 'f64.add', '-': 'f64.sub', '*': 'f64.mul', '/': 'f64.div' };
const DEFAULTS = { precio: 249.5, cantidad: 3, descuento: 100, iva: 0.16, envio: 99 };
class FormulaError extends Error {}

// 1. Texto → tokens: números, nombres de variable y símbolos, con su posición (desde 1).
function tokenize(text) {
  const tokens = [];
  const pattern = /(\d+(?:\.\d+)?)|([a-záéíóúüñ_][a-z0-9áéíóúüñ_]*)|([-+*/()])|(\S)/giuy;
  let index = 0;
  while (index < text.length) {
    if (/\s/.test(text[index])) { index += 1; continue; }
    pattern.lastIndex = index;
    const [match, number, name, symbol, other] = pattern.exec(text);
    if (other) throw new FormulaError(`posición ${index + 1}: «${other}» no es parte de una fórmula`);
    tokens.push({ kind: number ? 'number' : name ? 'name' : symbol, value: number ? Number(number) : match, at: index + 1 });
    index += match.length;
  }
  tokens.push({ kind: 'end', at: text.length + 1 });
  return tokens;
}

// 2. Tokens → árbol, con la precedencia de siempre: (…) antes que × ÷, antes que + −.
function parse(tokens) {
  let k = 0;
  const peek = () => tokens[k];
  const expect = (kind, message) => {
    if (peek().kind !== kind) throw new FormulaError(`posición ${peek().at}: ${message}`);
    return tokens[k++];
  };
  function expression() { // término ((+|−) término)*
    let node = term();
    while (peek().kind === '+' || peek().kind === '-') node = { type: 'binary', op: tokens[k++].kind, left: node, right: term() };
    return node;
  }
  function term() { // factor ((×|÷) factor)*
    let node = factor();
    while (peek().kind === '*' || peek().kind === '/') node = { type: 'binary', op: tokens[k++].kind, left: node, right: factor() };
    return node;
  }
  function factor() { // número | variable | (expresión) | −factor
    const token = peek();
    if (token.kind === 'number') { k++; return { type: 'number', value: token.value }; }
    if (token.kind === 'name') { k++; return { type: 'variable', name: token.value.toLowerCase() }; }
    if (token.kind === '-') { k++; return { type: 'negate', arg: factor() }; }
    if (token.kind === '(') {
      k++;
      const inner = expression();
      expect(')', 'falta un «)»');
      return inner;
    }
    throw new FormulaError(`posición ${token.at}: se esperaba un número, una variable o «(»`);
  }
  const tree = expression();
  expect('end', `sobra «${peek().value ?? ''}»`);
  return tree;
}

// 3. Árbol → instrucciones de una máquina de pila: primero los operandos, después la operación.
function compile(tree) {
  const params = [];
  const body = [];
  const wat = [];
  (function emit(node) {
    if (node.type === 'number') { body.push(...f64Const(node.value)); wat.push(`f64.const ${node.value}`); return; }
    if (node.type === 'variable') {
      if (!params.includes(node.name)) params.push(node.name); // un parámetro por variable
      body.push(op.local_get, params.indexOf(node.name));
      wat.push(`local.get $${node.name}`);
      return;
    }
    if (node.type === 'negate') { emit(node.arg); body.push(F64_NEG); wat.push('f64.neg'); return; }
    emit(node.left);
    emit(node.right);
    body.push(OPCODES[node.op]);
    wat.push(WAT_NAMES[node.op]);
  })(tree);
  const bytes = encodeModule({
    types: [[params.map(() => F64), [F64]]],
    funcs: [{ type: 0, body }],
    exports: { formula: { func: 0 } },
  });
  return { params, bytes, wat };
}
// La referencia: evaluar el mismo árbol en JavaScript.
function evaluate(node, values) {
  switch (node.type) {
    case 'number': return node.value;
    case 'variable': return values[node.name];
    case 'negate': return -evaluate(node.arg, values);
    default: {
      const a = evaluate(node.left, values);
      const b = evaluate(node.right, values);
      return node.op === '+' ? a + b : node.op === '-' ? a - b : node.op === '*' ? a * b : a / b;
    }
  }
}

const formulaInput = document.querySelector('#formula');
const errorText = document.querySelector('#error');
const variablesBox = document.querySelector('#variables');
const resultOutput = document.querySelector('#result');
const watBlock = document.querySelector('#wat');
const logList = document.querySelector('#log');
const values = { ...DEFAULTS };
let current = null; // { tree, params, formula, bytes, wat }
let latest = 0;     // cada reconstrucción lleva un número: solo cuenta la última
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

async function rebuild(log) {
  const ticket = ++latest;
  try {
    const tree = parse(tokenize(formulaInput.value));
    const { params, bytes, wat } = compile(tree);
    const { instance } = await WebAssembly.instantiate(bytes);
    if (ticket !== latest) return; // mientras compilaba, llegó otra tecla
    current = { tree, params, bytes, wat, formula: instance.exports.formula };
    errorText.textContent = '';
    formulaInput.removeAttribute('aria-invalid');
    variablesBox.replaceChildren(...params.map((name) => {
      if (!(name in values)) values[name] = 1;
      const input = Object.assign(document.createElement('input'), { type: 'number', step: 'any', value: values[name], id: `var-${name}` });
      input.addEventListener('input', () => { values[name] = input.valueAsNumber; show(false); });
      input.addEventListener('change', () => show(true));
      const label = Object.assign(document.createElement('label'), { htmlFor: input.id, textContent: name });
      label.append(input);
      return label;
    }));
    const signature = params.map((name) => `(param $${name} f64)`).join(' ');
    watBlock.textContent = `(module\n  (func (export "formula") ${signature} (result f64)\n${wat.map((line) => `    ${line}`).join('\n')}))`;
    if (log) {
      logLine(`fórmula → ${formulaInput.value.trim()}`);
      logLine(`parámetros → ${params.join(', ') || '(ninguno)'}`);
      logLine(`WAT → ${wat.join(' · ')}`);
      logLine(`módulo → ${bytes.length} bytes · ¿válido? ${WebAssembly.validate(bytes)}`);
    }
    show(log);
  } catch (error) {
    if (!(error instanceof FormulaError)) throw error;
    current = null;
    errorText.textContent = `Error en la ${error.message}`;
    formulaInput.setAttribute('aria-invalid', 'true');
    resultOutput.textContent = '—';
    if (log) logLine(`❗ ${error.message}`);
  }
}
function show(log) {
  if (!current) return;
  const args = current.params.map((name) => values[name]);
  const result = current.formula(...args);
  resultOutput.textContent = String(result);
  if (log) logLine(`formula(${args.join(', ')}) → ${result} · ¿igual que en JavaScript? ${Object.is(result, evaluate(current.tree, values))}`);
}

formulaInput.addEventListener('input', () => rebuild(false)); // la página, en cada tecla
formulaInput.addEventListener('change', () => rebuild(true)); // la consola, al pulsar Intro o salir
await rebuild(true);
logLine('Listo: escribe otra fórmula y pulsa Intro, o cambia los valores');

// La calculadora no usa eval(): su lenguaje solo sabe sumar, restar, multiplicar y dividir,
// y el módulo que genera no importa nada. Así se ejecutan fórmulas escritas por usuarios.
```
