---
example_description: "Controles WASD con event.key === 'w' fallan con Bloq Mayús o Shift (key es 'W') y en teclados franceses (la W está en otro sitio); para posiciones físicas, event.code ('KeyW'); para atajos con significado (Ctrl+Z), key"
example_tags: "javascript|eventos|teclado|key|code|juegos|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Repartidor en el mercado</h1>
  <p class="hint">Haz clic en la vista previa y mueve al repartidor con <kbd>W</kbd> <kbd>A</kbd> <kbd>S</kbd> <kbd>D</kbd>. Después activa Bloq Mayús (o mantén Shift) y repite.</p>
  <div class="boards">
    <section>
      <h2>🐛 con <code>key</code></h2>
      <p class="board"><output id="pos-key">(2, 2)</output></p>
    </section>
    <section>
      <h2>✅ con <code>code</code></h2>
      <p class="board"><output id="pos-code">(2, 2)</output></p>
    </section>
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
h2 {
  font-size: 0.95rem;
  margin: 0 0 0.25rem;
}
.hint {
  color: #52606d;
}
.boards {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}
.board {
  margin: 0;
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-family: Menlo, Consolas, monospace;
  font-size: 1.1rem;
  text-align: center;
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
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
  if (logList.children.length > 8) logList.firstElementChild.remove();
}
function makeMover(outputId) {
  const position = { x: 2, y: 2 };
  return ([dx, dy]) => {
    position.x = Math.min(4, Math.max(0, position.x + dx));
    position.y = Math.min(4, Math.max(0, position.y + dy));
    document.querySelector(outputId).textContent = `(${position.x}, ${position.y})`;
  };
}
const moveByKey = makeMover('#pos-key');
const moveByCode = makeMover('#pos-code');

// 🐛 key es el CARÁCTER: con Shift o Bloq Mayús, 'W' en vez de 'w'; en un
//    teclado francés (AZERTY), la tecla de arriba a la izquierda escribe 'z'.
const byKey = { w: [0, -1], a: [-1, 0], s: [0, 1], d: [1, 0] };
// ✅ code es la POSICIÓN física: 'KeyW' es la misma tecla en cualquier teclado.
const byCode = { KeyW: [0, -1], KeyA: [-1, 0], KeyS: [0, 1], KeyD: [1, 0] };

document.addEventListener('keydown', (event) => {
  if (!(event.code in byCode)) return;
  if (event.key in byKey) {
    moveByKey(byKey[event.key]);
    logLine(`key ${JSON.stringify(event.key)} → movido · code ${event.code} → movido`);
  } else {
    logLine(`🐛 key ${JSON.stringify(event.key)} → ignorada · ✅ code ${event.code} → movido`);
  }
  moveByCode(byCode[event.code]);
});
logLine('Listo: haz clic en la vista previa y pulsa W, A, S, D; luego, con Bloq Mayús');

// ¿Entonces siempre code? No: para atajos con SIGNIFICADO (Ctrl+Z deshacer,
// «?» ayuda) usa key, porque el usuario busca la letra impresa en su teclado.
// code es para posiciones (juegos, controles que imitan un mando).
```
