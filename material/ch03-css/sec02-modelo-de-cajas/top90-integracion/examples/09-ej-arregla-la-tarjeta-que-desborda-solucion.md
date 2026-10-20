---
example_stage: final-solution
example_description: "Solución: reset de box-sizing, max-width: 100% con height: auto, la receta de tres propiedades del «…» y min-height en lugar de height"
example_tags: "css|solucion|box-sizing|max-width|text-overflow|min-height"
---

# HTML

```html
<article class="event">
  <img class="event-image" src="concert.svg" width="800" height="400" alt="Escenario al aire libre iluminado al atardecer, con público delante">
  <h2 class="event-title" title="Concierto de la Orquesta Sinfónica de Castilla y León en la Plaza Mayor">Concierto de la Orquesta Sinfónica de Castilla y León en la Plaza Mayor</h2>
  <p class="event-text">Programa: Dvořák, Sinfonía n.º 9, «Del Nuevo Mundo». Entrada libre hasta completar el aforo; te recomendamos llegar media hora antes.</p>
  <p class="event-date">Sábado 14 de noviembre · 20:30</p>
  <a class="event-button" href="#">Reservar asiento</a>
</article>

<ul class="checklist">
  <li>El botón no asoma por la derecha de la tarjeta.</li>
  <li>La imagen cabe en la tarjeta y no se deforma.</li>
  <li>El título ocupa una sola línea y termina en «…».</li>
  <li>El texto no se monta sobre la fecha: la caja crece si hace falta.</li>
</ul>
```

# CSS

```css
/* ✅ 1: width mide de borde a borde en todo. Arregla el botón (100% + padding + borde)
   y también la propia tarjeta, que con content-box medía 100% + 2rem + 2px
   y desbordaba la vista previa al estrecharla. */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: #1e293b;
}

.event {
  width: min(100%, 20rem);
  padding: 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 12px;
  background: #ffffff;
}

/* ✅ 2: como mucho el ancho del contenedor; height: auto recalcula el alto con la
   proporción de los atributos width y height (sin él, la imagen se aplastaría). */
.event-image {
  display: block;
  max-width: 100%;
  height: auto;
  border-radius: 8px;
}

/* ✅ 3: la receta completa. El texto entero sigue en el HTML (y en el title). */
.event-title {
  margin: 0.75rem 0 0.25rem;
  font-size: 1.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ✅ 4: al menos 3rem, pero crece con el texto. */
.event-text {
  min-height: 3rem;
  margin: 0;
  color: #475569;
}

.event-date {
  margin: 0.5rem 0 1rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  background: #fef3c7;
  font-weight: 600;
}

.event-button {
  display: inline-block;
  width: 100%;
  padding: 0.6rem 1rem;
  border: 2px solid #1d4ed8;
  border-radius: 8px;
  background: #1d4ed8;
  color: #ffffff;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
}

.event-button:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 3px;
}

.checklist {
  max-width: 30rem;
  color: #475569;
}
```
