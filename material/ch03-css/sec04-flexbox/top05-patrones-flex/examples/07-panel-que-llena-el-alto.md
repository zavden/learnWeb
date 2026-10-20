---
example_description: "Un panel de filtros de alto fijo: cabecera y pie a su medida y un cuerpo con flex: 1 que ocupa exactamente el alto restante y se desplaza si no cabe"
example_tags: "css|flexbox|columna|overflow|min-height|scroll|patrones"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<p class="label">El mismo panel con 200px y 280px de alto: la cabecera y el pie no cambian; el cuerpo se queda con el resto. ↕ En el primero, desplaza el cuerpo.</p>

<aside class="filters" aria-labelledby="filters-title-a">
  <header class="filters-header"><h3 id="filters-title-a">Filtros</h3><span>3 activos</span></header>
  <form class="filters-body" id="filters-a" action="/plantas">
    <fieldset><legend>Luz</legend>
      <label><input type="checkbox" name="luz" value="sombra" checked> Sombra</label>
      <label><input type="checkbox" name="luz" value="indirecta" checked> Luz indirecta</label>
      <label><input type="checkbox" name="luz" value="sol"> Sol directo</label>
    </fieldset>
    <fieldset><legend>Tamaño</legend>
      <label><input type="checkbox" name="tamano" value="mini" checked> Mini (hasta 15 cm)</label>
      <label><input type="checkbox" name="tamano" value="mediana"> Mediana</label>
      <label><input type="checkbox" name="tamano" value="grande"> Grande</label>
    </fieldset>
  </form>
  <footer class="filters-footer"><button type="reset" form="filters-a">Limpiar</button><button form="filters-a">Aplicar</button></footer>
</aside>

<aside class="filters is-tall" aria-labelledby="filters-title-b">
  <header class="filters-header"><h3 id="filters-title-b">Filtros</h3><span>3 activos</span></header>
  <form class="filters-body" id="filters-b" action="/plantas">
    <fieldset><legend>Luz</legend>
      <label><input type="checkbox" name="luz" value="sombra" checked> Sombra</label>
      <label><input type="checkbox" name="luz" value="indirecta" checked> Luz indirecta</label>
      <label><input type="checkbox" name="luz" value="sol"> Sol directo</label>
    </fieldset>
    <fieldset><legend>Tamaño</legend>
      <label><input type="checkbox" name="tamano" value="mini" checked> Mini (hasta 15 cm)</label>
      <label><input type="checkbox" name="tamano" value="mediana"> Mediana</label>
      <label><input type="checkbox" name="tamano" value="grande"> Grande</label>
    </fieldset>
  </form>
  <footer class="filters-footer"><button type="reset" form="filters-b">Limpiar</button><button form="filters-b">Aplicar</button></footer>
</aside>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 0 0 6px;
  font-size: 0.8rem;
}

/* Dos paneles uno al lado del otro (inline-block, alineados arriba). */
.filters {
  display: inline-flex;
  vertical-align: top;
  flex-direction: column;
  width: 200px;
  height: 200px;
  margin-right: 8px;
  outline: 2px dashed #7c3aed;
  font-size: 0.8rem;
}

.filters.is-tall {
  height: 280px;
}

/* Cabecera y pie: a la medida de su contenido (flex: 0 1 auto, el valor inicial). */
.filters-header,
.filters-footer {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  background: #f0fdf4;
}

.filters-header h3 {
  margin: 0;
  font-size: 0.9rem;
}

.filters-header span {
  margin-left: auto;
  color: #166534;
}

/* El cuerpo se queda con TODO el alto que dejan la cabecera y el pie, sea cual sea el
   alto del panel, y se desplaza si su contenido no cabe. Sin cuentas ni max-height:
   compáralo con el panel lateral del módulo 2, que necesitaba un min() a ojo.
   min-height: 0 no hace falta aquí (un contenedor de scroll no tiene mínimo automático),
   pero se escribe de serie: si un día el overflow pasa a un hijo, el panel no se rompe. */
.filters-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 0 8px;
}

.filters-body fieldset {
  margin: 6px 0;
  padding: 0;
  border: 0;
}

.filters-body legend {
  font-weight: bold;
}

.filters-body label {
  display: block;
  padding: 2px 0;
}

/* Los dos botones se reparten el pie a partes iguales (lección 3). */
.filters-footer button {
  flex: 1;
  padding: 5px;
  border: 1px solid #166534;
  border-radius: 6px;
  background: #ffffff;
  color: #166534;
  font: inherit;
}

.filters-footer button:last-child {
  background: #166534;
  color: #ffffff;
}

.filters :focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: -3px;
}
```
