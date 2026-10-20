---
exercise: true
exercise_title: "Arregla la tarjeta que desborda"
exercise_instructions: "Haz que todas las cajas midan de borde a borde con el reset de box-sizing (TODO 1): el botón deja de asomar por la derecha || Haz que la imagen nunca sea más ancha que la tarjeta y conserve su proporción (TODO 2) || Deja el título en una sola línea terminada en «…» (TODO 3) || Cambia la altura fija del texto por un mínimo para que no pise la fecha (TODO 4) || Estrecha la vista previa y comprueba los cuatro puntos de la lista"
exercise_hints: "Los pseudoelementos no los elige el selector universal: nómbralos aparte || Una imagen con max-width necesita height: auto para no deformarse || text-overflow no recorta nada por sí solo: necesita a white-space y a overflow || min-height garantiza un tamaño y deja crecer la caja"
exercise_solution_example: 09-ej-arregla-la-tarjeta-que-desborda-solucion.md
exercise_locked_files: index.html
example_stage: exercise
example_description: "Ejercicio: una tarjeta de evento con cuatro desbordamientos (botón al 100 %, imagen enorme, título largo y altura fija) que se arreglan solo con el modelo de cajas"
example_tags: "css|ejercicio|box-sizing|max-width|text-overflow|min-height"
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
/* TODO 1: añade aquí el reset que hace que width mida de borde a borde
   en todos los elementos y pseudoelementos. */

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

/* TODO 2: la imagen mide 800px y se sale de la tarjeta.
   Que nunca pase del ancho de su contenedor y que conserve su proporción. */
.event-image {
  display: block;
  border-radius: 8px;
}

/* TODO 3: una sola línea terminada en «…». Hacen falta tres propiedades. */
.event-title {
  margin: 0.75rem 0 0.25rem;
  font-size: 1.125rem;
}

/* TODO 4: con esta altura fija, el texto se sale por abajo y pisa la fecha. */
.event-text {
  height: 3rem;
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

/* Este bloque NO hay que tocarlo: el TODO 1 lo arregla. */
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
