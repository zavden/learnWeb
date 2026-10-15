---
example_description: "Las líneas negativas cuentan desde el final: -1 es la última línea, así que grid-column: 1 / -1 ocupa todo el ancho sin saber cuántas columnas hay"
example_tags: "css|grid|lineas-negativas|grid-column|grid-row|colocacion"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="label">Mira ahora los números de <strong>abajo</strong> y de la <strong>derecha</strong>: son las mismas líneas, contadas desde el final.</p>

<div class="board">
  <div class="a">A · <code>col 1 / -1</code>: todo el ancho</div>
  <div class="b">B<br><code>col 1</code> · <code>fila 2 / -1</code></div>
  <div class="c">C · <code>col -3 / -1</code></div>
  <div class="d">D<br><code>col -2</code></div>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 8px 0;
  font-size: 0.8rem;
}

/* El fondo dibuja también los números negativos, abajo y a la derecha,
   como el overlay de DevTools. */
.board {
  display: grid;
  grid-template-columns: repeat(4, 90px);
  grid-template-rows: repeat(3, 40px);
  gap: 10px;
  width: 390px;
  padding: 18px;
  background: url(board-4x3.svg) no-repeat;
}

.board > div {
  border: 1px solid #0f766e;
  background: #ccfbf1;
  font-size: 0.7rem;
  font-weight: bold;
  line-height: 1.2;
  text-align: center;
}

.board code {
  font-weight: normal;
}

/* -1 es la última línea, -2 la penúltima… 1 / -1 significa «de la primera a la
   última»: funciona igual con 4 columnas que con 12. Es la forma habitual de hacer
   una cabecera o un pie que ocupen toda la fila. */
.a {
  grid-column: 1 / -1;
}

.b {
  grid-column: 1;
  grid-row: 2 / -1;
}

/* Las dos últimas columnas: de la antepenúltima línea (-3) a la última (-1). */
.c {
  grid-column: -3 / -1;
  grid-row: 2;
}

/* Un solo número negativo también es la línea de inicio: -2 / auto → la última columna. */
.d {
  grid-column: -2;
  grid-row: 3;
}
```
