---
example_description: "repeat(n, pistas) repite una pista o un patrón de pistas: repeat(4, 1fr), una ficha técnica con repeat(2, 5rem 1fr) y repeat() mezclado con pistas sueltas"
example_tags: "css|grid|repeat|grid-template-columns|dl"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="caption"><code>repeat(4, 1fr)</code> es lo mismo que <code>1fr 1fr 1fr 1fr</code></p>
<div class="grid is-four">
  <div>1fr</div><div>1fr</div><div>1fr</div><div>1fr</div>
</div>

<p class="caption"><code>repeat(2, 5rem 1fr)</code> repite el <strong>patrón</strong> entero: <code>5rem 1fr 5rem 1fr</code>. Cada <code>dt</code> y cada <code>dd</code> ocupa una celda, en orden.</p>
<dl class="grid specs">
  <dt>Altura</dt><dd>1,2 m</dd>
  <dt>Maceta</dt><dd>24 cm</dd>
  <dt>Luz</dt><dd>Indirecta</dd>
  <dt>Riego</dt><dd>Semanal</dd>
  <dt>Origen</dt><dd>México</dd>
  <dt>Mascotas</dt><dd>Tóxica si la muerden</dd>
</dl>

<p class="caption"><code>repeat()</code> se mezcla con otras pistas: <code>3rem repeat(3, 1fr) 3rem</code></p>
<div class="grid is-mixed">
  <div class="fixed">3rem</div><div>1fr</div><div>1fr</div><div>1fr</div><div class="fixed">3rem</div>
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
  gap: 8px;
  width: 400px;
  outline: 2px dashed #0f766e;
  background: url(hatch.svg);
}

.grid > * {
  margin: 0;                     /* los dd traen un margin-left del navegador */
  padding: 4px 6px;
  border: 1px solid #0f766e;
  background: #ccfbf1;
  font-size: 0.75rem;
  font-weight: bold;
  text-align: center;
}

.grid > .fixed {
  border-color: #b45309;
  background: #fef3c7;
}

/* repeat(veces, lista de pistas): ahorra escribir y evita contar mal. */
.is-four {
  grid-template-columns: repeat(4, 1fr);
}

/* El segundo argumento puede ser un PATRÓN: aquí, etiqueta de 5rem + valor de 1fr,
   dos veces. Seis parejas dt/dd → doce elementos → tres filas de cuatro celdas.
   Las filas se crean solas: no hay grid-template-rows. */
.specs {
  grid-template-columns: repeat(2, 5rem 1fr);
}

.specs dt {
  text-align: right;
}

.specs dd {
  background: #ffffff;
  font-weight: normal;
  text-align: left;
}

.is-mixed {
  grid-template-columns: 3rem repeat(3, 1fr) 3rem;
}
```
