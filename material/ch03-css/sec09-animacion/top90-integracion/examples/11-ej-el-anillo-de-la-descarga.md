---
exercise: true
exercise_title: "El anillo de la descarga"
exercise_instructions: "Al cargar la página, el anillo debería esperar 0,3 s y llenarse en 1,2 s, pero espera 1,2 s y se llena en 0,3 s: arregla el orden de los tiempos (TODO 1) || Además, no se llena poco a poco: se queda vacío y salta a la mitad. Registra --progress para que se pueda interpolar (TODO 2) || Al terminar, el anillo vuelve a quedarse vacío: que conserve el último fotograma (TODO 3) || Recarga la vista previa para ver la animación otra vez, y comprueba que las tres líneas de la lista marcan ✅"
exercise_hints: "En el atajo animation, el primer tiempo es la duración y el segundo el retardo || @property --progress con syntax \"<percentage>\", inherits y un initial-value || animation-fill-mode: con forwards se queda el final; con both, además, el principio durante el retardo"
exercise_solution_example: 11-ej-el-anillo-de-la-descarga-solucion.md
exercise_locked_files: index.html,script.js
example_stage: exercise
console: true
example_description: "Ejercicio: un anillo de progreso de descarga con tres errores (la duración y el retardo cambiados en el atajo, una custom property sin registrar que se anima a saltos y un fill-mode que lo vacía al terminar); un script lo comprueba con getAnimations() y congelando una copia del anillo al 40 %"
example_tags: "css|ejercicio|keyframes|property|fill-mode|atajo|web-animations|congelar"
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
/* TODO 2: --progress no está registrada. */

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
  /* TODO 1: «esperar 0,3 s y llenarse en 1,2 s». TODO 3: el final se pierde. */
  animation: fill-ring 300ms 1200ms linear;
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
