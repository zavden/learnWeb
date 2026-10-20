---
example_description: "Un bucle con requestAnimationFrame: cada callback pide el siguiente, recibe el instante del frame (en la escala de performance.now) y el bucle se detiene solo con una condición; contar frames durante medio segundo estima la frecuencia de la pantalla"
example_tags: "javascript|requestanimationframe|bucle|frames|tiempo"
example_stage: minimal
example_importance: critical
console: true
---

# JavaScript

```javascript
// Un bucle de animación: el callback hace su trabajo y pide el SIGUIENTE frame.
// Aquí solo cuenta frames durante 500 ms para estimar la frecuencia de la pantalla.
const DURATION_MS = 500;
let firstFrameTime = null;
let frames = 0;
let frameId = null;

function onFrame(frameTime) {
  // frameTime: el instante del frame, en la misma escala que performance.now().
  if (firstFrameTime === null) {
    firstFrameTime = frameTime;
    console.log('el instante del frame ya pasó (≤ performance.now()) →', frameTime <= performance.now());
  }
  frames += 1;
  if (frameTime - firstFrameTime < DURATION_MS) {
    frameId = requestAnimationFrame(onFrame); // ← el bucle: pide el siguiente
  } else {
    finish('el bucle se detuvo solo');
  }
}

function finish(reason) {
  cancelAnimationFrame(frameId); // por si quedaba uno pedido
  clearTimeout(safetyTimer);
  const fps = Math.round((frames - 1) / (DURATION_MS / 1000));
  console.log(`⏹️ ${reason}`);
  console.log('frames en medio segundo > 20 →', frames > 20);
  console.log(`≈ ${fps} frames por segundo (60 en la mayoría de pantallas, 120 en las de alta frecuencia; varía)`);
}

frameId = requestAnimationFrame(onFrame);

// Red de seguridad: si la pestaña está oculta, los rAF no llegan (lo verás en
// este mismo módulo); este temporizador cierra la medición de todas formas.
const safetyTimer = setTimeout(() => {
  if (frames === 0) finish('ningún frame: ¿pestaña oculta?');
}, DURATION_MS + 500);

// Por qué rAF y no setInterval(fn, 16): rAF va sincronizado con el pintado
// (un callback por frame, justo antes de pintar), se adapta a 60, 120 o 144
// Hz, y se pausa cuando la pestaña no se ve, sin gastar batería.
```
