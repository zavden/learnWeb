---
exercise: true
exercise_title: "Alinea el panel de documentos"
exercise_instructions: "Centra los iconos de los botones con su texto: ahora quedan altos (TODO 1) || Alinea los tres botones por arriba: el cuadrado queda a otra altura (TODO 2) || Alinea las tres fichas por arriba (TODO 3) || Centra en vertical el texto del aviso sin vertical-align (TODO 4) || Comprueba que las cuatro líneas de la lista marcan ✅"
exercise_hints: "Un icono con vertical-align: baseline apoya su borde inferior en la línea base. Un pequeño valor negativo en em lo baja || El botón cuadrado no tiene ninguna línea de texto (su icono es un bloque): ¿dónde está entonces su línea base? || Cada ficha se apoya en la línea base de su última línea, o en su borde inferior si tiene overflow || vertical-align no se aplica a bloques: quita la altura fija y usa el mismo relleno arriba y abajo"
exercise_solution_example: 12-ej-alinea-el-panel-solucion.md
exercise_locked_files: index.html,script.js
example_stage: exercise
example_description: "Ejercicio: un panel con iconos altos en los botones, botones y fichas inline-block desalineados y un aviso que intenta centrarse con vertical-align"
example_tags: "css|ejercicio|vertical-align|inline-block|baseline"
---

# HTML

```html
<section class="panel">
  <h2 class="panel-title">Tus documentos</h2>

  <p class="toolbar">
    <a class="button button--primary" href="#"><img class="icon" src="icon-download.svg" alt="">Descargar todo</a>
    <button class="button" type="button"><img class="icon" src="icon-heart.svg" alt="">Favoritos</button>
    <a class="button button--square" href="#" aria-label="Avisos"><img class="icon" src="icon-bell.svg" alt=""></a>
  </p>

  <div class="docs">
    <article class="doc"><h3>Contrato de alquiler</h3><p>PDF · 340 KB</p></article>
    <article class="doc"><h3>Presupuesto de la reforma de la cocina y del baño</h3><p>PDF · 1,2 MB</p></article>
    <article class="doc doc--preview"><h3>Plano del piso</h3><p>JPG · 2,8 MB</p></article>
  </div>

  <div class="notice"><p>Los documentos se guardan cifrados durante 5 años.</p></div>
</section>

<ul class="checklist">
  <li>Iconos centrados con el texto: <output id="check-icons">…</output></li>
  <li>Botones alineados por arriba: <output id="check-buttons">…</output></li>
  <li>Fichas alineadas por arriba: <output id="check-docs">…</output></li>
  <li>Texto del aviso centrado: <output id="check-notice">…</output></li>
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
  line-height: 1.4;
}

.panel {
  max-width: 32rem;
  padding: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
}

.panel-title {
  margin: 0 0 0.75rem;
  font-size: 1.2rem;
}

/* TODO 2: los botones están en fila, pero el cuadrado no queda a la misma altura. */
.button {
  display: inline-block;
  min-height: 2.75rem;
  margin: 0 0.4rem 0.4rem 0;
  padding: 0.55rem 1rem;
  border: 2px solid #1d4ed8;
  border-radius: 8px;
  background: #ffffff;
  color: #1d4ed8;
  font: inherit;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
}

.button--primary {
  background: #1d4ed8;
  color: #ffffff;
}

.button--square {
  width: 2.75rem;
  padding: 0.7rem 0;
}

.button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

/* TODO 1: los iconos quedan altos respecto al texto del botón. */
.icon {
  display: inline-block;
  width: 1.1em;
  height: 1.1em;
  margin-right: 0.4em;
}

/* En el botón cuadrado, el icono es un bloque centrado con margin: auto. */
.button--square .icon {
  display: block;
  margin: 0 auto;
}

/* TODO 3: las fichas no quedan alineadas por arriba. */
.doc {
  display: inline-block;
  width: calc(33.3% - 0.6rem);
  margin: 0.5rem 0.4rem 0 0;
  padding: 0.5rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
}

/* La ficha con vista previa recorta su contenido a las esquinas redondeadas. */
.doc--preview {
  overflow: hidden;
}

.doc h3 {
  margin: 0;
  font-size: 0.9rem;
}

.doc p {
  margin: 0;
  color: #475569;
  font-size: 0.8rem;
}

/* TODO 4: el texto del aviso debería quedar centrado en vertical. */
.notice {
  height: 4rem;
  margin-top: 1rem;
  padding: 0 1rem;
  border-radius: 8px;
  background: #dbeafe;
  vertical-align: middle;
}

.notice p {
  margin: 0;
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

const rects = (selector) => [...document.querySelectorAll(selector)].map((element) => element.getBoundingClientRect());
const middle = (box) => (box.top + box.bottom) / 2;
const sameTop = (boxes) => boxes.every((box) => Math.abs(box.top - boxes[0].top) <= 1);

// Iconos: el centro del icono, frente al centro de su botón (con texto).
const offsets = [0, 1].map((index) => {
  const button = rects('.button')[index];
  const icon = rects('.button .icon')[index];
  return Math.abs(middle(icon) - middle(button));
});
const iconsOk = offsets.every((offset) => offset <= 1.5);
check('check-icons', iconsOk, `desvío de ${offsets.map((offset) => offset.toFixed(1)).join(' y ')}px (objetivo: ≤ 1,5px)`);

check('check-buttons', sameTop(rects('.button')), sameTop(rects('.button')) ? 'a la misma altura' : 'a distintas alturas');
check('check-docs', sameTop(rects('.doc')), sameTop(rects('.doc')) ? 'a la misma altura' : 'a distintas alturas');

const notice = document.querySelector('.notice').getBoundingClientRect();
const text = document.querySelector('.notice p').getBoundingClientRect();
const noticeOffset = Math.abs(middle(text) - middle(notice));
check('check-notice', noticeOffset <= 1.5, `desvío de ${noticeOffset.toFixed(1)}px (objetivo: ≤ 1,5px)`);
```
