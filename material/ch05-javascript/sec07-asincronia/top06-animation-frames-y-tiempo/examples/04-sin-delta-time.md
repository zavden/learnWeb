---
example_description: "Un bucle de rAF que mueve «2 px por frame» va el doble de rápido en una pantalla de 120 Hz que en una de 60 Hz; multiplicando la velocidad (px/s) por el tiempo transcurrido desde el frame anterior (delta time), la velocidad es la misma en cualquier pantalla"
example_tags: "javascript|requestanimationframe|delta-time|animacion|frecuencia|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main class="lanes">
  <h1>Dos repartidores durante 1 s</h1>
  <p>🐛 2 px por frame</p>
  <div class="lane"><span class="rider" id="per-frame">🛵</span></div>
  <p>✅ 120 px por segundo × delta time</p>
  <div class="lane"><span class="rider" id="per-second">🛵</span></div>
  <button id="replay" type="button">Repetir</button>
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
.lanes {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
p {
  margin: 0.75rem 0 0.25rem;
}
.lane {
  height: 2.25rem;
  border-bottom: 2px solid #9aa5b1;
}
.rider {
  display: inline-block;
  font-size: 1.6rem;
}
button {
  margin-top: 1rem;
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
// 1. SIMULACIÓN (resultados exactos): el mismo segundo en dos pantallas.
//    simulate llama a update(dt) una vez por frame, como haría rAF.
function simulate(hz, seconds, update) {
  let x = 0;
  const dt = 1000 / hz; // ms entre frames
  for (let frame = 0; frame < hz * seconds; frame++) x = update(x, dt);
  return Math.round(x);
}
const perFrame = (x) => x + 2;                 // 🐛 «2 px por frame»
const perSecond = (x, dt) => x + 120 * dt / 1000; // ✅ 120 px/s × segundos transcurridos

console.log('🐛 2 px por frame → 60 Hz:', simulate(60, 1, perFrame), 'px | 120 Hz:', simulate(120, 1, perFrame), 'px');
console.log('✅ 120 px/s × dt → 60 Hz:', simulate(60, 1, perSecond), 'px | 120 Hz:', simulate(120, 1, perSecond), 'px');

// 2. EN TU PANTALLA: los dos repartidores durante 1 s de verdad.
//    (querySelector, style y addEventListener: capítulo 6.)
const perFrameRider = document.querySelector('#per-frame');
const perSecondRider = document.querySelector('#per-second');
const replayButton = document.querySelector('#replay');

function race() {
  let previous = null;
  let start = null;
  let xFrame = 0;
  let xSecond = 0;
  replayButton.disabled = true;
  requestAnimationFrame(function step(now) {
    start ??= now;
    const dt = previous === null ? 0 : now - previous; // ms desde el frame anterior
    previous = now;
    xFrame += 2;
    xSecond += 120 * dt / 1000;
    perFrameRider.style.translate = `${xFrame}px 0`;
    perSecondRider.style.translate = `${xSecond}px 0`;
    if (now - start < 1000) {
      requestAnimationFrame(step);
      return;
    }
    replayButton.disabled = false;
    console.log(`en tu pantalla: 🐛 ≈ ${xFrame} px · ✅ ≈ ${Math.round(xSecond)} px (varía)`);
  });
}

replayButton.addEventListener('click', () => {
  perFrameRider.style.translate = '0px 0';
  perSecondRider.style.translate = '0px 0';
  race();
});
race();

// Con «2 px por frame», la velocidad depende de cuántos frames dibuje la
// pantalla: en un monitor de 120 Hz (o 144, o un móvil que baja a 30 Hz para
// ahorrar batería) el juego va a otra velocidad. Con delta time, cada frame
// avanza lo que corresponde al tiempo que ha pasado desde el anterior.
```
