---
example_description: "span N abarca N pistas: con una línea de inicio (1 / span 2), solo (span 3) o en las filas; cuatro elementos que llenan el tablero sin contar líneas de fin"
example_tags: "css|grid|span|grid-column|grid-row|colocacion"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="label"><code>span</code> cuenta <strong>pistas</strong>, no líneas: dice cuántas columnas o filas abarca el elemento.</p>

<div class="board">
  <div class="a">A · <code>col 1 / span 2</code></div>
  <div class="b">B<br><code>col 3</code><br><code>fila 1 / span 3</code></div>
  <div class="c">C<br><code>col span 2</code><br><code>fila 2 / span 2</code></div>
  <div class="d">D<br><code>col 4</code><br><code>fila span 3</code></div>
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

/* Inicio + span: empieza en la línea 1 y abarca 2 columnas (acaba en la 3). */
.a {
  grid-column: 1 / span 2;
  grid-row: 1;
}

/* Lo mismo en las filas: de la línea 1, tres filas hacia abajo. */
.b {
  grid-column: 3;
  grid-row: 1 / span 3;
}

/* span sin inicio: «dos columnas, donde quepan». Tiene la fila fijada (2 y 3), así
   que el navegador busca en esas filas el primer sitio con dos columnas libres. */
.c {
  grid-column: span 2;
  grid-row: 2 / span 2;
}

/* Columna fija y span en las filas: ocupa la columna 4 entera. */
.d {
  grid-column: 4;
  grid-row: span 3;
}
```
