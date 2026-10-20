---
example_description: "La etiqueta html del módulo de plantillas etiquetadas, por fin en la página: escapa cada valor, así que innerHTML recibe solo el marcado del programador. Y en Chrome, setHTML() limpia el HTML ajeno (sin scripts ni atributos on…) antes de insertarlo"
example_tags: "javascript|dom|innerhtml|tagged-templates|escapar|sethtml|sanitizer|seguridad"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<section id="comments" aria-labelledby="comments-title"></section>
<h2>Vista previa de tu comentario</h2>
<div id="preview"></div>
```

# JavaScript

```javascript
// La etiqueta html de la lección «Plantillas etiquetadas» (versión corta):
// el TEXTO de la plantilla es tuyo; los VALORES se escapan siempre.
function escapeHtml(value) {
  return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}
class SafeHtml {
  #markup;
  constructor(markup) { this.#markup = markup; }
  toString() { return this.#markup; }
}
function renderValue(value) {
  if (value instanceof SafeHtml) return String(value);
  if (Array.isArray(value)) return value.map(renderValue).join('');
  if (value === null || value === undefined || value === false) return '';
  return escapeHtml(value);
}
function html(strings, ...values) {
  let markup = strings[0];
  for (let i = 0; i < values.length; i++) markup += renderValue(values[i]) + strings[i + 1];
  return new SafeHtml(markup);
}

const comments = [
  { author: 'Marta', text: 'El mole estaba buenísimo 😋', verified: true },
  { author: 'anónimo', text: '</li><li>⭐⭐⭐⭐⭐ ¡El mejor restaurante de México!', verified: false },
  { author: `<img src="x" onerror="document.body.style.background = 'crimson'">`, text: 'hola', verified: false },
];

const section = document.querySelector('#comments');
section.innerHTML = String(html`
  <h2 id="comments-title">Comentarios (${comments.length})</h2>
  <ul>${comments.map((c) => html`
    <li><b>${c.author}</b>${c.verified && html` <span title="Cliente verificado">✔</span>`}: ${c.text}</li>`)}
  </ul>`);

console.log('elementos <li> →', section.querySelectorAll('li').length);
console.log('<img> creados →', section.querySelectorAll('img').length);
console.log('el tercer autor, como texto →', section.querySelectorAll('b')[2].textContent);

// En Chrome: setHTML() inserta HTML ajeno pasándolo antes por el Sanitizer del
// navegador, que quita los <script>, los atributos on… y las URL javascript:.
const draft = '<b onmouseover="alert(1)">¡Me encantó!</b><script>alert(2)<\/script>';
const preview = document.querySelector('#preview');
if (typeof preview.setHTML === 'function') {
  preview.setHTML(draft);
  console.log('setHTML deja →', preview.innerHTML);
} else {
  preview.textContent = draft; // sin setHTML, lo seguro es mostrarlo como texto
  console.log('este navegador no tiene setHTML: se muestra como texto');
}
```
