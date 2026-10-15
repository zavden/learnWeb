---
example_description: "display: grid con tres columnas, dos filas y gap: las pistas, las líneas numeradas, las celdas y el hueco entre pistas; los hijos ocupan una celda cada uno en el orden del HTML"
example_tags: "css|grid|display|grid-template-columns|grid-template-rows|gap|lineas"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="label">Tres columnas de <code>1fr</code> y dos filas de 60px, con <code>gap: 20px</code>. Los números de arriba y de la izquierda son las <strong>líneas</strong> de la rejilla; las franjas rayadas, el <code>gap</code>.</p>

<div class="grid">
  <div><b>1</b>fila 1 · columna 1</div>
  <div><b>2</b>fila 1 · columna 2</div>
  <div><b>3</b>fila 1 · columna 3</div>
  <div><b>4</b>fila 2 · columna 1</div>
  <div><b>5</b>fila 2 · columna 2</div>
  <div><b>6</b>fila 2 · columna 3</div>
</div>

<p class="caption">Cada hijo ocupa una <strong>celda</strong>, en el orden del HTML: la fila 1 de izquierda a derecha y después la fila 2. Las columnas quedan alineadas de arriba abajo, cosa que <code>flex-wrap</code> no podía garantizar.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label,
.caption {
  margin: 8px 0;
  font-size: 0.8rem;
}

/* display: grid en el PADRE: sus hijos directos pasan a ser elementos grid.
   - grid-template-columns define las PISTAS verticales (columnas);
   - grid-template-rows, las horizontales (filas);
   - gap separa las pistas entre sí, nunca en los bordes.
   Entre pista y pista hay una LÍNEA, numerada desde 1: con 3 columnas hay 4 líneas
   verticales; con 2 filas, 3 horizontales. Con gap, la línea «engorda» y ocupa el hueco. */
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-template-rows: 60px 60px;
  gap: 20px;
  width: 400px;                        /* 400 − 2 × 20 = 360 → 120 por columna */
  padding: 18px 8px 6px 18px;          /* sitio para los números de línea */
  /* El fondo es solo un dibujo que imita el overlay de grid de DevTools:
     líneas discontinuas, huecos rayados y números. */
  background: url(grid-3x2.svg) no-repeat;
}

/* Los elementos grid: nadie les ha dicho dónde ir, así que el navegador los coloca
   uno por celda. Se estiran hasta llenar su celda en los dos ejes. */
.grid > div {
  border: 1px solid #0f766e;
  background: #ccfbf1;
  font-size: 0.7rem;
  text-align: center;
}

.grid b {
  display: block;
  font-size: 1.1rem;
}
```
