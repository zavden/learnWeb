---
example_description: "requestAnimationFrame se pausa en las pestañas en segundo plano: al volver, el primer delta time es enorme y el objeto «salta» (un paquete atraviesa el escáner sin que lo vea); limitar el delta a 100 ms lo evita. Incluye un medidor para comprobarlo cambiando de pestaña"
example_tags: "javascript|requestanimationframe|delta-time|segundo-plano|visibilidad|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main class="probe">
  <h1>¿Se pausa la animación en segundo plano?</h1>
  <p>Pulsa el botón, cambia a otra pestaña unos segundos y vuelve.</p>
  <button id="measure" type="button">Medir durante 10 s</button>
  <p id="result" role="status">Sin medir todavía.</p>
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
.probe {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
button {
  font: inherit;
  padding: 0.4rem 0.8rem;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// 1. SIMULACIÓN (resultados exactos). Una cinta lleva paquetes a 120 px/s; el
//    escáner solo los «ve» si en algún frame están entre 140 y 160 px.
//    A 60 Hz, cada frame avanza 2 px: imposible saltarse 20 px… salvo que el
//    usuario cambie de pestaña: rAF se pausa y el siguiente frame llega 5 s tarde.
function runBelt(clampDt) {
  const frameTimes = [];
  for (let t = 0; t <= 1000; t += 1000 / 60) frameTimes.push(t);        // 1 s visible
  for (let t = 6000; t <= 7500; t += 1000 / 60) frameTimes.push(t);     // 5 s oculta, y vuelve
  let x = 0;
  let scanned = false;
  let biggestJump = 0;
  for (let i = 1; i < frameTimes.length && x < 300; i++) {
    let dt = frameTimes[i] - frameTimes[i - 1];
    if (clampDt) dt = Math.min(dt, 100); // ✅ nunca más de 100 ms por frame
    const step = 120 * dt / 1000;
    biggestJump = Math.max(biggestJump, step);
    x += step;
    if (x >= 140 && x <= 160) scanned = true;
  }
  return { scanned, biggestJump: Math.round(biggestJump) };
}

const raw = runBelt(false);
const clamped = runBelt(true);
console.log('🐛 sin límite → ¿escaneado?', raw.scanned, '| mayor salto:', raw.biggestJump, 'px');
console.log('✅ dt ≤ 100 ms → ¿escaneado?', clamped.scanned, '| mayor salto:', clamped.biggestJump, 'px');

// 2. EN TU NAVEGADOR: mide el mayor hueco entre dos frames durante 10 s.
//    (querySelector, textContent, disabled y addEventListener: capítulo 6.)
const button = document.querySelector('#measure');
const result = document.querySelector('#result');

button.addEventListener('click', () => {
  button.disabled = true;
  result.textContent = 'Midiendo… cambia de pestaña unos segundos y vuelve.';
  const end = performance.now() + 10_000;
  let previous = null;
  let maxGap = 0;
  requestAnimationFrame(function step(now) {
    if (previous !== null) maxGap = Math.max(maxGap, now - previous);
    previous = now;
    if (now < end) {
      requestAnimationFrame(step);
      return;
    }
    button.disabled = false;
    result.textContent = `Hueco máximo entre dos frames: ${Math.round(maxGap)} ms`;
    console.log(`hueco máximo entre frames ≈ ${Math.round(maxGap)} ms (≈ 17 si no cambiaste de pestaña)`);
  });
});

// Cuando la pestaña no se ve, Chrome deja de pintarla y NO llama a los rAF
// (ahorra batería); los temporizadores, en cambio, siguen, aunque espaciados
// a 1 s o más. Al volver, el primer frame trae todo el tiempo que estuvo fuera.
// Soluciones: limitar el delta (Math.min(dt, 100)), o pausar la animación al
// ocultarse la página con el evento visibilitychange (capítulo 6).
```
