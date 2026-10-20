---
example_description: "La sección actual de una receta larga sin medir en cada scroll: un rootMargin negativo convierte la raíz en una franja en la parte alta del panel, y la sección que la toca se marca en el índice con aria-current"
example_tags: "javascript|intersectionobserver|rootmargin|scrollspy|aria-current|indice"
example_stage: intermediate
example_importance: important
console: true
---

# HTML

```html
<main>
  <h1>Mole poblano</h1>
  <nav aria-label="Índice de la receta">
    <ol id="toc" class="toc">
      <li><a href="#ingredientes">Ingredientes</a></li>
      <li><a href="#chiles">Chiles</a></li>
      <li><a href="#salsa">Salsa</a></li>
      <li><a href="#coccion">Cocción</a></li>
      <li><a href="#servir">Servir</a></li>
    </ol>
  </nav>
  <div id="recipe" class="panel" tabindex="0" role="region" aria-label="Receta">
    <section id="ingredientes"><h2>Ingredientes</h2><p>Chiles mulato, ancho, pasilla y chipotle; jitomate, cebolla, ajo, ajonjolí, almendras, cacahuates, pasas, plátano macho, tortilla dura, pan, canela, clavo, pimienta y una tablilla de chocolate de metate.</p></section>
    <section id="chiles"><h2>Chiles</h2><p>Desvénalos, quítales las semillas y ásalos en el comal sin que se quemen: un chile quemado amarga todo el mole. Remójalos en agua caliente veinte minutos.</p></section>
    <section id="salsa"><h2>Salsa</h2><p>Fríe por separado las semillas, el pan, la tortilla y el plátano. Muele todo con los chiles y un poco del agua del remojo hasta tener una pasta lisa.</p></section>
    <section id="coccion"><h2>Cocción</h2><p>Fríe la pasta en manteca, a fuego medio, removiendo sin parar. Añade caldo de guajolote poco a poco y el chocolate. Deja que espese una hora.</p></section>
    <section id="servir"><h2>Servir</h2><p>Sirve sobre piezas de guajolote, con ajonjolí tostado por encima, arroz rojo y tortillas recién hechas.</p></section>
  </div>
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
  max-width: 32rem;
  margin: 0 auto;
  padding: 1rem;
}
h1 {
  font-size: 1.2rem;
  margin: 0 0 0.5rem;
}
.toc {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  margin: 0 0 0.5rem;
  padding: 0;
  list-style: none;
}
.toc a {
  color: #1d4ed8;
}
/* El índice marca la sección actual con el mismo atributo que leen los
   lectores de pantalla: no pueden separarse. */
.toc a[aria-current] {
  color: #1f2933;
  font-weight: 700;
  text-decoration-thickness: 3px;
}
.toc a:focus-visible,
.panel:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
.panel {
  height: 16rem;
  overflow-y: auto;
  border: 1px solid #7b8794;
  border-radius: 0.5rem;
  background: #ffffff;
}
.panel section {
  padding: 0.25rem 1rem 0.5rem;
  border-bottom: 1px solid #e4e7eb;
}
/* El último apartado mide lo que el panel: así puede llegar arriba, a la
   franja, aunque su texto sea corto. */
.panel section:last-child {
  min-height: 16rem;
  box-sizing: border-box;
  border-bottom: 0;
}
.panel h2 {
  font-size: 1rem;
  margin: 0.5rem 0 0.25rem;
}
.panel p {
  margin: 0;
  line-height: 1.5;
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
const panel = document.querySelector('#recipe');
const sections = [...panel.querySelectorAll('section')];
const tocLinks = new Map([...document.querySelectorAll('#toc a')].map((link) => [link.hash.slice(1), link]));
const logList = document.querySelector('#log');
function logLine(text) {
  console.log(text);
  const entry = document.createElement('li');
  entry.textContent = text;
  logList.append(entry);
}

const touching = new Set(); // secciones que tocan la franja ahora mismo
let currentId = null;

const observer = new IntersectionObserver((entries) => {
  for (const entry of entries) {
    if (entry.isIntersecting) touching.add(entry.target.id);
    else touching.delete(entry.target.id);
  }
  // Si dos tocan la franja (el final de una y el principio de la siguiente),
  // manda la ÚLTIMA en el orden del documento: es la que acaba de llegar.
  const current = sections.findLast((section) => touching.has(section.id));
  if (!current || current.id === currentId) return; // nada cambia: no escribas
  currentId = current.id;
  for (const [id, link] of tocLinks) {
    if (id === currentId) link.setAttribute('aria-current', 'true');
    else link.removeAttribute('aria-current');
  }
  logLine(`📍 sección actual → ${current.querySelector('h2').textContent}`);
}, {
  root: panel,
  // -75 % por abajo: la raíz se queda en una franja con el 25 % de arriba
  // del panel (64 px). Una sección es «la actual» cuando pasa por ahí.
  rootMargin: '0px 0px -75% 0px',
});

for (const section of sections) observer.observe(section);
logLine('Listo: desplaza la receta o usa el índice');

// Los enlaces del índice son anclas normales: el salto no necesita JS.
// Compáralo con «Sección actual» del módulo «El DOM», que medía todos los
// títulos con getBoundingClientRect en cada evento de scroll.
```
