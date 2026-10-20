---
example_description: "Subir un archivo con FormData y una barra de progreso de SUBIDA real, que fetch no ofrece: XMLHttpRequest con xhr.upload.onprogress, envuelto en una promesa que acepta { signal } como fetch; límite de 1 MB comprobado antes de enviar, cancelar y la respuesta del servidor (nombre, tamaño y tipo recibidos)"
example_tags: "javascript|xmlhttprequest|subida|progreso|formdata|abortsignal|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="upload">
  <h1>Sube tu informe de ventas</h1>
  <form id="upload-form">
    <label for="file">Archivo (máximo 1 MB)</label>
    <input id="file" name="archivo" type="file" required>
    <p><button id="generate" type="button">Generar un archivo de prueba</button></p>
    <label for="description">Descripción</label>
    <input id="description" name="descripcion" value="Ventas de octubre">
    <p class="actions">
      <button type="submit">Subir</button>
      <button id="cancel" type="button" disabled>Cancelar</button>
    </p>
  </form>
  <label for="progress">Progreso de la subida</label>
  <progress id="progress" max="100" value="0">0 %</progress>
  <p id="status" class="status" role="status">Elige un archivo.</p>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1f2933; --muted: #52606d; --line: #cbd2d9; --surface: #ffffff; --page: #f5f7fa; --accent: #1d4ed8; --ok: #166534; --error: #b91c1c; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.upload { max-width: 32rem; margin: 0 auto; padding: 1rem; }
h1 { margin: 0 0 0.5rem; font-size: 1.25rem; }
form { display: grid; gap: 0.3rem; }
label { font-weight: 600; }
input, button { font: inherit; padding: 0.35rem 0.6rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: var(--surface); color: var(--ink); }
button { cursor: pointer; }
button:disabled { color: #616e7c; cursor: not-allowed; }
:is(input, button):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.actions { display: flex; gap: 0.5rem; }
progress { width: 100%; height: 1.25rem; accent-color: var(--accent); }
.status.is-ok { color: var(--ok); }
.status.is-error { color: var(--error); }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
```

# JavaScript

```javascript
// Subida con progreso.
//
// Decisiones de diseño:
// - fetch no informa de cuánto se ha ENVIADO; XMLHttpRequest sí, con los
//   eventos progress de xhr.upload (loaded / total). Se envuelve en una
//   promesa con el mismo contrato que fetch: acepta { signal } y rechaza con
//   signal.reason al cancelar, así el resto del código no sabe que es XHR.
// - Registrar listeners en xhr.upload hace que una subida a otro origen pida
//   un preflight; el servidor de prueba lo acepta.
// - El límite de 1 MB se comprueba ANTES de enviar: no tiene sentido subir
//   un archivo que el servidor va a rechazar.
// - Con FormData no se pone Content-Type: el navegador escribe el multipart
//   con su boundary. En localhost la subida es casi instantánea, así que la
//   barra avanza a saltos grandes; contra un servidor lejano se ve fluida.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.

const MAX_BYTES = 1024 * 1024;
const form = document.querySelector('#upload-form');
const fileInput = document.querySelector('#file');
const cancelButton = document.querySelector('#cancel');
const progressBar = document.querySelector('#progress');
const statusText = document.querySelector('#status');
const logList = document.querySelector('#log');
let uploading = null;
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;
function setStatus(text, kind = '') {
  statusText.textContent = text;
  statusText.className = `status ${kind}`;
}

function uploadWithProgress(url, body, { onProgress, signal }) {
  return new Promise((resolve, reject) => {
    signal.throwIfAborted();
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.responseType = 'json';
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) onProgress(event.loaded / event.total);
    });
    xhr.addEventListener('load', () => resolve({ status: xhr.status, statusText: xhr.statusText, body: xhr.response }));
    xhr.addEventListener('error', () => reject(new TypeError('Failed to upload')));
    signal.addEventListener('abort', () => {
      xhr.abort();
      reject(signal.reason);
    }, { once: true });
    xhr.send(body);
  });
}

// Un CSV de ventas de unos 700 KB, para probar sin buscar un archivo. Poner un
// File en un <input type="file"> se hace con DataTransfer (módulo «APIs
// modernas del navegador»).
document.querySelector('#generate').addEventListener('click', () => {
  const skus = ['CAF-CHI-500', 'CAF-VER-250', 'CAF-OAX-500', 'CAF-PUE-500'];
  const rows = ['fecha,sku,unidades,total'];
  for (let index = 0; index < 24000; index += 1) {
    const units = 1 + ((index * 7) % 9);
    rows.push(`2026-10-${String(1 + (index % 28)).padStart(2, '0')},${skus[index % 4]},${units},${units * 210}`);
  }
  const file = new File([`${rows.join('\n')}\n`], 'ventas-octubre.csv', { type: 'text/csv' });
  const transfer = new DataTransfer();
  transfer.items.add(file);
  fileInput.files = transfer.files;
  logLine(`📄 archivo de prueba: ${file.name} (${kb(file.size)})`);
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const file = fileInput.files[0];
  if (file.size > MAX_BYTES) {
    setStatus(`«${file.name}» pesa ${kb(file.size)}; el máximo es ${kb(MAX_BYTES)}.`, 'is-error');
    logLine(`⛔ ${file.name}: demasiado grande (${kb(file.size)})`);
    return;
  }
  uploading = new AbortController();
  cancelButton.disabled = false;
  progressBar.value = 0;
  setStatus(`Subiendo «${file.name}»…`);
  logLine(`⬆️ subiendo ${file.name} (${kb(file.size)})…`);
  try {
    const result = await uploadWithProgress('/api/demo/echo?status=201', new FormData(form), {
      signal: uploading.signal,
      onProgress: (fraction) => {
        progressBar.value = Math.round(fraction * 100);
        progressBar.textContent = `${progressBar.value} %`;
      },
    });
    if (result.status < 200 || result.status >= 300) throw new Error(`HTTP ${result.status}`);
    const received = result.body.body;
    progressBar.value = 100;
    setStatus(`Subido: el servidor recibió ${received.archivo.name} (${kb(received.archivo.size)}).`, 'is-ok');
    logLine(`✅ ${result.status} ${result.statusText} · el servidor recibió ${received.archivo.name} · ${received.archivo.size} bytes · ${received.archivo.type} · «${received.descripcion}»`);
  } catch (error) {
    progressBar.value = 0;
    if (error.name === 'AbortError') {
      setStatus('Subida cancelada.');
      logLine('🛑 subida cancelada');
    } else {
      setStatus(`No se pudo subir (${error.message}). Inténtalo de nuevo.`, 'is-error');
      logLine(`⛔ ${error.message}`);
    }
  } finally {
    cancelButton.disabled = true;
  }
});
cancelButton.addEventListener('click', () => uploading?.abort());
logLine('Listo: pulsa «Generar un archivo de prueba» y después «Subir» (o elige un archivo tuyo de menos de 1 MB)');
```
