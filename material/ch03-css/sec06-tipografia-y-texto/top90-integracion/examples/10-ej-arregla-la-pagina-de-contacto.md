---
exercise: true
exercise_title: "Arregla la página de contacto"
exercise_instructions: "Las tres fichas tienen flex: 1, pero la del correo largo es mucho más ancha: haz que el correo se parta y que las fichas vuelvan a medir lo mismo (TODO 1) || Los cargos son palabras largas en columnas estrechas: deja que el navegador los parta con guiones (TODO 2) || En el aviso en árabe, la barra está en el lado donde termina el texto: que vaya donde empieza, en los dos idiomas (TODO 3) || En las reseñas, el número salta delante del nombre árabe y del hebreo: aísla los nombres desde el CSS (TODO 4) || Comprueba que las cuatro líneas de la lista marcan ✅"
exercise_hints: "break-word parte el correo, pero no cambia el ancho mínimo que miran los elementos flex || La propiedad tiene tres valores: none, manual y el que buscas; el idioma ya está en el HTML || border-left es un lado de la pantalla; busca el lado donde empieza la línea || Es lo que hace <bdi>, pero con una propiedad de CSS"
exercise_solution_example: 10-ej-arregla-la-pagina-de-contacto-solucion.md
exercise_locked_files: index.html,script.js
example_stage: exercise
console: true
example_description: "Ejercicio: una página de contacto con cuatro errores de texto (break-word que no iguala unas columnas flex, cargos sin guiones, un aviso árabe con propiedades físicas y nombres sin aislar) que un pequeño script comprueba en directo"
example_tags: "css|ejercicio|tipografia|overflow-wrap|hyphens|propiedades-logicas|unicode-bidi"
---

# HTML

```html
<div class="cards">
  <article class="card"><h3>Ana Lucía Méndez</h3><p class="role">Coordinadora de exportaciones</p><p class="mail">ana.mendez@panaderialaespiga.mx</p></article>
  <article class="card"><h3>Facturación</h3><p class="role">Departamento de administración</p><p class="mail">facturacionyclientes@panaderialaespiga.mx</p></article>
  <article class="card"><h3>Mayoreo</h3><p class="role">Pedidos para restaurantes</p><p class="mail">mayoreo@panaderialaespiga.mx</p></article>
</div>

<div class="notes">
  <p class="note">Respondemos en menos de 24&nbsp;horas.</p>
  <p class="note" lang="ar" dir="rtl">نرد خلال أقل من 24 ساعة.</p>
</div>

<ul class="reviews">
  <li><span class="reviewer">Ana</span>: 12 reseñas</li>
  <li><span class="reviewer" lang="ar">سارة</span>: 5 reseñas</li>
  <li><span class="reviewer" lang="he">דוד</span>: 3 reseñas</li>
</ul>

<ul class="checklist">
  <li>Las tres fichas, iguales: <output id="check-cards">…</output></li>
  <li>Cargos con guiones automáticos: <output id="check-hyphens">…</output></li>
  <li>La barra del aviso árabe, a la derecha: <output id="check-border">…</output></li>
  <li>Nombres aislados: <output id="check-bidi">…</output></li>
</ul>
```

# CSS

```css
body {
  color: #1e293b;
  font-family: system-ui, sans-serif;
  font-size: 0.85rem;
}

.cards {
  display: flex;
  gap: 8px;
  width: 400px;
}

.card {
  flex: 1;
  padding: 6px 8px;
  background: #e0e7ff;
}

.card h3,
.card p {
  margin: 0;
}

.card h3 {
  font-size: 0.95rem;
}

/* TODO 1: break-word parte el correo, pero la ficha sigue sin encoger. */
.mail {
  overflow-wrap: break-word;
}

/* TODO 2: deja que el navegador parta los cargos con guiones. */
.role {
  color: #334155;
  hyphens: manual;
}

.notes {
  display: grid;
  gap: 6px;
  max-width: 400px;
  margin-block: 12px;
}

/* TODO 3: en árabe, la barra queda donde termina el texto. */
.note {
  margin: 0;
  padding-left: 10px;
  border-left: 4px solid #4338ca;
  background: #f1f5f9;
}

.reviews {
  margin: 0;
  padding-inline-start: 1.2em;
  font-size: 1rem;
}

/* TODO 4: en las dos últimas reseñas, el número salta delante del nombre. */
.reviewer {
  font-weight: 700;
}

.checklist {
  padding-inline-start: 1.2em;
  color: #475569;
  font-size: 0.8rem;
}

.checklist output {
  color: #1e293b;
  font-weight: bold;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Este script solo mide las cajas,
// lee los estilos calculados y escribe ✅ o ❌ en la lista (y en la consola).
// No hace falta tocarlo: se vuelve a ejecutar con cada cambio.
function check(id, ok, detail) {
  const text = `${ok ? '✅' : '❌'} ${detail}`;
  document.getElementById(id).textContent = text;
  console.log(`${id}: ${text}`);
}

const widths = [...document.querySelectorAll('.card')].map((card) => card.getBoundingClientRect().width);
check('check-cards', Math.max(...widths) - Math.min(...widths) < 1,
  `${widths.map(Math.round).join(', ')} px`);

const hyphens = getComputedStyle(document.querySelector('.role')).hyphens;
check('check-hyphens', hyphens === 'auto', `hyphens: ${hyphens}`);

// getComputedStyle siempre responde en lados físicos: así se ve dónde ha ido a parar.
const arabicNote = getComputedStyle(document.querySelector('.note[dir="rtl"]'));
const right = parseFloat(arabicNote.borderRightWidth);
const left = parseFloat(arabicNote.borderLeftWidth);
check('check-border', right > 0 && left === 0, `borde izquierdo ${left} px, derecho ${right} px`);

const bidi = getComputedStyle(document.querySelector('.reviewer')).unicodeBidi;
check('check-bidi', bidi === 'isolate', `unicode-bidi: ${bidi}`);
```
