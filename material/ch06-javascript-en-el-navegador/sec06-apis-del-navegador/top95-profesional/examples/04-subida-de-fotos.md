---
example_description: "Un cargador de fotos para una reseña: las fotos llegan soltándolas, pegándolas (una captura del portapapeles) o con el <input>, se validan (tipo, tamaño, máximo 4, sin repetidas), se previsualizan con URLs blob: que se revocan en cuanto la imagen carga, piden una descripción para su alt, se reducen con canvas a 1200 px si son grandes y se suben con XMLHttpRequest al servidor de prueba con barra de progreso y botón «Cancelar»"
example_tags: "javascript|file-api|drag-and-drop|paste|createobjecturl|revokeobjecturl|canvas|xhr|progreso|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Fotos de tu reseña</h1>
  <div id="drop-zone" class="drop-zone" tabindex="0" aria-describedby="drop-help">
    <p id="drop-help">Suelta aquí tus fotos o pégalas con ⌘V / Ctrl+V (PNG, JPG o WebP, hasta 4)</p>
    <label class="picker">o elígelas <input id="picker" type="file" accept="image/png,image/jpeg,image/webp" multiple></label>
  </div>
  <ul id="photos" class="photos" aria-label="Fotos elegidas"></ul>
  <div class="upload">
    <button id="upload" type="button" disabled>Subir fotos</button>
    <button id="cancel" type="button" hidden>Cancelar</button>
    <progress id="progress" max="100" value="0" hidden aria-label="Progreso de la subida"></progress>
  </div>
  <p id="status" class="status" role="status"></p>
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
  max-width: 36rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  margin: 0 0 0.75rem;
  font-size: 1.25rem;
}
.drop-zone {
  padding: 1rem;
  border: 2px dashed #7b8794;
  border-radius: 0.75rem;
  background: #ffffff;
  text-align: center;
}
.drop-zone.over {
  border-color: #1d4ed8;
  background: #dbeafe;
}
.drop-zone p {
  margin: 0 0 0.5rem;
}
.photos {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
  gap: 0.75rem;
  margin: 0.75rem 0;
  padding: 0;
  list-style: none;
}
.photo {
  display: grid;
  gap: 0.3rem;
  padding: 0.5rem;
  border: 1px solid #cbd2d9;
  border-radius: 0.5rem;
  background: #ffffff;
  font-size: 0.85rem;
}
.photo img {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 0.25rem;
  background: #e4e7eb;
}
.photo input {
  font: inherit;
  padding: 0.2rem 0.35rem;
  border: 1px solid #7b8794;
  border-radius: 0.25rem;
}
.upload {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}
.upload [hidden] {
  display: none;
}
button {
  font: inherit;
  padding: 0.3rem 0.75rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:disabled {
  color: #52606d;
  cursor: not-allowed;
}
button:focus-visible,
input:focus-visible,
.drop-zone:focus-visible,
.picker:focus-within {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.status {
  min-height: 1.4em;
}
```

# JavaScript

```javascript
// CARGADOR DE FOTOS PARA UNA RESEÑA.
//
// Decisiones de diseño:
// - Tres entradas (soltar, pegar, elegir) y un solo camino: addFiles(). El
//   <input> es la alternativa de teclado y de móvil; el pegado sirve para
//   capturas de pantalla, que van al portapapeles como archivo.
// - Validación propia (accept solo filtra el diálogo): PNG, JPG o WebP, hasta
//   15 MB, como mucho 4 fotos y sin repetir (nombre + tamaño). Cada rechazo
//   dice el motivo en la región role="status".
// - Vista previa con URL.createObjectURL y revokeObjectURL en cuanto la
//   imagen carga (o falla): ya decodificada, no necesita el archivo.
// - Cada foto pide una descripción, que será su alt (y viaja con ella).
// - El servidor de prueba admite 1 MB por petición: antes de subir, las fotos
//   de más de 1200 px se dibujan en un canvas más pequeño y se exportan como
//   JPEG con toBlob (módulo «Gráficos y animación»).
// - Subida con XMLHttpRequest por su evento upload.progress (módulo «Red y
//   almacenamiento»), con «Cancelar» (xhr.abort()) y la barra con nombre.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos,
// formularios con JS, red y almacenamiento, gráficos y este módulo.

const TYPES = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_FILE = 15 * 1024 * 1024;
const MAX_PHOTOS = 4;
const MAX_SIDE = 1200;
const SERVER_LIMIT = 1024 * 1024;
const zone = document.querySelector('#drop-zone');
const list = document.querySelector('#photos');
const uploadButton = document.querySelector('#upload');
const cancelButton = document.querySelector('#cancel');
const progress = document.querySelector('#progress');
const statusLine = document.querySelector('#status');
const kilobytes = new Intl.NumberFormat('es-MX', { style: 'unit', unit: 'kilobyte', maximumFractionDigits: 1 });
const photos = []; // { file, item, caption }
let liveUrls = 0;

function say(text) {
  statusLine.textContent = text;
  console.log(text);
}

// ── Validar y añadir ─────────────────────────────────────────────────────
function problemWith(file) {
  if (!TYPES.includes(file.type)) return `${file.name} no es una imagen PNG, JPG o WebP`;
  if (file.size > MAX_FILE) return `${file.name} pesa más de 15 MB`;
  if (photos.some((photo) => photo.file.name === file.name && photo.file.size === file.size)) return `${file.name} ya está en la lista`;
  if (photos.length >= MAX_PHOTOS) return `Como mucho ${MAX_PHOTOS} fotos: ${file.name} no se ha añadido`;
  return '';
}
function addFiles(files, how) {
  const messages = [];
  for (const file of files) {
    const problem = problemWith(file);
    if (problem) {
      messages.push(`⛔ ${problem}`);
      continue;
    }
    photos.push(renderPhoto(file));
    messages.push(`🖼 ${file.name} (${how})`);
  }
  uploadButton.disabled = photos.length === 0;
  uploadButton.textContent = `Subir ${photos.length} foto${photos.length === 1 ? '' : 's'}`;
  say(messages.join(' · '));
  return messages;
}

function renderPhoto(file) {
  const item = document.createElement('li');
  item.className = 'photo';
  const image = document.createElement('img');
  const url = URL.createObjectURL(file);
  liveUrls += 1;
  const release = () => {
    URL.revokeObjectURL(url); // ✅ la imagen ya está decodificada (o rota): suelta el archivo
    liveUrls -= 1;
  };
  image.addEventListener('load', release, { once: true });
  image.addEventListener('error', release, { once: true });
  image.src = url;
  const label = document.createElement('label');
  label.textContent = 'Descripción';
  const caption = document.createElement('input');
  caption.placeholder = 'Ej.: taza de café de olla';
  caption.addEventListener('input', () => { image.alt = caption.value; });
  image.alt = ''; // sin descripción todavía: decorativa hasta que la escribas
  label.append(caption);
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.textContent = 'Quitar';
  remove.setAttribute('aria-label', `Quitar ${file.name}`);
  remove.addEventListener('click', () => removePhoto(photo));
  item.append(image, label, remove);
  list.append(item);
  const photo = { file, item, image, caption };
  return photo;
}
function removePhoto(photo) {
  photos.splice(photos.indexOf(photo), 1);
  photo.item.remove();
  uploadButton.disabled = photos.length === 0;
  uploadButton.textContent = `Subir ${photos.length} foto${photos.length === 1 ? '' : 's'}`;
  say(`${photo.file.name} quitada`);
  zone.focus(); // el botón pulsado ya no existe: el foco va a un sitio útil
}

// ── Las tres entradas ────────────────────────────────────────────────────
window.addEventListener('dragover', (event) => event.preventDefault());
window.addEventListener('drop', (event) => event.preventDefault());
zone.addEventListener('dragover', (event) => {
  if (!event.dataTransfer.types.includes('Files')) return;
  event.preventDefault();
  event.dataTransfer.dropEffect = 'copy';
  zone.classList.add('over');
});
zone.addEventListener('dragleave', (event) => {
  if (!zone.contains(event.relatedTarget)) zone.classList.remove('over');
});
zone.addEventListener('drop', (event) => {
  event.preventDefault();
  zone.classList.remove('over');
  addFiles(event.dataTransfer.files, 'soltada');
});
document.querySelector('#picker').addEventListener('change', (event) => {
  addFiles(event.target.files, 'elegida');
  event.target.value = ''; // poder elegir otra vez el mismo archivo
});
document.addEventListener('paste', (event) => {
  if (event.clipboardData.files.length === 0) return; // texto: que siga su camino
  event.preventDefault();
  addFiles(event.clipboardData.files, 'pegada');
});

// ── Reducir antes de subir ───────────────────────────────────────────────
async function prepare(photo) {
  await photo.image.decode();
  const { naturalWidth: width, naturalHeight: height } = photo.image;
  const scale = Math.min(1, MAX_SIDE / Math.max(width, height));
  if (scale === 1 && photo.file.size <= SERVER_LIMIT / MAX_PHOTOS) return photo.file;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  canvas.getContext('2d').drawImage(photo.image, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.8));
  return new File([blob], photo.file.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' });
}

// ── Subir con progreso ───────────────────────────────────────────────────
let currentRequest = null;
function send(formData) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    currentRequest = xhr;
    xhr.open('POST', '/api/demo/echo');
    xhr.responseType = 'json';
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) progress.value = Math.round((event.loaded / event.total) * 100);
    });
    xhr.addEventListener('load', () => (xhr.status < 400 ? resolve(xhr.response) : reject(new Error(`HTTP ${xhr.status}`))));
    xhr.addEventListener('error', () => reject(new TypeError('Error de red')));
    xhr.addEventListener('abort', () => reject(new DOMException('Subida cancelada', 'AbortError')));
    xhr.send(formData);
  });
}
async function upload() {
  const formData = new FormData();
  for (const photo of photos) {
    formData.append('photos', await prepare(photo));
    formData.append('captions', photo.caption.value);
  }
  const size = [...formData.values()].reduce((sum, value) => sum + (value.size ?? 0), 0);
  if (size > SERVER_LIMIT) {
    say(`⛔ ${kilobytes.format(size / 1024)} en total: el servidor admite 1 MB por subida`);
    return 'too-big';
  }
  uploadButton.disabled = true;
  cancelButton.hidden = false;
  progress.hidden = false;
  progress.value = 0;
  try {
    const answer = await send(formData);
    const received = [].concat(answer.body.photos).map((file) => `${file.name} (${file.type})`);
    say(`✅ subidas: ${received.join(', ')}`);
    return 'uploaded';
  } catch (error) {
    say(error.name === 'AbortError' ? '✖ subida cancelada' : `⛔ ${error.message}: vuelve a intentarlo`);
    return error.name;
  } finally {
    currentRequest = null;
    uploadButton.disabled = photos.length === 0;
    cancelButton.hidden = true;
    progress.hidden = true;
  }
}
uploadButton.addEventListener('click', upload);
cancelButton.addEventListener('click', () => currentRequest?.abort());

// ── Comprobaciones al cargar (con archivos creados en memoria) ───────────
function audit(label, actual, expected) {
  if (actual === expected) console.log('✅', label, '→', actual);
  else console.error('❌', label, '→', actual, '(esperaba', expected, ')');
}
async function makePng(name) { // una «foto» de 64 × 48 dibujada en un canvas
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 48;
  const context = canvas.getContext('2d');
  context.fillStyle = '#92400e';
  context.fillRect(0, 0, 64, 48);
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
  return new File([blob], name, { type: 'image/png' });
}
const cup = await makePng('taza.png');
addFiles([cup], 'prueba');
audit('acepta una imagen PNG', photos.length, 1);
audit('rechaza un PDF', addFiles([new File(['%PDF-1.7'], 'menu.pdf', { type: 'application/pdf' })], 'prueba')[0], '⛔ menu.pdf no es una imagen PNG, JPG o WebP');
audit('ignora la misma foto otra vez', addFiles([cup], 'prueba')[0], '⛔ taza.png ya está en la lista');
await photos[0].image.decode();
await new Promise((resolve) => setTimeout(resolve)); // deja pasar el evento load
audit('la vista previa cargó y su URL blob: se revocó', liveUrls, 0);
photos[0].caption.value = 'Taza de barro con café de olla';
photos[0].caption.dispatchEvent(new Event('input'));
audit('la descripción es el alt', photos[0].image.alt, 'Taza de barro con café de olla');
audit('subida al servidor de prueba', await upload(), 'uploaded');
audit('el servidor recibió', statusLine.textContent, '✅ subidas: taza.png (image/png)');
removePhoto(photos[0]);
audit('al quitarla, la lista queda vacía y el botón desactivado', `${photos.length} · ${uploadButton.disabled}`, '0 · true');
statusLine.textContent = '';
console.log('Listo: suelta, pega o elige fotos; escribe su descripción y pulsa «Subir»');
```
