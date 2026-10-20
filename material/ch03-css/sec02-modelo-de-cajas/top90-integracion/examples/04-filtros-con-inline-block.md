---
example_description: "Filtros en forma de chip: etiquetas inline-block que saltan de línea como palabras, un borde reservado para el estado marcado y contadores que pasan de círculo a píldora con min-width"
example_tags: "css|display|inline-block|margin|border|has"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<form class="filters" aria-labelledby="filters-title">
  <h2 id="filters-title">Filtra las recetas</h2>

  <fieldset>
    <legend>Tipo de plato</legend>
    <label class="chip"><input type="checkbox" name="type" value="starters"> Entrantes <span class="count">12</span></label>
    <label class="chip"><input type="checkbox" name="type" value="soups" checked> Sopas y cremas <span class="count">8</span></label>
    <label class="chip"><input type="checkbox" name="type" value="rice"> Arroces <span class="count">23</span></label>
    <label class="chip"><input type="checkbox" name="type" value="desserts"> Postres <span class="count">104</span></label>
  </fieldset>

  <fieldset>
    <legend>Dieta</legend>
    <label class="chip"><input type="checkbox" name="diet" value="vegetarian" checked> Vegetariana <span class="count">31</span></label>
    <label class="chip"><input type="checkbox" name="diet" value="gluten-free"> Sin gluten <span class="count">9</span></label>
    <label class="chip"><input type="checkbox" name="diet" value="nut-free"> Apta para personas con alergia a los frutos secos <span class="count">57</span></label>
  </fieldset>

  <button class="reset" type="reset">Quitar los filtros</button>
</form>
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
}

.filters {
  max-width: 34rem;
}

.filters h2 {
  margin: 0 0 0.75rem;
  font-size: 1.25rem;
}

/* fieldset trae borde, relleno y márgenes del navegador. Además lleva
   min-inline-size: min-content: un contenido muy ancho lo estiraría fuera de la página. */
fieldset {
  min-inline-size: 0;
  margin: 0 0 1rem;
  padding: 0;
  border: 0;
}

legend {
  margin-bottom: 0.5rem;
  padding: 0;
  font-weight: 700;
}

/* label es inline: con su display por defecto, el padding vertical se pintaría encima
   de la fila de arriba sin apartarla (lección 2). inline-block: en la línea por fuera,
   bloque por dentro. Los chips saltan de línea como si fueran palabras. */
.chip {
  display: inline-block;
  max-width: 100%;                 /* un texto larguísimo se parte dentro del chip */
  margin: 0 0.25rem 0.5rem 0;      /* el margen inferior separa las filas al partirse */
  padding: 0.35rem 0.75rem 0.35rem 0.5rem;
  border: 2px solid #64748b;       /* el grosor nunca cambia: solo el color */
  border-radius: 1.25rem;          /* con una sola línea es una píldora; con dos, sigue legible */
  background: #ffffff;
  cursor: pointer;
}

/* Entre chip y chip hay, además del margen, un espacio: el salto de línea del HTML,
   que entre cajas en línea vale lo que un espacio (lección 2). */

.chip:hover {
  border-color: #1e293b;
}

/* Estado marcado con :has() (módulo 1): cambian colores, no tamaños. Nada salta. */
.chip:has(:checked) {
  border-color: #1d4ed8;
  background: #eff6ff;
  color: #1e3a8a;
}

/* El foco lo recibe la casilla, pero el anillo se dibuja en todo el chip.
   outline no ocupa sitio: los vecinos no se mueven (lección 1). */
.chip:has(:focus-visible) {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

.chip input {
  margin: 0 0.35rem 0 0;
}

/* min-width + radio de píldora: con un dígito es un círculo; con tres, una píldora.
   La caja crece con su contenido y nunca baja del mínimo (lección 4). */
.count {
  display: inline-block;
  min-width: 1.6em;
  margin-left: 0.25rem;
  padding: 0 0.4em;
  border-radius: 999px;
  background: #e2e8f0;
  color: #334155;
  font-size: 0.8em;
  text-align: center;
}

.chip:has(:checked) .count {
  background: #1d4ed8;
  color: #ffffff;
}

/* Botón con aspecto de enlace. El borde transparente está reservado: si algún día
   se le pone color en :hover, el botón no cambiará de tamaño. */
.reset {
  padding: 0.35rem 0.5rem;
  border: 2px solid transparent;
  border-radius: 8px;
  background: none;
  color: #1d4ed8;
  font: inherit;
  text-decoration: underline;
  cursor: pointer;
}

.reset:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}
```
