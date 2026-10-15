---
example_description: "Una barra de progreso de lectura fija arriba y un índice que marca las secciones ya leídas: en cada scroll se hacen primero todas las lecturas (scrollY, scrollHeight, getBoundingClientRect de cada sección) y después todas las escrituras (una variable CSS, aria-valuenow y classList)"
example_tags: "javascript|dom|integracion|scroll|getboundingclientrect|variables-css|aria|medidas"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<header class="reading-header">
  <div class="progress" role="progressbar" aria-label="Progreso de lectura" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">
    <div class="progress-bar"></div>
  </div>
  <nav aria-label="Secciones">
    <ol class="sections" id="section-links">
      <li><a href="#masa">Masa</a></li>
      <li><a href="#relleno">Relleno</a></li>
      <li><a href="#armado">Armado</a></li>
      <li><a href="#vapor">Vapor</a></li>
    </ol>
  </nav>
</header>
<main>
  <article>
    <h1>Tamales verdes, paso a paso</h1>
    <section class="chapter" id="masa"><h2>Masa</h2><p>Bate la manteca hasta que esponje y añade la masa de maíz poco a poco.</p></section>
    <section class="chapter" id="relleno"><h2>Relleno</h2><p>Deshebra el pollo y mézclalo con la salsa verde de tomatillo.</p></section>
    <section class="chapter" id="armado"><h2>Armado</h2><p>Unta la masa en la hoja de maíz, pon el relleno y dobla.</p></section>
    <section class="chapter" id="vapor"><h2>Vapor</h2><p>Una hora en la vaporera, con las hojas hacia arriba.</p></section>
  </article>
</main>
```

# CSS

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1e293b;
}
.reading-header {
  position: sticky;
  top: 0;
  background: #ffffff;
  border-bottom: 1px solid #cbd5e1;
}
.progress {
  height: 6px;
  background: #e2e8f0;
}
.progress-bar {
  width: var(--progress, 0%);
  height: 100%;
  background: #1d4ed8;
}
.sections {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  margin: 0;
  padding: 0.5rem 1rem;
  list-style: none;
}
.sections a {
  color: #1d4ed8;
}
.sections .is-read a::after {
  content: ' ✓';
}
main {
  padding: 0 1rem;
}
.chapter {
  min-height: 70vh; /* secciones largas, para que haya scroll */
  scroll-margin-top: 5rem; /* al saltar con un enlace, el encabezado fijo no tapa el título */
}
```

# JavaScript

```javascript
const progress = document.querySelector('.progress');
const chapters = [...document.querySelectorAll('.chapter')];
const links = new Map(chapters.map((chapter) =>
  [chapter, document.querySelector(`#section-links a[href="#${chapter.id}"]`).parentElement]));

function updateReading() {
  // 1. TODAS las lecturas (como mucho, un layout)…
  const scrolled = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const viewportBottom = window.innerHeight;
  const readChapters = chapters.filter((chapter) => chapter.getBoundingClientRect().bottom <= viewportBottom + 1);

  // 2. …y después TODAS las escrituras.
  const percent = maxScroll <= 0 ? 100 : Math.round((scrolled / maxScroll) * 100);
  progress.style.setProperty('--progress', `${percent}%`);
  progress.setAttribute('aria-valuenow', percent);
  for (const [chapter, item] of links) item.classList.toggle('is-read', readChapters.includes(chapter));
  return { percent, read: readChapters.length };
}

// Comprobaciones al cargar: arriba del todo y abajo del todo.
window.scrollTo(0, 0);
console.log('arriba → progreso:', updateReading().percent);
window.scrollTo(0, document.documentElement.scrollHeight); // se limita al máximo
const atBottom = updateReading();
console.log('abajo → progreso:', atBottom.percent, '| secciones leídas:', atBottom.read, 'de', chapters.length);
console.log("aria-valuenow →", progress.getAttribute('aria-valuenow'));
console.log('marcadas con ✓ →', document.querySelectorAll('#section-links .is-read').length);
window.scrollTo(0, 0);
const atTop = updateReading();
console.log('otra vez arriba → progreso:', atTop.percent, '| leídas:', atTop.read, '(varía con el alto de la vista previa)');

// Desplázate por la página (el evento scroll, en el módulo siguiente).
window.addEventListener('scroll', updateReading);
```
