---
example_description: "Texto en español en vertical sin transform: lomos de libros con vertical-rl (se leen de arriba abajo) y el rótulo de un eje con sideways-lr (de abajo arriba); vertical-lr no sirve para eso"
example_tags: "css|modos-de-escritura|writing-mode|sideways-lr|vertical-rl|rotulos"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p class="caption">Lomos de libros: <code>vertical-rl</code>, de arriba abajo</p>
<ul class="shelf">
  <li class="spine">Don Quijote de la Mancha</li>
  <li class="spine">Fortunata y Jacinta</li>
  <li class="spine">La Regenta</li>
  <li class="spine">Platero y yo</li>
</ul>

<p class="caption">El rótulo de un eje se lee de abajo arriba. <code>vertical-lr</code> no lo hace (solo cambia hacia dónde van las líneas siguientes); <code>sideways-lr</code>, sí</p>
<div class="axes">
  <figure class="chart-case">
    <figcaption>❌ <code>vertical-lr</code></figcaption>
    <div class="chart">
      <p class="axis-label is-vertical-lr">Piezas vendidas</p>
      <div class="bars" aria-hidden="true"><span class="b40"></span><span class="b75"></span><span class="b100"></span></div>
    </div>
  </figure>
  <figure class="chart-case">
    <figcaption>✅ <code>sideways-lr</code></figcaption>
    <div class="chart">
      <p class="axis-label is-sideways">Piezas vendidas</p>
      <div class="bars" aria-hidden="true"><span class="b40"></span><span class="b75"></span><span class="b100"></span></div>
    </div>
  </figure>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 10px 0 4px;
  font-size: 0.75rem;
}

.shelf {
  display: flex;
  gap: 4px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Cada lomo es una caja vertical-rl: las letras latinas se tumban (mixed) y la
   línea baja. Su inline-size es el alto del libro; el ancho del lomo lo da la
   línea de texto con su padding. Ocupa su sitio de verdad en el layout: con
   transform: rotate (módulo de efectos visuales) la caja seguiría siendo
   horizontal y habría que recolocarla a mano. */
.spine {
  writing-mode: vertical-rl;
  inline-size: 150px;
  padding: 8px 6px;
  border-radius: 3px;
  background: #3730a3;
  color: #ffffff;
  font-family: Georgia, serif;
  font-size: 0.9rem;
  text-align: center;
}

.spine:nth-child(even) {
  background: #9a3412;
}

.axes {
  display: flex;
  gap: 32px;
}

.chart-case {
  margin: 0;
}

.chart-case figcaption {
  margin-block-end: 4px;
  font-size: 0.7rem;
}

.chart {
  display: flex;
  gap: 6px;
  block-size: 150px;
}

.axis-label {
  margin: 0;
  font-size: 0.8rem;
  text-align: center;
}

/* ❌ vertical-lr baja igual que vertical-rl: solo cambia hacia dónde se colocan
   las líneas siguientes (a la derecha). Las letras siguen tumbadas hacia la
   derecha y se lee de arriba abajo. */
.is-vertical-lr {
  writing-mode: vertical-lr;
}

/* ✅ sideways-lr gira la línea entera 90° en sentido contrario: se lee de abajo
   arriba, como en los ejes de las gráficas (y en los lomos de muchos libros).
   Desde Chrome 132 (enero de 2025). */
.is-sideways {
  writing-mode: sideways-lr;
}

.bars {
  display: flex;
  gap: 6px;
  align-items: end;
  inline-size: 110px;
  border-block-end: 2px solid #1e293b;
  border-inline-start: 2px solid #1e293b;
}

.bars span {
  flex: 1;
  background: #4338ca;
}

.b40  { block-size: 40%; }
.b75  { block-size: 75%; }
.b100 { block-size: 100%; }
```
