---
example_description: "Cuando las pistas no llenan el contenedor, justify-content mueve la rejilla entera; con space-between los huecos crecen, y un elemento que abarca dos columnas se ensancha con ellos"
example_tags: "css|grid|justify-content|align-content|space-between|alineacion"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption">Tres columnas de 80px y <code>gap: 10px</code> = 260 en un contenedor de 400: sobran <strong>140</strong>. Por defecto, al final.</p>
<div class="grid">
  <div>80</div><div>80</div><div>80</div>
  <div class="wide">span 2 · 170</div><div>80</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<p class="caption"><code>justify-content: center</code>: 70 a cada lado; las pistas no cambian</p>
<div class="grid is-center">
  <div>80</div><div>80</div><div>80</div>
  <div class="wide">span 2 · 170</div><div>80</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">

<p class="caption"><code>justify-content: space-between</code>: cada hueco pasa de 10 a 10 + 70 = <strong>80</strong>, y el elemento ancho, a 80 + 80 + 80 = <strong>240</strong></p>
<div class="grid is-between">
  <div>80</div><div>80</div><div>80</div>
  <div class="wide">span 2 · 240</div><div>80</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 6px 0 4px;
  font-size: 0.75rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(3, 80px);
  gap: 6px 10px;
  width: 400px;
  outline: 2px dashed #0f766e;
  background: url(hatch.svg);
}

.ruler {
  display: block;
  margin-top: 3px;
}

.grid > div {
  padding: 4px 0;
  border: 1px solid #0f766e;
  background: #ccfbf1;
  font-size: 0.75rem;
  font-weight: bold;
  text-align: center;
}

.grid > .wide {
  grid-column: span 2;
  border-color: #b45309;
  background: #fef3c7;
}

/* *-items coloca cada elemento dentro de su celda; *-content mueve las PISTAS dentro
   del contenedor, cuando entre todas no lo llenan (pistas fijas o de contenido; con
   alguna fr no sobra nada). Valores, los de flexbox: start, center, end,
   space-between, space-around, space-evenly. */
.is-center {
  justify-content: center;
}

/* space-between reparte lo que sobra ENTRE las pistas: cada gap crece 140 ÷ 2 = 70.
   El elemento que abarca dos columnas incluye el hueco que hay entre ellas, así
   que también crece. Si querías tarjetas del mismo tamaño, no uses space-*. */
.is-between {
  justify-content: space-between;
}
```
