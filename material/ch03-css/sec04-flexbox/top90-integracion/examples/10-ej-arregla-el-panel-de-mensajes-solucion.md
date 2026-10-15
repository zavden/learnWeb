---
example_stage: final-solution
example_description: "Solución: min-height: 0 en el cuerpo intermedio, min-width: 0 en el texto de cada fila, flex-shrink: 0 en los avatares y justify-content: flex-end en el pie"
example_tags: "css|solucion|flexbox|min-height|min-width|flex-shrink|justify-content"
console: true
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

/* ✅ 1: el elemento flex intermedio, sin overflow, tenía min-height: auto (el alto de
   toda la lista). Con 0 encoge, la lista se queda con el hueco y su scroll se activa. */
.panel-body {
  min-height: 0;
}

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

/* ✅ 3: width es solo la base; sin flex-shrink: 0, el avatar encoge junto al texto. */
.avatar {
  flex-shrink: 0;
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

/* ✅ 2: el elemento flex de la fila es .thread-text: su mínimo era la frase entera.
   Con min-width: 0 encoge y el p de dentro ya puede mostrar su «…». */
.thread-text {
  flex: auto;
  min-width: 0;
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

/* ✅ 4: justify-content los lleva a la derecha sin tocar el orden del HTML: lo que se
   ve y lo que recorre el tabulador vuelven a coincidir. */
.panel-footer {
  display: flex;
  justify-content: flex-end;
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
