---
example_description: "Un probador de expresiones regulares que no se cuelga: cada prueba va al worker con un id y un plazo (AbortSignal.timeout); si un patrón catastrófico tarda más de 300 ms, la página termina el worker, rechaza lo pendiente con TimeoutError y arranca uno nuevo. Los errores de sintaxis vuelven como datos"
example_tags: "javascript|workers|regex|timeout|abortsignal|terminate|protocolo|integracion"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Probador de expresiones regulares</h1>
  <div class="fields">
    <label>Patrón <input id="pattern" autocomplete="off" spellcheck="false"></label>
    <label>Banderas <input id="flags" autocomplete="off" spellcheck="false" size="4"></label>
    <label class="wide">Texto <textarea id="text" rows="2" spellcheck="false"></textarea></label>
    <button id="test" type="button">Probar</button>
  </div>
  <div class="presets">
    <span id="presets-label">Ejemplos:</span>
    <button type="button" data-preset="emails" aria-describedby="presets-label">Correos</button>
    <button type="button" data-preset="broken" aria-describedby="presets-label">Paréntesis sin cerrar</button>
    <button type="button" data-preset="catastrophic" aria-describedby="presets-label">Patrón catastrófico</button>
  </div>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.5rem; }
.fields { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: end; }
label { display: grid; gap: 0.2rem; font-size: 0.9rem; flex: 1 1 10rem; }
label.wide { flex-basis: 100%; }
input, textarea { font: 0.9rem Menlo, Consolas, monospace; padding: 0.3rem 0.4rem; border: 1px solid #64748b; border-radius: 0.4rem; }
button { font: inherit; padding: 0.35rem 0.8rem; }
:is(button, input, textarea):focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
.presets { display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center; margin-block-start: 0.75rem; font-size: 0.9rem; }
.log { padding-inline-start: 1.25rem; font-size: 0.85rem; overflow-wrap: anywhere; }
```

# JavaScript

```javascript
// El worker es 04-regex/regex-worker.js («Assets»).
const $ = (selector) => document.querySelector(selector);
function report(text) {
  console.log(text);
  $('#log').append(Object.assign(document.createElement('li'), { textContent: text }));
}

// Un cliente con id por petición, plazo por petición y reinicio si el worker se cuelga.
class RegexTester {
  #worker = null;
  #pending = new Map(); // id → { resolve, reject }
  #nextId = 1;
  restarts = 0;

  constructor(url) {
    this.url = url;
    this.#start();
  }

  #start() {
    this.#worker = new Worker(this.url, { type: 'module' });
    this.#worker.onmessage = (event) => {
      const request = this.#pending.get(event.data.id);
      if (!request) return;
      this.#pending.delete(event.data.id);
      request.resolve(event.data);
    };
  }

  test(pattern, flags, text, { timeout = 300 } = {}) {
    const id = this.#nextId++;
    const { promise, resolve, reject } = Promise.withResolvers();
    this.#pending.set(id, { resolve, reject });
    const signal = AbortSignal.timeout(timeout);
    signal.addEventListener('abort', () => {
      // ¿Sigue sin respuesta? El worker está atascado: no atenderá ningún mensaje más.
      if (this.#pending.has(id)) this.restart(signal.reason);
    });
    this.#worker.postMessage({ id, pattern, flags, text });
    return promise;
  }

  restart(reason) {
    this.#worker.terminate(); // corta el cálculo en seco: no hay otra forma de pararlo
    for (const request of this.#pending.values()) request.reject(reason);
    this.#pending.clear();
    this.restarts += 1;
    this.#start();
  }

  terminate() {
    this.#worker.terminate();
  }
}

const tester = new RegexTester('04-regex/regex-worker.js');
addEventListener('pagehide', () => tester.terminate());

const PRESETS = {
  emails: { pattern: String.raw`[\w.+-]+@[\w-]+\.[\w.]+`, flags: '', text: 'Escríbenos a ventas@cafe-chiapas.mx o a soporte@ejemplo.com.mx; nunca a @nadie.' },
  broken: { pattern: String.raw`(\d{4}-\d{2}`, flags: '', text: 'Pedido del 2026-10' },
  // (\w+\s?)+ puede repartir las letras de 2^26 maneras, y las prueba todas antes de fallar por el «!».
  catastrophic: { pattern: String.raw`^(\w+\s?)+$`, flags: '', text: 'HuitzilopochtliQuetzalcoatl!' },
};

async function run({ pattern, flags, text }) {
  try {
    const result = await tester.test(pattern, flags, text);
    if (result.ok) report(`✅ ${result.matches.length} coincidencias${result.matches.length > 0 ? `: ${result.matches.join(', ')}` : ''}`);
    else report(`⚠️ ${result.error.name}: ${result.error.message}`);
  } catch (error) {
    report(`⏱️ ${error.name}: más de 300 ms sin respuesta → worker terminado y sustituido (reinicios: ${tester.restarts})`);
  }
}
function fill(preset) {
  $('#pattern').value = preset.pattern;
  $('#flags').value = preset.flags;
  $('#text').value = preset.text;
}
// Un botón normal y no un formulario: en las tarjetas (iframes aislados) no hay envío de formularios.
$('#test').addEventListener('click', () => run({ pattern: $('#pattern').value, flags: $('#flags').value, text: $('#text').value }));
document.querySelector('.presets').addEventListener('click', (event) => {
  const preset = PRESETS[event.target.closest('button')?.dataset.preset];
  if (!preset) return;
  fill(preset);
  run(preset);
});

await run(PRESETS.broken);
fill(PRESETS.emails);
await run(PRESETS.emails);
report('Listo: pulsa «Patrón catastrófico» y, después, «Correos»: el worker nuevo responde');
```
