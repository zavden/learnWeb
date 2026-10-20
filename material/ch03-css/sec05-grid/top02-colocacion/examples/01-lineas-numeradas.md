---
example_description: "grid-column y grid-row colocan un elemento entre dos líneas numeradas (inicio / fin); un solo número ocupa una pista, y lo que no se coloca va al primer hueco libre"
example_tags: "css|grid|grid-column|grid-row|lineas|colocacion"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="label">Un tablero de 4 columnas y 3 filas. Mira los números del borde: cada elemento empieza y termina en una <strong>línea</strong>.</p>

<div class="board">
  <div class="a">A · <code>col 1 / 3</code> · <code>fila 1</code></div>
  <div class="b">B<br><code>col 3 / 5</code><br><code>fila 1 / 3</code></div>
  <div class="c">C<br><code>col 2</code> · <code>fila 3</code></div>
  <div class="d">D<br>sin colocar</div>
</div>

<p class="caption">A, B y C tienen posición; D no, así que el navegador lo mete en el primer hueco libre (fila 2, columna 1).</p>
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

/* El tablero: 4 columnas de 90px y 3 filas de 40px. El fondo es un dibujo que
   imita el overlay de DevTools (números positivos arriba y a la izquierda). */
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

/* grid-column: <línea de inicio> / <línea de fin>
   Es el atajo de grid-column-start y grid-column-end (y grid-row, de las filas).
   A empieza en la línea 1 y acaba en la 3: ocupa las columnas 1 y 2. */
.a {
  grid-column: 1 / 3;
  grid-row: 1;
}

/* B: columnas 3 y 4, filas 1 y 2. */
.b {
  grid-column: 3 / 5;
  grid-row: 1 / 3;
}

/* Un solo número es la línea de INICIO; el fin, si no se dice, es «una pista más».
   grid-column: 2 equivale a grid-column: 2 / 3. */
.c {
  grid-column: 2;
  grid-row: 3;
}

/* D no tiene grid-column ni grid-row: lo coloca el algoritmo automático, DESPUÉS
   de los que tienen posición, en el primer hueco libre recorriendo fila a fila. */
.d {
  border-style: dashed;
}
```
