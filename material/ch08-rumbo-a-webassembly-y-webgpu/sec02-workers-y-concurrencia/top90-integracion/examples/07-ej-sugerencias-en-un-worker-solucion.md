---
example_description: "Solución: el worker responde { id, ok, result } o { id, ok: false, error } a cada petición, y la página guarda una promesa por id en un Map y la cumple o la rechaza cuando llega su respuesta"
example_tags: "javascript|workers|protocolo|promesas|withresolvers|solucion"
example_stage: final-solution
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>¿Quisiste decir…?</h1>
  <label for="query">Busca en la tienda</label>
  <input id="query" autocomplete="off" spellcheck="false" placeholder="mescal joven">
  <p><output id="suggestion" for="query" aria-live="polite">Escribe algo (con alguna errata).</output></p>
  <p class="note">Las comprobaciones del ejercicio están en la consola.</p>
</main>

<script type="text/js-worker" id="worker-code">
// EL CÓDIGO DEL WORKER. Un <script> con un type inventado no se ejecuta en la
// página: la página lee su texto (textContent) y lo convierte en un worker.
const CATALOG = ['Mole poblano', 'Mole negro', 'Café de olla', 'Chocolate de mesa', 'Cajeta de Celaya',
  'Vainilla de Papantla', 'Salsa macha', 'Mezcal joven', 'Pan de muerto', 'Queso de bola'];

// Distancia de edición: cuántas letras hay que cambiar, añadir o quitar para pasar de a a b.
function distance(a, b) {
  const previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = previous[0];
    previous[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const above = previous[j];
      previous[j] = Math.min(above + 1, previous[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return previous[b.length];
}

function suggest(text) {
  const query = text.toLowerCase();
  return CATALOG.reduce((best, name) => {
    const d = distance(query, name.toLowerCase());
    return d < best.distance ? { name, distance: d } : best;
  }, { name: null, distance: Infinity });
}

const handlers = { suggest };

// ✅ 1. Cada petición recibe su respuesta, con el mismo id. Los errores se atrapan
// aquí y viajan como datos: el worker nunca deja una petición sin contestar.
self.onmessage = (event) => {
  const { id, type, payload } = event.data;
  try {
    const handler = handlers[type];
    if (!handler) throw new Error(`tipo de petición desconocido: ${type}`);
    self.postMessage({ id, ok: true, result: handler(payload) });
  } catch (error) {
    self.postMessage({ id, ok: false, error: error.message });
  }
};
</script>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 28rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.5rem; }
label { display: block; font-size: 0.9rem; margin-block-end: 0.25rem; }
input { box-sizing: border-box; inline-size: 100%; font: inherit; padding: 0.4rem 0.5rem; border: 1px solid #64748b; border-radius: 0.4rem; }
input:focus-visible { outline: 3px solid #1d4ed8; outline-offset: 2px; }
output { font-weight: 600; }
.note { color: #475569; font-size: 0.85rem; }
```

# JavaScript

```javascript
// El worker se crea con el texto del <script type="text/js-worker"> (un Blob).
const code = document.querySelector('#worker-code').textContent;
const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
const worker = new Worker(url);
URL.revokeObjectURL(url);
addEventListener('pagehide', () => worker.terminate());

const pending = new Map(); // id → { resolve, reject }
let nextId = 1;

// ✅ 2. Cada respuesta busca su petición por id, la saca del Map y la resuelve.
worker.onmessage = (event) => {
  const { id, ok, result, error } = event.data;
  const request = pending.get(id);
  if (!request) return;
  pending.delete(id);
  if (ok) request.resolve(result);
  else request.reject(new Error(error));
};

// ✅ 3. Una petición = un id nuevo + una promesa guardada en pending + un postMessage.
function callWorker(type, payload) {
  const id = nextId++;
  const { promise, resolve, reject } = Promise.withResolvers();
  pending.set(id, { resolve, reject });
  worker.postMessage({ id, type, payload });
  return promise;
}

// La página: pregunta al worker con cada tecla.
document.querySelector('#query').addEventListener('input', async (event) => {
  const output = document.querySelector('#suggestion');
  try {
    const { name, distance } = await callWorker('suggest', event.target.value);
    output.textContent = distance === 0 ? `✔ ${name}` : `¿Quisiste decir «${name}»?`;
  } catch (error) {
    output.textContent = `⚠️ ${error.message}`;
  }
});

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
async function check(description, run, expected) {
  let actual;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('sin respuesta en 1 s')), 1000));
    actual = JSON.stringify(await Promise.race([run(), timeout]));
  } catch (error) {
    actual = JSON.stringify(`${error.name}: ${error.message}`);
  }
  if (actual === JSON.stringify(expected)) console.log('✅', description);
  else console.error('❌', description, '→ esperaba', JSON.stringify(expected), 'y obtuve', actual);
}
await check('«mole poblan» → Mole poblano, a distancia 1', () => callWorker('suggest', 'mole poblan'), { name: 'Mole poblano', distance: 1 });
await check('dos peticiones a la vez, cada una con su respuesta', async () => (await Promise.all([callWorker('suggest', 'cafe de oya'), callWorker('suggest', 'mescal joven')])).map((answer) => answer.name), ['Café de olla', 'Mezcal joven']);
await check('un tipo desconocido rechaza la promesa con su mensaje', () => callWorker('translate', 'hola').then(() => 'se cumplió', (error) => error.message), 'tipo de petición desconocido: translate');
await check('no queda ninguna petición pendiente', async () => pending.size, 0);
await check('la página no calcula: suggest solo existe en el worker', async () => typeof suggest, 'undefined');
```
