---
example_description: "Un sistema mínimo de componentes con <template>: atributos data-text, data-attr, data-class, data-show y data-list dicen dónde va cada dato; render() clona la plantilla, aplica cada enlace con textContent, setAttribute, classList y hidden, anida otras plantillas y avisa con un error claro si falta un dato"
example_tags: "javascript|dom|profesional|template|componentes|dataset|classlist|hidden"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<main class="shop">
  <h1>Escaparate</h1>
  <div class="grid" id="showcase"></div>
</main>

<template id="product-card">
  <article class="product" data-class="sold-out:soldOut">
    <h2><a data-text="name" data-attr="href:url"></a></h2>
    <p class="price" data-text="price"></p>
    <p class="badge" data-show="soldOut">Agotado</p>
    <ul class="tags" data-list="tags" data-template="tag-chip" aria-label="Etiquetas"></ul>
  </article>
</template>

<template id="tag-chip">
  <li class="tag" data-text="label" data-attr="title:hint"></li>
</template>
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
  background: #f8fafc;
}
.shop {
  max-width: 60rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  margin-top: 0;
  font-size: 1.3rem;
}
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
  gap: 0.75rem;
}
.product {
  padding: 0.75rem 1rem;
  background: #ffffff;
  border: 1px solid #cbd5e1;
  border-radius: 0.5rem;
}
.product h2 {
  margin: 0 0 0.25rem;
  font-size: 1.05rem;
}
.product a {
  color: #1d4ed8;
}
.product a:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.price {
  margin: 0 0 0.5rem;
  font-weight: bold;
}
.sold-out .price {
  color: #475569;
  text-decoration: line-through;
}
.badge {
  display: inline-block;
  margin: 0 0 0.5rem;
  padding: 0.1rem 0.5rem;
  color: #7f1d1d;
  background: #fee2e2;
  border-radius: 999px;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.tag {
  padding: 0.1rem 0.5rem;
  font-size: 0.85rem;
  background: #e2e8f0;
  border-radius: 999px;
}
```

# JavaScript

```javascript
// COMPONENTES CON <template> Y ATRIBUTOS data-*.
//
// Decisiones:
// - El HTML de cada componente vive en un <template>; unos atributos data-*
//   dicen qué dato va en cada sitio (como los «bindings» de Vue o Angular):
//     data-text="campo"            → textContent (nunca HTML)
//     data-attr="atributo:campo …" → setAttribute
//     data-class="clase:campo"     → classList.toggle(clase, Boolean(dato))
//     data-show="campo"            → hidden = !dato
//     data-list="campo" + data-template="id" → una copia de otra plantilla por elemento
// - render() trabaja sobre una COPIA (cloneNode(true)): la plantilla sirve
//   siempre. Al aplicar un enlace, quita su atributo: el DOM final queda limpio.
// - Un dato que falta es un error con nombre, no un hueco vacío en la página.
//
// Alcance: HTML, CSS (módulos 1-7), el capítulo de JavaScript y el módulo «El DOM».

class TemplateDataError extends Error {
  name = 'TemplateDataError';
}

function valueOf(data, field, templateId) {
  if (!(field in data)) throw new TemplateDataError(`Falta el dato «${field}» para #${templateId}`);
  return data[field];
}

// «href:url title:name» → [['href', 'url'], ['title', 'name']]
const pairs = (text) => text.trim().split(' ').filter(Boolean).map((pair) => pair.split(':'));

function render(templateId, data) {
  const template = document.getElementById(templateId);
  if (!(template instanceof HTMLTemplateElement)) throw new TemplateDataError(`No hay ninguna plantilla #${templateId}`);
  const copy = template.content.cloneNode(true);
  const read = (field) => valueOf(data, field, templateId);

  for (const element of copy.querySelectorAll('[data-text]')) {
    element.textContent = read(element.dataset.text);
    element.removeAttribute('data-text');
  }
  for (const element of copy.querySelectorAll('[data-attr]')) {
    for (const [attribute, field] of pairs(element.dataset.attr)) element.setAttribute(attribute, read(field));
    element.removeAttribute('data-attr');
  }
  for (const element of copy.querySelectorAll('[data-class]')) {
    for (const [className, field] of pairs(element.dataset.class)) element.classList.toggle(className, Boolean(read(field)));
    element.removeAttribute('data-class');
  }
  for (const element of copy.querySelectorAll('[data-show]')) {
    element.hidden = !read(element.dataset.show);
    element.removeAttribute('data-show');
  }
  for (const element of copy.querySelectorAll('[data-list]')) {
    const items = read(element.dataset.list);
    element.append(...items.map((item) => render(element.dataset.template, item))); // composición
    element.removeAttribute('data-list');
    element.removeAttribute('data-template');
  }
  return copy;
}

// ── Los datos de la tienda y su «vista» para la plantilla ───────────────
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const products = [
  { slug: 'cafe-de-chiapas', name: 'Café de Chiapas 500 g', price: 210, stock: 12, tags: ['tueste medio', 'chocolate'] },
  { slug: 'cafe-de-veracruz', name: 'Café de Veracruz <edición limitada>', price: 185, stock: 0, tags: ['tueste claro'] },
  { slug: 'molinillo-manual', name: 'Molinillo manual', price: 549, stock: 4, tags: ['acero', 'muelas cónicas', 'plegable'] },
];
const toCard = (product) => ({
  name: product.name,
  url: `/tienda/${product.slug}`,
  price: money.format(product.price),
  soldOut: product.stock === 0,
  tags: product.tags.map((label) => ({ label, hint: `Ver más productos con «${label}»` })),
});

const showcase = document.querySelector('#showcase');
showcase.replaceChildren(...products.map((product) => render('product-card', toCard(product))));

// ── Comprobaciones al cargar ────────────────────────────────────────────
function audit(label, actual, expected) {
  if (actual === expected) console.log('✅', label, '→', actual);
  else console.error('❌', label, '→', actual, '(esperaba', expected, ')');
}
const cards = [...showcase.querySelectorAll('.product')];
audit('tarjetas', cards.length, 3);
audit('enlaces', cards.map((card) => card.querySelector('a').getAttribute('href')).join(' '), '/tienda/cafe-de-chiapas /tienda/cafe-de-veracruz /tienda/molinillo-manual');
audit('etiquetas por tarjeta', cards.map((card) => card.querySelectorAll('.tag').length).join(' '), '2 1 3');
audit('«Agotado» visible solo en Veracruz', cards.map((card) => !card.querySelector('.badge').hidden).join(' '), 'false true false');
audit('clase sold-out', cards.map((card) => card.classList.contains('sold-out')).join(' '), 'false true false');
audit('el nombre con < > es texto', cards[1].querySelector('a').textContent === 'Café de Veracruz <edición limitada>' && showcase.querySelector('edición') === null, true);
audit('no quedan atributos de enlace', showcase.querySelectorAll('[data-text], [data-attr], [data-class], [data-show], [data-list]').length, 0);
audit('title de una etiqueta', cards[0].querySelector('.tag').title, 'Ver más productos con «tueste medio»');
try {
  render('product-card', { name: 'Taza de talavera', url: '/tienda/taza' });
  audit('un dato que falta lanza un error', 'no lanzó nada', 'TemplateDataError');
} catch (error) {
  audit('un dato que falta lanza un error', `${error.name}: ${error.message}`, 'TemplateDataError: Falta el dato «price» para #product-card');
}
audit('la plantilla sigue intacta', document.querySelector('#product-card').content.querySelectorAll('[data-text]').length, 2);
```
