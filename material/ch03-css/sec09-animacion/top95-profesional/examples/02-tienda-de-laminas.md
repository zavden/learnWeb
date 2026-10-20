---
example_description: "La tienda de láminas de un museo: al elegir una lámina del catálogo, su miniatura viaja y crece hasta la imagen grande de la ficha con una View Transition (el mismo view-transition-name en la miniatura y en la ficha, que nunca están visibles a la vez); al volver, hace el camino inverso. Adelanto de JavaScript: startViewTransition, hidden y focus"
example_tags: "css|profesional|view-transitions|view-transition-name|view-transition-class|object-fit|container-queries|galeria|javascript"
example_stage: professional
example_importance: important
---

# HTML

```html
<main class="shop">
  <section class="catalog" aria-labelledby="catalog-title">
    <h1 id="catalog-title">Láminas del museo</h1>
    <p class="catalog__lead">Reproducciones en papel de algodón, 40 × 50 cm. Elige una para ver su ficha.</p>
    <ul class="catalog__grid">
      <li><button type="button" class="thumb" onclick="showPrint('print-hokusai')"><img src="hokusai-gran-ola.jpg" alt="" width="160" height="160" style="--vt: print-hokusai"><span>La gran ola</span></button></li>
      <li><button type="button" class="thumb" onclick="showPrint('print-velasco')"><img src="velasco-valle-de-mexico.jpg" alt="" width="160" height="160" style="--vt: print-velasco"><span>Valle de México</span></button></li>
      <li><button type="button" class="thumb" onclick="showPrint('print-tierra')"><img src="tierra-apolo-17.jpg" alt="" width="160" height="160" style="--vt: print-tierra"><span>La Tierra desde el Apolo 17</span></button></li>
      <li><button type="button" class="thumb" onclick="showPrint('print-pilares')"><img src="pilares-de-la-creacion.jpg" alt="" width="160" height="160" style="--vt: print-pilares"><span>Pilares de la creación</span></button></li>
    </ul>
  </section>

  <article id="print-hokusai" class="detail" hidden>
    <img src="hokusai-gran-ola.jpg" alt="Una ola gigante con garras de espuma a punto de caer sobre tres barcas; al fondo, el monte Fuji" width="960" height="646" style="--vt: print-hokusai">
    <div class="detail__text">
      <h2 tabindex="-1">La gran ola de Kanagawa</h2>
      <p>Katsushika Hokusai, c. 1831. Xilografía. Dominio público.</p>
      <p class="detail__price">$450</p>
      <button type="button" class="back" onclick="showCatalog()">← Volver al catálogo</button>
    </div>
  </article>
  <article id="print-velasco" class="detail" hidden>
    <img src="velasco-valle-de-mexico.jpg" alt="El valle de México desde un cerro: el lago de Texcoco, la ciudad a lo lejos y los volcanes en el horizonte" width="960" height="660" style="--vt: print-velasco">
    <div class="detail__text">
      <h2 tabindex="-1">Valle de México</h2>
      <p>José María Velasco, 1877. Óleo sobre tela. Dominio público.</p>
      <p class="detail__price">$520</p>
      <button type="button" class="back" onclick="showCatalog()">← Volver al catálogo</button>
    </div>
  </article>
  <article id="print-tierra" class="detail" hidden>
    <img src="tierra-apolo-17.jpg" alt="La Tierra entera iluminada: África, Arabia y la Antártida bajo las nubes" width="960" height="960" style="--vt: print-tierra">
    <div class="detail__text">
      <h2 tabindex="-1">La Tierra desde el Apolo 17</h2>
      <p>NASA, tripulación del Apolo 17, 1972. Dominio público.</p>
      <p class="detail__price">$380</p>
      <button type="button" class="back" onclick="showCatalog()">← Volver al catálogo</button>
    </div>
  </article>
  <article id="print-pilares" class="detail" hidden>
    <img src="pilares-de-la-creacion.jpg" alt="Tres columnas de gas y polvo ocre que se alzan en una nebulosa azul" width="960" height="1002" style="--vt: print-pilares">
    <div class="detail__text">
      <h2 tabindex="-1">Pilares de la creación</h2>
      <p>NASA, ESA y el equipo Hubble Heritage, 2014. Dominio público.</p>
      <p class="detail__price">$380</p>
      <button type="button" class="back" onclick="showCatalog()">← Volver al catálogo</button>
    </div>
  </article>
</main>
```

# CSS

```css
/* ──────────────────────────────────────────────────────────────────────────
   Tienda de láminas
   - Dos «vistas» en la misma página: el catálogo y una ficha por lámina. Se
     cambian con hidden dentro de una View Transition.
   - La miniatura y la imagen de la ficha comparten view-transition-name
     (desde --vt en línea). Nunca están visibles a la vez (lo oculto no tiene
     caja), así que el nombre no se repite: el navegador empareja las dos
     fotos y la miniatura viaja y crece hasta la ficha (y vuelve).
   - Las fotos tienen proporciones distintas (cuadrada en el catálogo): con
     object-fit: cover en los pseudoelementos, no se deforman al viajar.
   - view-transition-class: print da a todas las láminas la misma duración.
   - Movimiento reducido: sin nombres; la página se funde de una vista a otra.
   - Accesibilidad: al cambiar de vista, el foco va al título de la ficha
     (tabindex="-1") o vuelve al catálogo; el texto alternativo largo está en
     la ficha, y las miniaturas se nombran por el texto del botón.
   ────────────────────────────────────────────────────────────────────────── */

/* ── Tokens ── */
:root {
  --color-text: #1e293b;
  --color-muted: #475569;
  --color-accent: #1d4ed8;
  --color-surface: #ffffff;
  --color-card: #f1f5f9;
  --radius: 12px;
}

/* ── Base ── */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--color-surface);
  color: var(--color-text);
  font-family: system-ui, sans-serif;
  line-height: 1.5;
}

img {
  display: block;
  max-width: 100%;
  height: auto;
}

:focus-visible {
  outline: 3px solid var(--color-accent);
  outline-offset: 3px;
}

.shop {
  max-width: 56rem;
  margin-inline: auto;
  padding: 1rem;
  container-type: inline-size;
}

/* ── Catálogo ── */
.catalog h1 {
  margin: 0;
  font-size: 1.4rem;
}

.catalog__lead {
  margin: 0.25rem 0 1rem;
  color: var(--color-muted);
}

.catalog__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(9rem, 1fr));
  gap: 0.75rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.thumb {
  display: grid;
  gap: 0.4rem;
  width: 100%;
  padding: 0.4rem;
  border: 0;
  border-radius: var(--radius);
  background: var(--color-card);
  color: inherit;
  font: inherit;
  font-size: 0.85rem;
  font-weight: 600;
  text-align: start;
  cursor: pointer;
  transition: background-color 150ms;
}

.thumb:hover {
  background: #e2e8f0;
}

.thumb img {
  width: 100%;
  aspect-ratio: 1;
  border-radius: calc(var(--radius) - 4px);
  object-fit: cover;
}

/* ── Ficha ── */
.detail {
  display: grid;
  gap: 1rem;
}

/* El atributo hidden solo aplica un display: none del navegador, y cualquier
   display del autor (el grid de arriba) le gana. Sin esta regla, las cuatro
   fichas se verían siempre y sus view-transition-name chocarían con los de
   las miniaturas (nombres repetidos: la transición se cancela). */
.detail[hidden] {
  display: none;
}

.detail img {
  width: 100%;
  border-radius: var(--radius);
}

.detail h2 {
  margin: 0;
  font-size: 1.4rem;
}

.detail p {
  margin: 0.25rem 0;
}

.detail__price {
  font-size: 1.3rem;
  font-weight: 800;
}

.back {
  margin-top: 0.75rem;
  padding: 0.5rem 1rem;
  border: 0;
  border-radius: 999px;
  background: var(--color-text);
  color: #ffffff;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

@container (width >= 34rem) {
  .detail {
    grid-template-columns: 3fr 2fr;
    align-items: start;
  }
}

/* ── Transición ── */
@media (prefers-reduced-motion: no-preference) {
  .thumb img,
  .detail img {
    view-transition-name: var(--vt);
    view-transition-class: print;
  }

  ::view-transition-group(*.print) {
    animation-duration: 400ms;
    animation-timing-function: cubic-bezier(0.2, 0, 0, 1);
  }

  ::view-transition-old(*.print),
  ::view-transition-new(*.print) {
    height: 100%;
    object-fit: cover;
  }
}
```

# JavaScript

```javascript
// Adelanto: JavaScript del navegador (capítulo 6). Cambia de vista con la propiedad hidden
// dentro de una View Transition y mueve el foco a lo que acaba de aparecer.
const catalog = document.querySelector('.catalog');
const details = document.querySelectorAll('.detail');

function changeView(update) {
  if (!document.startViewTransition) {
    update();
    return;
  }
  document.startViewTransition(update);
}

function showPrint(id) {
  changeView(() => {
    catalog.hidden = true;
    for (const detail of details) {
      detail.hidden = detail.id !== id;
    }
    document.querySelector(`#${id} h2`).focus();
  });
}

function showCatalog() {
  const openId = [...details].find((detail) => !detail.hidden)?.id;
  changeView(() => {
    for (const detail of details) {
      detail.hidden = true;
    }
    catalog.hidden = false;
    // El foco vuelve a la miniatura de la lámina que estaba abierta.
    document.querySelector(`[onclick="showPrint('${openId}')"]`)?.focus();
  });
}
```
