---
example_description: "Un router mínimo de una tienda con rutas en la query (?vista=producto&sku=…): delegación sobre los enlaces, pushState y pintar, popstate para atrás/adelante, vista 404, título del documento, foco en el encabezado de la vista nueva y un «← Atrás» que no sale de la página"
example_tags: "javascript|router|spa|history|pushstate|popstate|urlsearchparams|accesibilidad"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<div class="shop">
  <header>
    <nav id="menu" aria-label="Tienda">
      <a href="?vista=catalogo">Catálogo</a>
      <a href="?vista=carrito">Carrito</a>
      <a href="?vista=ofertas">Ofertas</a>
    </nav>
    <button id="back" type="button">← Atrás</button>
  </header>
  <main>
    <h1 id="view-title" tabindex="-1">Catálogo</h1>
    <div id="view-body"></div>
  </main>
  <ol id="log" class="log" aria-live="polite"></ol>
</div>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
.shop {
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
header {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}
nav {
  display: flex;
  gap: 1rem;
}
a {
  color: #1d4ed8;
}
h1 {
  font-size: 1.2rem;
}
h1:focus {
  outline: none;
}
h1:focus-visible {
  outline: 3px solid #1d4ed8;
}
button {
  font: inherit;
  padding: 0.4rem 0.8rem;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
button:disabled {
  color: #616e7c;
  cursor: not-allowed;
}
a:focus-visible,
button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
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
const PRODUCTS = {
  'CAF-500': { title: 'Café de Chiapas · 500 g', price: 210 },
  'CAC-250': { title: 'Cacao de Tabasco · 250 g', price: 145 },
};
const cart = ['CAF-500'];
const backButton = document.querySelector('#back');
const viewTitle = document.querySelector('#view-title');
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  logList.append(Object.assign(document.createElement('li'), { textContent: text }));
}
const link = (href, text) => Object.assign(document.createElement('a'), { href, textContent: text });
const paragraph = (...children) => {
  const element = document.createElement('p');
  element.append(...children);
  return element;
};

// Cada vista recibe los parámetros y devuelve su título y su contenido.
// Todo con textContent: el sku viene de la URL, y la URL la escribe cualquiera.
const routes = {
  catalogo: () => ({
    title: 'Catálogo',
    body: Object.entries(PRODUCTS).map(([sku, product]) => paragraph(link(`?vista=producto&sku=${sku}`, product.title))),
  }),
  producto: (params) => {
    const sku = params.get('sku');
    if (!Object.hasOwn(PRODUCTS, sku)) return notFound(`el producto «${sku}»`);
    const product = PRODUCTS[sku];
    return { title: product.title, body: [paragraph(`$${product.price} MXN`), paragraph(link('?vista=carrito', 'Ir al carrito'))] };
  },
  carrito: () => ({
    title: 'Carrito',
    body: [paragraph(`${cart.length} producto(s): ${cart.map((sku) => PRODUCTS[sku].title).join(', ')}`)],
  }),
};
function notFound(what) {
  return { title: 'Página no encontrada', body: [paragraph(`No encontramos ${what}. `, link('?vista=catalogo', 'Volver al catálogo'))] };
}

function render(url, { focus = true } = {}) {
  const viewName = url.searchParams.get('vista') ?? 'catalogo';
  // Object.hasOwn: con routes[viewName] a secas, ?vista=toString encontraría
  // un método heredado de Object.prototype.
  const view = Object.hasOwn(routes, viewName) ? routes[viewName](url.searchParams) : notFound(`la vista «${viewName}»`);
  viewTitle.textContent = view.title;
  document.querySelector('#view-body').replaceChildren(...view.body);
  document.title = `${view.title} · Tienda de la sierra`;
  backButton.disabled = (history.state?.depth ?? 0) === 0;
  if (focus) viewTitle.focus(); // el lector de pantalla anuncia la vista nueva
  logLine(`🧭 ${url.search || '(sin query)'} → «${view.title}»`);
}

function navigate(url) {
  try {
    history.pushState({ depth: (history.state?.depth ?? 0) + 1 }, '', url);
  } catch (error) {
    logLine(`⚠️ ${error.name}: en esta tarjeta (iframe aislado) la dirección no cambia; ábrela con ▶ o en el editor`);
  }
  render(url);
}

// Un solo listener para todos los enlaces internos, también los que pintan las vistas.
document.addEventListener('click', (event) => {
  const anchor = event.target.closest('a[href^="?"]');
  if (!anchor || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigate(new URL(anchor.href));
});
window.addEventListener('popstate', () => render(new URL(location.href)));
backButton.addEventListener('click', () => history.back());

try {
  history.replaceState({ depth: 0 }, '', location.href);
} catch {
  // tarjeta aislada: se navega igual, pero sin historial
}
render(new URL(location.href), { focus: false }); // al cargar, el foco no se mueve
logLine('Listo: pulsa «Café de Chiapas», «Ir al carrito» y «Ofertas»; luego «← Atrás»');
```
