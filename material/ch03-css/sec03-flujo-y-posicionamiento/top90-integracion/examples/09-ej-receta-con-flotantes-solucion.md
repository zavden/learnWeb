---
example_stage: final-solution
example_description: "Solución: imagen de bloque, cita y recuadro con display: flow-root y la sección con clear: left"
example_tags: "css|solucion|float|clear|flow-root|baseline"
---

# HTML

```html
<article class="recipe">
  <h1>Tortilla de patatas</h1>
  <figure class="photo">
    <img src="tortilla.svg" width="240" height="180" alt="Tortilla de patatas jugosa en un plato, con una porción cortada">
    <figcaption>Para 4 personas · 45 minutos</figcaption>
  </figure>
  <p>La receta de siempre, con cebolla y la patata confitada a fuego lento.</p>
  <blockquote class="quote"><p>«El secreto está en dejar reposar la patata con el huevo batido diez minutos.»</p></blockquote>
  <h2 class="section-title">Ingredientes</h2>
  <ul>
    <li>800 g de patatas</li>
    <li>6 huevos camperos</li>
    <li>1 cebolla grande</li>
    <li>Aceite de oliva virgen extra y sal</li>
  </ul>
  <aside class="tip">
    <img class="tip-icon" src="icon-tip.svg" width="24" height="24" alt="">
    <p class="tip-text"><strong>Truco:</strong> dale la vuelta con una tapa plana, no con un plato hondo.</p>
  </aside>
</article>

<ul class="checklist">
  <li>Hueco entre la foto y su pie: <output id="check-gap">…</output></li>
  <li>Borde de la cita junto a la foto: <output id="check-quote">…</output></li>
  <li>«Ingredientes» por debajo de la foto: <output id="check-clear">…</output></li>
  <li>El truco envuelve a su icono: <output id="check-tip">…</output></li>
</ul>
```

# CSS

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  line-height: 1.5;
}

.recipe {
  display: flow-root;
  width: min(100% - 1rem, 34rem);
}

.recipe h1 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
}

.photo {
  float: left;
  width: min(45%, 12rem);
  margin: 0.25rem 1rem 0.75rem 0;
  background: #bfdbfe;
}

/* ✅ 1. Como bloque, la imagen ya no está en una línea: no hay hueco de descendentes. */
.photo img {
  display: block;
  width: 100%;
  height: auto;
}

.photo figcaption {
  padding: 0.25rem 0.5rem;
  background: #1e3a8a;
  color: #ffffff;
  font-size: 0.8rem;
}

/* ✅ 2. Un BFC no se mete debajo de los flotantes: la cita se estrecha y se pone al lado. */
.quote {
  display: flow-root;
  margin: 0 0 1rem;
  padding: 0.25rem 0.75rem;
  border-left: 4px solid #9a3412;
  background: #fff7ed;
  color: #9a3412;
  font-style: italic;
}

.quote p {
  margin: 0;
}

/* ✅ 3. clear: left la coloca por debajo de los flotantes de la izquierda (la foto). */
.section-title {
  clear: left;
  margin: 0.5rem 0 0.25rem;
  padding: 0.15rem 0.5rem;
  background: #e2e8f0;
  font-size: 1.1rem;
}

/* ✅ 4. Un BFC contiene a sus flotantes: el recuadro mide lo que su contenido. */
.tip {
  display: flow-root;
  margin-top: 1rem;
  padding: 0.5rem 0.75rem;
  border: 1px solid #f59e0b;
  border-radius: 8px;
  background: #fef3c7;
}

.tip-icon {
  float: left;
  margin-right: 0.5rem;
}

.tip-text {
  float: left;
  max-width: 85%;
  margin: 0;
}

.checklist {
  margin-top: 2rem;
  color: #475569;
  font-size: 0.9rem;
}

.checklist output {
  color: #1e293b;
  font-weight: bold;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Este script solo mide las cajas y
// escribe ✅ o ❌ en la lista.
function check(id, ok, detail) {
  document.getElementById(id).textContent = `${ok ? '✅' : '❌'} ${detail}`;
}

const rect = (selector) => document.querySelector(selector).getBoundingClientRect();
const image = rect('.photo img');
const caption = rect('.photo figcaption');
const photo = rect('.photo');
const quote = rect('.quote');
const title = rect('.section-title');
const tip = rect('.tip');
const icon = rect('.tip-icon');

const gap = Math.round(caption.top - image.bottom);
check('check-gap', gap === 0, `${gap}px (objetivo: 0px)`);
check('check-quote', quote.left >= photo.right, quote.left >= photo.right ? 'a la derecha de la foto' : 'por debajo de la foto');
check('check-clear', title.top >= photo.bottom, title.top >= photo.bottom ? 'empieza por debajo' : 'empieza al lado');
check('check-tip', tip.bottom >= icon.bottom, tip.bottom >= icon.bottom ? 'lo envuelve' : 'el icono se sale');
```
