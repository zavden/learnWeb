---
example_description: "Solución: el worker devuelve las muestras transfiriendo su búfer, la página usa lo que llega (no su vista vacía) y envía una copia de la grabación, que se queda intacta para «Deshacer»"
example_tags: "javascript|workers|transferibles|detached|float32array|audio|solucion"
example_stage: final-solution
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Nota de voz</h1>
  <p>Normalizar sube el volumen hasta que el pico llega a 1. La grabación original se guarda para «Deshacer».</p>
  <p><output id="status" aria-live="polite">Procesando…</output></p>
  <p class="note">Las comprobaciones del ejercicio están en la consola.</p>
</main>

<script type="text/js-worker" id="worker-code">
// EL CÓDIGO DEL WORKER: normaliza las muestras EN SU SITIO (sin crear otro array).
self.onmessage = (event) => {
  const samples = event.data;
  let peak = 0;
  for (const value of samples) peak = Math.max(peak, Math.abs(value));
  if (peak > 0) {
    for (let i = 0; i < samples.length; i++) samples[i] /= peak;
  }
  // ✅ 1. De vuelta, transferidas también: el mismo búfer, sin copia.
  self.postMessage(samples, [samples.buffer]);
};
</script>
```

# CSS

```css
body { margin: 0; font-family: system-ui, sans-serif; color: #1e293b; background: #f8fafc; }
main { max-width: 28rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin: 0 0 0.5rem; }
output { font-weight: 600; }
.note { color: #475569; font-size: 0.85rem; }
```

# JavaScript

```javascript
const code = document.querySelector('#worker-code').textContent;
const url = URL.createObjectURL(new Blob([code], { type: 'text/javascript' }));
const worker = new Worker(url);
URL.revokeObjectURL(url);
addEventListener('pagehide', () => worker.terminate());

// Un segundo de una voz grave (220 Hz) grabada bajita: pico 0.5.
const recording = Float32Array.from({ length: 48_000 }, (_, i) => 0.5 * Math.sin((2 * Math.PI * 220 * i) / 48_000));
// Con un for por índice: sobre un búfer desconectado da 0 (reduce lanzaría TypeError).
function peak(samples) {
  let max = 0;
  for (let i = 0; i < samples.length; i++) max = Math.max(max, Math.abs(samples[i]));
  return max;
}

function normalize(samples) {
  return new Promise((resolve) => {
    // ✅ 2. Lo que vale es lo que devuelve el worker: la vista de la página quedó vacía.
    worker.onmessage = (event) => resolve(event.data);
    worker.postMessage(samples, [samples.buffer]); // ida: transferido, sin copia
  });
}

// ✅ 3. Se transfiere una COPIA: la grabación original se queda para «Deshacer».
function normalizeRecording() {
  return normalize(recording.slice());
}

const normalized = await normalizeRecording();
document.querySelector('#status').textContent = `Normalizada: ${normalized.length} muestras, pico ${peak(normalized).toFixed(2)} · original: ${recording.length} muestras`;

// ── Comprobaciones (no hace falta tocarlas) ─────────────────────────────
async function check(description, run, expected) {
  let actual;
  try {
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('sin respuesta en 1 s')), 1000));
    actual = JSON.stringify(await Promise.race([run(), timeout]));
  } catch (error) {
    actual = JSON.stringify(error.name);
  }
  if (actual === JSON.stringify(expected)) console.log('✅', description);
  else console.error('❌', description, '→ esperaba', JSON.stringify(expected), 'y obtuve', actual);
}
await check('la versión normalizada tiene 48000 muestras', async () => normalized.length, 48_000);
await check('su pico es 1.00', async () => peak(normalized).toFixed(2), '1.00');
await check('la grabación original sigue intacta para «Deshacer» (48000 muestras, pico 0.50)', async () => [recording.length, peak(recording).toFixed(2)], [48_000, '0.50']);
await check('normalizar otra vez no lanza y vuelve a dar 48000 muestras', async () => (await normalizeRecording()).length, 48_000);
```
