---
example_description: "Un solo listener en la tarjeta recibe los clics de todo lo que hay dentro: target es el elemento más interno que se pulsó y cambia en cada clic; currentTarget (y this, con function) es siempre la tarjeta que escucha"
example_tags: "javascript|eventos|propagacion|target|currenttarget|this"
example_stage: minimal
example_importance: critical
console: true
---

# HTML

```html
<main>
  <article id="track-card" class="card">
    <h1>Bésame mucho</h1>
    <p>Consuelo Velázquez · <em>1940</em></p>
    <button id="play" type="button">▶ Reproducir</button>
  </article>
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
  margin: 0 0 0.25rem;
}
.card {
  padding: 0.75rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
}
button {
  font: inherit;
  padding: 0.4rem 0.8rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
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
}

// UN listener, en la tarjeta. Los clics en el título, el año o el botón
// suben (burbuja) hasta ella.
document.querySelector('#track-card').addEventListener('click', function (event) {
  logLine(`target → ${event.target.tagName} · currentTarget → #${event.currentTarget.id}`
    + ` · this === currentTarget → ${this === event.currentTarget}`);
});
logLine('Listo: pulsa el título, el año (1940) y el botón');

// target: el elemento MÁS INTERNO donde ocurrió el clic (cambia en cada clic).
// currentTarget: el elemento cuyo listener se está ejecutando (aquí, siempre
// la tarjeta). Con una función normal, this es currentTarget.
// Los nodos de texto nunca son target: un clic en «Consuelo Velázquez» llega
// con target = el <p> que contiene ese texto.
```
