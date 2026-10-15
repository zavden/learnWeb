---
example_description: "Un inspector del modelo de caja como el de DevTools: elige un elemento y dibuja sus capas (margin, border, padding, contenido) con los valores de getComputedStyle, lista sus medidas offset*, client* y scroll*, y lo resalta en la página con una capa colocada con getBoundingClientRect"
example_tags: "javascript|dom|profesional|modelo-de-caja|getcomputedstyle|getboundingclientrect|medidas|devtools"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="inspector">
  <h1>Inspector de cajas</h1>
  <p>
    <label for="target">Elemento</label>
    <select id="target">
      <option value="#sample-card">La tarjeta (.card)</option>
      <option value="#sample-button">El botón</option>
      <option value="#sample-scroll">La caja con scroll</option>
    </select>
  </p>
  <div class="stage">
    <div class="card" id="sample-card">Café de Chiapas · $210.00</div>
    <button type="button" id="sample-button">Añadir al carrito</button>
    <div class="scroll" id="sample-scroll" tabindex="0" aria-label="Notas de cata">
      <p>Chocolate amargo, nuez tostada, final largo y dulce. Acidez media, cuerpo redondo. Mejor en prensa francesa o en olla de barro.</p>
    </div>
  </div>
  <div class="diagram" id="diagram" aria-label="Modelo de caja del elemento elegido"></div>
  <dl class="metrics" id="metrics"></dl>
</main>
<div class="overlay overlay-margin" id="overlay-margin" hidden></div>
<div class="overlay overlay-border" id="overlay-border" hidden></div>
```

# CSS

```css
[hidden] {
  display: none !important;
}
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1e293b;
}
.inspector {
  max-width: 40rem;
  padding: 1rem;
}
h1 {
  margin-top: 0;
  font-size: 1.3rem;
}
select {
  font: inherit;
}
.stage {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  padding: 0.5rem;
  background: #f1f5f9;
}
.card {
  width: 200px;
  height: 50px;
  margin: 16px;
  padding: 12px;
  border: 3px solid #1d4ed8;
  background: #ffffff;
}
#sample-button {
  margin: 16px;
  font: inherit;
}
.scroll {
  width: 180px;
  height: 80px;
  margin: 16px;
  padding: 8px;
  overflow-y: auto;
  border: 1px solid #64748b;
  background: #ffffff;
}
.scroll p {
  margin: 0;
}
.overlay {
  position: absolute;
  pointer-events: none;
}
.overlay-margin {
  background: rgb(249 115 22 / 0.25);
}
.overlay-border {
  background: rgb(59 130 246 / 0.25);
  outline: 1px dashed #1d4ed8;
}
.diagram {
  margin: 1rem 0;
  font-size: 0.8rem;
  text-align: center;
}
.layer {
  display: grid;
  grid-template-columns: 2.5rem 1fr 2.5rem;
  align-items: center;
  border: 1px dashed #475569;
}
.layer > :nth-child(1),
.layer > :nth-child(2) {
  grid-column: 1 / -1;
}
.layer-margin {
  background: #fed7aa;
}
.layer-border {
  background: #fde68a;
}
.layer-padding {
  background: #bbf7d0;
}
.content {
  padding: 0.5rem;
  background: #bfdbfe;
  border: 1px solid #475569;
}
.layer-name {
  justify-self: start;
  padding-left: 0.25rem;
}
.metrics {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 0.15rem 1rem;
  font-variant-numeric: tabular-nums;
}
.metrics dt {
  font-weight: bold;
}
.metrics dd {
  margin: 0;
}
```

# JavaScript

```javascript
// INSPECTOR DEL MODELO DE CAJA.
//
// Decisiones:
// - Los valores de cada capa salen de getComputedStyle: valores RESUELTOS en
//   px (lección «Atributos y propiedades»). El contenido es el width/height
//   computado (en una caja content-box, el del contenido).
// - Las medidas offset*/client*/scroll* se leen tal cual, como en el panel
//   de DevTools (lección «Medidas y layout»).
// - El resaltado son dos capas con position: absolute colocadas con
//   getBoundingClientRect + scrollX/scrollY (coordenadas del documento).
// - inspect() lee TODO primero y escribe después: un solo layout.
// - El diagrama se construye con createElement: cuatro capas anidadas.
//
// Alcance: HTML, CSS (módulos 1-7), el capítulo de JavaScript y el módulo «El DOM».

const SIDES = ['top', 'right', 'bottom', 'left'];
const px = (value) => Number.parseFloat(value) || 0;
const round = (value) => Math.round(value * 100) / 100;

function readBox(element) {
  const style = getComputedStyle(element);
  const sides = (prefix, suffix = '') =>
    Object.fromEntries(SIDES.map((side) => [side, px(style.getPropertyValue(`${prefix}-${side}${suffix}`))]));
  return {
    margin: sides('margin'),
    border: sides('border', '-width'),
    padding: sides('padding'),
    content: { width: px(style.width), height: px(style.height) },
    rect: element.getBoundingClientRect(),
    offset: { width: element.offsetWidth, height: element.offsetHeight },
    client: { width: element.clientWidth, height: element.clientHeight },
    scroll: { width: element.scrollWidth, height: element.scrollHeight, top: element.scrollTop },
    page: { x: window.scrollX, y: window.scrollY },
  };
}

function layer(name, values, inner) {
  const box = document.createElement('div');
  box.className = `layer layer-${name}`;
  const label = document.createElement('span');
  label.className = 'layer-name';
  label.textContent = name;
  const cell = (text) => {
    const span = document.createElement('span');
    span.textContent = text;
    return span;
  };
  box.append(label, cell(round(values.top)), cell(round(values.left)), inner, cell(round(values.right)), cell(''), cell(round(values.bottom)));
  return box;
}

function drawDiagram(box) {
  const content = document.createElement('div');
  content.className = 'content';
  content.textContent = `${round(box.content.width)} × ${round(box.content.height)}`;
  return layer('margin', box.margin, layer('border', box.border, layer('padding', box.padding, content)));
}

function drawMetrics(box) {
  const rows = [
    ['offset', `${box.offset.width} × ${box.offset.height}`],
    ['client', `${box.client.width} × ${box.client.height}`],
    ['scroll', `${box.scroll.width} × ${box.scroll.height} (scrollTop ${box.scroll.top})`],
    ['rect', `${round(box.rect.width)} × ${round(box.rect.height)} en (${round(box.rect.x)}, ${round(box.rect.y)})`],
  ];
  return rows.flatMap(([term, value]) => {
    const dt = document.createElement('dt');
    dt.textContent = term;
    const dd = document.createElement('dd');
    dd.textContent = value;
    return [dt, dd];
  });
}

function placeOverlay(overlay, left, top, width, height) {
  overlay.style.left = `${left}px`;
  overlay.style.top = `${top}px`;
  overlay.style.width = `${width}px`;
  overlay.style.height = `${height}px`;
  overlay.hidden = false;
}

const overlayMargin = document.querySelector('#overlay-margin');
const overlayBorder = document.querySelector('#overlay-border');
const diagram = document.querySelector('#diagram');
const metrics = document.querySelector('#metrics');

function inspect(element) {
  const box = readBox(element); // todas las lecturas
  const { rect, margin, page } = box;
  placeOverlay(overlayBorder, rect.left + page.x, rect.top + page.y, rect.width, rect.height);
  placeOverlay(overlayMargin, rect.left + page.x - margin.left, rect.top + page.y - margin.top,
    rect.width + margin.left + margin.right, rect.height + margin.top + margin.bottom);
  diagram.replaceChildren(drawDiagram(box));
  metrics.replaceChildren(...drawMetrics(box));
  return box;
}

// El <select> elige qué inspeccionar (el evento change: módulo siguiente).
const targetSelect = document.querySelector('#target');
targetSelect.addEventListener('change', () => inspect(document.querySelector(targetSelect.value)));

// ── Comprobaciones al cargar ────────────────────────────────────────────
function audit(label, actual, expected) {
  if (actual === expected) console.log('✅', label, '→', actual);
  else console.error('❌', label, '→', actual, '(esperaba', expected, ')');
}
const card = inspect(document.querySelector('#sample-card'));
audit('contenido', `${card.content.width} × ${card.content.height}`, '200 × 50');
audit('padding · border · margin', `${card.padding.top} · ${card.border.top} · ${card.margin.top}`, '12 · 3 · 16');
audit('offset = contenido + padding + borde', `${card.offset.width} × ${card.offset.height}`, '230 × 80');
audit('client = contenido + padding', `${card.client.width} × ${card.client.height}`, '224 × 74');
const overlayRect = overlayBorder.getBoundingClientRect();
const cardRect = document.querySelector('#sample-card').getBoundingClientRect();
audit('el resaltado cubre la tarjeta', ['left', 'top', 'width', 'height'].every((key) => Math.abs(overlayRect[key] - cardRect[key]) < 0.5), true);
audit('el resaltado del margen mide 16 px más por lado', round(overlayMargin.getBoundingClientRect().width - overlayRect.width), 32);
audit('capas del diagrama', [...diagram.querySelectorAll('.layer-name')].map((name) => name.textContent).join(' › '), 'margin › border › padding');
const scrollBox = inspect(document.querySelector('#sample-scroll'));
audit('la caja con scroll tiene más contenido del que se ve', scrollBox.scroll.height > scrollBox.client.height, true);
console.log('barra de scroll de la caja (varía) →', scrollBox.offset.width - scrollBox.client.width - scrollBox.border.left - scrollBox.border.right, 'px');
inspect(document.querySelector('#sample-card'));
```
