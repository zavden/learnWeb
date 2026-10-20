---
example_description: "Números aleatorios reproducibles con enteros de 64 bits: el generador xorshift64* en WAT (i64 de verdad) y el mismo en JavaScript con BigInt dan la misma secuencia y la misma estimación de π por Monte Carlo para una semilla; medido desde un botón, aquí WebAssembly gana por mucho, porque JavaScript no tiene enteros de 64 bits rápidos"
example_tags: "javascript|webassembly|wasm|i64|bigint|prng|monte-carlo|benchmark|profesional"
example_stage: professional
example_importance: important
console: true
loop_protect: false
---

# HTML

```html
<main class="lab">
  <header>
    <h1>π por Monte Carlo, con 64 bits</h1>
    <p>Puntos al azar en un cuadrado: la fracción que cae dentro del círculo, por 4, se acerca a π.</p>
  </header>
  <div class="controls">
    <label>Semilla <input id="seed" value="2026" inputmode="numeric" autocomplete="off" spellcheck="false"></label>
    <label>Puntos
      <select id="samples">
        <option value="100000">100 000</option>
        <option value="1000000" selected>1 000 000</option>
        <option value="5000000">5 000 000</option>
      </select>
    </label>
    <button id="estimate" type="button">Estimar π</button>
    <button id="bench" type="button">Comparar con BigInt</button>
  </div>
  <p class="result">π ≈ <output id="pi" aria-live="polite">—</output> <span id="error" class="error"></span></p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --page: #f8fafc; --surface: #ffffff; --accent: #1d4ed8; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.lab { max-width: 38rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0; font-size: 1.3rem; }
header p { margin: 0.2rem 0 0.75rem; color: var(--muted); }
.controls { display: flex; flex-wrap: wrap; gap: 0.5rem 0.75rem; align-items: end; }
label { display: grid; gap: 0.15rem; font-size: 0.9rem; }
input, select, button { font: inherit; padding: 0.3rem 0.6rem; border: 1px solid #64748b; border-radius: 0.4rem; background: var(--surface); color: var(--ink); }
input { inline-size: 12rem; font-family: Menlo, Consolas, monospace; }
button { cursor: pointer; }
button:disabled { cursor: progress; }
:is(input, select, button):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.result { font-size: 1.2rem; }
output { font-family: Menlo, Consolas, monospace; font-weight: 700; }
.error { font-size: 0.85rem; color: var(--muted); }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; overflow-wrap: anywhere; }
```

# JavaScript

```javascript
// loop_protect: false (en la cabecera): hay medidas; todos los bucles terminan.
//
// Decisiones de diseño:
// - xorshift64* (Sebastiano Vigna): tres desplazamientos con XOR sobre un estado de 64 bits y
//   una multiplicación módulo 2⁶⁴. Rápido, de buena calidad para simulaciones (no para
//   criptografía: para eso, crypto.getRandomValues) y, sobre todo, reproducible: la misma
//   semilla da los mismos números en cualquier máquina.
// - En WebAssembly el estado es un i64: cada operación es una instrucción de la CPU. En
//   JavaScript hace falta BigInt, que no tiene tamaño fijo: cada operación crea un número
//   nuevo y hay que recortarlo a 64 bits con & MASK (lección «Bits y bytes»).
// - Un número de [0, 1) son los 53 bits altos por 2⁻⁵³: exacto en un f64, así que las dos
//   versiones generan los MISMOS puntos y dan la misma estimación, bit a bit.
// - El bucle de WebAssembly tiene un límite fijo (10 millones de puntos). Las medidas, desde
//   un botón, con la CPU despierta y menos de 300 ms de trabajo por pulsación.
//
// Usa assets/wasm/wat.js y assets/wasm/emit.js.
// Alcance: HTML, CSS, JavaScript, DOM, eventos, BigInt, Intl y este módulo.
import { assemble } from './wasm/wat.js';

const WAT = `(module
  (global $state (mut i64) (i64.const 1))
  (func $seed (export "seed") (param $s i64)                    ;; una semilla 0 dejaría el generador en 0
    (global.set $state (select (local.get $s) (i64.const 1) (i64.ne (local.get $s) (i64.const 0)))))
  (func $next (export "next") (result i64) (local $x i64)
    (local.set $x (global.get $state))
    (local.set $x (i64.xor (local.get $x) (i64.shr_u (local.get $x) (i64.const 12))))
    (local.set $x (i64.xor (local.get $x) (i64.shl (local.get $x) (i64.const 25))))
    (local.set $x (i64.xor (local.get $x) (i64.shr_u (local.get $x) (i64.const 27))))
    (global.set $state (local.get $x))
    (i64.mul (local.get $x) (i64.const 0x2545F4914F6CDD1D)))
  (func $uniform (result f64)                                    ;; [0, 1): 53 bits por 2^-53
    (f64.mul (f64.convert_i64_u (i64.shr_u (call $next) (i64.const 11))) (f64.const 1.1102230246251565e-16)))
  (func $estimatePi (export "estimatePi") (param $samples i32) (result f64)
    (local $i i32) (local $inside i32) (local $x f64) (local $y f64)
    (if (i32.gt_u (local.get $samples) (i32.const 10000000))     ;; límite fijo de vueltas
      (then (local.set $samples (i32.const 10000000))))
    block $done
      loop $more
        (br_if $done (i32.ge_u (local.get $i) (local.get $samples)))
        (local.set $x (call $uniform))
        (local.set $y (call $uniform))
        (if (f64.le (f64.add (f64.mul (local.get $x) (local.get $x)) (f64.mul (local.get $y) (local.get $y))) (f64.const 1))
          (then (local.set $inside (i32.add (local.get $inside) (i32.const 1)))))
        (local.set $i (i32.add (local.get $i) (i32.const 1)))
        br $more
      end
    end
    (f64.div (f64.mul (f64.const 4) (f64.convert_i32_u (local.get $inside))) (f64.convert_i32_u (local.get $samples)))))`;
const { instance } = await WebAssembly.instantiate(assemble(WAT));
const wasm = instance.exports;

// --- El mismo generador con BigInt ---
const MASK = (1n << 64n) - 1n;
class XorShift64Star {
  constructor(seed) { this.state = seed === 0n ? 1n : BigInt.asUintN(64, seed); }
  next() {
    let x = this.state;
    x ^= x >> 12n;
    x ^= (x << 25n) & MASK;
    x ^= x >> 27n;
    this.state = x;
    return (x * 0x2545f4914f6cdd1dn) & MASK;
  }
  uniform() { return Number(this.next() >> 11n) * 2 ** -53; }
}
function estimatePiBigInt(seed, samples) {
  const random = new XorShift64Star(seed);
  let inside = 0;
  for (let i = 0; i < samples; i++) {
    const x = random.uniform();
    const y = random.uniform();
    if (x * x + y * y <= 1) inside += 1;
  }
  return (4 * inside) / samples;
}

const seedInput = document.querySelector('#seed');
const samplesSelect = document.querySelector('#samples');
const piOutput = document.querySelector('#pi');
const errorText = document.querySelector('#error');
const logList = document.querySelector('#log');
const hex64 = (value) => BigInt.asUintN(64, value).toString(16).padStart(16, '0');
const grouped = new Intl.NumberFormat('es-MX');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
function readSeed() {
  const text = seedInput.value.trim();
  if (!/^\d{1,20}$/.test(text) || BigInt(text) > MASK) throw new RangeError('la semilla es un entero de 0 a 18446744073709551615');
  return BigInt(text);
}
function wakeCpu(ms) {
  const end = performance.now() + ms;
  let x = 0;
  while (performance.now() < end) x += Math.sqrt(x + 1);
  return x;
}

// Al cargar: la misma secuencia en los dos lados, y una estimación pequeña.
{
  const seed = readSeed();
  wasm.seed(seed);
  const reference = new XorShift64Star(seed);
  const fromWasm = Array.from({ length: 4 }, () => hex64(wasm.next()));
  const fromBigInt = Array.from({ length: 4 }, () => hex64(reference.next()));
  logLine(`semilla ${seed} → ${fromWasm.join(' ')}`);
  logLine(`¿la misma secuencia con BigInt? ${fromWasm.join() === fromBigInt.join()}`);
  wasm.seed(seed);
  const small = wasm.estimatePi(10000);
  logLine(`10 000 puntos → π ≈ ${small} · ¿el mismo resultado con BigInt? ${small === estimatePiBigInt(seed, 10000)}`);
}

document.querySelector('#estimate').addEventListener('click', () => {
  let seed;
  try {
    seed = readSeed();
  } catch (error) {
    errorText.textContent = error.message;
    return;
  }
  const samples = Number(samplesSelect.value);
  wasm.seed(seed);
  const pi = wasm.estimatePi(samples);
  piOutput.textContent = pi.toFixed(6);
  errorText.textContent = `(error ${Math.abs(pi - Math.PI).toExponential(1)})`;
  logLine(`semilla ${seed} · ${grouped.format(samples)} puntos → π ≈ ${pi}`);
});

const benchButton = document.querySelector('#bench');
benchButton.addEventListener('click', () => {
  benchButton.disabled = true;
  requestAnimationFrame(() => setTimeout(() => { // deja pintar el botón desactivado antes de medir
    const seed = 2026n;
    const SAMPLES = 200000; // BigInt crea un número nuevo en cada operación: con muchos más, pasaría de 300 ms
    wakeCpu(100);
    let start = performance.now();
    const fromBigInt = estimatePiBigInt(seed, SAMPLES);
    const bigIntMs = performance.now() - start;
    wasm.seed(seed);
    start = performance.now();
    const fromWasm = wasm.estimatePi(SAMPLES);
    const wasmMs = performance.now() - start;
    logLine(`${grouped.format(SAMPLES)} puntos, semilla 2026 → ¿el mismo π en los dos? ${fromBigInt === fromWasm} (${fromWasm})`);
    logLine(`BigInt: ≈ ${bigIntMs.toFixed(1)} ms · WebAssembly i64: ≈ ${wasmMs.toFixed(2)} ms · ≈ ${Math.round(bigIntMs / Math.max(wasmMs, 0.05))} veces más rápido`);
    benchButton.disabled = false;
  }, 0));
});
logLine('Listo: pulsa «Estimar π» o «Comparar con BigInt»');
```
