---
exercise: true
exercise_title: "Coloca las piezas de la tarjeta"
exercise_instructions: "Haz que la insignia «Nuevo» quede en la esquina superior izquierda sin dejar un hueco en la tarjeta (TODO 1) || Lleva el botón de favoritos a la esquina superior derecha, a 0.5rem de los bordes (TODO 2) || Haz que el sello «Agotado» cubra solo la foto, no toda la tarjeta (TODO 3) || Quita el hueco bajo la foto para que el sello la cubra exactamente (TODO 4) || Comprueba que las cuatro líneas de la lista marcan ✅"
exercise_hints: "relative dibuja la caja desplazada, pero su hueco sigue ocupando sitio en el flujo || Una caja absolute sin desplazamientos se queda en su posición estática || inset: 0 se mide desde el antepasado posicionado más cercano: ¿cuál es ahora? || La foto es inline: debajo queda el sitio de los descendentes de la línea"
exercise_solution_example: 10-ej-coloca-las-piezas-de-la-tarjeta-solucion.md
exercise_locked_files: index.html,script.js
example_stage: exercise
example_description: "Ejercicio: una tarjeta de producto con una insignia relative que deja hueco, un botón absolute sin desplazamientos, un sello que cubre la tarjeta entera y el hueco bajo la foto"
example_tags: "css|ejercicio|position|absolute|inset|bloque-contenedor"
---

# HTML

```html
<article class="card">
  <figure class="card-media">
    <img src="product-tent.svg" width="240" height="180" alt="Tienda de campaña verde para dos personas">
    <span class="sold-out">Agotado</span>
  </figure>
  <span class="badge">Nuevo</span>
  <button class="fav" type="button" aria-label="Guardar «Tienda de campaña para dos» en favoritos"><img src="icon-heart.svg" width="24" height="24" alt=""></button>
  <h2 class="card-title">Tienda de campaña para dos</h2>
  <p class="card-price">129,00 € · vuelve en noviembre</p>
</article>

<ul class="checklist">
  <li>Insignia en la esquina y sin hueco: <output id="check-badge">…</output></li>
  <li>Favoritos en la esquina derecha: <output id="check-fav">…</output></li>
  <li>El sello cubre solo la foto: <output id="check-overlay">…</output></li>
  <li>Hueco bajo la foto: <output id="check-gap">…</output></li>
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
}

.card {
  position: relative;
  width: min(100%, 15rem);
  margin: 0.5rem;
  padding-bottom: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  background: #ffffff;
}

/* TODO 3: el sello debería cubrir la foto, pero cubre la tarjeta entera.
   TODO 4: entre la foto y el final de la figura hay unos píxeles de hueco. */
.card-media {
  margin: 0;
  background: #bbf7d0;
}

.card-media img {
  width: 100%;
  height: auto;
  border-radius: 9px 9px 0 0;
}

.sold-out {
  position: absolute;
  inset: 0;
  padding-top: 3rem;
  border-radius: 9px 9px 0 0;
  background: rgb(15 23 42 / 0.6);
  color: #ffffff;
  font-weight: bold;
  text-align: center;
}

/* TODO 1: la insignia está en el flujo (relative) y empuja el título hacia abajo. */
.badge {
  position: relative;
  top: 0.5rem;
  left: 0.5rem;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  background: #b91c1c;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: bold;
}

/* TODO 2: el botón es absolute, pero no tiene desplazamientos. */
.fav {
  position: absolute;
  width: 2.25rem;
  height: 2.25rem;
  padding: 0.5rem;
  border: 1px solid #94a3b8;
  border-radius: 50%;
  background: #ffffff;
  cursor: pointer;
}

.fav img {
  display: block;
  width: 100%;
  height: auto;
}

.fav:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

.card-title {
  margin: 0.6rem 0.75rem 0.25rem;
  font-size: 1rem;
}

.card-price {
  margin: 0 0.75rem;
  color: #475569;
  font-size: 0.85rem;
}

.checklist {
  margin-top: 1.5rem;
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
// escribe ✅ o ❌ en la lista. No hace falta tocarlo: se vuelve a ejecutar con cada cambio.
function check(id, ok, detail) {
  document.getElementById(id).textContent = `${ok ? '✅' : '❌'} ${detail}`;
}

const rect = (selector) => document.querySelector(selector).getBoundingClientRect();
const card = rect('.card');
const media = rect('.card-media');
const image = rect('.card-media img');
const overlay = rect('.sold-out');
const badge = rect('.badge');
const fav = rect('.fav');
const title = rect('.card-title');
const near = (a, b, tolerance = 1) => Math.abs(a - b) <= tolerance;

const badgeInCorner = badge.top - card.top <= 12 && badge.left - card.left <= 12;
const noHole = title.top - media.bottom < 16;
check('check-badge', badgeInCorner && noHole, badgeInCorner ? (noHole ? 'en su sitio' : 'deja un hueco') : 'fuera de la esquina');

const favInCorner = near(fav.top - card.top, 9, 3) && near(card.right - fav.right, 9, 3);
check('check-fav', favInCorner, favInCorner ? 'en la esquina' : 'fuera de la esquina');

const coversPhoto = near(overlay.top, media.top) && near(overlay.bottom, media.bottom) && near(overlay.left, media.left) && near(overlay.right, media.right);
check('check-overlay', coversPhoto, coversPhoto ? 'cubre la foto' : 'no coincide con la foto');

const gap = Math.round(media.bottom - image.bottom);
check('check-gap', gap === 0, `${gap}px (objetivo: 0px)`);
```
