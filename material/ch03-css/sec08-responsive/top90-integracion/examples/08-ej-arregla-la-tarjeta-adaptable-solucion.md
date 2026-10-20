---
example_stage: final-solution
example_description: "Solución: el contenedor pasa al hueco (.slot), el título usa cqi (16px y 21.6px) y la foto tiene aspect-ratio: 4 / 3 para que object-fit: cover recorte"
example_tags: "css|solucion|container-queries|cqi|object-fit|aspect-ratio"
console: true
---

# HTML

```html
<p class="caption">Dos huecos de ancho fijo: 200px y 340px. La tarjeta debe apilarse en el primero y poner la foto a la izquierda en el segundo (desde 18rem = 288px de contenedor).</p>

<div class="slot is-small">
  <article class="card">
    <img src="tierra-apolo-17-480.jpg" alt="La Tierra vista desde el Apolo 17" width="480" height="480">
    <div><h3>La canica azul</h3><p>Lámina de 40 × 40 cm · 390 MXN</p></div>
  </article>
</div>

<div class="slot is-large">
  <article class="card">
    <img src="tierra-apolo-17-480.jpg" alt="La Tierra vista desde el Apolo 17" width="480" height="480">
    <div><h3>La canica azul</h3><p>Lámina de 40 × 40 cm · 390 MXN</p></div>
  </article>
</div>

<ul class="checklist">
  <li>Apilada en 200px y en dos columnas en 340px: <output id="check-layout">…</output></li>
  <li>El título crece con el hueco: <output id="check-title">…</output></li>
  <li>La foto, en una caja 4:3: <output id="check-photo">…</output></li>
</ul>
<p class="credit">NASA, Apolo 17, 1972. Dominio público.</p>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.caption, .credit { margin: 0 0 8px; font-size: 0.72rem; }

/* Los huecos. */
:where(.slot) { margin-bottom: 10px; outline: 2px dashed #7c3aed; }
:where(.slot.is-small) { width: 200px; }
:where(.slot.is-large) { width: 340px; }

/* ✅ 1: el contenedor es el HUECO. La consulta da estilo a .card, y el
   contenedor más cercano entre sus antepasados es .slot. */
.slot { container-type: inline-size; }

.card {
  display: grid;
  gap: 8px;
  padding: 8px;
}

@container (width >= 18rem) {
  .card { grid-template-columns: 7rem 1fr; align-items: start; }
}

/* ✅ 2: cqi mide el contenedor: 8 + 4 % de 200 = 16px; 8 + 4 % de 340 = 21.6px. */
.card h3 {
  margin: 0;
  font-size: clamp(1rem, 0.5rem + 4cqi, 1.75rem);
}

.card p { margin: 4px 0 0; font-size: 0.8rem; }

/* ✅ 3: una caja con proporción propia; ahora cover tiene algo que recortar. */
.card img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 6px;
}

.checklist { padding-inline-start: 1.2em; color: #475569; font-size: 0.8rem; }
.checklist output { color: #1e293b; font-weight: bold; }
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Este script mide las dos
// tarjetas (los huecos tienen ancho fijo, así que el resultado no depende del
// tamaño de la vista previa) y escribe ✅ o ❌ en la lista y en la consola.
function check(id, ok, detail) {
  const text = `${ok ? '✅' : '❌'} ${detail}`;
  document.getElementById(id).textContent = text;
  console.log(`${id}: ${text}`);
}

const small = document.querySelector('.is-small .card');
const large = document.querySelector('.is-large .card');

// Número de columnas: «none» es una; «112px 196px» son dos.
const columns = (card) => {
  const value = getComputedStyle(card).gridTemplateColumns;
  return value === 'none' ? 1 : value.split(' ').length;
};
check('check-layout', columns(small) === 1 && columns(large) === 2,
  `${columns(small)} columna(s) en 200px, ${columns(large)} en 340px`);

const size = (card) => parseFloat(getComputedStyle(card.querySelector('h3')).fontSize);
check('check-title', size(large) - size(small) >= 4,
  `${size(small).toFixed(1)}px en el pequeño, ${size(large).toFixed(1)}px en el grande`);

const photo = small.querySelector('img');
const box = photo.getBoundingClientRect();
const ratio = box.width / box.height;
check('check-photo', Math.abs(ratio - 4 / 3) < 0.03 && getComputedStyle(photo).objectFit === 'cover',
  `caja de ${Math.round(box.width)} × ${Math.round(box.height)} (proporción ${ratio.toFixed(2)})`);
```
