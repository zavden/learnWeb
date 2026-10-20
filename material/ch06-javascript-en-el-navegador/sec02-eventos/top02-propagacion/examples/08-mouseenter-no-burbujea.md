---
example_description: "mouseenter no burbujea: escuchado en la galería se dispara una sola vez, al entrar en ella, con target = la galería; mouseover sí burbujea y avisa de cada foto (con closest para saber cuál); focusin da la misma vista previa con el teclado"
example_tags: "javascript|eventos|mouseenter|mouseover|focusin|burbuja|galeria|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Grabados japoneses</h1>
  <ul id="gallery" class="gallery">
    <li><button type="button" data-title="La gran ola de Kanagawa (Hokusai, 1831)">🌊</button></li>
    <li><button type="button" data-title="El Fuji rojo (Hokusai, 1831)">🗻</button></li>
    <li><button type="button" data-title="Lluvia repentina en Ōhashi (Hiroshige, 1857)">🌧️</button></li>
  </ul>
  <p id="caption" class="caption" aria-live="polite">Pasa el ratón (o el foco) por una obra.</p>
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
  font-size: 1.1rem;
  margin-top: 0;
}
.gallery {
  display: flex;
  gap: 0.75rem;
  margin: 0;
  padding: 0.75rem;
  list-style: none;
  border: 2px dashed #7b8794;
  border-radius: 0.75rem;
}
.gallery button {
  font-size: 2rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  cursor: pointer;
}
.gallery button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.caption {
  min-height: 1.5em;
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
const gallery = document.querySelector('#gallery');
const caption = document.querySelector('#caption');
const logList = document.querySelector('#log');
let lastTitle = '';
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// 🐛 mouseenter NO burbujea: escuchado en la galería solo avisa de que el
//    ratón entró en la GALERÍA (una vez), no en cada foto.
gallery.addEventListener('mouseenter', (event) => {
  logLine(`🐛 mouseenter → target: ${event.target.tagName}#${event.target.id} (una vez, al entrar)`);
});

// ✅ mouseover burbujea: llega desde cada hijo. Avisa a menudo (también al
//    pasar de un elemento a su hijo), así que filtramos con closest y con la
//    última foto mostrada.
function preview(event) {
  const button = event.target.closest('[data-title]');
  if (!button || button.dataset.title === lastTitle) return;
  lastTitle = button.dataset.title;
  caption.textContent = lastTitle;
  logLine(`✅ ${event.type} → ${lastTitle}`);
}
gallery.addEventListener('mouseover', preview);
gallery.addEventListener('focusin', preview); // ✅ lo mismo con el teclado (Tab)

logLine('Listo: pasa el ratón por las tres obras; luego recórrelas con Tab');

// mouseenter/mouseleave son útiles justo por no burbujear: escuchados en
// un elemento, avisan una vez al entrar y al salir de él, sin el ruido de
// sus hijos. Para «avisar de cada hijo desde el padre» (delegación), usa
// mouseover/mouseout (o pointerover/pointerout).
```
