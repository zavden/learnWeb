---
example_description: "Una tabla ancha dentro de un contenedor con overflow-x: auto se desplaza en horizontal sin romper la página; tabindex lo hace accesible con teclado"
example_tags: "css|overflow|tablas|accesibilidad|responsive"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<!-- role="region" + aria-label + tabindex="0": quien navega con teclado puede enfocar
     el contenedor y desplazarlo con las flechas. -->
<div class="table-scroll" role="region" aria-label="Resultados trimestrales" tabindex="0">
  <table>
    <caption>Resultados trimestrales 2026 (miles de €)</caption>
    <thead>
      <tr><th scope="col">Región</th><th scope="col">T1</th><th scope="col">T2</th><th scope="col">T3</th><th scope="col">T4</th><th scope="col">Total</th><th scope="col">Variación</th></tr>
    </thead>
    <tbody>
      <tr><th scope="row">Norte</th><td>1240</td><td>1310</td><td>1295</td><td>1402</td><td>5247</td><td>+6,1 %</td></tr>
      <tr><th scope="row">Sur</th><td>980</td><td>1022</td><td>1100</td><td>1187</td><td>4289</td><td>+9,4 %</td></tr>
    </tbody>
  </table>
</div>
<p>Estrecha la vista previa: la tabla se desplaza sola, la página no.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
}

.table-scroll {
  max-width: 100%;
  overflow-x: auto;
  border: 1px solid #cbd5e1;
}

.table-scroll:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

table {
  border-collapse: collapse;
  min-width: 640px;             /* más ancha que un móvil, a propósito */
}

th,
td {
  padding: 6px 12px;
  border-bottom: 1px solid #e2e8f0;
  text-align: right;
  white-space: nowrap;
}

th[scope="row"] {
  text-align: left;
}
```
