---
example_description: "Una guía larga con una barra fija que muestra dónde estás (migas: título › sección › apartado) y un índice que marca la sección actual con aria-current: en cada scroll se miden todos los títulos con getBoundingClientRect y solo se escribe en el DOM si la sección ha cambiado"
example_tags: "javascript|dom|profesional|scroll|getboundingclientrect|migas|aria-current|sticky"
example_stage: professional
example_importance: important
console: true
---

# HTML

```html
<header class="topbar" id="topbar">
  <nav aria-label="Estás aquí">
    <ol class="crumbs" id="crumbs"></ol>
  </nav>
  <button type="button" id="to-top">↑ Arriba</button>
</header>
<main class="guide">
  <h1 id="guide-title">Café de olla</h1>
  <nav class="toc" aria-labelledby="toc-title">
    <h2 id="toc-title">Contenido</h2>
    <ol id="toc">
      <li><a href="#ingredientes">Ingredientes</a></li>
      <li><a href="#preparacion">Preparación</a>
        <ol>
          <li><a href="#el-piloncillo">El piloncillo</a></li>
          <li><a href="#la-canela">La canela y el clavo</a></li>
        </ol>
      </li>
      <li><a href="#variantes">Variantes del año</a></li>
    </ol>
  </nav>
  <section>
    <h2 id="ingredientes">Ingredientes</h2>
    <p>Un litro de agua, cuatro cucharadas de café molido grueso, 100 g de piloncillo, una raja de canela y dos clavos.</p>
  </section>
  <section>
    <h2 id="preparacion">Preparación</h2>
    <p>Todo se hace en la misma olla de barro, a fuego medio.</p>
    <h3 id="el-piloncillo">El piloncillo</h3>
    <p>Disuélvelo en el agua antes de añadir nada más; si hierve demasiado, amarga.</p>
    <h3 id="la-canela">La canela y el clavo</h3>
    <p>Diez minutos de hervor suave con la olla tapada. Después, fuera del fuego, el café.</p>
  </section>
  <section>
    <h2 id="variantes">Variantes del año</h2>
    <p>En diciembre se añade cáscara de naranja; en Día de Muertos, un trozo de chocolate de mesa.</p>
  </section>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: #1e293b;
}
.topbar {
  position: sticky;
  top: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem 1rem;
  background: #ffffff;
  border-bottom: 1px solid #cbd5e1;
}
.crumbs {
  display: flex;
  flex-wrap: wrap;
  margin: 0;
  padding: 0;
  list-style: none;
}
.crumbs li + li::before {
  content: '›';
  padding: 0 0.4rem;
  color: #64748b;
}
.crumbs [aria-current] {
  font-weight: bold;
}
button {
  font: inherit;
  padding: 0.2rem 0.6rem;
}
.guide {
  max-width: 40rem;
  padding: 0 1rem;
}
h2,
h3 {
  scroll-margin-top: 4rem; /* al saltar con un enlace, la barra fija no tapa el título */
}
section {
  min-height: 60vh;
}
section:last-of-type {
  min-height: 100vh; /* para que el último título también pueda llegar arriba */
}
.toc a {
  color: #1d4ed8;
}
.toc a[aria-current="true"] {
  font-weight: bold;
  color: #1e293b;
  background: #fef3c7;
}
:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// ¿EN QUÉ SECCIÓN ESTOY?
//
// Decisiones:
// - La sección actual es el último título (h2 o h3) que ya ha pasado por
//   debajo de la barra fija. Se calcula con getBoundingClientRect, relativo a
//   la ventana (lección «Medidas y layout»).
// - updateCurrent() lee TODO primero (el alto de la barra y la posición de
//   cada título) y solo escribe si la sección actual ha cambiado: en un scroll
//   normal, la mayoría de las llamadas no tocan el DOM.
// - Las migas se reconstruyen con createElement; la última lleva
//   aria-current="location" y el enlace del índice, aria-current="true".
// - Los enlaces del índice son anclas normales: el salto no necesita JS, y
//   scroll-margin-top evita que la barra tape el título.
// - En el módulo «APIs del navegador», IntersectionObserver hará lo mismo sin
//   medir en cada evento de scroll.
//
// Alcance: HTML, CSS (módulos 1-7), el capítulo de JavaScript y el módulo «El DOM».

const topbar = document.querySelector('#topbar');
const crumbs = document.querySelector('#crumbs');
const headings = [...document.querySelectorAll('.guide section h2, .guide section h3')];
const tocLinks = new Map([...document.querySelectorAll('#toc a')].map((link) => [link.getAttribute('href').slice(1), link]));
const pageTitle = document.querySelector('#guide-title').textContent;
let currentId = undefined; // undefined = todavía sin calcular; null = ninguna sección

// El rastro de un título: su h2 y, si es un h3, él mismo.
function trailOf(heading) {
  if (heading === null) return [];
  if (heading.localName === 'h2') return [heading];
  const index = headings.indexOf(heading);
  const parent = headings.slice(0, index).findLast((candidate) => candidate.localName === 'h2');
  return [parent, heading];
}

function renderCrumbs(heading) {
  const names = [pageTitle, ...trailOf(heading).map((item) => item.textContent)];
  crumbs.replaceChildren(...names.map((name, index) => {
    const item = document.createElement('li');
    item.textContent = name;
    if (index === names.length - 1) item.setAttribute('aria-current', 'location');
    return item;
  }));
}

function updateCurrent() {
  // Lecturas
  const line = topbar.getBoundingClientRect().bottom + 8;
  const passed = headings.filter((heading) => heading.getBoundingClientRect().top <= line);
  const current = passed.at(-1) ?? null;
  const id = current?.id ?? null;
  if (id === currentId) return current; // nada cambió: ninguna escritura
  // Escrituras
  currentId = id;
  renderCrumbs(current);
  for (const [linkId, link] of tocLinks) {
    if (linkId === id) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  }
  return current;
}

// Coloca un título justo debajo de la barra (sin animación, para comprobarlo).
function scrollToHeading(id) {
  const heading = document.getElementById(id);
  window.scrollTo(0, heading.getBoundingClientRect().top + window.scrollY - topbar.offsetHeight);
}

// Eventos (módulo siguiente): el scroll de la página y el botón.
window.addEventListener('scroll', updateCurrent);
document.querySelector('#to-top').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Comprobaciones al cargar ────────────────────────────────────────────
function audit(label, actual, expected) {
  if (actual === expected) console.log('✅', label, '→', actual);
  else console.error('❌', label, '→', actual, '(esperaba', expected, ')');
}
const crumbText = () => [...crumbs.children].map((item) => item.textContent).join(' › ');

window.scrollTo(0, 0);
updateCurrent();
audit('arriba del todo: sin sección', crumbText(), 'Café de olla');
scrollToHeading('el-piloncillo');
updateCurrent();
audit('en «El piloncillo»', crumbText(), 'Café de olla › Preparación › El piloncillo');
audit('enlace marcado en el índice', document.querySelector('#toc [aria-current="true"]').textContent, 'El piloncillo');
scrollToHeading('variantes');
updateCurrent();
audit('en «Variantes del año»', crumbText(), 'Café de olla › Variantes del año');
audit('un solo aria-current en el índice', document.querySelectorAll('#toc [aria-current]').length, 1);
audit('la última miga es la ubicación', crumbs.lastElementChild.getAttribute('aria-current'), 'location');
window.scrollTo(0, 0);
updateCurrent();
```
