---
example_description: "Mantener una tecla pulsada repite keydown con event.repeat === true y da un solo keyup al soltar: avance rápido de una canción mientras se mantiene la flecha →; keypress, obsoleto, no llega con las teclas que no escriben"
example_tags: "javascript|eventos|teclado|keydown|keyup|repeat|keypress"
example_stage: minimal
example_importance: useful
console: true
---

# HTML

```html
<main>
  <h1>Bésame mucho · <output id="time">0:00</output> / 3:12</h1>
  <p class="hint">Haz clic en la vista previa y <strong>mantén pulsada</strong> la flecha <kbd>→</kbd> para avanzar; suéltala para parar.</p>
  <progress id="progress" max="192" value="0" aria-label="Posición de la canción"></progress>
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
  font-variant-numeric: tabular-nums;
}
.hint {
  color: #52606d;
}
progress {
  width: 100%;
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
const logList = document.querySelector('#log');
let seconds = 0;
let presses = { keydown: 0, repeats: 0, keypress: 0 };
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
function showTime() {
  document.querySelector('#time').textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
  document.querySelector('#progress').value = seconds;
}

document.addEventListener('keydown', (event) => {
  if (event.key !== 'ArrowRight') return;
  if (event.repeat) {
    presses.repeats += 1; // el sistema repite la tecla mientras sigue pulsada
  } else {
    presses = { keydown: 1, repeats: 0, keypress: 0 };
    logLine('⏩ keydown (repeat: false) → empieza el avance');
  }
  seconds = Math.min(192, seconds + 2);
  showTime();
});

// keypress está OBSOLETO: llega solo con las teclas que escriben un carácter
// (letras, números, Enter), nunca con las flechas. No lo uses; aquí solo se
// cuenta para que lo veas.
document.addEventListener('keypress', (event) => {
  if (event.key === 'ArrowRight') presses.keypress += 1;
});

document.addEventListener('keyup', (event) => {
  if (event.key !== 'ArrowRight') return;
  logLine(`⏹️ keyup → keydown: 1 + ${presses.repeats} repeticiones · keypress: ${presses.keypress} · posición ${document.querySelector('#time').textContent}`);
});
logLine('Listo: haz clic en la vista previa y mantén pulsada la flecha → un par de segundos');

// Cuántas repeticiones llegan, y cada cuánto, lo deciden los ajustes del
// teclado del sistema operativo: no cuentes con un ritmo fijo.
// Para medir cuánto tiempo estuvo pulsada, usa event.timeStamp del keydown y
// del keyup.
```
