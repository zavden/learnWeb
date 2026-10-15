---
example_description: "Todo lo que va en una línea se apoya en la línea base: las letras, el texto grande, una imagen (con su borde inferior) y un botón (con la línea base de su texto)"
example_tags: "css|contexto-inline|baseline|vertical-align"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="legend">La raya roja discontinua marca la <strong>línea base</strong>. La franja morada es la caja de línea entera.</p>

<p class="line"><span class="baseline-ruler" aria-hidden="true"></span>Agua <span class="big">Agua</span> <img src="lake.svg" alt="Lago entre montañas" width="48" height="32"> <span class="button">Comprar</span> gyp</p>

<ul class="notes">
  <li>Las letras se apoyan en la línea base; las que tienen rabo (<strong>g, y, p</strong>) bajan por debajo.</li>
  <li>El texto grande comparte la misma línea base: por eso la caja de línea crece hacia arriba.</li>
  <li>La imagen se apoya con su <strong>borde inferior</strong>: debajo queda el sitio de los rabos.</li>
  <li>El botón (<code>inline-block</code>) se apoya con la línea base de <strong>su texto</strong>.</li>
</ul>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.legend,
.notes {
  font-size: 0.8rem;
}

.notes {
  padding-left: 1.2em;
}

/* Una sola línea de 24px. Su fondo morado muestra la caja de línea completa. */
.line {
  font-size: 24px;
  white-space: nowrap;
  background: #e0e7ff;
}

/* Por defecto, TODAS las cajas de una línea tienen vertical-align: baseline:
   colocan su línea base sobre la línea base de su padre. */
.big {
  font-size: 2em;
}

.button {
  display: inline-block;
  padding: 6px 12px;
  border: 2px solid #1d4ed8;
  border-radius: 6px;
  background: #ffffff;
  color: #1d4ed8;
  font-size: 0.6em;
  font-weight: bold;
}

/* Regla visual: una caja inline-block VACÍA no tiene línea base propia, así que se
   apoya en la línea base con su borde inferior (ejemplo 8). Con altura 0 y un borde
   superior discontinuo, dibuja la línea base. El margen negativo hace que no ocupe sitio. */
.baseline-ruler {
  display: inline-block;
  width: 100%;
  margin-right: -100%;
  border-top: 2px dashed #dc2626;
}
```
