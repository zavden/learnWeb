---
example_description: "Varias animaciones de la misma propiedad en un elemento se apilan: por defecto la última reemplaza a las anteriores; con composite: 'add', se suma. Y el navegador elimina solas las animaciones con fill que han quedado tapadas por otras (replaceState 'removed'), salvo que llames a persist()"
example_tags: "javascript|web-animations|composite|replacestate|persist|fill"
example_stage: intermediate
example_importance: useful
console: true
---

# HTML

```html
<main>
  <h1>Ficha en el tablero</h1>
  <div class="board"><span id="piece" class="piece" aria-hidden="true">♞</span></div>
  <div id="frozen" class="frozen" aria-hidden="true">●</div>
  <p>
    <button id="move" type="button">Mover la ficha</button>
    <label><input id="persist" type="checkbox"> persist() en cada movimiento</label>
  </p>
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
.board {
  width: 240px;
  height: 2.5rem;
  background: repeating-linear-gradient(90deg, #e4e7eb 0 40px, #ffffff 40px 80px);
}
.piece {
  display: inline-block;
  width: 40px;
  font-size: 2rem;
  line-height: 2.5rem;
  text-align: center;
}
.frozen {
  width: max-content;
  color: #9aa5b1;
}
button {
  font: inherit;
  padding: 0.3rem 0.8rem;
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
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// 1. Dos animaciones de translate en el mismo elemento, congeladas a la mitad (lineales)
const frozen = document.querySelector('#frozen');
const base = frozen.animate({ translate: ['0px', '200px'] }, { duration: 1000, easing: 'linear' });
const shake = frozen.animate({ translate: ['0px', '40px'] }, { duration: 1000, easing: 'linear' });
for (const animation of [base, shake]) {
  animation.pause();
  animation.currentTime = 500;               // base: 100px · shake: 20px
}
logLine(`composite 'replace' (por defecto) → translate ${getComputedStyle(frozen).translate}`);
shake.effect.composite = 'add';              // se suma a lo que haya debajo
logLine(`composite 'add' → translate ${getComputedStyle(frozen).translate}`);

// 2. Cada movimiento crea una animación con fill: 'forwards' que deja la ficha en su casilla
const piece = document.querySelector('#piece');
const first = piece.animate({ translate: ['0px', '0px'] }, { duration: 1, fill: 'forwards' });
logLine(`replaceState al crearla → ${first.replaceState}`);
let square = 0;
document.querySelector('#move').addEventListener('click', async () => {
  square = (square + 1) % 6;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches; // matchMedia: módulo siguiente
  const move = piece.animate({ translate: `${square * 40}px` }, { duration: reduce ? 0 : 300, fill: 'forwards' });
  if (document.querySelector('#persist').checked) move.persist(); // replaceState → 'persisted'
  await move.finished;
  await new Promise(requestAnimationFrame);   // la limpieza ocurre en el siguiente frame
  logLine(`casilla ${square} → animaciones en la ficha: ${piece.getAnimations().length} · la primera: ${first.replaceState}`);
});
logLine('Listo: pulsa «Mover la ficha» varias veces');
```
