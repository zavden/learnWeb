---
example_stage: final-solution
example_description: "Solución: line-height sin unidad, la ruta correcta del archivo de Literata, una pila monoespaciada para el código y el titular sin text-transform"
example_tags: "css|solucion|tipografia|line-height|font-face|monospace|text-transform"
console: true
---

# HTML

```html
<article class="article">
  <h1>Cómo guardar tu trabajo con Git antes de apagar el ordenador</h1>
  <p>Git guarda fotografías del proyecto llamadas <em>commits</em>. Antes de terminar el día, revisa qué ha cambiado con <code>git status</code> y añade lo que quieras guardar con <code>git add</code>.</p>
  <p>Después, crea el commit con un mensaje que explique por qué hiciste el cambio, como <code>git commit -m "Corrige el menú del móvil"</code>, y súbelo con <code>git push</code>.</p>
</article>

<ul class="checklist">
  <li>El título calcula su interlineado: <output id="check-line-height">…</output></li>
  <li>Literata se descarga: <output id="check-font">…</output></li>
  <li>El código, del tamaño del texto: <output id="check-code">…</output></li>
  <li>El titular, sin capitalize: <output id="check-transform">…</output></li>
</ul>
```

# CSS

```css
/* ✅ 2: el archivo se llama literata-normal.woff2. */
@font-face {
  font-family: "Literata";
  src: url("fonts/literata-normal.woff2") format("woff2");
  font-weight: 200 900;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: "Literata";
  src: url("fonts/literata-italic.woff2") format("woff2");
  font-weight: 200 900;
  font-style: italic;
  font-display: swap;
}

body {
  color: #1e293b;
  font-family: Literata, Georgia, serif;
}

/* ✅ 1: sin unidad se hereda el factor; el título calcula 32 × 1.5 = 48px.
   Y el título lleva su propio factor, más apretado: 32 × 1.15 ≈ 37px. */
.article {
  max-inline-size: 60ch;
  line-height: 1.5;
}

.article h1 {
  margin: 0 0 12px;
  font-size: 2rem;
  line-height: 1.15;
  text-wrap: balance;
  /* ✅ 4: sin text-transform: el titular se lee como está escrito. */
}

.article p {
  margin: 0 0 12px;
}

/* ✅ 3: con otra fuente delante de la genérica, el código recupera los 16px;
   si se quiere un poco menor, se dice con font-size. */
code {
  padding: 0 3px;
  border-radius: 3px;
  background: #e0e7ff;
  font-family: ui-monospace, Menlo, Consolas, monospace;
  font-size: 0.9em;
}

.checklist {
  padding-inline-start: 1.2em;
  color: #475569;
  font-family: system-ui, sans-serif;
  font-size: 0.8rem;
}

.checklist output {
  color: #1e293b;
  font-weight: bold;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Este script solo lee los estilos
// calculados y escribe ✅ o ❌ en la lista (y en la consola). No hace falta tocarlo:
// se vuelve a ejecutar con cada cambio.
function check(id, ok, detail) {
  const text = `${ok ? '✅' : '❌'} ${detail}`;
  document.getElementById(id).textContent = text;
  console.log(`${id}: ${text}`);
}

const px = (value) => parseFloat(value);

const title = getComputedStyle(document.querySelector('.article h1'));
const ratio = px(title.lineHeight) / px(title.fontSize);
check('check-line-height', ratio >= 1.05,
  `line-height ${Math.round(px(title.lineHeight))} px para una letra de ${Math.round(px(title.fontSize))} px`);

const paragraph = getComputedStyle(document.querySelector('.article p'));
const code = getComputedStyle(document.querySelector('code'));
const codeRatio = px(code.fontSize) / px(paragraph.fontSize);
check('check-code', codeRatio >= 0.85,
  `código a ${px(code.fontSize)} px, párrafo a ${px(paragraph.fontSize)} px`);

check('check-transform', title.textTransform !== 'capitalize',
  `text-transform: ${title.textTransform}`);

// document.fonts es la lista de fuentes de la página (los @font-face incluidos).
// load() pide cada archivo y espera a que llegue… o a que falle.
const faces = [...document.fonts].filter((face) => face.family.replace(/"/g, '') === 'Literata');
Promise.allSettled(faces.map((face) => face.load())).then(() => {
  const ok = faces.length > 0 && faces.every((face) => face.status === 'loaded');
  const states = faces.map((face) => `${face.style}: ${face.status === 'loaded' ? 'cargada' : 'error'}`);
  check('check-font', ok, states.join(', ') || 'no hay ningún @font-face de Literata');
});
```
