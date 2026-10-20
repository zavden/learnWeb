---
example_description: "Un mini renderizador HTML con plantillas etiquetadas: escapa cada valor según su contexto (texto, atributo, URL), atributos booleanos con ?disabled=${…}, prohíbe atributos de evento y URLs javascript:, anida plantillas y listas, y analiza cada plantilla una sola vez por sitio del código"
example_tags: "javascript|profesional|plantillas|tagged-templates|html|seguridad|xss|weakmap"
example_stage: professional
example_importance: critical
console: true
---

# JavaScript

```javascript
// MINI RENDERIZADOR HTML para el catálogo de una tienda (produce strings).
//
// Decisiones:
// - html`…` devuelve un Template, la marca de «HTML de confianza»: las
//   plantillas anidadas se insertan sin volver a escaparse.
// - Cada hueco se escapa según su CONTEXTO, que se deduce del trozo que lo precede:
//     texto            → & < > se convierten en entidades
//     attr="${…}"      → además " y '
//     href="${…}"      → además se valida la URL (javascript: se bloquea)
//     ?disabled=${…}   → atributo booleano (sintaxis de lit-html): aparece o no
//     onclick="${…}"   → prohibido: un dato nunca debe acabar siendo código
//     attr=${…}        → prohibido: un atributo sin comillas se rompe con un espacio
// - El análisis (qué contexto tiene cada hueco) se hace UNA vez por sitio del
//   código y se guarda en un WeakMap cuya clave es el array strings.
// - Arrays → se concatenan; null, undefined y false → nada (para cond && html`…`).
// - Simplificación: no entiende <script>, <style> ni comentarios. Para eso
//   están las librerías de verdad (lit-html) y, en el capítulo 6, el DOM.
//
// Alcance: módulos 1-6. Insertar el resultado en la página (innerHTML) llega en
// el capítulo 6; aquí se imprime el texto.

class Template {
  #markup;
  constructor(markup) {
    this.#markup = markup;
  }
  toString() {
    return this.#markup;
  }
}

const unsafeHtml = (trustedMarkup) => new Template(trustedMarkup); // solo para HTML PROPIO

const escapeText = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const escapeAttribute = (value) => escapeText(value).replaceAll('"', '&quot;').replaceAll("'", '&#39;');

const URL_ATTRIBUTES = new Set(['href', 'src', 'action', 'formaction']);
const SAFE_SCHEMES = new Set(['http', 'https', 'mailto', 'tel']);
const warnings = [];

function safeUrl(value) {
  // El navegador ignora tabuladores y saltos de línea dentro de una URL:
  // 'java\tscript:' sería javascript:. Se quitan antes de mirar el esquema.
  const clean = String(value).trim().replaceAll('\t', '').replaceAll('\n', '').replaceAll('\r', '');
  const colon = clean.indexOf(':');
  const slash = clean.indexOf('/');
  const hasScheme = colon !== -1 && (slash === -1 || colon < slash);
  if (hasScheme && !SAFE_SCHEMES.has(clean.slice(0, colon).toLowerCase())) {
    warnings.push(`URL bloqueada: ${clean}`);
    return '#url-bloqueada';
  }
  return clean;
}

// ── Análisis de una plantilla: el contexto de cada hueco ───────────────────
let parses = 0;
const parsedTemplates = new WeakMap();

function parse(strings) {
  parses += 1;
  const cleaned = [...strings];
  const holes = [];
  for (let i = 0; i < strings.length - 1; i++) {
    const before = cleaned[i];
    const lastSpace = Math.max(before.lastIndexOf(' '), before.lastIndexOf('\n'));
    const tail = before.slice(lastSpace + 1); // p. ej. 'href="' o '?disabled='
    if (tail.startsWith('?') && tail.endsWith('=')) {
      holes.push({ kind: 'boolean', name: tail.slice(1, -1) });
      cleaned[i] = before.slice(0, lastSpace); // el atributo lo escribe el hueco
    } else if (tail.endsWith('="') || tail.endsWith("='")) {
      const name = tail.slice(0, -2).toLowerCase();
      if (name.startsWith('on')) throw new TypeError(`Atributo de evento «${name}» con un valor: prohibido`);
      holes.push({ kind: URL_ATTRIBUTES.has(name) ? 'url' : 'attribute', name });
    } else if (tail.endsWith('=')) {
      throw new TypeError(`El atributo «${tail.slice(0, -1)}» necesita comillas: ${tail}"\${…}"`);
    } else {
      holes.push({ kind: 'text' });
    }
  }
  return { strings: cleaned, holes };
}

function renderText(value) {
  if (value instanceof Template) return String(value);
  if (Array.isArray(value)) return value.map(renderText).join('');
  if (value === null || value === undefined || value === false) return '';
  return escapeText(value);
}

function renderHole(hole, value) {
  switch (hole.kind) {
    case 'boolean': return value ? ` ${hole.name}` : '';
    case 'attribute': return escapeAttribute(value ?? '');
    case 'url': return escapeAttribute(safeUrl(value ?? ''));
    default: return renderText(value);
  }
}

function html(strings, ...values) {
  if (!parsedTemplates.has(strings)) parsedTemplates.set(strings, parse(strings));
  const { strings: parts, holes } = parsedTemplates.get(strings);
  let markup = parts[0];
  holes.forEach((hole, i) => {
    markup += renderHole(hole, values[i]) + parts[i + 1];
  });
  return new Template(markup);
}

// ── El catálogo (con datos que vienen de fuera) ────────────────────────────
const pesos = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const products = [
  { sku: 'CAF-500', name: 'Café de Chiapas', cents: 21000, stock: 12, url: '/productos/cafe-de-chiapas', badge: 'Nuevo' },
  { sku: 'MOL-250', name: 'Mole "de la abuela" <poblano>', cents: 16000, stock: 0, url: 'java\tscript:alert(document.cookie)' },
  { sku: 'CAC-070', name: "Chocolate d'Oaxaca", cents: 9500, stock: 3, url: 'https://cacao.example/oaxaca', badge: null },
];

function productCard(product) {
  const soldOut = product.stock === 0;
  return html`<article class="card" data-sku="${product.sku}">
    <h3><a href="${product.url}">${product.name}</a></h3>
    ${product.badge && html`<span class="badge">${product.badge}</span>`}
    <p class="price">${pesos.format(product.cents / 100)}</p>
    <button type="button" ?disabled=${soldOut}>${soldOut ? 'Agotado' : 'Añadir al carrito'}</button>
  </article>`;
}

function catalogPage(items) {
  return html`<section aria-labelledby="catalog-title">
  <h2 id="catalog-title">Catálogo (${items.length})</h2>
  ${items.map(productCard)}
  ${unsafeHtml('<p class="note">Precios con IVA incluido.</p>')}
</section>`;
}

console.log(String(catalogPage(products)));
console.log('avisos →', warnings);

// La caché por sitio del código: renderizar 3 veces más no vuelve a analizar.
const before = parses;
for (let i = 0; i < 3; i++) catalogPage(products);
console.log('análisis nuevos en 3 renderizados →', parses - before, '| plantillas analizadas →', parses, '(página, tarjeta y etiqueta)');

for (const [code, build] of Object.entries({
  'onclick="${…}"': () => html`<button onclick="${'comprar()'}">Comprar</button>`,
  'alt=${…} sin comillas': () => html`<img src="/logo.svg" alt=${'logo de la tienda'}>`,
})) {
  try {
    build();
  } catch (error) {
    console.warn(`⛔ ${code} → ${error.name}: ${error.message}`);
  }
}
```
