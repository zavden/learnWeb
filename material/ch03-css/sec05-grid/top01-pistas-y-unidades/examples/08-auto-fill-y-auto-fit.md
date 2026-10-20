---
example_description: "repeat(auto-fill, …) y repeat(auto-fit, …) crean tantas columnas como caben; con pocos elementos, auto-fill conserva las pistas vacías y auto-fit las colapsa y estira los elementos"
example_tags: "css|grid|repeat|auto-fill|auto-fit|minmax|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="caption"><code>repeat(auto-fill, minmax(80px, 1fr))</code>, <code>gap: 20px</code>: caben 4 pistas (4 × 80 + 3 × 20 = 380 ≤ 400) → (400 − 60) ÷ 4 = <strong>85</strong>. Con 2 elementos, las otras 2 pistas se quedan <strong>vacías</strong>.</p>
<div class="grid is-fill">
  <div>A · 85</div><div>B · 85</div>
</div>

<p class="caption"><code>repeat(auto-fit, minmax(80px, 1fr))</code>: las mismas 4 pistas, pero las vacías se <strong>colapsan</strong> a 0 (con sus gaps) → (400 − 20) ÷ 2 = <strong>190</strong></p>
<div class="grid is-fit">
  <div>A · 190</div><div>B · 190</div>
</div>

<p class="caption">Con la fila llena no hay pistas vacías y los dos dan lo mismo: la diferencia solo aparece cuando hay <strong>pocos</strong> elementos</p>
<div class="grid is-fit is-full">
  <div>A · 85</div><div>B · 85</div><div>C · 85</div><div>D · 85</div><div>E · 85</div><div>F · 85</div>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 8px 0 4px;
  font-size: 0.75rem;
}

.grid {
  display: grid;
  gap: 20px;
  grid-template-rows: 40px;
  width: 400px;
  padding: 18px 8px 6px 18px;            /* sitio para los números de línea */
}

.grid > div {
  border: 1px solid #0f766e;
  background: #ccfbf1;
  font-size: 0.75rem;
  font-weight: bold;
  line-height: 38px;
  text-align: center;
}

/* auto-fill: «mete tantas pistas como quepan». El navegador calcula cuántas de 80px
   (el mínimo) caben con sus gaps: 4. Después, cada una crece hasta 1fr.
   Las pistas que no tienen elementos SIGUEN AHÍ, vacías: los dos elementos miden
   lo mismo que si la fila estuviera llena. El fondo dibuja las 4 pistas. */
.is-fill {
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  background: url(tracks-auto-fill.svg) no-repeat;
}

/* auto-fit: lo mismo, y al final COLAPSA las pistas vacías: miden 0 y sus gaps
   desaparecen. Sus líneas (3, 4 y 5) siguen existiendo, todas en el borde derecho.
   Las pistas con elementos se reparten el ancho entero.
   🐛 Ninguno de los dos es «el bueno»: elige según lo que quieras ver con pocos
   elementos. Una búsqueda con un solo resultado y auto-fit da una tarjeta que ocupa
   toda la fila; con auto-fill, la tarjeta mide lo mismo que las demás. */
.is-fit {
  grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
  background: url(tracks-auto-fit.svg) no-repeat;
}

.is-full {
  grid-template-rows: none;              /* dos filas: que se creen solas */
  padding: 0;
  background: url(hatch.svg);
  outline: 2px dashed #0f766e;
}
```
