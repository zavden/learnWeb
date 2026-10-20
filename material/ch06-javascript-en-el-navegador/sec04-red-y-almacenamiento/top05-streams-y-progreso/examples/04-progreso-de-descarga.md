---
example_description: "Una barra de progreso de descarga de verdad: el total sale de la cabecera Content-Length, lo recibido se suma trozo a trozo con el reader, y un <progress> accesible muestra el porcentaje mientras llega el cuerpo"
example_tags: "javascript|streams|progreso|content-length|progress|fetch|accesibilidad"
example_stage: minimal
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Catálogo de otoño (PDF)</h1>
  <label for="download-progress">Descarga</label>
  <progress id="download-progress" max="100" value="0">0 %</progress>
  <p id="status" role="status">Preparando…</p>
  <p><button id="download" type="button">Descargar otra vez</button></p>
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
label {
  display: block;
  font-weight: 600;
}
progress {
  width: 100%;
  height: 1.25rem;
  accent-color: #1d4ed8;
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
const progressBar = document.querySelector('#download-progress');
const statusText = document.querySelector('#status');
const downloadButton = document.querySelector('#download');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}

// 10 trozos de 2048 bytes, uno cada 150 ms: un «PDF» de 20 KB que tarda ~1,4 s.
async function download() {
  downloadButton.disabled = true;
  const response = await fetch('/api/demo/stream?chunks=10&interval=150&size=2048');
  const total = Number(response.headers.get('content-length')); // bytes anunciados
  logLine(`Content-Length → ${total} bytes`);

  const reader = response.body.getReader();
  const chunks = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.byteLength;
    const percent = Math.round((received / total) * 100);
    progressBar.value = percent;
    progressBar.textContent = `${percent} %`; // el texto alternativo de <progress>
    statusText.textContent = `Descargando: ${(received / 1024).toFixed(0)} de ${(total / 1024).toFixed(0)} KB`;
    logLine(`📦 ${percent} %`);
  }

  // Los trozos se juntan en un Blob, como haría response.blob() (capítulo 8).
  const file = new Blob(chunks, { type: 'application/pdf' });
  statusText.textContent = `Descarga completa: ${(file.size / 1024).toFixed(0)} KB.`;
  logLine(`✅ ${file.size} bytes en ${chunks.length} trozos`);
  downloadButton.disabled = false;
}

downloadButton.addEventListener('click', () => {
  logList.replaceChildren();
  download();
});
download();
logLine('Listo: mira la barra; «Descargar otra vez» repite la descarga');

// No hace falta clone(): el reader ES la lectura del cuerpo. Al acabar, los
// bytes están en chunks, listos para un Blob (y URL.createObjectURL para
// ofrecerlo como descarga, capítulo 8).
```
