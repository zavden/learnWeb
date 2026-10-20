---
example_description: "Ejercicio: saca a un worker la búsqueda de «¿quisiste decir…?» con un protocolo de petición y respuesta: el worker responde { id, ok, result } o { id, ok: false, error } y la página convierte cada petición en una promesa que se cumple o se rechaza con su respuesta"
example_tags: "javascript|workers|protocolo|promesas|withresolvers|ejercicio"
exercise: true
exercise_title: "Sugerencias en un worker"
exercise_instructions: "El código del worker está en el bloque HTML, dentro de un <script type=\"text/js-worker\">: la página no lo ejecuta, solo lee su texto para crear el worker || En el worker (TODO 1): en self.onmessage, lee { id, type, payload }, busca handlers[type] y responde { id, ok: true, result }; si el tipo no existe o la función lanza, responde { id, ok: false, error: mensaje } || En la página (TODO 2): en worker.onmessage, busca en pending la petición de ese id, bórrala y cúmplela con result o recházala con new Error(error) || En la página (TODO 3): callWorker(type, payload) crea un id nuevo, guarda { resolve, reject } en pending, envía { id, type, payload } y devuelve la promesa || Ejecuta hasta que las cinco comprobaciones salgan ✅ y prueba a escribir «mescal» en la página"
exercise_hints: "En el worker, el mensaje de error para un tipo que no existe es exactamente: tipo de petición desconocido: translate (con el tipo que llegó) || Promise.withResolvers() te da { promise, resolve, reject } de una vez || Si una comprobación dice «sin respuesta en 1 s», el worker no está contestando o la página no encuentra la petición por su id"
exercise_solution_example: 07-ej-sugerencias-en-un-worker-solucion.md
example_stage: exercise
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

// TODO 1: responde a cada { id, type, payload } con { id, ok: true, result: handlers[type](payload) },
// o con { id, ok: false, error: 'tipo de petición desconocido: …' } (o el mensaje del error si lanza).
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

// TODO 2: worker.onmessage → la respuesta { id, ok, result, error } cumple o rechaza su petición.

// TODO 3: una petición = un id nuevo + una promesa guardada en pending + un postMessage.
function callWorker(type, payload) {
  return Promise.reject(new Error('callWorker aún no está hecha'));
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
