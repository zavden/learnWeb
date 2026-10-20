---
example_stage: final-solution
console: true
example_description: "Solución: --progress registrada con @property como <percentage> (se interpola y el anillo se llena poco a poco), la duración antes que el retardo en el atajo y fill-mode both para que el anillo se quede lleno"
example_tags: "css|solucion|keyframes|property|fill-mode|atajo|web-animations|congelar"
---

# HTML

```html
<section class="download" aria-labelledby="download-title">
  <div class="ring is-live" aria-hidden="true"></div>
  <div>
    <h2 id="download-title">Catálogo de primavera</h2>
    <p>PDF · 4,8 MB</p>
  </div>
</section>
<p class="note">Copia del anillo congelada al 40 % de la animación (debería verse un 40 % lleno):</p>
<div class="ring is-frozen" aria-hidden="true"></div>
<ul class="checks">
  <li id="check-times">…</li>
  <li id="check-register">…</li>
  <li id="check-fill">…</li>
</ul>
```

# CSS

```css
/* ✅ 2. Registrada: el navegador sabe que es un porcentaje y la interpola. */
@property --progress {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 0%;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.download {
  display: flex;
  gap: 14px;
  align-items: center;
  max-width: 340px;
  padding: 12px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
}

.download h2 {
  margin: 0;
  font-size: 1rem;
}

.download p {
  margin: 2px 0 0;
  color: #475569;
  font-size: 0.85rem;
}

.note {
  margin: 14px 0 6px;
  font-size: 0.75rem;
}

/* El anillo: un conic-gradient lleno hasta --progress, con el centro
   quitado por una máscara. */
.ring {
  --progress: 0%;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: conic-gradient(#15803d var(--progress), #e2e8f0 0);
  mask-image: radial-gradient(circle, transparent 54%, #000 55%);
  /* ✅ 1. Primero la duración (1,2 s), después el retardo (0,3 s).
     ✅ 3. both: vacío durante el retardo y lleno al terminar. */
  animation: fill-ring 1200ms 300ms linear both;
}

@keyframes fill-ring {
  from { --progress: 0%; }
  to   { --progress: 100%; }
}

.checks {
  margin: 14px 0 0;
  padding-left: 1.2rem;
  font-size: 0.75rem;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo, y getAnimations() es de la Web
// Animations API (capítulo 6): devuelve las animaciones de un elemento, con sus tiempos.
// Este script escribe ✅ o ❌ en la lista (y en la consola). No hace falta tocarlo.
function check(id, ok, detail) {
  const text = `${ok ? '✅' : '❌'} ${detail}`;
  document.getElementById(id).textContent = text;
  console.log(`${id}: ${text}`);
}

const [live] = document.querySelector('.ring.is-live').getAnimations();
const [frozen] = document.querySelector('.ring.is-frozen').getAnimations();

if (!live || !frozen) {
  for (const id of ['check-times', 'check-register', 'check-fill']) {
    check(id, false, 'el anillo no tiene ninguna animación');
  }
} else {
  const timing = live.effect.getTiming();
  check('check-times', timing.duration === 1200 && timing.delay === 300,
    `duración: ${timing.duration} ms · retardo: ${timing.delay} ms`);

  // La copia: en pausa y llevada al 40 % de la duración (después del retardo).
  // Es la técnica de congelar de la lección de keyframes, hecha desde JavaScript.
  const frozenTiming = frozen.effect.getTiming();
  frozen.pause();
  frozen.currentTime = frozenTiming.delay + 0.4 * frozenTiming.duration;
  const progress = getComputedStyle(document.querySelector('.ring.is-frozen'))
    .getPropertyValue('--progress').trim();
  check('check-register', Math.abs(parseFloat(progress) - 40) < 1,
    `--progress al 40 % del tiempo: ${progress}`);

  check('check-fill', ['forwards', 'both'].includes(timing.fill),
    `animation-fill-mode: ${timing.fill}`);
}
```
