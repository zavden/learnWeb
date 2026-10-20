---
example_description: "Un ResizeObserver cuyo callback cambia el tamaño de lo que observa provoca el error «ResizeObserver loop completed with undelivered notifications.» en window, aunque el cálculo se estabilice a la segunda; la proporción se resuelve en CSS con aspect-ratio y el callback solo lee"
example_tags: "javascript|resizeobserver|bucle|error|aspect-ratio|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Plano del mercado (2:1)</h1>
  <div class="maps">
    <figure>
      <div id="map-js" class="map">🐛 alto calculado en JS</div>
      <figcaption>Alto = ancho / 2 en el callback</figcaption>
    </figure>
    <figure>
      <div id="map-css" class="map map-css">✅ aspect-ratio: 2 / 1</div>
      <figcaption>La proporción la pone el CSS</figcaption>
    </figure>
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
.maps {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
figure {
  margin: 0;
}
figcaption {
  font-size: 0.85rem;
  color: #52606d;
}
.map {
  display: grid;
  place-items: center;
  box-sizing: border-box;
  width: 200px;
  border: 2px solid #15803d;
  border-radius: 0.5rem;
  background: #dcfce7;
  font-size: 0.9rem;
}
/* ✅ El navegador calcula el alto en el propio layout: nada que vigilar. */
.map-css {
  aspect-ratio: 2 / 1;
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
const mapJs = document.querySelector('#map-js');
const mapCss = document.querySelector('#map-css');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// El aviso del navegador llega como un evento error de window (sin objeto Error).
window.addEventListener('error', (event) => {
  if (event.message.includes('ResizeObserver')) logLine(`🛟 error en window → ${event.message}`);
});

let rounds = 0;
const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const { inlineSize: width, blockSize: height } = entry.borderBoxSize[0];
    if (entry.target === mapCss) {
      logLine(`✅ #map-css → ${width} × ${height}: lo da el CSS, solo leo`);
      continue;
    }
    rounds += 1;
    if (rounds > 5) return observer.unobserve(mapJs); // freno de seguridad
    if (height === width / 2) {
      logLine(`🐛 #map-js, vuelta ${rounds} → ${width} × ${height}: ya es 2:1, no toco nada`);
      continue;
    }
    // 🐛 Cambiar el tamaño de un elemento observado DENTRO del callback: su
    //    nuevo tamaño ya no se puede entregar en este frame. El navegador lo
    //    deja para el siguiente y avisa con el error de abajo.
    mapJs.style.height = `${width / 2}px`;
    logLine(`🐛 #map-js, vuelta ${rounds} → ${width} px de ancho: pongo el alto a ${width / 2} px`);
  }
});
observer.observe(mapJs);
observer.observe(mapCss);
logLine('Listo: el plano 🐛 calcula su alto en el callback; el ✅, con aspect-ratio');

// Aquí el cálculo se estabiliza a la segunda vuelta, y aun así hay un error.
// Si el callback cambiara el tamaño en CADA vuelta (crecer 10 px, por ejemplo),
// el error saldría en cada frame, sin fin: por eso el freno de seguridad.
```
