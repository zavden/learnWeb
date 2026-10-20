---
example_description: "Un presupuesto de recursos para la ficha de un producto: cuántas imágenes, hojas de estilo, peticiones y KB puede pedir la página. Resource Timing da una entrada por archivo (initiatorType y tamaños), un PerformanceObserver con buffered: true llena la tabla y la auditoría compara contra el presupuesto; añadir la galería en alta resolución lo rompe y nombra a los archivos más pesados. Un servicio de otro origen sin Timing-Allow-Origin no enseña sus tamaños"
example_tags: "javascript|rendimiento|resource-timing|performanceobserver|presupuesto|imagenes|profesional"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<link rel="stylesheet" href="budget/product.css">
<main class="shop">
  <h1>Tienda del museo</h1>
  <article class="product" aria-labelledby="product-title">
    <div>
      <img class="product-photo" src="gallery/hokusai-wave-480.jpg" width="480" height="323" alt="La gran ola de Kanagawa, de Katsushika Hokusai">
      <ul class="thumbs" aria-label="Otras láminas de la colección">
        <li><img src="gallery/velasco-valley-480.jpg" width="480" height="330" alt="Valle de México, de José María Velasco"></li>
        <li><img src="gallery/earth-apollo17-480.jpg" width="480" height="480" alt="La Tierra desde el Apolo 17"></li>
      </ul>
    </div>
    <div>
      <h2 id="product-title">Lámina: La gran ola de Kanagawa</h2>
      <p id="price" class="price">—</p>
      <p id="stock" class="stock">Consultando existencias…</p>
      <p id="reviews" class="reviews">Cargando reseñas…</p>
      <button id="gallery-button" type="button">Añadir la galería en alta resolución (5 imágenes)</button>
    </div>
  </article>
  <div id="gallery" class="gallery-hd" hidden></div>
  <table class="resources">
    <caption>Recursos que pidió esta página</caption>
    <thead><tr><th scope="col">Archivo</th><th scope="col">Tipo</th><th scope="col">Tamaño</th></tr></thead>
    <tbody id="resource-rows"></tbody>
  </table>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
:root { --ink: #1e293b; --muted: #475569; --line: #cbd5e1; --accent: #1d4ed8; --paper: #ffffff; --page: #f8fafc; }
body { margin: 0; font-family: system-ui, sans-serif; color: var(--ink); background: var(--page); }
.shop { max-width: 40rem; margin: 0 auto; padding: 1rem; }
h1 { font-size: 1.2rem; margin-top: 0; }
h2 { font-size: 1.05rem; margin: 0; }
button { font: inherit; padding: 0.35rem 0.8rem; border: 1px solid #64748b; border-radius: 0.4rem; background: var(--paper); color: var(--ink); cursor: pointer; }
button:disabled { cursor: not-allowed; color: #64748b; }
button:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.resources { inline-size: 100%; margin-top: 1rem; border-collapse: collapse; background: var(--paper); font-size: 0.8rem; font-variant-numeric: tabular-nums; }
.resources caption { text-align: start; font-weight: 600; padding-block: 0.3rem; }
.resources th, .resources td { padding: 0.2rem 0.5rem; border-block-end: 1px solid var(--line); text-align: start; overflow-wrap: anywhere; }
.resources td:last-child, .resources th:last-child { text-align: end; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--paper); font-family: Menlo, Consolas, monospace; font-size: 0.8rem; }
```

# JavaScript

```javascript
// PRESUPUESTO DE RECURSOS
// - Un presupuesto de rendimiento pone límites ANTES de que la página engorde: cuántos archivos de
//   cada tipo y cuántos KB. Se comprueba con Resource Timing: el navegador crea una entrada por
//   cada archivo que pidió la página, con su tipo (initiatorType: img, link, fetch, script, css…)
//   y sus tamaños.
// - Tamaños: encodedBodySize es el archivo tal como viaja (comprimido, si lo está);
//   decodedBodySize, ya descomprimido; transferSize, lo que pasó de verdad por la red (0 si salió
//   de la caché; solo las cabeceras si el servidor contestó 304). El presupuesto usa
//   encodedBodySize: no cambia entre la primera visita y la siguiente.
// - De otro origen, el navegador oculta los tamaños (y casi todos los tiempos) salvo que el
//   servidor envíe Timing-Allow-Origin. Los assets de LearnWeb lo envían; las reseñas vienen de
//   la API de prueba en 127.0.0.1 (otro origen, como un servicio externo) y no lo envían.
// - Un PerformanceObserver con buffered: true llena la tabla (también con lo que se cargó antes
//   del script); la auditoría lee la foto completa con getEntriesByType('resource').
// - Las imágenes no llevan srcset (el ejemplo 04 lo usa): así se sabe qué archivo pide cada una.
// - La consola da tipos, conteos y tamaños de archivos conocidos; nunca tiempos.

const BUDGET = [
  { type: 'img', label: 'imágenes', count: 6, kb: 400 },
  { type: 'link', label: 'hojas de estilo', count: 2, kb: 30 },
  { type: 'script', label: 'scripts', count: 3, kb: 100 },
  { type: 'fetch', label: 'peticiones fetch', count: 5, kb: 50 },
  { type: 'other', label: 'otros', count: 3, kb: 50 },
];
const TOTAL_BUDGET = { count: 15, kb: 600 };
const HD_IMAGES = [
  { file: 'aldrin-apollo11', height: 966, alt: 'Buzz Aldrin en la Luna, Apolo 11' },
  { file: 'earth-apollo17', height: 960, alt: 'La Tierra desde el Apolo 17' },
  { file: 'hokusai-wave', height: 646, alt: 'La gran ola de Kanagawa, de Katsushika Hokusai' },
  { file: 'pillars-creation', height: 1002, alt: 'Pilares de la creación, telescopio Hubble' },
  { file: 'velasco-valley', height: 660, alt: 'Valle de México, de José María Velasco' },
];
const REVIEWS_URL = 'http://127.0.0.1:3001/api/demo/echo?resenas=LAM-001&delay=150';

const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
const fileName = (url) => new URL(url).pathname.split('/').pop();
// Sin Timing-Allow-Origin, las fases de la respuesta valen 0 (y los tamaños también).
const sizesHidden = (entry) => entry.responseStart === 0;

// ── La tabla: se rellena según llegan las entradas ──
const rowsBody = document.querySelector('#resource-rows');
function addRow(entry) {
  const row = document.createElement('tr');
  const host = new URL(entry.name).host;
  const name = host === location.host || entry.name.includes('/assets/') ? fileName(entry.name) : `${host} · ${fileName(entry.name)}`;
  const size = sizesHidden(entry) ? 'sin datos' : kb(entry.encodedBodySize);
  for (const text of [name, entry.initiatorType, size]) row.append(Object.assign(document.createElement('td'), { textContent: text }));
  rowsBody.append(row);
}
new PerformanceObserver((list) => list.getEntries().forEach(addRow)).observe({ type: 'resource', buffered: true });
performance.addEventListener('resourcetimingbufferfull', () => {
  logLine('⚠️ el búfer de Resource Timing está lleno (250 entradas): el observador sigue recibiéndolas, getEntriesByType ya no');
});

// ── La auditoría: agrupar por tipo y comparar con el presupuesto ──
function audit(moment) {
  const entries = performance.getEntriesByType('resource');
  const groups = new Map(BUDGET.map((rule) => [rule.type, { rule, count: 0, bytes: 0, hidden: 0 }]));
  for (const entry of entries) {
    const group = groups.get(entry.initiatorType) ?? groups.get('other');
    group.count += 1;
    if (sizesHidden(entry)) group.hidden += 1;
    else group.bytes += entry.encodedBodySize;
  }
  const used = [...groups.values()].filter((group) => group.count > 0);
  logLine(`📦 ${moment} · recursos: ${entries.length} · ${used.map((group) => `${group.rule.type} ${group.count}`).join(' · ')}`);
  for (const { rule, count, bytes, hidden } of used) {
    const ok = count <= rule.count && bytes / 1024 <= rule.kb;
    const hiddenNote = hidden ? ` · sin datos de tamaño: ${hidden} (otro origen sin Timing-Allow-Origin)` : '';
    logLine(`${ok ? '✅' : '❌'} ${rule.label}: ${count} de ${rule.count} · ${kb(bytes)} de ${rule.kb} KB${hiddenNote}`);
  }
  const totalBytes = used.reduce((sum, group) => sum + group.bytes, 0);
  const totalOk = entries.length <= TOTAL_BUDGET.count && totalBytes / 1024 <= TOTAL_BUDGET.kb;
  logLine(`${totalOk ? '✅' : '❌'} total: ${entries.length} de ${TOTAL_BUDGET.count} recursos · ${kb(totalBytes)} de ${TOTAL_BUDGET.kb} KB`);
  if (!totalOk) {
    const heaviest = entries.filter((entry) => !sizesHidden(entry)).sort((a, b) => b.encodedBodySize - a.encodedBodySize).slice(0, 3);
    logLine(`🏋️ las más pesadas: ${heaviest.map((entry) => `${fileName(entry.name)} ${kb(entry.encodedBodySize)}`).join(' · ')}`);
  }
}

// ── La ficha: precio y existencias de un JSON (assets/budget/stock.json) y reseñas «externas» ──
const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const pageLoaded = document.readyState === 'complete' ? Promise.resolve() : new Promise((resolve) => addEventListener('load', resolve, { once: true }));
const stock = fetch('budget/stock.json').then((response) => response.json()).then((data) => {
  document.querySelector('#price').textContent = pesos.format(data.precio);
  document.querySelector('#stock').textContent = `${data.existencias} en existencia · envío en ${data.envio}`;
});
const reviews = fetch(REVIEWS_URL).then((response) => {
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.text(); // leer el cuerpo: la entrada de Resource Timing se crea cuando termina de llegar
}).then(() => {
  document.querySelector('#reviews').textContent = '★ 4,8 de 5 · 126 opiniones (servicio de reseñas externo)';
}).catch((error) => { document.querySelector('#reviews').textContent = `Reseñas no disponibles (${error.message})`; });
// Las entradas de los fetch se crean al terminar el cuerpo: se espera un poco más antes de auditar.
const settled = () => new Promise((resolve) => setTimeout(resolve, 150));
Promise.all([pageLoaded, stock, reviews]).then(settled).then(() => audit('al cargar'));

// ── Romper el presupuesto: cinco imágenes de 960 px más ──
const galleryButton = document.querySelector('#gallery-button');
galleryButton.addEventListener('click', () => {
  galleryButton.disabled = true;
  const gallery = document.querySelector('#gallery');
  const loads = HD_IMAGES.map(({ file, height, alt }) => {
    const image = Object.assign(document.createElement('img'), { src: `gallery/${file}-960.jpg`, width: 960, height, alt, decoding: 'async' });
    gallery.append(image);
    return new Promise((resolve) => { image.addEventListener('load', resolve, { once: true }); image.addEventListener('error', resolve, { once: true }); });
  });
  gallery.hidden = false;
  Promise.all(loads).then(settled).then(() => audit('con la galería'));
});
console.log('Listo: espera a que cargue la ficha y pulsa «Añadir la galería en alta resolución»');
```
