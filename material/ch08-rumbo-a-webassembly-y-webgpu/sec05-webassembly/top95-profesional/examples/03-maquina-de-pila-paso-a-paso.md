---
example_description: "La máquina de pila, paso a paso: el máximo común divisor de Euclides en WAT, ejecutado por un intérprete de JavaScript que enseña la pila, las variables locales y los bloques abiertos tras cada instrucción, con pasos hacia delante y hacia atrás (también con las flechas); el mismo texto, ensamblado con wat.js, da el mismo resultado que el intérprete"
example_tags: "javascript|webassembly|wasm|maquina-de-pila|interprete|block|loop|br|accesibilidad|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="stepper">
  <header>
    <h1>La máquina de pila, paso a paso</h1>
    <p>El máximo común divisor de Euclides, instrucción a instrucción.</p>
  </header>
  <div class="inputs">
    <label>a <input id="a" type="number" min="1" max="1000000" value="1071"></label>
    <label>b <input id="b" type="number" min="0" max="1000000" value="462"></label>
    <button id="reset" type="button">Empezar de nuevo</button>
  </div>
  <div id="machine" class="machine" tabindex="0" aria-describedby="keys">
    <ol id="program" class="program" aria-label="Programa"></ol>
    <div class="state">
      <section aria-labelledby="stack-title"><h2 id="stack-title">Pila <small>(la cima, arriba)</small></h2><ol id="stack" class="cells" reversed></ol></section>
      <section aria-labelledby="locals-title"><h2 id="locals-title">Locales</h2><dl id="locals" class="locals"></dl></section>
      <section aria-labelledby="frames-title"><h2 id="frames-title">Bloques abiertos</h2><ol id="frames" class="cells"></ol></section>
    </div>
  </div>
  <p id="keys" class="hint">Con el foco en la máquina: <kbd>→</kbd> un paso, <kbd>←</kbd> atrás, <kbd>Fin</kbd> hasta el final.</p>
  <div class="controls">
    <button id="back" type="button">◀ Atrás</button>
    <button id="step" type="button">Paso ▶</button>
    <button id="run" type="button">Hasta el final ⏭</button>
  </div>
  <p id="explain" class="explain" role="status"></p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; --current: #fef3c7; --current-ink: #78350f; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.stepper { max-width: 46rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0; font-size: 1.3rem; }
h2 { margin: 0 0 0.3rem; font-size: 0.9rem; }
h2 small { font-weight: 400; color: var(--muted); }
header p { margin: 0.2rem 0 0.75rem; color: var(--muted); }
.inputs, .controls { display: flex; flex-wrap: wrap; gap: 0.5rem 0.75rem; align-items: end; }
.inputs label { display: grid; gap: 0.15rem; font-family: Menlo, Consolas, monospace; }
input, button { font: inherit; padding: 0.3rem 0.6rem; border: 1px solid #64748b; border-radius: 0.4rem; background: var(--surface); color: var(--ink); }
input { inline-size: 8rem; }
button { cursor: pointer; }
button:disabled { cursor: not-allowed; color: var(--muted); }
:is(input, button, .machine):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.machine { display: grid; grid-template-columns: minmax(14rem, 1fr) minmax(12rem, 1fr); gap: 1rem; margin-block-start: 0.75rem; padding: 0.75rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); }
@media (max-width: 34rem) { .machine { grid-template-columns: 1fr; } }
.program { margin: 0; padding-inline-start: 2.2rem; font: 0.8rem/1.55 Menlo, Consolas, monospace; }
.program li { white-space: pre; }
.program li[aria-current] { background: var(--current); color: var(--current-ink); font-weight: 700; }
.state { display: grid; gap: 0.75rem; align-content: start; }
.cells { display: flex; flex-direction: column; gap: 0.2rem; min-block-size: 1.6rem; margin: 0; padding: 0; list-style: none; font-family: Menlo, Consolas, monospace; font-size: 0.85rem; }
.cells li { padding: 0.1rem 0.5rem; border: 1px solid var(--line); border-radius: 0.3rem; background: var(--page); }
.cells:empty::before { content: 'vacía'; color: var(--muted); font-size: 0.8rem; }
.locals { display: grid; grid-template-columns: auto 1fr; gap: 0.2rem 0.6rem; margin: 0; font-family: Menlo, Consolas, monospace; font-size: 0.85rem; }
.locals dd { margin: 0; }
.hint { font-size: 0.8rem; color: var(--muted); }
kbd { font: 0.75rem Menlo, Consolas, monospace; padding: 0 0.25rem; border: 1px solid var(--line); border-radius: 0.25rem; background: var(--surface); }
.explain { min-block-size: 2.9em; margin: 0.6rem 0 0; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
```

# JavaScript

```javascript
// La máquina de pila, paso a paso.
//
// Decisiones de diseño:
// - El programa es WAT de verdad, en forma plana: el mismo texto se ensambla con wat.js y se
//   ejecuta en WebAssembly, y el intérprete de JavaScript debe dar el mismo resultado (se
//   comprueba al cargar con 50 parejas de números).
// - El intérprete calcula, antes de empezar, dónde termina cada bloque: «br» a un block salta
//   detrás de su end; «br» a un loop, a su principio (lección «Qué es WebAssembly»).
// - Cada paso guarda una copia del estado (contador, pila, locales y bloques): «Atrás» solo
//   recupera la anterior. Como mucho 5000 pasos: el programa termina mucho antes, pero el
//   límite hace imposible un bucle sin fin aunque se edite el programa.
// - Los números son i32 de verdad: i32.rem_u y las comparaciones leen sin signo, como el módulo.
// - Teclado: la máquina tiene foco propio; → avanza, ← retrocede, Fin llega al final.
//
// Usa assets/wasm/wat.js y assets/wasm/emit.js.
// Alcance: HTML, CSS, JavaScript, DOM, eventos de teclado y este módulo.
import { assemble } from './wasm/wat.js';

const PROGRAM = [
  'block $done',
  '  loop $next',
  '    local.get $b',
  '    i32.eqz',
  '    br_if $done',
  '    local.get $a',
  '    local.get $b',
  '    i32.rem_u',
  '    local.set $t',
  '    local.get $b',
  '    local.set $a',
  '    local.get $t',
  '    local.set $b',
  '    br $next',
  '  end',
  'end',
  'local.get $a',
];
const LOCALS = ['$a', '$b', '$t'];
const WAT = `(module
  (func $gcd (export "gcd") (param $a i32) (param $b i32) (result i32) (local $t i32)
${PROGRAM.map((line) => `    ${line}`).join('\n')}))`;
const MAX_STEPS = 5000;

// --- El intérprete ---
const code = PROGRAM.map((line) => {
  const [name, operand] = line.trim().split(/\s+/);
  return { name, operand };
});
const matchingEnd = new Map(); // posición de block/loop → posición de su end
{
  const open = [];
  code.forEach((instruction, index) => {
    if (instruction.name === 'block' || instruction.name === 'loop') open.push(index);
    if (instruction.name === 'end') matchingEnd.set(open.pop(), index);
  });
}
const u32 = (value) => value >>> 0;
function initialState(a, b) {
  return { pc: 0, stack: [], locals: { $a: a | 0, $b: b | 0, $t: 0 }, frames: [], steps: 0, done: false, note: 'Preparado: los parámetros están en sus locales; la pila está vacía.' };
}
function branch(state, label) {
  const depth = state.frames.findLastIndex((frame) => frame.label === label);
  const frame = state.frames[depth];
  if (frame.kind === 'loop') {
    state.frames.length = depth + 1; // se queda dentro del loop
    state.pc = frame.start + 1;
    return `salta al principio de ${label} (un loop): otra vuelta`;
  }
  state.frames.length = depth; // sale del block
  state.pc = frame.end + 1;
  return `salta detrás del end de ${label} (un block): sale del bucle`;
}
function step(previous) {
  if (previous.done) return previous;
  const state = structuredClone(previous);
  state.steps += 1;
  const { name, operand } = code[state.pc];
  const pop = () => state.stack.pop();
  let note;
  switch (name) {
    case 'block':
    case 'loop':
      state.frames.push({ kind: name, label: operand, start: state.pc, end: matchingEnd.get(state.pc) });
      note = `abre ${operand} (un ${name})`;
      state.pc += 1;
      break;
    case 'end':
      note = `cierra ${state.frames.pop().label}`;
      state.pc += 1;
      break;
    case 'local.get':
      state.stack.push(state.locals[operand]);
      note = `apila ${operand}, que vale ${state.locals[operand]}`;
      state.pc += 1;
      break;
    case 'local.set':
      state.locals[operand] = pop();
      note = `desapila ${state.locals[operand]} y lo guarda en ${operand}`;
      state.pc += 1;
      break;
    case 'i32.eqz': {
      const value = pop();
      state.stack.push(value === 0 ? 1 : 0);
      note = `desapila ${value}; ¿es 0? apila ${value === 0 ? 1 : 0}`;
      state.pc += 1;
      break;
    }
    case 'i32.rem_u': {
      const right = pop();
      const left = pop();
      const result = u32(left) % u32(right) | 0; // con b = 0 sería una trampa; aquí nunca llega a 0
      state.stack.push(result);
      note = `desapila ${left} y ${right}; apila ${left} mod ${right} = ${result}`;
      state.pc += 1;
      break;
    }
    case 'br_if': {
      const condition = pop();
      if (condition !== 0) note = `desapila ${condition} (no es 0): ${branch(state, operand)}`;
      else { note = `desapila 0: no salta`; state.pc += 1; }
      break;
    }
    case 'br':
      note = branch(state, operand);
      break;
    default:
      throw new Error(`el intérprete no conoce «${name}»`);
  }
  if (state.pc >= code.length || state.steps >= MAX_STEPS) {
    state.done = true;
    note += ` · fin: el resultado es la cima de la pila, ${state.stack.at(-1)}`;
  }
  state.note = note;
  return state;
}
function runToEnd(state) {
  let current = state;
  while (!current.done) current = step(current);
  return current;
}

// --- La página ---
const aInput = document.querySelector('#a');
const bInput = document.querySelector('#b');
const programList = document.querySelector('#program');
const stackList = document.querySelector('#stack');
const localsList = document.querySelector('#locals');
const framesList = document.querySelector('#frames');
const explain = document.querySelector('#explain');
const backButton = document.querySelector('#back');
const stepButton = document.querySelector('#step');
const runButton = document.querySelector('#run');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
programList.replaceChildren(...PROGRAM.map((line) => Object.assign(document.createElement('li'), { textContent: line })));
let timeline = [];
const currentState = () => timeline.at(-1);

function render() {
  const state = currentState();
  [...programList.children].forEach((item, index) => {
    if (index === state.pc && !state.done) item.setAttribute('aria-current', 'step');
    else item.removeAttribute('aria-current');
  });
  stackList.replaceChildren(...state.stack.toReversed().map((value) => Object.assign(document.createElement('li'), { textContent: String(value) })));
  localsList.replaceChildren(...LOCALS.flatMap((name) => [Object.assign(document.createElement('dt'), { textContent: name }), Object.assign(document.createElement('dd'), { textContent: String(state.locals[name]) })]));
  framesList.replaceChildren(...state.frames.map((frame) => Object.assign(document.createElement('li'), { textContent: `${frame.kind} ${frame.label}` })));
  explain.textContent = `Paso ${state.steps}: ${state.note}`;
  backButton.disabled = timeline.length < 2;
  stepButton.disabled = runButton.disabled = state.done;
}
function reset({ log }) {
  const a = Math.trunc(aInput.valueAsNumber);
  const b = Math.trunc(bInput.valueAsNumber);
  if (!(a >= 1 && a <= 1000000 && b >= 0 && b <= 1000000)) {
    explain.textContent = 'a va de 1 a 1 000 000 y b, de 0 a 1 000 000.';
    return;
  }
  timeline = [initialState(a, b)];
  render();
  if (log) logLine(`gcd(${a}, ${b}): ${PROGRAM.length} instrucciones, ${LOCALS.length} locales`);
}

const { instance } = await WebAssembly.instantiate(assemble(WAT));
const { gcd } = instance.exports;
// El intérprete contra el módulo de verdad, con 50 parejas fijas.
const pairs = Array.from({ length: 50 }, (_, i) => [1 + ((i * 7919) % 100000), (i * 104729) % 50000]);
const agrees = pairs.every(([a, b]) => runToEnd(initialState(a, b)).stack.at(-1) === gcd(a, b));
logLine(`¿el intérprete y el módulo de wat.js coinciden en 50 parejas? ${agrees}`);

stepButton.addEventListener('click', () => { timeline.push(step(currentState())); render(); });
backButton.addEventListener('click', () => { if (timeline.length > 1) { timeline.pop(); render(); } });
runButton.addEventListener('click', () => {
  while (!currentState().done) timeline.push(step(currentState()));
  render();
  const state = currentState();
  const expected = gcd(timeline[0].locals.$a, timeline[0].locals.$b);
  logLine(`fin en el paso ${state.steps} · resultado ${state.stack.at(-1)} · ¿igual que el módulo de verdad? ${state.stack.at(-1) === expected}`);
});
document.querySelector('#reset').addEventListener('click', () => reset({ log: true }));
document.querySelector('#machine').addEventListener('keydown', (event) => {
  const actions = { ArrowRight: stepButton, ArrowLeft: backButton, End: runButton };
  const button = actions[event.key];
  if (!button) return;
  event.preventDefault();
  if (!button.disabled) button.click();
});
reset({ log: true });
logLine('Listo: pulsa «Paso ▶» (o → con el foco en la máquina) o «Hasta el final»');
```
