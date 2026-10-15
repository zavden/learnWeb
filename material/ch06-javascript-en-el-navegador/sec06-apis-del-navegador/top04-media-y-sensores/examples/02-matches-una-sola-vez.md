---
example_description: "Leer matchMedia(...).matches una sola vez al cargar congela la decisión: si la vista previa cambia de ancho, el menú 🐛 sigue en modo compacto con su botón «Menú»; el ✅ escucha change y cambia de modo, también su aria-expanded"
example_tags: "javascript|matchmedia|change|responsive|menu|aria-expanded|bug"
example_stage: common-error
example_importance: important
console: true
---

# HTML

```html
<main>
  <nav id="nav-buggy" class="site-nav" aria-label="Menú 🐛">
    <p class="tag">🐛 decide al cargar</p>
    <button class="toggle" type="button" aria-expanded="false" aria-controls="links-buggy">☰ Menú</button>
    <ul id="links-buggy" class="links">
      <li><a href="/carta">Carta</a></li>
      <li><a href="/cafes-de-origen">Cafés de origen</a></li>
      <li><a href="/reservas">Reservas</a></li>
    </ul>
  </nav>
  <nav id="nav-fixed" class="site-nav" aria-label="Menú ✅">
    <p class="tag">✅ escucha change</p>
    <button class="toggle" type="button" aria-expanded="false" aria-controls="links-fixed">☰ Menú</button>
    <ul id="links-fixed" class="links">
      <li><a href="/carta">Carta</a></li>
      <li><a href="/cafes-de-origen">Cafés de origen</a></li>
      <li><a href="/reservas">Reservas</a></li>
    </ul>
  </nav>
  <ol id="log" class="log" aria-live="polite"></ol>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2933;
  background: #f5f7fa;
}
main {
  max-width: 40rem;
  margin: 0 auto;
  padding: 1rem;
}
.site-nav {
  margin-bottom: 0.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  background: #ffffff;
}
.tag {
  margin: 0 0 0.25rem;
  font-size: 0.8rem;
  color: #52606d;
}
.links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  margin: 0;
  padding: 0;
  list-style: none;
}
.links a {
  color: #1d4ed8;
}
/* Modo compacto: el botón se ve y la lista se apila (y se oculta con hidden). */
.site-nav:not([data-compact]) .toggle {
  display: none;
}
.site-nav[data-compact] .links {
  flex-direction: column;
  margin-top: 0.4rem;
}
.links[hidden] {
  display: none;
}
.toggle {
  font: inherit;
  padding: 0.25rem 0.6rem;
  border: 1px solid #7b8794;
  border-radius: 0.375rem;
  background: #ffffff;
  color: #1f2933;
  cursor: pointer;
}
.toggle:focus-visible,
.links a:focus-visible {
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
const NARROW = '(width < 36rem)'; // menos de 576 px
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

// Compacto: un botón abre y cierra la lista. Completo: la lista, siempre a la vista.
function setCompact(nav, compact) {
  const toggle = nav.querySelector('.toggle');
  const links = nav.querySelector('.links');
  nav.toggleAttribute('data-compact', compact);
  toggle.setAttribute('aria-expanded', 'false');
  links.hidden = compact; // en compacto, empieza cerrada
}
for (const nav of document.querySelectorAll('.site-nav')) {
  nav.querySelector('.toggle').addEventListener('click', (event) => {
    const open = event.currentTarget.getAttribute('aria-expanded') === 'true';
    event.currentTarget.setAttribute('aria-expanded', String(!open));
    nav.querySelector('.links').hidden = open;
  });
}

// 🐛 Una foto del momento de la carga: si después cambia el ancho, nadie se entera.
const startsNarrow = matchMedia(NARROW).matches;
setCompact(document.querySelector('#nav-buggy'), startsNarrow);
logLine(`🐛 al cargar → ${NARROW}: ${startsNarrow} · modo ${startsNarrow ? 'compacto' : 'completo'}, para siempre`);

// ✅ La lista viva y su evento change.
const narrow = matchMedia(NARROW);
const navFixed = document.querySelector('#nav-fixed');
setCompact(navFixed, narrow.matches);
logLine(`✅ al cargar → ${NARROW}: ${narrow.matches} · modo ${narrow.matches ? 'compacto' : 'completo'}`);
narrow.addEventListener('change', (event) => {
  setCompact(navFixed, event.matches);
  logLine(`✅ change → ${NARROW}: ${event.matches} · paso a modo ${event.matches ? 'compacto' : 'completo'}`);
});
logLine('Listo: cambia el ancho de la vista previa (cruza los 576 px) y mira los dos menús');

// Si solo cambiara el aspecto, bastaría el CSS (@media). Aquí cambia el
// comportamiento: el botón, aria-expanded y hidden.
```
