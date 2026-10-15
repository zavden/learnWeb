---
example_description: "Comprobador del título y la meta descripción de una página: contadores en vivo, estados con switch y vista previa del resultado de búsqueda"
example_tags: "javascript|profesional|seo|formulario|contadores|accesibilidad"
example_stage: professional
example_importance: useful
console: true
---

# HTML

```html
<main class="app">
  <h1>Título y descripción para buscadores</h1>
  <p class="intro">Comprueba la longitud del <code>&lt;title&gt;</code> y de la <code>&lt;meta name="description"&gt;</code> de una página antes de publicarla.</p>

  <form id="seo-form" class="card" novalidate>
    <div class="field">
      <label for="title">Título de la página</label>
      <input id="title" name="title" type="text" aria-describedby="title-count title-status"
             value="Café de especialidad tostado en Valencia | La Tiendita">
      <p class="meta">
        <span id="title-count" class="count">0 caracteres</span>
        <span id="title-status" class="status" data-state="empty"></span>
      </p>
    </div>

    <div class="field">
      <label for="description">Meta descripción</label>
      <textarea id="description" name="description" rows="4" aria-describedby="description-count description-status">Tostamos cada semana en nuestro obrador de Ruzafa. Cafés de origen único, envío en 24 h y molienda a tu gusto.</textarea>
      <p class="meta">
        <span id="description-count" class="count">0 caracteres</span>
        <span id="description-status" class="status" data-state="empty"></span>
      </p>
    </div>
  </form>

  <section class="card" aria-labelledby="preview-title">
    <h2 id="preview-title">Vista previa aproximada</h2>
    <div class="snippet">
      <p class="snippet__url">latiendita.example › cafe</p>
      <p id="snippet-title" class="snippet__title"></p>
      <p id="snippet-description" class="snippet__description"></p>
    </div>
    <p class="hint">Los buscadores recortan por anchura en píxeles, no por caracteres: los límites son orientativos.</p>
  </section>
</main>
```

# CSS

```css
:root {
  --text: #1b1f24;
  --muted: #545b66;
  --page: #f4f6f8;
  --surface: #ffffff;
  --border: #c4c9d0;
  --accent: #0b5cad;
  --ok-text: #1a6b3c;
  --ok-bg: #e8f5ec;
  --warn-text: #8a5a00;
  --warn-bg: #fff8e1;
  --bad-text: #9b1c1c;
  --bad-bg: #fdecec;
  --link: #1a0dab;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
  line-height: 1.5;
  color: var(--text);
  background: var(--page);
}

.app {
  max-width: 44rem;
  margin: 0 auto;
  padding: 1.5rem 1rem 2.5rem;
  display: grid;
  gap: 1.25rem;
}

h1 {
  margin: 0;
  font-size: clamp(1.4rem, 1.1rem + 1.5vw, 1.9rem);
}

h2 {
  margin-top: 0;
  font-size: 1.1rem;
}

.intro,
.hint {
  margin: 0;
  color: var(--muted);
}

.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.25rem;
}

.field + .field {
  margin-top: 1.25rem;
}

label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.35rem;
}

input,
textarea {
  width: 100%;
  font: inherit;
  padding: 0.55rem 0.7rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  resize: vertical;
}

input:focus-visible,
textarea:focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 2px;
}

.meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1rem;
  align-items: center;
  margin: 0.4rem 0 0;
  font-size: 0.9rem;
}

.count {
  font-variant-numeric: tabular-nums;
  color: var(--muted);
}

.status {
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  font-weight: 600;
}

.status[data-state='ok'] {
  color: var(--ok-text);
  background: var(--ok-bg);
}

.status[data-state='short'] {
  color: var(--warn-text);
  background: var(--warn-bg);
}

.status[data-state='long'] {
  color: var(--bad-text);
  background: var(--bad-bg);
}

.snippet {
  max-width: 600px;
  font-family: Arial, sans-serif;
}

.snippet p {
  margin: 0;
}

.snippet__url {
  font-size: 0.85rem;
  color: #3c4043;
}

.snippet__title {
  font-size: 1.25rem;
  color: var(--link);
  overflow-wrap: anywhere;
}

.snippet__description {
  font-size: 0.9rem;
  color: #4d5156;
  overflow-wrap: anywhere;
}
```

# JavaScript

```javascript
// COMPROBADOR DE TÍTULO Y META DESCRIPCIÓN.
//
// Decisiones de diseño:
// - Los límites están en una tabla de datos (LIMITS), no repartidos por el código.
// - assessLength devuelve un ESTADO ('empty', 'short', 'ok', 'long'); el texto y el
//   color salen de ese estado (switch en el código, selectores [data-state] en CSS).
// - Ojo: .length cuenta unidades UTF-16; un emoji cuenta 2. Lo verás en
//   «Números, texto y colecciones». Para este uso, la aproximación basta.
//
// Alcance: function se estudia en «Funciones y ámbito»; objetos y métodos de string
// (trim, slice, lastIndexOf) en «Números, texto y colecciones»; el DOM y los eventos,
// en el capítulo 6.

// ── Lógica ──────────────────────────────────────────────────────────────

const LIMITS = {
  title: { min: 30, max: 60, fallback: 'Título de tu página' },
  description: { min: 70, max: 160, fallback: 'Aquí aparecerá la descripción de tu página.' },
};

function assessLength(length, min, max) {
  if (length === 0) {
    return 'empty';
  }
  if (length < min) {
    return 'short';
  }
  return length > max ? 'long' : 'ok';
}

function statusMessage(state, min, max) {
  switch (state) {
    case 'empty':
      return 'Vacío';
    case 'short':
      return `Corto: intenta llegar a ${min}`;
    case 'ok':
      return 'Longitud adecuada';
    case 'long':
      return `Largo: se cortará hacia los ${max}`;
    default:
      throw new RangeError(`Estado desconocido: «${state}»`);
  }
}

// Recorta en el último espacio antes del límite, para no partir una palabra.
function truncate(text, max) {
  if (text.length <= max) {
    return text;
  }
  const cut = text.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > 0 ? cut.slice(0, lastSpace) : cut).trim()} …`;
}

// ── Interfaz ────────────────────────────────────────────────────────────
// querySelector busca un elemento; .value lee el campo; textContent y dataset
// cambian su texto y sus atributos data-*; addEventListener reacciona a eventos.
// Todo esto se estudia en el capítulo 6.

const fields = {
  title: {
    input: document.querySelector('#title'),
    count: document.querySelector('#title-count'),
    status: document.querySelector('#title-status'),
    preview: document.querySelector('#snippet-title'),
  },
  description: {
    input: document.querySelector('#description'),
    count: document.querySelector('#description-count'),
    status: document.querySelector('#description-status'),
    preview: document.querySelector('#snippet-description'),
  },
};

function renderField(name) {
  const field = fields[name];
  const limits = LIMITS[name];
  // Espacios al principio y al final no cuentan: el buscador los ignora.
  const text = field.input.value.trim();
  const state = assessLength(text.length, limits.min, limits.max);

  const unit = text.length === 1 ? 'carácter' : 'caracteres';
  field.count.textContent = `${text.length} ${unit} (recomendado: ${limits.min}–${limits.max})`;
  field.status.textContent = statusMessage(state, limits.min, limits.max);
  field.status.dataset.state = state;

  // Aquí || es correcto: un texto vacío SÍ debe sustituirse por el de ejemplo.
  field.preview.textContent = truncate(text || limits.fallback, limits.max);
}

function render() {
  renderField('title');
  renderField('description');
}

function handleSubmit(event) {
  event.preventDefault(); // Enter no debe recargar la página
}

const form = document.querySelector('#seo-form');
form.addEventListener('input', render);
form.addEventListener('submit', handleSubmit);
render();
console.log('Comprobador listo: edita el título o la descripción.');
```
