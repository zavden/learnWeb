---
exercise: true
exercise_title: "Arregla la página del taller"
exercise_instructions: "La cabecera debería ocupar las tres columnas y ocupa dos (TODO 1) || La rejilla tiene tres columnas, pero aparece una cuarta: la barra lateral está en una línea que no existe (TODO 2) || La barra lateral es sticky pero no se pega al desplazar: la fila la estira (TODO 3) || En la tarjeta de la entrada, de alto fijo, el título y el precio crecen sin motivo: que el sobrante vaya al precio y el botón quede abajo (TODO 4) || Comprueba que las cuatro líneas de la lista marcan ✅ y que, al desplazar, la entrada se queda arriba"
exercise_hints: "Con N columnas, la última línea es la N + 1, o la -1 || La última columna empieza en la penúltima línea || Un elemento estirado mide lo mismo que su celda; ¿qué valor de align-self lo deja a su medida? || Las filas auto de un contenedor con alto se reparten el sobrante (align-content: normal). Di tú qué fila se lo queda"
exercise_solution_example: 10-ej-arregla-la-pagina-del-taller-solucion.md
exercise_locked_files: index.html,script.js
example_stage: exercise
console: true
example_description: "Ejercicio: la página de un taller con cuatro errores de grid (una línea final mal contada, una columna implícita, un sticky estirado y filas auto que se estiran) que un pequeño script comprueba en directo"
example_tags: "css|ejercicio|grid|lineas|grid-implicito|sticky|align-content"
---

# HTML

```html
<div class="viewport" tabindex="0" role="region" aria-label="Página del taller de terrarios">
  <div class="event-page">
    <header class="banner">
      <p class="kicker">Taller presencial · Monterrey</p>
      <h2>Terrarios cerrados: un ecosistema en un frasco</h2>
    </header>

    <article class="details">
      <h3>Qué aprenderás</h3>
      <p>A elegir el frasco y las plantas: musgos, fitonias y helechos pequeños que soportan la humedad alta.</p>
      <p>A montar las capas de drenaje, carbón activado y sustrato para que el agua no se pudra.</p>
      <p>A cerrarlo y cuidarlo: un terrario bien hecho se riega una o dos veces al año.</p>
      <h3>Qué incluye</h3>
      <p>Todo el material, un frasco de 3 litros y café de olla. Duración: tres horas, el sábado 24 de octubre a las 10:00.</p>
    </article>

    <aside class="sidebar">
      <section class="ticket" aria-labelledby="ticket-title">
        <h3 id="ticket-title" class="ticket-title">Entrada</h3>
        <p class="ticket-price">450 MXN</p>
        <a class="ticket-button" href="/talleres/terrarios/inscripcion">Inscribirme</a>
      </section>
    </aside>
  </div>
</div>

<ul class="checklist">
  <li>La cabecera, a todo el ancho: <output id="check-banner">…</output></li>
  <li>Tres columnas, ni una más: <output id="check-columns">…</output></li>
  <li>La barra lateral, a su medida: <output id="check-sidebar">…</output></li>
  <li>El título de la entrada, a su medida: <output id="check-ticket">…</output></li>
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
  outline-offset: 2px;
}

/* La «ventana» de la página, con su propio scroll. */
.viewport {
  max-width: 400px;
  height: 260px;
  overflow-y: auto;
  border: 1px solid #94a3b8;
}

/* Tres columnas: dos para el artículo y una de 8rem para la barra lateral. */
.event-page {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr)) 8rem;
  gap: 10px;
  padding: 10px;
}

/* TODO 1: la cabecera debería ir de la primera línea a la última. */
.banner {
  grid-column: 1 / 3;
  padding: 10px;
  background: #134e4a;
  color: #ffffff;
}

.banner h2 {
  margin: 0;
  font-size: 1.1rem;
}

.kicker {
  margin: 0 0 4px;
  color: #99f6e4;
  font-weight: bold;
}

.details {
  grid-column: 1 / 3;
}

.details h3 {
  margin: 0 0 4px;
  font-size: 0.95rem;
}

.details p {
  margin: 0 0 8px;
  line-height: 1.5;
}

/* TODO 2: «la última columna» no empieza en la línea 4.
   TODO 3: sticky necesita recorrido; ahora la fila lo estira hasta el alto del
   artículo. */
.sidebar {
  grid-column: 4;
  position: sticky;
  top: 0;
}

/* TODO 4: una tarjeta de alto fijo con tres filas auto: se reparten el sobrante.
   El precio debería quedarse con él y el botón, abajo. */
.ticket {
  display: grid;
  gap: 6px;
  height: 10rem;
  padding: 8px;
  border: 2px solid #0f766e;
  border-radius: 8px;
  background: #f0fdfa;
}

.ticket > * {
  margin: 0;
}

.ticket-title {
  padding: 0;
  background: #ccfbf1;
  font-size: 0.9rem;
}

.ticket-price {
  font-size: 1.2rem;
  font-weight: bold;
}

.ticket-button {
  padding: 4px;
  border-radius: 999px;
  background: #0f766e;
  color: #ffffff;
  font-weight: bold;
  text-align: center;
  text-decoration: none;
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

const page = document.querySelector('.event-page');
const pageStyle = getComputedStyle(page);
const contentWidth = page.clientWidth - parseFloat(pageStyle.paddingLeft) - parseFloat(pageStyle.paddingRight);
const bannerWidth = box('.banner').width;
check('check-banner', Math.abs(bannerWidth - contentWidth) < 1,
  `mide ${Math.round(bannerWidth)} px de ${Math.round(contentWidth)}`);

const columns = pageStyle.gridTemplateColumns.split(' ');
check('check-columns', columns.length === 3, `${columns.length} columnas`);

const sidebarHeight = box('.sidebar').height;
const detailsHeight = box('.details').height;
check('check-sidebar', sidebarHeight < detailsHeight - 1,
  `${Math.round(sidebarHeight)} px de alto (el artículo: ${Math.round(detailsHeight)})`);

// Alto de la caja del título frente al alto de su texto.
const title = document.querySelector('.ticket-title');
const range = document.createRange();
range.selectNodeContents(title);
const extra = title.getBoundingClientRect().height - range.getBoundingClientRect().height;
check('check-ticket', extra < 6, `le sobran ${Math.round(extra)} px`);
```
