---
example_description: "Una imagen de otro origen se puede dibujar en un canvas, pero entonces el canvas queda «contaminado» y getImageData lanza un SecurityError. Con img.crossOrigin = 'anonymous' (antes de src) y un servidor que responda con CORS, se puede leer"
example_tags: "javascript|canvas|cors|crossorigin|securityerror|getimagedata|bug"
example_stage: common-error
example_importance: critical
console: true
---

# HTML

```html
<main>
  <h1>¿Puedo leer estos píxeles?</h1>
  <div class="trio">
    <figure><canvas width="140" height="96" role="img" aria-label="Valle de México"></canvas><figcaption>mismo origen</figcaption></figure>
    <figure><canvas width="140" height="96" role="img" aria-label="Valle de México"></canvas><figcaption>🐛 otro origen</figcaption></figure>
    <figure><canvas width="140" height="96" role="img" aria-label="Valle de México"></canvas><figcaption>✅ otro origen + CORS</figcaption></figure>
  </div>
  <ol id="log" class="log" aria-live="polite"></ol>
  <p class="credit">José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</p>
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
.trio {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
figure {
  margin: 0;
  font-size: 0.8rem;
}
canvas {
  display: block;
  background: #e4e7eb;
}
.log {
  padding-left: 1.2rem;
  font-family: Menlo, Consolas, monospace;
  font-size: 0.8rem;
  overflow-wrap: anywhere;
}
.credit {
  font-size: 0.8rem;
  color: #52606d;
}
```

# JavaScript

```javascript
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

async function tryToRead(label, url, canvas, useCors) {
  const img = new Image();
  if (useCors) img.crossOrigin = 'anonymous'; // ANTES de src: la imagen se pide con CORS
  img.src = url;
  await img.decode();
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height); // dibujarla siempre se puede
  try {
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    logLine(`${label} → leídos ${data.length} números`);
  } catch (error) {
    logLine(`${label} → ${error.name}: ${error.message}`);
  }
}

if (location.origin === 'null') {
  // Las tarjetas de la teoría y de la galería son iframes aislados: para ellas, TODO es otro origen
  logLine('Esta tarjeta es un iframe aislado (origen null): ábrelo con ▶ o en el editor');
} else {
  const canvases = document.querySelectorAll('canvas');
  const sameUrl = new URL('valley-of-mexico.jpg', document.baseURI);
  const otherUrl = new URL(sameUrl);
  // El mismo servidor y la misma ruta con otro nombre de host: otro origen
  otherUrl.hostname = location.hostname === 'localhost' ? '127.0.0.1' : 'localhost';
  logLine(`página: ${location.origin} · otro origen: ${otherUrl.origin}`);
  await tryToRead('mismo origen', sameUrl, canvases[0], false);
  await tryToRead('🐛 otro origen, sin crossOrigin', otherUrl, canvases[1], false);
  // Otra URL (?cors) para que la caché no reutilice la respuesta anterior, que llegó sin CORS
  const corsUrl = new URL(otherUrl);
  corsUrl.search = '?cors';
  await tryToRead('✅ otro origen, crossOrigin = anonymous', corsUrl, canvases[2], true);
}

// Sin crossOrigin, la imagen llega sin CORS: se puede MOSTRAR, pero el script no puede ver
// sus píxeles. Con crossOrigin = 'anonymous' se pide con la cabecera Origin, y el servidor
// de LearnWeb contesta Access-Control-Allow-Origin: http://localhost:3001 (lección «Orígenes y CORS»).
// toDataURL() y toBlob() de un canvas contaminado lanzan el mismo error.
```
