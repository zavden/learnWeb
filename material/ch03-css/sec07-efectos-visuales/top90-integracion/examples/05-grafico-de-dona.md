---
example_description: "Un gráfico de dona: un conic-gradient con paradas duras y el agujero hecho con una máscara radial; el total va en un hermano superpuesto en la misma celda de grid (la máscara se comería el texto), y los datos están en una tabla accesible de la que el gráfico es solo un resumen visual"
example_tags: "css|integracion|conic-gradient|mask-image|tablas|accesibilidad|grafico"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<figure class="report">
  <figcaption>Visitantes del museo por sala, octubre</figcaption>
  <div class="layout">
    <!-- El gráfico resume la tabla: para el lector de pantalla, la tabla basta. -->
    <div class="chart" aria-hidden="true">
      <div class="donut"></div>
      <p class="total"><strong>3480</strong>visitantes</p>
    </div>
    <table class="data">
      <thead>
        <tr><th scope="col">Sala</th><th scope="col">Visitantes</th><th scope="col">%</th></tr>
      </thead>
      <tbody>
        <tr><th scope="row"><span class="key k1"></span>Paisaje mexicano</th><td>1392</td><td>40</td></tr>
        <tr><th scope="row"><span class="key k2"></span>Grabado japonés</th><td>870</td><td>25</td></tr>
        <tr><th scope="row"><span class="key k3"></span>Fotografía espacial</th><td>696</td><td>20</td></tr>
        <tr><th scope="row"><span class="key k4"></span>Taller infantil</th><td>522</td><td>15</td></tr>
      </tbody>
      <tfoot>
        <tr><th scope="row">Total</th><td>3480</td><td>100</td></tr>
      </tfoot>
    </table>
  </div>
</figure>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.report {
  --c1: #1e3a8a;
  --c2: #fcd34d;
  --c3: #0e7490;
  --c4: #fbcfe8;
  max-width: 440px;
  margin: 0;
}

.report figcaption {
  margin-bottom: 10px;
  font-weight: 700;
}

.layout {
  display: flex;
  flex-wrap: wrap;
  gap: 16px 20px;
  align-items: center;
}

/* El gráfico: la dona y el total, uno encima del otro en la misma celda. */
.chart {
  display: grid;
  place-items: center;
  flex: none;
  width: 160px;
  aspect-ratio: 1;
}

.chart > * {
  grid-area: 1 / 1;
}

/* 1. conic-gradient con paradas duras: cada parada dice dónde ACABA su
      porción (40, 65, 85, 100 %), y el «0» se ajusta a la anterior.
   2. mask-image con un radial-gradient: transparente hasta el 58 % del radio
      (el agujero) y opaco después, con medio punto de transición para que el
      borde interior no salga dentado.
   Los colores alternan oscuro y claro: cada porción contrasta al menos 3.7:1
   con sus vecinas. */
.donut {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(
    var(--c1) 0 40%,
    var(--c2) 0 65%,
    var(--c3) 0 85%,
    var(--c4) 0
  );
  mask-image: radial-gradient(circle closest-side, transparent 58%, black 58.5%);
}

/* 3. El total es un HERMANO de la dona, no un hijo: dentro de ella, la
      máscara lo haría transparente junto con el agujero. */
.total {
  display: grid;
  margin: 0;
  font-size: 0.75rem;
  text-align: center;
}

.total strong {
  font-size: 1.3rem;
  font-variant-numeric: tabular-nums;
}

.data {
  flex: 1;
  min-width: 220px;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.data th,
.data td {
  padding: 4px 6px;
  border-bottom: 1px solid #e2e8f0;
  text-align: start;
}

.data td {
  font-variant-numeric: tabular-nums;
  text-align: end;
}

.data thead th:not(:first-child) {
  text-align: end;
}

.data thead th {
  font-size: 0.75rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.data tbody th {
  font-weight: 500;
}

.data tfoot th,
.data tfoot td {
  border-bottom: 0;
  font-weight: 700;
}

.key {
  display: inline-block;
  width: 10px;
  height: 10px;
  margin-inline-end: 6px;
  border-radius: 2px;
  box-shadow: inset 0 0 0 1px rgb(15 23 42 / 0.3);
}

.k1 { background: var(--c1); }
.k2 { background: var(--c2); }
.k3 { background: var(--c3); }
.k4 { background: var(--c4); }
```
