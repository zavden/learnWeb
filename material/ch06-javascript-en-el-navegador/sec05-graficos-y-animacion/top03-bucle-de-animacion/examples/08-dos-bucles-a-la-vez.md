---
example_description: "Pulsar «Empezar» dos veces lanza dos cadenas de requestAnimationFrame: la barra avanza al doble de velocidad y «Parar» solo cancela el último frame pedido, así que sigue moviéndose. La solución: no empezar si ya hay un bucle en marcha"
example_tags: "javascript|requestanimationframe|cancelanimationframe|bucle|estado|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Mapa sin conexión</h1>
  <section class="download" id="buggy">
    <h2>🐛 sin comprobar</h2>
    <div class="track"><div class="fill"></div></div>
    <button type="button" data-action="start">▶ Empezar</button>
    <button type="button" data-action="stop">⏹ Parar</button>
  </section>
  <section class="download" id="fixed">
    <h2>✅ un bucle como mucho</h2>
    <div class="track"><div class="fill"></div></div>
    <button type="button" data-action="start">▶ Empezar</button>
    <button type="button" data-action="stop">⏹ Parar</button>
  </section>
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
  margin-top: 0;
}
h2 {
  font-size: 1rem;
  margin: 0.75rem 0 0.4rem;
}
.track {
  height: 0.75rem;
  margin-bottom: 0.4rem;
  border-radius: 0.375rem;
  overflow: hidden;
  background: #cbd2d9;
}
/* La barra mide siempre el 100 % y se escala desde la izquierda (lección de rendimiento de CSS) */
.fill {
  height: 100%;
  background: #1d4ed8;
  transform-origin: left;
  scale: 0 1;
}
button {
  font: inherit;
  padding: 0.3rem 0.8rem;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.log {
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
}
```

# JavaScript

```javascript
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

function makeDownload(root, guarded) {
  const label = guarded ? '✅' : '🐛';
  const fill = root.querySelector('.fill');
  let progress = 0;                              // de 0 a 100
  let frameId = null;                            // el ÚLTIMO frame pedido
  let running = 0;                               // cadenas de rAF vivas (para verlo en el registro)

  function startLoop() {
    if (guarded && frameId !== null) {           // ✅ ya hay un bucle: no se lanza otro
      logLine(`${label} ▶ Empezar → ignorado: ya hay un bucle`);
      return;
    }
    if (progress >= 100) progress = 0;
    running += 1;
    let previous = null;
    frameId = requestAnimationFrame(function frame(now) {
      const dt = previous === null ? 0 : Math.min((now - previous) / 1000, 0.1);
      previous = now;
      progress = Math.min(100, progress + 20 * dt); // 20 % por segundo… por CADA bucle
      fill.style.scale = `${progress / 100} 1`;
      if (progress < 100) {
        frameId = requestAnimationFrame(frame);  // 🐛 con dos cadenas, se pisan este número
        return;
      }
      running -= 1;
      frameId = null;
      if (running === 0) logLine(`${label} 🏁 descarga completa`);
    });
    logLine(`${label} ▶ Empezar → bucles en marcha: ${running}`);
  }
  function stopLoop() {
    if (frameId === null) return;
    cancelAnimationFrame(frameId);               // 🐛 cancela UN frame: el de la otra cadena sigue pedido
    frameId = null;
    running -= 1;
    logLine(`${label} ⏹ Parar → bucles en marcha: ${running}`);
  }
  root.querySelector('[data-action="start"]').addEventListener('click', startLoop);
  root.querySelector('[data-action="stop"]').addEventListener('click', stopLoop);
}

makeDownload(document.querySelector('#buggy'), false);
makeDownload(document.querySelector('#fixed'), true);
logLine('Listo: en cada descarga, pulsa «Empezar» dos veces y luego «Parar»');
```
