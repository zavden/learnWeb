---
example_description: "Solución: la misma página con header, nav, main, article, aside y footer, títulos, párrafos, listas y time"
example_tags: "solucion|semantica|landmarks|titulos|listas|time"
example_stage: final-solution
example_importance: critical
console: true
---

# HTML

```html
<!-- ✅ 1. header + nav con una lista de enlaces (los <br> ya no hacen falta) -->
<header class="header">
  <p class="brand">Cuaderno de huerta</p>
  <nav class="nav" aria-label="Principal">
    <ul>
      <li><a href="https://cuadernodehuerta.example/">Inicio</a></li>
      <li><a href="https://cuadernodehuerta.example/calendario/">Calendario de siembra</a></li>
      <li><a href="https://cuadernodehuerta.example/sobre-mi/">Sobre mí</a></li>
    </ul>
  </nav>
</header>

<!-- ✅ 2. main con un article dentro -->
<main class="main">
  <article class="article">
    <!-- ✅ 3. h1, la fecha con time y párrafos -->
    <h1 class="title">Cómo hacer compost en un balcón</h1>
    <p class="date">Publicado el <time datetime="2026-03-12">12 de marzo de 2026</time></p>
    <p class="text">Con un cubo con tapa, unos agujeros y un poco de paciencia, los restos de la cocina se convierten en abono en unos tres meses.</p>

    <!-- ✅ 4. los apartados son h2 (un nivel por debajo del h1) -->
    <h2 class="subtitle">Qué puedes echar</h2>
    <p class="text">Restos de fruta y verdura, posos de café, cáscaras de huevo y hojas secas.</p>
    <h2 class="subtitle">Qué no debes echar</h2>
    <p class="text">Carne, pescado y lácteos: huelen mal y atraen a los bichos.</p>
  </article>
</main>

<!-- ✅ 5. aside con su título y una lista de enlaces -->
<aside class="sidebar" aria-labelledby="related-title">
  <h2 class="sidebar-title" id="related-title">Te puede interesar</h2>
  <ul>
    <li><a href="https://cuadernodehuerta.example/lombricario/">Un lombricario casero</a></li>
    <li><a href="https://cuadernodehuerta.example/abonos-verdes/">Abonos verdes para el invierno</a></li>
  </ul>
</aside>

<!-- ✅ 6. footer de la página -->
<footer class="footer">© 2026 Cuaderno de huerta · <a href="mailto:hola@cuadernodehuerta.example">Escríbeme</a></footer>
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
// Las mismas comprobaciones del ejercicio: ahora todas salen ✅
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
