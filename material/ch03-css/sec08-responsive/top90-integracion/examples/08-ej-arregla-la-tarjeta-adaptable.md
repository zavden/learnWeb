---
exercise: true
exercise_title: "Arregla la tarjeta adaptable"
exercise_instructions: "La tarjeta del hueco de 340px debería poner la foto a la izquierda, pero sigue apilada: el contenedor está en el sitio equivocado. Haz que la @container pregunte por el hueco (TODO 1) || El título mide lo mismo en los dos huecos: que crezca con el ancho del contenedor, de 16px en el hueco pequeño a unos 22px en el grande (TODO 2) || La foto de la Tierra es cuadrada aunque tiene object-fit: cover: dale una caja de proporción 4:3 (TODO 3) || Comprueba que las tres líneas de la lista marcan ✅"
exercise_hints: "Un contenedor no puede consultarse a sí mismo: la regla da estilo a .card, así que el contenedor tiene que ser un antepasado de .card || vw mide la ventana; hay una unidad que mide el contenedor más cercano || object-fit necesita una caja con tamaño propio; con height: auto, la caja tiene la proporción de la foto"
exercise_solution_example: 08-ej-arregla-la-tarjeta-adaptable-solucion.md
exercise_locked_files: index.html,script.js
example_stage: exercise
console: true
example_description: "Ejercicio: una tarjeta de producto con tres errores de la lección de container queries y la de imágenes (el contenedor que se consulta a sí mismo, un título en vw y object-fit sin caja propia), comprobados por un pequeño script en dos huecos de ancho fijo"
example_tags: "css|ejercicio|container-queries|cqi|object-fit|aspect-ratio"
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

/* Los huecos (no hace falta tocarlos, salvo para el TODO 1). */
:where(.slot) { margin-bottom: 10px; outline: 2px dashed #7c3aed; }
:where(.slot.is-small) { width: 200px; }
:where(.slot.is-large) { width: 340px; }

/* TODO 1: la tarjeta es el contenedor… y la consulta de abajo le da estilo
   a ella misma. */
.card {
  container-type: inline-size;
  display: grid;
  gap: 8px;
  padding: 8px;
}

@container (width >= 18rem) {
  .card { grid-template-columns: 7rem 1fr; align-items: start; }
}

/* TODO 2: el título sigue a la ventana, no al hueco. */
.card h3 {
  margin: 0;
  font-size: clamp(1rem, 0.5rem + 4vw, 1.75rem);
}

.card p { margin: 4px 0 0; font-size: 0.8rem; }

/* TODO 3: object-fit: cover no recorta nada. */
.card img {
  display: block;
  width: 100%;
  height: auto;
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
