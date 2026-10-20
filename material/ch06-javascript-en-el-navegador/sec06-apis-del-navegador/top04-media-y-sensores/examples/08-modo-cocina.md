---
example_description: "Screen Wake Lock: navigator.wakeLock.request('screen') evita que la pantalla se apague mientras cocinas; el navegador suelta el bloqueo (evento release) en cuanto la página se oculta, así que el modo cocina lo vuelve a pedir en visibilitychange; todo detrás de un botón y con el error tratado"
example_tags: "javascript|wake-lock|visibilitychange|permisos|recetas"
example_stage: intermediate
example_importance: useful
console: true
---

# HTML

```html
<main>
  <h1>Chiles en nogada</h1>
  <p><button id="cooking-mode" type="button" aria-pressed="false">🔆 Modo cocina: la pantalla no se apaga</button></p>
  <ol class="steps">
    <li>Asa y pela 8 chiles poblanos; ábrelos por un lado y quítales las semillas.</li>
    <li>Rellénalos con el picadillo de carne, frutas y almendras.</li>
    <li>Licúa nuez de Castilla pelada con queso fresco, leche y un poco de jerez.</li>
    <li>Cubre con la nogada y decora con granada y perejil.</li>
  </ol>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
main {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin: 0 0 0.5rem;
}
button {
  font: inherit;
  padding: 0.3rem 0.7rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button[aria-pressed="true"] {
  border-color: #92400e;
  background: #fef3c7;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.steps li {
  margin-bottom: 0.35rem;
  line-height: 1.5;
}
.log {
  margin: 0.75rem 0 0;
  padding: 0.5rem 0.5rem 0.5rem 2rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
const toggle = document.querySelector('#cooking-mode');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

let cookingMode = false;
let sentinel = null; // el WakeLockSentinel: el bloqueo activo

async function keepScreenOn() {
  try {
    sentinel = await navigator.wakeLock.request('screen');
    logLine(`🔆 wakeLock.request('screen') → released: ${sentinel.released}`);
    sentinel.addEventListener('release', () => {
      const why = document.visibilityState === 'hidden' ? 'el navegador lo soltó al ocultarse la página' : 'lo has soltado tú';
      logLine(`💤 release → ${why}`);
    });
  } catch (error) {
    const reason = window.origin === 'null'
      ? 'esta tarjeta es un iframe aislado sin permiso; ábrela con ▶ o en el editor'
      : 'el sistema no lo permite ahora (batería baja, página oculta…)';
    logLine(`⚠️ ${error.name}: ${reason}`);
    setMode(false);
  }
}
function setMode(on) {
  cookingMode = on;
  toggle.setAttribute('aria-pressed', String(on));
}

toggle.addEventListener('click', async () => {
  if (!cookingMode) {
    setMode(true);
    await keepScreenOn();
  } else {
    setMode(false);
    await sentinel?.release();
    sentinel = null;
  }
});

// Al volver a la pestaña, el bloqueo ya no existe: hay que pedirlo otra vez.
document.addEventListener('visibilitychange', () => {
  if (cookingMode && document.visibilityState === 'visible') keepScreenOn();
});

logLine(`'wakeLock' in navigator → ${'wakeLock' in navigator}`);
if (!('wakeLock' in navigator)) toggle.disabled = true; // Firefox antiguo, por ejemplo
logLine('Listo: pulsa «Modo cocina»; después cambia de pestaña y vuelve');
```
