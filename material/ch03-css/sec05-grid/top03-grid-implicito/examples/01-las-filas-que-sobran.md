---
example_description: "Con grid-template-rows: 60px 60px y nueve elementos, la tercera fila la crea el navegador (implícita) y mide auto, no 60px; grid-auto-rows da tamaño a las filas implícitas"
example_tags: "css|grid|grid-implicito|grid-auto-rows|grid-template-rows|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="caption">❌ <code>grid-template-rows: 60px 60px</code> y nueve elementos: la fila 3 (en ámbar) no estaba en la plantilla y mide lo que su texto</p>
<div class="grid">
  <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div>
</div>

<p class="caption">✅ <code>grid-auto-rows: 60px</code>: todas las filas que se creen miden 60px</p>
<div class="grid is-fixed">
  <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div><div>9</div>
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
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: 60px 60px;
  gap: 8px;
  width: 400px;
  outline: 2px dashed #0f766e;
  background: url(hatch.svg);
}

.grid > div {
  padding: 4px;
  border: 1px solid #0f766e;
  background: #ccfbf1;
  font-weight: bold;
  text-align: center;
}

/* Los elementos 7, 8 y 9 caen en la fila implícita. */
.grid > div:nth-child(n + 7) {
  border-color: #b45309;
  background: #fef3c7;
}

/* 🐛 La rejilla EXPLÍCITA es la que defines: 3 columnas y 2 filas, seis celdas.
   Los elementos 7, 8 y 9 no caben, y el navegador no los descarta: crea las filas
   que hagan falta. Esas filas son IMPLÍCITAS y su tamaño no sale de
   grid-template-rows, sino de grid-auto-rows, que vale auto: miden su contenido. */

/* ✅ grid-auto-rows dice cuánto miden las filas implícitas. Con él, a menudo ni
   siquiera hace falta grid-template-rows: todas las filas son implícitas. */
.is-fixed {
  grid-template-rows: none;
  grid-auto-rows: 60px;
}
```
