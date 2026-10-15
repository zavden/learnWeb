---
example_description: "Ejercicio: una página hecha solo con div que hay que convertir en HTML semántico sin cambiar su aspecto"
example_tags: "ejercicio|semantica|landmarks|titulos|listas|time"
example_stage: exercise
example_importance: critical
exercise: true
exercise_title: "De la sopa de div al HTML semántico"
exercise_instructions: "Convierte la cabecera en un header y el menú en un nav con sus enlaces dentro de una lista ul || Envuelve el contenido en un main y el artículo en un article || Usa h1 para el título, h2 para los dos apartados y p para los párrafos || Marca la fecha con un time y su datetime || Convierte la barra lateral en un aside con un título h2 y una lista de enlaces || Convierte el pie en un footer || Comprueba que no queda ningún div y que la consola sale toda ✅"
exercise_hints: "Conserva las clases: el CSS (bloqueado) las usa, así que la página se verá igual || Los <br> entre enlaces sobran en cuanto los metes en una lista || El datetime de una fecha se escribe año-mes-día: 2026-03-12 || La fecha puede ir dentro de un párrafo: <p class=\"date\">Publicado el <time …>…</time></p>"
exercise_solution_example: 09-ej-de-divs-a-html-semantico-solucion.md
exercise_locked_files: styles.css,script.js
console: true
---

# HTML

```html
<!-- TODO: cambia cada div (y cada span) por el elemento que le corresponde.
     Conserva las clases: el CSS las usa, así que el aspecto no cambiará. -->

<!-- TODO 1: la cabecera de la página, con un menú de navegación (sus enlaces, en una lista) -->
<div class="header">
  <div class="brand">Cuaderno de huerta</div>
  <div class="nav">
    <a href="https://cuadernodehuerta.example/">Inicio</a><br>
    <a href="https://cuadernodehuerta.example/calendario/">Calendario de siembra</a><br>
    <a href="https://cuadernodehuerta.example/sobre-mi/">Sobre mí</a>
  </div>
</div>

<!-- TODO 2: el contenido principal, y dentro un artículo autónomo -->
<div class="main">
  <div class="article">
    <!-- TODO 3: el título del artículo, la fecha (con su datetime) y los párrafos -->
    <div class="title">Cómo hacer compost en un balcón</div>
    <div class="date">Publicado el <span>12 de marzo de 2026</span></div>
    <div class="text">Con un cubo con tapa, unos agujeros y un poco de paciencia, los restos de la cocina se convierten en abono en unos tres meses.</div>

    <!-- TODO 4: dos apartados del artículo -->
    <div class="subtitle">Qué puedes echar</div>
    <div class="text">Restos de fruta y verdura, posos de café, cáscaras de huevo y hojas secas.</div>
    <div class="subtitle">Qué no debes echar</div>
    <div class="text">Carne, pescado y lácteos: huelen mal y atraen a los bichos.</div>
  </div>
</div>

<!-- TODO 5: contenido relacionado pero secundario: su título y una lista de enlaces -->
<div class="sidebar">
  <div class="sidebar-title">Te puede interesar</div>
  <a href="https://cuadernodehuerta.example/lombricario/">Un lombricario casero</a><br>
  <a href="https://cuadernodehuerta.example/abonos-verdes/">Abonos verdes para el invierno</a>
</div>

<!-- TODO 6: el pie de la página -->
<div class="footer">© 2026 Cuaderno de huerta · <a href="mailto:hola@cuadernodehuerta.example">Escríbeme</a></div>
```

# CSS

```css
/* Estilos por clase: funcionan igual sobre un div que sobre un header, un h1 o un p.
   (Bloqueado: no hace falta tocarlo.) */
body {
  max-width: 40rem;
  margin: 0 auto;
  padding: 0 1rem;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: #1f2937;
}

.header {
  padding: 0.75rem 0;
  border-bottom: 1px solid #d1d5db;
}

.brand {
  margin: 0;
  font-weight: 700;
}

/* Preparado para cuando el menú sea una lista: sin viñetas y en fila (flex: capítulo de CSS) */
.nav ul {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem 1rem;
  margin: 0.25rem 0 0;
  padding: 0;
  list-style: none;
}

.title {
  margin: 1.5rem 0 0.25rem;
  font-size: 1.6rem;
  font-weight: 700;
}

.date {
  margin: 0;
  color: #4b5563;
}

.subtitle {
  margin: 1.25rem 0 0.25rem;
  font-size: 1.2rem;
  font-weight: 700;
}

.text {
  margin: 0.5rem 0;
}

.sidebar {
  margin-top: 2rem;
  padding: 0.5rem 1rem;
  background: #f1f5f9;
}

.sidebar-title {
  margin: 0.25rem 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.footer {
  margin-top: 2rem;
  padding: 0.75rem 0;
  border-top: 1px solid #d1d5db;
}
```

# JavaScript

```javascript
// Comprobaciones automáticas (bloqueadas: no hace falta tocarlas). Cada una escribe ✅ o ❌.
// Adelanto: JavaScript se explica en su capítulo.
const ofPage = (element) => element !== null && element.parentElement.closest('article, aside, main, nav, section') === null;
const article = document.querySelector('main article');

const checks = [
  ['la cabecera es un header de la página', [...document.querySelectorAll('header')].some(ofPage)],
  ['el menú es un nav con sus enlaces en una lista', document.querySelectorAll('nav ul > li > a').length === 3],
  ['hay un único main', document.querySelectorAll('main').length === 1],
  ['el artículo es un article dentro del main', article !== null],
  ['el título es el único h1 y está en el artículo', document.querySelectorAll('h1').length === 1 && article?.querySelector('h1') != null],
  ['los dos apartados son h2', article?.querySelectorAll('h2').length === 2],
  ['los párrafos son p', (article?.querySelectorAll('p').length ?? 0) >= 3],
  ['la fecha es un time con datetime="2026-03-12"', article?.querySelector('time')?.getAttribute('datetime') === '2026-03-12'],
  ['la barra lateral es un aside con un h2 y una lista', document.querySelector('aside h2') !== null && document.querySelectorAll('aside li a').length === 2],
  ['el pie es un footer de la página', [...document.querySelectorAll('footer')].some(ofPage)],
  ['no queda ningún div ni span', document.querySelectorAll('div, span').length === 0],
];
for (const [label, ok] of checks) console.log(ok ? '✅' : '❌', label);
```
