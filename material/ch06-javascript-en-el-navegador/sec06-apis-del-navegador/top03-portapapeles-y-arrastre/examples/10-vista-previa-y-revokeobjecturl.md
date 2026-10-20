---
example_description: "URL.createObjectURL(file) da una URL blob: para mostrar una foto sin subirla, pero mantiene el archivo en memoria hasta que se llama a URL.revokeObjectURL o se cierra la página: sin revocar, la vista previa quitada sigue respondiendo a fetch; FileReader.readAsDataURL es la alternativa antigua, con un texto un tercio más grande"
example_tags: "javascript|file-api|createobjecturl|revokeobjecturl|filereader|memoria|imagenes|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Fotos de tu reseña</h1>
  <label for="photos">Elige fotos de tu café</label>
  <input id="photos" type="file" accept="image/*" multiple>
  <p class="options">
    <label><input id="revoke" type="checkbox" checked> Revocar cada URL en cuanto la foto se ve (✅)</label>
  </p>
  <p>URLs blob vivas: <output id="live-count">0</output></p>
  <div id="previews" class="previews"></div>
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
label {
  display: block;
  margin-bottom: 0.25rem;
}
.options label {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}
input:focus-visible,
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.previews {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
.previews figure {
  margin: 0;
  text-align: center;
}
.previews img {
  display: block;
  width: 120px;
  height: 90px;
  object-fit: cover;
  border-radius: 0.375rem;
}
button {
  font: inherit;
  font-size: 0.85rem;
  padding: 0.1rem 0.5rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
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
const previews = document.querySelector('#previews');
const revokeBox = document.querySelector('#revoke');
const liveCount = document.querySelector('#live-count');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}
const liveUrls = new Set();
function track(url, alive) {
  if (alive) liveUrls.add(url);
  else liveUrls.delete(url);
  liveCount.textContent = liveUrls.size;
}

// Una vista previa: una URL blob: que apunta al archivo, sin leerlo ni subirlo.
function addPreview(file, revoke) {
  const url = URL.createObjectURL(file);
  track(url, true);
  const figure = document.createElement('figure');
  const image = document.createElement('img');
  image.alt = `Vista previa de ${file.name}`;
  if (revoke) {
    // ✅ Ya decodificada, la imagen no necesita la URL: suelta el archivo.
    image.addEventListener('load', () => {
      URL.revokeObjectURL(url);
      track(url, false);
    }, { once: true });
  }
  image.src = url;
  const remove = document.createElement('button');
  remove.type = 'button';
  remove.textContent = 'Quitar';
  remove.addEventListener('click', () => figure.remove()); // 🐛 sin revocar, el archivo sigue en memoria
  figure.append(image, remove);
  previews.append(figure);
  return { url, image, figure };
}

document.querySelector('#photos').addEventListener('change', (event) => {
  for (const file of event.target.files) addPreview(file, revokeBox.checked);
  logLine(`🖼 ${event.target.files.length} foto(s) · URLs blob vivas: ${liveUrls.size}`);
});

// ── Simulado al cargar, con una «foto» creada en memoria ──────────────────
const photo = new File(['<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 90"><rect width="120" height="90" fill="#fdf6e3"/><path d="M30 30h50v25a20 20 0 0 1-20 20h-10a20 20 0 0 1-20-20z" fill="#92400e"/><path d="M80 38h8a9 9 0 0 1 0 18h-8" fill="none" stroke="#92400e" stroke-width="5"/></svg>'], 'taza.svg', { type: 'image/svg+xml' });

async function tryRemovedPreview(revoke) {
  const { url, image, figure } = addPreview(photo, revoke);
  await new Promise((resolve) => image.addEventListener('load', resolve, { once: true })); // la foto ya se ve
  figure.remove(); // la persona pulsa «Quitar»
  try {
    const response = await fetch(url); // ¿sigue vivo el archivo detrás de la URL?
    return `fetch(url) → ${response.status} · ${(await response.blob()).size} bytes siguen en memoria`;
  } catch (error) {
    return `fetch(url) → ${error.name}: ${error.message}`;
  }
}

function readAsDataUrl(file) { // FileReader: la API antigua, con eventos
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

(async () => {
  logLine(`— simulado: una foto en memoria (taza.svg, ${photo.size} bytes) —`);
  logLine(`🐛 sin revocar, quitada → ${await tryRemovedPreview(false)}`);
  logLine(`✅ revocada, quitada → ${await tryRemovedPreview(true)}`);
  const dataUrl = await readAsDataUrl(photo);
  logLine(`FileReader → data URL de ${dataUrl.length} caracteres para ${photo.size} bytes (${dataUrl.slice(0, 26)}…)`);
  logLine(`URLs blob vivas: ${liveUrls.size} · Listo: elige fotos; desmarca la casilla para ver cómo se acumulan`);
})();
```
