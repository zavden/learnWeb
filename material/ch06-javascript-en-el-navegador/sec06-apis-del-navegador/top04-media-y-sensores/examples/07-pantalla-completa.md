---
example_description: "Fullscreen API: element.requestFullscreen() (desde un clic) pone un cuadro a pantalla completa, :fullscreen le da otro estilo, fullscreenchange avisa al entrar y al salir, y document.exitFullscreen() o Esc salen; en una tarjeta de la teoría, document.fullscreenEnabled es false y la petición se rechaza"
example_tags: "javascript|fullscreen|requestfullscreen|fullscreenchange|exitfullscreen|permisos"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <figure id="painting" class="painting">
    <!-- Usa assets/velasco-valle-de-mexico.jpg (dominio público). -->
    <img src="velasco-valle-de-mexico.jpg" width="960" height="660" alt="Valle de México visto desde el cerro de Santa Isabel: llanura verde, lagos y volcanes al fondo">
    <figcaption>José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</figcaption>
    <button id="exit" class="exit" type="button">✕ Salir de pantalla completa</button>
  </figure>
  <p><button id="enter" type="button">⛶ Ver a pantalla completa</button></p>
  <p id="card-notice" class="notice" hidden>Esta tarjeta es un iframe aislado y no permite la pantalla completa: ábrela con «▶ Run» o en el editor.</p>
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
.painting {
  margin: 0;
}
.painting img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 0.5rem;
}
.painting figcaption {
  margin-top: 0.25rem;
  font-size: 0.85rem;
  color: #52606d;
}
.exit {
  display: none;
}
/* Solo mientras el cuadro ocupa la pantalla. */
.painting:fullscreen {
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 0.75rem;
  background: #111827;
}
.painting:fullscreen img {
  width: auto;
  max-width: 95vw;
  max-height: 80vh;
}
.painting:fullscreen figcaption {
  color: #e5e7eb;
}
.painting:fullscreen .exit {
  display: inline-block;
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
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.notice {
  color: #92400e;
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
const painting = document.querySelector('#painting');
const enterButton = document.querySelector('#enter');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// ¿Lo permite este documento? En un iframe hace falta allow="fullscreen".
logLine(`document.fullscreenEnabled → ${document.fullscreenEnabled}`);
if (!document.fullscreenEnabled) document.querySelector('#card-notice').hidden = false;

enterButton.addEventListener('click', async () => {
  try {
    await painting.requestFullscreen(); // necesita un gesto del usuario: este clic
  } catch (error) {
    logLine(`⚠️ ${error.name}: ${error.message}`);
  }
});
document.querySelector('#exit').addEventListener('click', () => {
  document.exitFullscreen();
});

// Llega al entrar y al salir (también con Esc, que gestiona el navegador).
document.addEventListener('fullscreenchange', () => {
  const element = document.fullscreenElement;
  logLine(`fullscreenchange → fullscreenElement: ${element ? `${element.localName}#${element.id}` : null}`);
  // Al salir, el foco vuelve al botón que la abrió (teclado y lector de pantalla).
  if (!element) enterButton.focus();
  else document.querySelector('#exit').focus();
});
logLine('Listo: pulsa «⛶ Ver a pantalla completa»; sal con Esc o con «✕ Salir»');
```
