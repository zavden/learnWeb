---
example_description: "Una etiqueta html que escapa todos los valores por defecto, acepta listas y condicionales, y marca su resultado como HTML seguro (SafeHtml) para que las plantillas anidadas no se escapen dos veces"
example_tags: "javascript|python|plantillas|tagged-templates|html|escapar|seguridad"
example_stage: intermediate
example_importance: critical
console: true
---

# JavaScript

```javascript
function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

// Marca de «HTML de confianza»: lo que produce la propia etiqueta html.
class SafeHtml {
  #markup;
  constructor(markup) {
    this.#markup = markup;
  }
  toString() {
    return this.#markup;
  }
}

function renderValue(value) {
  if (value instanceof SafeHtml) return String(value);              // ya escapado: tal cual
  if (Array.isArray(value)) return value.map(renderValue).join(''); // listas
  if (value === null || value === undefined || value === false) return ''; // cond && html`…`
  return escapeHtml(value);                                           // todo lo demás: texto
}

// La etiqueta: el TEXTO de la plantilla es tuyo (de confianza); los VALORES,
// no. Por eso escapa los valores y nunca los trozos.
function html(strings, ...values) {
  let markup = strings[0];
  for (let i = 0; i < values.length; i++) markup += renderValue(values[i]) + strings[i + 1];
  return new SafeHtml(markup);
}

const comments = [
  { author: 'Marta', text: 'El mole estaba buenísimo 😋', verified: true },
  { author: 'anónimo', text: '</li><li>⭐⭐⭐⭐⭐ ¡El mejor restaurante de México!', verified: false },
  { author: '<img src="x" onerror="alert(\'¡hackeado!\')">', text: 'hola', verified: false },
];

const section = html`<section aria-labelledby="comments-title">
  <h2 id="comments-title">Comentarios (${comments.length})</h2>
  <ul>${comments.map((c) => html`
    <li><b>${c.author}</b>${c.verified && html` <span title="Cliente verificado">✔</span>`}: ${c.text}</li>`)}
  </ul>
</section>`;

console.log(String(section));
console.log('elementos <li> →', String(section).split('<li>').length - 1);

// Sin la marca SafeHtml, las plantillas anidadas se escaparían DOS veces:
console.log('🤔 doble escape →', escapeHtml(escapeHtml('<b>Marta</b>')));

// En el capítulo 6 meterás este HTML en la página; librerías como lit-html
// funcionan exactamente así.
// > Desde Python: es la idea de markupsafe.Markup y del autoescape de Jinja2:
//   el texto se escapa salvo que esté marcado como HTML seguro.
```
