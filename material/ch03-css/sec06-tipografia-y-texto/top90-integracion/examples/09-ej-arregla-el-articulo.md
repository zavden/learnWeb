---
exercise: true
exercise_title: "Arregla el artículo"
exercise_instructions: "Las líneas del título se montan: arregla el interlineado del artículo para que cada elemento lo calcule con su propio tamaño de letra (TODO 1) || Literata no se descarga y el texto sale con Georgia: busca el error en el primer @font-face (TODO 2) || El código se ve más pequeño que el texto que lo rodea: dale una pila de fuentes de verdad (TODO 3) || El titular sale con mayúscula en cada palabra, que en español es una falta (TODO 4) || Comprueba que las cuatro líneas de la lista marcan ✅"
exercise_hints: "Con unidades, line-height se hereda ya calculado en píxeles || Mira en assets/fonts cómo se llama de verdad el archivo, o busca la petición en rojo en Network || Con la genérica monospace sola, Chrome usa 13px; con cualquier otra fuente delante, no || El titular ya está bien escrito en el HTML: sobra una transformación"
exercise_solution_example: 09-ej-arregla-el-articulo-solucion.md
exercise_locked_files: index.html,script.js
example_stage: exercise
console: true
example_description: "Ejercicio: un artículo con cuatro errores tipográficos (line-height con unidades, un @font-face con la ruta mal, código a 13px y capitalize en el titular) que un pequeño script comprueba en directo"
example_tags: "css|ejercicio|tipografia|line-height|font-face|monospace|text-transform"
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
/* TODO 2: Literata no llega. Revisa el src de esta regla. */
@font-face {
  font-family: "Literata";
  src: url("fonts/literata.woff2") format("woff2");
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

/* TODO 1: el título (32px) hereda un interlineado de 24px y sus líneas se montan. */
.article {
  max-inline-size: 60ch;
  line-height: 1.5em;
}

.article h1 {
  margin: 0 0 12px;
  font-size: 2rem;
  /* TODO 4: el titular ya está bien escrito en el HTML. */
  text-transform: capitalize;
}

.article p {
  margin: 0 0 12px;
}

/* TODO 3: este código mide 13px en un párrafo de 16px. */
code {
  padding: 0 3px;
  border-radius: 3px;
  background: #e0e7ff;
  font-family: monospace;
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
