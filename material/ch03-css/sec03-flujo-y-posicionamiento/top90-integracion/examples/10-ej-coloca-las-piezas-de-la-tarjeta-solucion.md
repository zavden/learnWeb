---
example_stage: final-solution
example_description: "Solución: insignia absolute en la esquina, botón con top y right, la figura como referencia del sello y la imagen como bloque"
example_tags: "css|solucion|position|absolute|inset|bloque-contenedor"
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

/* ✅ 3. La figura es ahora el antepasado posicionado más cercano del sello:
   inset: 0 se mide desde ella, no desde la tarjeta. */
.card-media {
  position: relative;
  margin: 0;
  background: #bbf7d0;
}

/* ✅ 4. Como bloque, la imagen no deja el hueco de la línea base. */
.card-media img {
  display: block;
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

/* ✅ 1. absolute la saca del flujo: ya no deja hueco y se mide desde la tarjeta. */
.badge {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  background: #b91c1c;
  color: #ffffff;
  font-size: 0.8rem;
  font-weight: bold;
}

/* ✅ 2. Con top y right deja su posición estática y va a la esquina. */
.fav {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
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
// escribe ✅ o ❌ en la lista.
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
