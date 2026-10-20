---
example_description: "Carga diferida con rootMargin: las imágenes guardan su archivo en data-src y se piden cuando están a menos de 100 px de entrar en el panel; después se dejan de observar. Para un <img> normal basta loading=\"lazy\"; la técnica sirve para cualquier cosa cara"
example_tags: "javascript|intersectionobserver|rootmargin|lazy-load|imagenes|unobserve"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Azulejos de Talavera</h1>
  <p class="toolbar">
    <button id="to-end" type="button">⤓ Ir al final</button>
    <button id="to-start" type="button">⤒ Volver al inicio</button>
    <span>Pedidas: <output id="requested">0 de 9</output></span>
  </p>
  <!-- Usa las imágenes tile-01.svg … tile-09.svg de assets/. -->
  <div id="tiles" class="panel" tabindex="0" role="region" aria-label="Catálogo de azulejos">
    <ul class="tiles">
      <li><img data-src="tile-01.svg" width="96" height="96" alt="Flor azul de ocho pétalos"><p><b>Pétalos</b> Cobalto y ocre · $95</p></li>
      <li><img data-src="tile-02.svg" width="96" height="96" alt="Estrella azul de seis puntas"><p><b>Estrella</b> Cobalto y verde · $95</p></li>
      <li><img data-src="tile-03.svg" width="96" height="96" alt="Rosetón azul de doce pétalos"><p><b>Rosetón</b> Azul y naranja · $110</p></li>
      <li><img data-src="tile-04.svg" width="96" height="96" alt="Flor verde de cuatro pétalos"><p><b>Trébol</b> Verde y cobalto · $85</p></li>
      <li><img data-src="tile-05.svg" width="96" height="96" alt="Estrella naranja de ocho puntas"><p><b>Lucero</b> Naranja y cobalto · $95</p></li>
      <li><img data-src="tile-06.svg" width="96" height="96" alt="Flor azul de cinco pétalos"><p><b>Jazmín</b> Cobalto y ocre · $90</p></li>
      <li><img data-src="tile-07.svg" width="96" height="96" alt="Flor ocre de seis pétalos"><p><b>Margarita</b> Ocre y cobalto · $90</p></li>
      <li><img data-src="tile-08.svg" width="96" height="96" alt="Estrella azul de diez puntas"><p><b>Sol</b> Cobalto y naranja · $120</p></li>
      <li><img data-src="tile-09.svg" width="96" height="96" alt="Flor verde de diez pétalos"><p><b>Girasol</b> Verde y ocre · $110</p></li>
    </ul>
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
.toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
  margin: 0 0 0.5rem;
}
button {
  font: inherit;
  padding: 0.3rem 0.7rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:focus-visible,
.panel:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.panel {
  height: 15rem;
  overflow-y: auto;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
}
.tiles {
  display: grid;
  gap: 0.75rem;
  margin: 0;
  padding: 0 0.5rem;
  list-style: none;
}
.tiles li {
  display: flex;
  align-items: center;
  gap: 1rem;
  height: 96px;
}
/* width y height reservan el hueco: nada salta cuando llega la imagen. */
.tiles img {
  flex: none;
  border-radius: 0.25rem;
  background: #e4e7eb;
}
.tiles img:not([src]) {
  color: transparent; /* sin archivo todavía: no enseñes el alt suelto */
}
.tiles p {
  margin: 0;
}
.tiles b {
  display: block;
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
const panel = document.querySelector('#tiles');
const images = [...panel.querySelectorAll('img[data-src]')];
const requestedOutput = document.querySelector('#requested');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

let requested = 0;
const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (!entry.isIntersecting) continue;
    const image = entry.target;
    image.src = image.dataset.src; // aquí empieza la descarga
    observer.unobserve(image);     // una vez pedida, no hay nada más que vigilar
    requested += 1;
    logLine(`⬇️ pido ${image.dataset.src}`);
  }
  requestedOutput.textContent = `${requested} de ${images.length}`;
}, {
  root: panel,
  // La raíz crece 100 px por abajo: la imagen se pide ANTES de asomar,
  // y cuando llega a la vista ya está descargada.
  rootMargin: '0px 0px 100px 0px',
});

for (const image of images) observer.observe(image);

document.querySelector('#to-end').addEventListener('click', () => {
  panel.scrollTop = panel.scrollHeight;
});
document.querySelector('#to-start').addEventListener('click', () => {
  panel.scrollTop = 0;
});
logLine('Listo: desplaza el panel o usa «Ir al final»');

// Para un <img> o un <iframe>, el navegador ya lo hace solo con
// loading="lazy" (lección de imágenes de HTML). Este patrón sirve para lo
// demás: pedir datos, crear un mapa o un vídeo, montar un componente pesado.
```
