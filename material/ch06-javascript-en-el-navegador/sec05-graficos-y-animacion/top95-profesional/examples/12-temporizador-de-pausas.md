---
example_description: "Un temporizador de trabajo y pausas cuyo reloj ES una animación: el anillo SVG se vacía con element.animate() durante cada fase, el tiempo restante se lee de animation.currentTime, «Pausa» y «Seguir» son pause() y play(), y las fases se encadenan con await finished. «Reiniciar» cancela y captura el AbortError; la sesión termina sola tras dos ciclos"
example_tags: "javascript|web-animations|finished|currenttime|svg|aria-live|temporizador|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="timer">
  <h1>Pausas activas</h1>
  <label class="timer__mode">Duración
    <select id="mode">
      <option value="demo">Demostración: 20 s de trabajo, 10 s de pausa</option>
      <option value="real">Real: 25 min de trabajo, 5 min de pausa</option>
    </select>
  </label>
  <div class="timer__dial">
    <svg viewBox="0 0 140 140" aria-hidden="true">
      <circle cx="70" cy="70" r="54" fill="none" stroke="#e4e7eb" stroke-width="12"/>
      <circle id="ring" cx="70" cy="70" r="54" fill="none" stroke="#0e7490" stroke-width="12"
              stroke-linecap="round" pathLength="100" stroke-dasharray="100 100" transform="rotate(-90 70 70)"/>
    </svg>
    <p class="timer__readout"><span id="phase">Listo</span><span id="remaining">0:20</span></p>
  </div>
  <div class="timer__controls">
    <button id="start" type="button">▶ Empezar</button>
    <button id="pause" type="button" disabled>⏸ Pausa</button>
    <button id="reset" type="button" disabled>Reiniciar</button>
  </div>
  <p id="announce" class="timer__announce" role="status"></p>
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
.timer {
  max-width: 24rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin-top: 0;
}
.timer__mode {
  display: grid;
  gap: 0.2rem;
}
.timer__dial {
  position: relative;
  width: 200px;
  margin: 1rem auto;
}
.timer__dial svg {
  display: block;
  width: 100%;
}
.timer__readout {
  position: absolute;
  inset: 0;
  display: grid;
  place-content: center;
  margin: 0;
  text-align: center;
}
#phase {
  font-size: 0.9rem;
  color: #52606d;
}
#remaining {
  font-size: 2rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.timer__controls {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
}
.timer__announce {
  min-height: 1.5em;
  text-align: center;
  font-weight: 600;
}
button,
select {
  font: inherit;
  padding: 0.3rem 0.7rem;
}
button:focus-visible,
select:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Temporizador de pausas activas.
//
// Decisiones de diseño:
// - El reloj es la propia animación: el anillo se vacía (stroke-dashoffset de 0 a 100, con
//   pathLength="100") en la duración de la fase, y el tiempo restante se calcula con
//   animation.currentTime. No hay un setInterval que cuente por su cuenta: no pueden desfasarse.
// - pause() y play() pausan el anillo y el reloj a la vez; las fases se encadenan con await
//   finished; cancel() (Reiniciar) rechaza esa promesa con AbortError, que se captura.
// - El texto del tiempo se refresca cuatro veces por segundo; la región role="status" solo
//   anuncia los cambios de fase, para no hablar sin parar a un lector de pantalla.
// - Dos ciclos y se termina: nada se mueve para siempre. La animación sigue su reloj aunque la
//   pestaña esté oculta (el tiempo de un temporizador debe seguir pasando).
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.

const MODES = {
  demo: [{ name: 'Trabajo', seconds: 20 }, { name: 'Pausa', seconds: 10 }],
  real: [{ name: 'Trabajo', seconds: 25 * 60 }, { name: 'Pausa', seconds: 5 * 60 }],
};
const CYCLES = 2;
const formatRemaining = (ms) => {
  const total = Math.ceil(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`;
};

const ring = document.querySelector('#ring');
const phaseLabel = document.querySelector('#phase');
const remainingLabel = document.querySelector('#remaining');
const announce = document.querySelector('#announce');
const startButton = document.querySelector('#start');
const pauseButton = document.querySelector('#pause');
const resetButton = document.querySelector('#reset');

// Un fotograma congelado: a los 5 s de una fase de 20 s
const probe = ring.animate({ strokeDashoffset: [0, 100] }, { duration: 20000, easing: 'linear' });
probe.pause();
probe.currentTime = 5000;
console.log(`a los 5 s de 20 s → quedan ${formatRemaining(20000 - probe.currentTime)} · anillo vaciado ${parseFloat(getComputedStyle(ring).strokeDashoffset)} %`);
probe.cancel();

let animation = null;
let ticker = null;
function refresh(durationMs) {
  if (animation?.currentTime != null) remainingLabel.textContent = formatRemaining(durationMs - animation.currentTime);
}
async function runPhase(phase, cycle) {
  const durationMs = phase.seconds * 1000;
  animation = ring.animate({ strokeDashoffset: [0, 100] }, { duration: durationMs, easing: 'linear' });
  ring.style.stroke = phase.name === 'Pausa' ? '#15803d' : '#0e7490';
  phaseLabel.textContent = `${phase.name} · ciclo ${cycle} de ${CYCLES}`;
  announce.textContent = `${phase.name}: ${formatRemaining(durationMs)}`;
  console.log(`⏱️ ${phase.name} (ciclo ${cycle}) · ${formatRemaining(durationMs)}`);
  clearInterval(ticker);
  ticker = setInterval(() => refresh(durationMs), 250);
  refresh(durationMs);
  await animation.finished;                       // la fase termina cuando termina el anillo
}
async function runSession() {
  const phases = MODES[document.querySelector('#mode').value];
  startButton.disabled = true;
  pauseButton.disabled = false;
  resetButton.disabled = false;
  document.querySelector('#mode').disabled = true;
  try {
    for (let cycle = 1; cycle <= CYCLES; cycle++) {
      for (const phase of phases) await runPhase(phase, cycle);
    }
    announce.textContent = '🎉 Sesión completa: buen trabajo.';
    console.log('✅ sesión completa');
  } catch (error) {
    if (error.name !== 'AbortError') throw error;  // cancelar es esperable; otro error, no
    announce.textContent = 'Sesión reiniciada.';
    console.log('↩️ reiniciado (AbortError capturado)');
  } finally {
    clearInterval(ticker);
    animation = null;
    phaseLabel.textContent = 'Listo';
    remainingLabel.textContent = formatRemaining(phases[0].seconds * 1000);
    startButton.disabled = false;
    pauseButton.disabled = true;
    pauseButton.textContent = '⏸ Pausa';
    resetButton.disabled = true;
    document.querySelector('#mode').disabled = false;
  }
}

startButton.addEventListener('click', runSession);
pauseButton.addEventListener('click', () => {
  if (!animation) return;
  if (animation.playState === 'running') {
    animation.pause();
    pauseButton.textContent = '▶ Seguir';
    announce.textContent = `En pausa: quedan ${remainingLabel.textContent}`;
  } else {
    animation.play();
    pauseButton.textContent = '⏸ Pausa';
    announce.textContent = 'Seguimos';
  }
  console.log(`${animation.playState === 'paused' ? '⏸' : '▶'} ${animation.playState} · ${phaseLabel.textContent}`);
});
resetButton.addEventListener('click', () => animation?.cancel());
document.querySelector('#mode').addEventListener('change', (event) => {
  remainingLabel.textContent = formatRemaining(MODES[event.target.value][0].seconds * 1000);
});
console.log('Listo: pulsa «Empezar», luego «Pausa», «Seguir» y «Reiniciar»');
```
