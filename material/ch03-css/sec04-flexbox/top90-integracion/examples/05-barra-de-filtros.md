---
example_description: "La cabecera de un listado: título y contador alineados por la línea base, orden empujado a la derecha, filtros en fichas que se reparten en líneas y filtros activos que se pueden quitar"
example_tags: "css|flexbox|filtros|flex-wrap|gap|baseline|has|formularios"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<section class="results" aria-labelledby="results-title">
  <div class="results-header">
    <h2 id="results-title">Plantas de interior</h2>
    <p class="count">128 resultados</p>
    <label class="sort">Ordenar por
      <select name="orden" form="filters">
        <option>Más vendidas</option>
        <option>Precio: de menor a mayor</option>
        <option>Novedades</option>
      </select>
    </label>
  </div>

  <form class="filters" id="filters" action="/plantas/interior">
    <fieldset>
      <legend>Luz</legend>
      <div class="chips">
        <label class="chip"><input type="checkbox" name="luz" value="sombra" checked> Sombra</label>
        <label class="chip"><input type="checkbox" name="luz" value="indirecta" checked> Luz indirecta</label>
        <label class="chip"><input type="checkbox" name="luz" value="sol"> Sol directo</label>
      </div>
    </fieldset>
    <fieldset>
      <legend>Cuidados</legend>
      <div class="chips">
        <label class="chip"><input type="checkbox" name="cuidados" value="facil"> Fácil</label>
        <label class="chip"><input type="checkbox" name="cuidados" value="mascotas"> Apta para mascotas</label>
        <label class="chip"><input type="checkbox" name="cuidados" value="purificadora"> Purifica el aire</label>
        <label class="chip"><input type="checkbox" name="cuidados" value="colgante"> Colgante</label>
      </div>
    </fieldset>
  </form>

  <div class="active">
    <p class="active-label">Filtros activos:</p>
    <ul class="active-list">
      <li>Sombra <button type="button" aria-label="Quitar el filtro Sombra">✕</button></li>
      <li>Luz indirecta <button type="button" aria-label="Quitar el filtro Luz indirecta">✕</button></li>
    </ul>
    <a class="clear" href="/plantas/interior">Borrar todo</a>
  </div>
</section>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

button,
select,
input {
  font: inherit;
}

:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

.results {
  max-width: 30rem;
  font-size: 0.8rem;
}

/* Título y contador apoyados en la misma línea base (letras de distinto tamaño) y el
   selector de orden al final de la línea. Si no cabe, baja y sigue a la derecha. */
.results-header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 4px 10px;
  margin-bottom: 8px;
}

.results-header h2 {
  margin: 0;
  font-size: 1.25rem;
}

.count {
  margin: 0;
  color: #475569;
}

.sort {
  margin-left: auto;
}

.sort select {
  margin-left: 4px;
  padding: 3px 6px;
  border: 1px solid #64748b;
  border-radius: 6px;
}

.filters fieldset {
  margin: 0 0 6px;
  padding: 0;
  border: 0;
}

.filters legend {
  margin-bottom: 4px;
  font-weight: bold;
}

/* Las fichas: tantas por línea como quepan, separadas igual en las dos direcciones. */
.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

/* Cada ficha centra su casilla y su texto con inline-flex. */
.chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px 3px 6px;
  border: 1px solid #64748b;
  border-radius: 999px;
  cursor: pointer;
}

.chip input {
  margin: 0;
}

/* La ficha marcada se resalta entera (:has, del módulo de fundamentos). */
.chip:has(:checked) {
  border-color: #166534;
  background: #dcfce7;
  color: #14532d;
  font-weight: 600;
}

/* Filtros activos: etiqueta, lista que se reparte en líneas y «Borrar todo» al final. */
.active {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 10px;
  padding-top: 8px;
  border-top: 1px solid #cbd5e1;
}

.active-label {
  margin: 0;
  color: #475569;
}

.active-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.active-list li {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 4px 2px 10px;
  border-radius: 999px;
  background: #1e3a8a;
  color: #ffffff;
}

/* Un botón cuadrado con la ✕ en el centro exacto (patrón de centrado). */
.active-list button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: #ffffff;
  color: #1e3a8a;
  font-size: 0.65rem;
}

.clear {
  margin-left: auto;
  color: #1d4ed8;
}
```
