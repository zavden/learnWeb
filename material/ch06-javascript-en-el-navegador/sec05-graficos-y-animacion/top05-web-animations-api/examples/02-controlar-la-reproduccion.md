---
example_description: "Un objeto Animation se controla como un reproductor: play, pause, reverse, finish y cancel cambian su playState; currentTime lo mueve a cualquier punto (una barra para arrastrar) y updatePlaybackRate cambia la velocidad sin saltos"
example_tags: "javascript|web-animations|playstate|currenttime|playbackrate|reproductor"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>Audioguía: sala 3 (8 s)</h1>
  <div class="track"><div id="runner" class="runner"><div class="needle"></div></div></div>
  <label for="scrub">Posición</label>
  <input id="scrub" type="range" min="0" max="8000" step="100" value="0">
  <div class="buttons" role="group" aria-label="Controles">
    <button type="button" data-action="play">▶ Play</button>
    <button type="button" data-action="pause">⏸ Pausa</button>
    <button type="button" data-action="reverse">⏪ Al revés</button>
    <button type="button" data-action="finish">⏭ Al final</button>
    <button type="button" data-action="cancel">✖ Cancelar</button>
    <button type="button" data-action="fast">×2</button>
  </div>
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
.track {
  position: relative;
  height: 0.5rem;
  margin: 1rem 0;
  border-radius: 0.25rem;
  background: #cbd2d9;
}
/* El «corredor» mide la pista menos la aguja; trasladarlo el 100 % de su ancho lleva la aguja al final */
.runner {
  width: calc(100% - 1rem);
}
.needle {
  position: relative;
  top: -0.25rem;
  width: 1rem;
  height: 1rem;
  border-radius: 50%;
  background: #be123c;
}
input {
  width: 100%;
}
.buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.5rem;
}
button {
  font: inherit;
  padding: 0.3rem 0.6rem;
}
button:focus-visible,
input:focus-visible {
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
const runner = document.querySelector('#runner');
const scrub = document.querySelector('#scrub');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.prepend(Object.assign(document.createElement('li'), { textContent: text }));
}

// La aguja recorre la pista en 8 s (translate en %: del ancho del propio corredor)
const animation = runner.animate(
  [{ translate: '0%' }, { translate: '100%' }],
  { duration: 8000, easing: 'linear', fill: 'both' },
);
const state = () => {
  const time = animation.currentTime === null ? 'null' : `${Math.round(animation.currentTime)} ms`;
  return `${animation.playState} · currentTime ${time} · ×${animation.playbackRate}`;
};

// Un recorrido por los estados, sin esperar a ningún frame
animation.pause();
logLine(`pause() → ${state()}`);
animation.finish();                                    // salta al final y termina
logLine(`finish() → ${state()}`);
animation.cancel();                                    // quita sus efectos: como si no existiera
logLine(`cancel() → ${state()}`);
animation.currentTime = 0;                             // vuelve a estar en pausa, al principio
logLine(`currentTime = 0 → ${state()}`);

const actions = {
  play: () => animation.play(),
  pause: () => animation.pause(),
  reverse: () => animation.reverse(),                  // invierte el sentido (playbackRate negativo)
  finish: () => animation.finish(),
  cancel: () => animation.cancel(),
  fast: () => animation.updatePlaybackRate(animation.playbackRate * 2), // sin saltos
};
document.querySelector('.buttons').addEventListener('click', (event) => {
  const button = event.target.closest('button');
  if (!button) return;
  actions[button.dataset.action]();
  logLine(`${button.textContent} → ${state()}`);
});
scrub.addEventListener('input', () => {
  animation.currentTime = Number(scrub.value);         // arrastrar la barra = mover el tiempo
});
logLine('Listo: pulsa ▶ Play y prueba los demás botones');
```
