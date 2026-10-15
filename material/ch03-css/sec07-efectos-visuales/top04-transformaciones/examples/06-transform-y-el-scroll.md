---
example_description: "Un menú escondido fuera de la pantalla con translateX(100%) no ocupa sitio en el layout, pero sí cuenta para el scroll: la página se puede desplazar de lado. En un Mac, con barras de desplazamiento ocultas, ni se nota. overflow-x: clip en su contenedor lo arregla"
example_tags: "css|transformaciones|translate|overflow|scroll|menu-lateral|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">Dos «móviles» de 220px con un menú lateral escondido a la derecha (<code>translateX(100%)</code>). Desliza cada pantalla de lado con el trackpad (o <kbd>Shift</kbd> + rueda).</p>
<div class="phones">
  <figure class="case">
    <div class="phone">
      <div class="page">
        <p class="title">Mercado de San Juan</p>
        <p>Frutas, quesos y especias desde 1850.</p>
        <nav class="drawer" aria-label="Menú">Inicio · Puestos · Horarios</nav>
      </div>
    </div>
    <figcaption>❌ La pantalla se desliza y aparece el menú</figcaption>
    <output class="readout"></output>
  </figure>
  <figure class="case">
    <div class="phone">
      <div class="page is-clipped">
        <p class="title">Mercado de San Juan</p>
        <p>Frutas, quesos y especias desde 1850.</p>
        <nav class="drawer" aria-label="Menú">Inicio · Puestos · Horarios</nav>
      </div>
    </div>
    <figcaption>✅ <code>overflow-x: clip</code> en la página</figcaption>
    <output class="readout"></output>
  </figure>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 0 0 8px;
  font-size: 0.72rem;
}

.phones {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.case {
  margin: 0;
  font-size: 0.7rem;
}

/* La «pantalla»: un contenedor de scroll, como la ventana de un móvil. */
.phone {
  width: 220px;
  height: 150px;
  overflow: auto;
  border: 6px solid #1e293b;
  border-radius: 14px;
}

.page {
  position: relative;
  min-height: 100%;
  padding: 8px;
  box-sizing: border-box;
  background: #fef3c7;
  font-size: 0.8rem;
}

.page p {
  margin: 0 0 6px;
}

.title {
  font-weight: 700;
}

/* El menú ocupa el 75 % de la pantalla y se esconde a la derecha. (Un menú
   cerrado de verdad lleva además visibility: hidden o el atributo inert, para
   que el teclado y el lector de pantalla no entren en él.) */
.drawer {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  width: 75%;
  padding: 8px;
  box-sizing: border-box;
  background: #1e3a8a;
  color: #ffffff;
  transform: translateX(100%);
}

/* 🐛 transform no ocupa sitio en el layout, pero el área de SCROLL incluye
   las cajas transformadas: el contenedor de scroll calcula hasta dónde llega
   lo que pinta, y el menú llega 156px (su propio ancho) más allá del borde.
   (Hacia la izquierda o hacia arriba no pasa: no se puede desplazar a
   coordenadas negativas.) */

/* ✅ overflow-x: clip recorta lo que se sale por los lados SIN convertir la
   página en un contenedor de scroll (a diferencia de hidden), así que no
   rompe position: sticky ni crea otra barra. */
.is-clipped {
  overflow-x: clip;
}

.readout {
  display: block;
  margin-top: 2px;
  font-family: ui-monospace, Menlo, monospace;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript (módulo del DOM). Mide cuánto contenido hay en cada
// pantalla (scrollWidth) frente a lo que cabe (clientWidth).
for (const caseFigure of document.querySelectorAll('.case')) {
  const phone = caseFigure.querySelector('.phone');
  caseFigure.querySelector('.readout').textContent =
    `scrollWidth ${phone.scrollWidth} · clientWidth ${phone.clientWidth}`;
}
```
