---
example_description: "Pausar con blur/focus de window no es lo mismo que pausar al ocultarse: la página pierde el foco al hacer clic en otro iframe, en la barra de direcciones o en el editor, y sigue a la vista; y en la vista previa ni siquiera empieza con el foco. visibilitychange solo avisa cuando de verdad deja de verse"
example_tags: "javascript|page-visibility|visibilitychange|blur|focus|hasfocus|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Radio de la cafetería</h1>
  <div class="players">
    <p class="player">🐛 con focus/blur<br><strong id="buggy-state">—</strong> · <output id="buggy-seconds">0</output> s</p>
    <p class="player">✅ con visibilitychange<br><strong id="fixed-state">—</strong> · <output id="fixed-seconds">0</output> s</p>
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
  margin: 0 0 0.5rem;
}
.players {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
}
.player {
  margin: 0;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background: #ffffff;
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
const MAX_SECONDS = 120; // la demo se apaga sola a los 2 minutos
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// Un «reproductor» mínimo: cuenta los segundos que está sonando.
function createPlayer(stateId, secondsId) {
  const player = { playing: false, seconds: 0 };
  const stateText = document.querySelector(stateId);
  const secondsText = document.querySelector(secondsId);
  player.set = (playing) => {
    player.playing = playing;
    stateText.textContent = playing ? '▶ sonando' : '⏸ en pausa';
  };
  player.tick = () => {
    if (!player.playing || player.seconds >= MAX_SECONDS) return;
    player.seconds += 1;
    secondsText.textContent = player.seconds;
  };
  return player;
}
const buggy = createPlayer('#buggy-state', '#buggy-seconds');
const fixed = createPlayer('#fixed-state', '#fixed-seconds');
const clock = setInterval(() => {
  buggy.tick();
  fixed.tick();
  if (buggy.seconds >= MAX_SECONDS && fixed.seconds >= MAX_SECONDS) clearInterval(clock);
}, 1000);

logLine(`document.hasFocus() → ${document.hasFocus()} · visibilityState → ${document.visibilityState}`);

// 🐛 «Si la ventana pierde el foco, nadie está mirando.» Falso: el foco puede
//    estar en otro iframe, en DevTools, en la barra de direcciones…
buggy.set(document.hasFocus());
logLine(`🐛 con focus/blur → ${buggy.playing ? 'sonando' : 'arranca en pausa (la vista previa no tiene el foco)'}`);
window.addEventListener('blur', () => {
  buggy.set(false);
  logLine('🐛 blur → pauso, aunque la página se sigue viendo');
});
window.addEventListener('focus', () => {
  buggy.set(true);
  logLine('🐛 focus → reanudo');
});

// ✅ visibilitychange: solo cuando la página deja de verse de verdad
//    (otra pestaña, ventana minimizada, pantalla bloqueada).
fixed.set(document.visibilityState === 'visible');
logLine(`✅ con visibilitychange → ${fixed.playing ? 'sonando' : 'en pausa'}`);
document.addEventListener('visibilitychange', () => {
  const visible = document.visibilityState === 'visible';
  fixed.set(visible);
  logLine(`✅ ${document.visibilityState} → ${visible ? 'reanudo' : 'pauso'}`);
});
logLine('Listo: haz clic dentro de la vista previa, después en el editor; luego cambia de pestaña y vuelve');
```
