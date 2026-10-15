---
example_description: "Una tienda de una sola página con enlaces profundos por query (?vista=cafe&sku=…): datos de assets/coffees.json con estado de carga, router con delegación, pushState/popstate, migas de pan, vistas 404, título del documento, foco en el encabezado nuevo y desplazamiento arriba; cada vista se puede recargar y compartir"
example_tags: "javascript|router|spa|pushstate|popstate|urlsearchparams|fetch|accesibilidad|profesional"
example_stage: professional
example_importance: critical
console: true
---

# HTML

```html
<div class="store">
  <header class="bar">
    <a class="brand" href="?vista=inicio">☕ Cafés de México</a>
    <button id="back" type="button">← Atrás</button>
  </header>
  <nav id="crumbs" class="crumbs" aria-label="Migas de pan"></nav>
  <main>
    <h1 id="view-title" tabindex="-1">Cargando…</h1>
    <div id="view-body" aria-busy="true"></div>
  </main>
  <p class="share"><label for="share-link">Enlace a esta vista</label> <input id="share-link" readonly></p>
  <ol id="log" class="log" aria-live="polite"></ol>
</div>
```

# CSS

```css
:root { --ink: #1f2933; --muted: #52606d; --line: #cbd2d9; --surface: #ffffff; --page: #f5f7fa; --accent: #1d4ed8; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.45; color: var(--ink); background: var(--page); }
.store { max-width: 34rem; margin: 0 auto; padding: 1rem; }
.bar { display: flex; justify-content: space-between; align-items: center; }
.brand { font-weight: 700; color: var(--ink); text-decoration: none; }
a { color: var(--accent); }
.crumbs { margin: 0.5rem 0 0; font-size: 0.85rem; color: var(--muted); }
h1 { font-size: 1.25rem; margin: 0.5rem 0; }
h1:focus { outline: none; }
h1:focus-visible { outline: 3px solid var(--accent); }
.cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr)); gap: 0.5rem; margin: 0; padding: 0; list-style: none; }
.cards li { padding: 0.5rem 0.6rem; border: 1px solid var(--line); border-radius: 0.6rem; background: var(--surface); }
.muted { color: var(--muted); font-size: 0.85rem; }
button, input { font: inherit; padding: 0.3rem 0.6rem; border: 1px solid #7b8794; border-radius: 0.5rem; background: var(--surface); color: var(--ink); }
button { cursor: pointer; }
button:disabled { color: #616e7c; cursor: not-allowed; }
:is(a, button, input):focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
.share { display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center; font-size: 0.85rem; }
.share input { flex: 1 1 14rem; font-size: 0.8rem; }
.log { margin: 0.75rem 0 0; padding: 0.5rem 0.5rem 0.5rem 2rem; border: 1px solid var(--line); border-radius: 0.5rem; background: var(--surface); font-family: Menlo, Consolas, monospace; font-size: 0.75rem; }
```

# JavaScript

```javascript
// Tienda de una sola página con enlaces profundos.
//
// Decisiones de diseño:
// - Rutas en la query (?vista=…): el servidor de LearnWeb solo sirve archivos
//   y una ruta con barra daría 404 al recargar (lección «URL e historial»).
// - Enlaces de verdad + un listener delegado: Cmd/Ctrl + clic abre otra
//   pestaña, copiar el enlace funciona y sin JavaScript serían navegables.
// - Las vistas son funciones puras de (parámetros, catálogo) → { título,
//   migas, contenido }; todo se construye con textContent, porque la URL la
//   puede escribir cualquiera. La tabla de rutas se consulta con Object.hasOwn.
// - Al navegar: pushState, pintar, document.title, desplazamiento arriba y el
//   foco en el h1 (tabindex="-1"): un lector de pantalla anuncia la vista
//   nueva como si fuera una página nueva. Al cargar, el foco no se mueve.
// - «← Atrás» guarda la profundidad en history.state y se desactiva en la
//   primera entrada, para no salir de la vista previa.
//
// Alcance: HTML, CSS, el capítulo de JavaScript, el DOM, los eventos y este módulo.

const titleElement = document.querySelector('#view-title');
const bodyElement = document.querySelector('#view-body');
const backButton = document.querySelector('#back');
const logList = document.querySelector('#log');
let catalog = [];
let historyWorks = true;
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
const cardList = (coffees) => {
  const list = Object.assign(document.createElement('ul'), { className: 'cards' });
  list.append(...coffees.map((coffee) => {
    const item = document.createElement('li');
    item.append(link(`?vista=cafe&sku=${coffee.sku}`, coffee.name),
      Object.assign(document.createElement('p'), { className: 'muted', textContent: `${coffee.origin} · $${coffee.price}` }));
    return item;
  }));
  return list;
};
const origins = () => [...new Set(catalog.map((coffee) => coffee.origin))].sort((a, b) => a.localeCompare(b, 'es'));

const notFound = (what) => ({
  title: `${what} no encontrado`,
  crumbs: [['?vista=inicio', 'Inicio']],
  body: [paragraph('Puede que el enlace sea antiguo. ', link('?vista=cafes', 'Ver todos los cafés'))],
});
const routes = {
  inicio: () => ({
    title: 'Cafés de México',
    crumbs: [],
    body: [paragraph('Elige un estado: '), paragraph(...origins().flatMap((origin, index) => [index ? ' · ' : '', link(`?vista=cafes&origen=${encodeURIComponent(origin)}`, origin)])),
      paragraph(link('?vista=cafes', 'Todos los cafés'), ' · ', link('?vista=cafe&sku=CAF-TAB-250', 'Café de Tabasco (ya no lo vendemos)'))],
  }),
  cafes: (params) => {
    const origin = params.get('origen');
    const list = origin ? catalog.filter((coffee) => coffee.origin === origin) : catalog;
    if (origin && list.length === 0) return notFound(`Estado «${origin}»`);
    return { title: origin ? `Cafés de ${origin}` : 'Todos los cafés', crumbs: [['?vista=inicio', 'Inicio']], body: [cardList(list)] };
  },
  cafe: (params) => {
    const coffee = catalog.find((item) => item.sku === params.get('sku'));
    if (!coffee) return notFound('Café');
    return {
      title: coffee.name,
      crumbs: [['?vista=inicio', 'Inicio'], ['?vista=cafes', 'Cafés'], [`?vista=cafes&origen=${encodeURIComponent(coffee.origin)}`, coffee.origin]],
      body: [paragraph(`Tueste ${coffee.roast} · ${coffee.grams} g · $${coffee.price} MXN`),
        paragraph(coffee.stock > 0 ? `Quedan ${coffee.stock} en el tostador.` : 'Agotado por ahora.')],
    };
  },
};

function render(url, { focus = true } = {}) {
  const viewName = url.searchParams.get('vista') ?? 'inicio';
  const view = Object.hasOwn(routes, viewName) ? routes[viewName](url.searchParams) : notFound('Página');
  titleElement.textContent = view.title;
  bodyElement.replaceChildren(...view.body);
  bodyElement.setAttribute('aria-busy', 'false');
  document.querySelector('#crumbs').replaceChildren(...view.crumbs.flatMap(([href, text]) => [link(href, text), ' › ']), view.title);
  document.title = `${view.title} · Cafés de México`;
  document.querySelector('#share-link').value = historyWorks ? location.href : '(en esta tarjeta no hay dirección propia)';
  backButton.disabled = (history.state?.depth ?? 0) === 0;
  if (focus) {
    window.scrollTo(0, 0);
    titleElement.focus();
  }
  logLine(`🧭 ${url.search || '(sin query)'} → «${view.title}»`);
}

function navigate(url) {
  if (historyWorks) {
    try {
      history.pushState({ depth: (history.state?.depth ?? 0) + 1 }, '', url);
    } catch (error) {
      historyWorks = false;
      logLine(`⚠️ ${error.name}: en esta tarjeta se navega sin cambiar la dirección; ábrela con ▶ o en el editor`);
    }
  }
  render(url);
}

document.addEventListener('click', (event) => {
  const anchor = event.target.closest('a[href^="?"]');
  if (!anchor || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  navigate(new URL(anchor.href));
});
window.addEventListener('popstate', () => render(new URL(location.href)));
backButton.addEventListener('click', () => history.back());

async function start() {
  try {
    const response = await fetch('coffees.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    catalog = await response.json();
    logLine(`📦 ${catalog.length} cafés cargados`);
  } catch (error) {
    titleElement.textContent = 'No se pudo cargar la tienda';
    bodyElement.replaceChildren(paragraph(`Inténtalo de nuevo más tarde (${error.message}).`));
    return;
  }
  try {
    if (history.state === null) history.replaceState({ depth: 0 }, '');
  } catch (error) {
    historyWorks = false;
    logLine(`⚠️ ${error.name}: en esta tarjeta se navega sin cambiar la dirección; ábrela con ▶ o en el editor`);
  }
  render(new URL(location.href), { focus: false });
  logLine('Listo: pulsa «Oaxaca», «Pluma Hidalgo» y la miga «Cafés»; prueba el café de Tabasco y «← Atrás»');
}
start();
```
