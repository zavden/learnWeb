---
exercise: true
exercise_title: "Arregla el panel de mensajes"
exercise_instructions: "La lista de conversaciones no se desplaza y el pie se sale del panel: arréglalo en el elemento flex intermedio (TODO 1) || Los textos se salen de sus filas sin «…»: arréglalo en el elemento flex que contiene el texto (TODO 2) || Los avatares salen ovalados: que no encojan (TODO 3) || En el pie, «Siguiente» aparece antes que «Anterior»: deja el orden del HTML y pega los dos enlaces a la derecha de otra forma (TODO 4) || Comprueba que las cuatro líneas de la lista marcan ✅"
exercise_hints: "La lista ya tiene overflow-y: auto. ¿Quién, entre la lista y el panel de alto fijo, es un elemento flex sin overflow? || El p con nowrap está bien; mira a su padre, que es el elemento flex de la fila || Un avatar con width: 32px encoge si su flex-shrink es 1 || row-reverse invierte el eje; justify-content mueve los elementos sin cambiar su orden"
exercise_solution_example: 10-ej-arregla-el-panel-de-mensajes-solucion.md
exercise_locked_files: index.html,script.js
example_stage: exercise
console: true
example_description: "Ejercicio: un panel de mensajes con una lista que no se desplaza, «…» que no aparecen, avatares aplastados y un pie con el orden invertido"
example_tags: "css|ejercicio|flexbox|min-height|min-width|flex-shrink|row-reverse"
---

# HTML

```html
<section class="panel" aria-labelledby="panel-title">
  <header class="panel-header">
    <h2 id="panel-title">Mensajes</h2>
    <span class="badge">3 nuevos</span>
  </header>
  <div class="panel-body">
    <ul class="threads" tabindex="0" aria-label="Conversaciones">
      <li class="thread"><span class="avatar" aria-hidden="true">LR</span><div class="thread-text"><p class="thread-name">Laura Rivas</p><p class="thread-preview">Te mando el presupuesto de la cocina con los tres tipos de encimera que vimos el sábado</p></div></li>
      <li class="thread"><span class="avatar" aria-hidden="true">JP</span><div class="thread-text"><p class="thread-name">Jorge Pérez</p><p class="thread-preview">¿Nos vemos el viernes a las 8 en la cafetería de la esquina de Chapultepec y Libertad?</p></div></li>
      <li class="thread"><span class="avatar" aria-hidden="true">MG</span><div class="thread-text"><p class="thread-name">Marta García</p><p class="thread-preview">Ya tengo las fotos del taller de cerámica; te las paso en cuanto llegue a casa</p></div></li>
      <li class="thread"><span class="avatar" aria-hidden="true">AT</span><div class="thread-text"><p class="thread-name">Ana Torres</p><p class="thread-preview">El pedido 4821 llegó perfecto, muchas gracias por envolver tan bien la monstera</p></div></li>
      <li class="thread"><span class="avatar" aria-hidden="true">LG</span><div class="thread-text"><p class="thread-name">Luis Gómez</p><p class="thread-preview">Te reenvío el contrato firmado y el comprobante de la transferencia del depósito</p></div></li>
      <li class="thread"><span class="avatar" aria-hidden="true">CO</span><div class="thread-text"><p class="thread-name">Carmen Ortiz</p><p class="thread-preview">¡Por fin subí las fotos del viaje a Oaxaca! Las del mercado de Tlacolula quedaron preciosas</p></div></li>
    </ul>
  </div>
  <footer class="panel-footer">
    <a href="/mensajes?pagina=1">« Anterior</a>
    <a href="/mensajes?pagina=3">Siguiente »</a>
  </footer>
</section>

<ul class="checklist">
  <li>La lista se desplaza y el pie queda dentro: <output id="check-scroll">…</output></li>
  <li>Ninguna fila se sale de su ancho: <output id="check-rows">…</output></li>
  <li>Avatares redondos de 32px: <output id="check-avatars">…</output></li>
  <li>Pie en el orden del HTML, a la derecha: <output id="check-footer">…</output></li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  font-size: 0.8rem;
}

:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: -3px;
}

/* El panel: una columna de 240px de alto. */
.panel {
  display: flex;
  flex-direction: column;
  max-width: 340px;
  height: 240px;
  border: 2px dashed #7c3aed;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-bottom: 1px solid #cbd5e1;
}

.panel-header h2 {
  margin: 0;
  font-size: 1rem;
}

.badge {
  padding: 0 8px;
  border-radius: 999px;
  background: #1d4ed8;
  color: #ffffff;
  font-size: 0.7rem;
}

/* El cuerpo es elemento flex del panel y columna de la lista. */
.panel-body {
  display: flex;
  flex-direction: column;
  flex: 1;
}

/* TODO 1: la lista tiene overflow-y: auto, pero nunca se desplaza y el pie se sale
   del panel por abajo. El problema no está en la lista. */

.threads {
  flex: 1;
  margin: 0;
  padding: 0;
  overflow-y: auto;
  list-style: none;
}

.thread {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-bottom: 1px solid #e2e8f0;
}

/* TODO 3: los avatares deberían ser círculos de 32px. */
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #4338ca;
  color: #ffffff;
  font-size: 0.7rem;
  font-weight: bold;
  line-height: 32px;
  text-align: center;
}

/* TODO 2: el texto parte de su ancho en una línea (flex: auto) y debería encoger
   hasta caber, con «…» en la vista previa del mensaje. */
.thread-text {
  flex: auto;
}

.thread-text p {
  margin: 0;
}

.thread-name {
  font-weight: bold;
}

.thread-preview {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #475569;
}

/* TODO 4: row-reverse se puso para pegar los enlaces a la derecha, pero también
   invierte su orden: «Siguiente» aparece antes, y el tabulador va al revés. */
.panel-footer {
  display: flex;
  flex-direction: row-reverse;
  gap: 12px;
  padding: 8px 10px;
  border-top: 1px solid #cbd5e1;
}

.panel-footer a {
  color: #1d4ed8;
}

.checklist {
  padding-left: 1.2em;
  color: #475569;
}

.checklist output {
  color: #1e293b;
  font-weight: bold;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Este script solo mide las cajas y
// escribe ✅ o ❌ en la lista (y en la consola). No hace falta tocarlo: se vuelve a
// ejecutar con cada cambio.
function check(id, ok, detail) {
  const text = `${ok ? '✅' : '❌'} ${detail}`;
  document.getElementById(id).textContent = text;
  console.log(`${id}: ${text}`);
}

const box = (selector) => document.querySelector(selector).getBoundingClientRect();
const all = (selector) => [...document.querySelectorAll(selector)];

const threads = document.querySelector('.threads');
const scrolls = threads.scrollHeight > threads.clientHeight;
const footerInside = box('.panel-footer').bottom <= box('.panel').bottom + 0.5;
check('check-scroll', scrolls && footerInside, `${scrolls ? 'con scroll' : 'sin scroll'}, pie ${footerInside ? 'dentro' : 'fuera'}`);

const overflowingRows = all('.thread').filter((row) => row.scrollWidth > row.clientWidth).length;
check('check-rows', overflowingRows === 0, `${overflowingRows} filas se salen`);

const widths = all('.avatar').map((avatar) => Math.round(avatar.getBoundingClientRect().width));
check('check-avatars', widths.every((width) => width === 32), `anchos: ${widths.join(', ')}px`);

const [previous, next] = all('.panel-footer a').map((link) => link.getBoundingClientRect());
const footerStyle = getComputedStyle(document.querySelector('.panel-footer'));
const footerRight = box('.panel-footer').right - parseFloat(footerStyle.paddingRight);
const inOrder = previous.left < next.left;
const atRight = Math.abs(footerRight - next.right) <= 1;
check('check-footer', inOrder && atRight, `${inOrder ? '«Anterior» primero' : '«Siguiente» primero'}, ${atRight ? 'a la derecha' : 'no está a la derecha'}`);
```
