---
example_description: "grid-column: 1 / 3 ocupa dos columnas, no tres: los números son líneas, no celdas; para tres columnas, 1 / 4 o 1 / span 3"
example_tags: "css|grid|grid-column|lineas|span|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="label">Queremos tres barras que ocupen las <strong>tres primeras columnas</strong>, cada una con un <code>grid-column</code> distinto. Cuenta las columnas que ocupa cada una y mira en qué línea acaba.</p>

<div class="board">
  <div class="bad">❌ <code>1 / 3</code>: solo 2</div>
  <div class="good-end">✅ <code>1 / 4</code>: 3 columnas</div>
  <div class="good-span">✅ <code>1 / span 3</code>: 3 columnas</div>
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
  padding: 4px 6px;
  border: 1px solid #0f766e;
  background: #ccfbf1;
  font-size: 0.75rem;
  font-weight: bold;
}

/* 🐛 «De la 1 a la 3» suena a tres columnas, pero los números son LÍNEAS: la
   barra empieza en la línea 1 y termina en la 3, y entre ellas solo hay dos
   columnas. Con N columnas, la última línea es la N + 1. */
.bad {
  grid-column: 1 / 3;
  border-color: #b45309;
  background: #fef3c7;
}

/* ✅ Tres columnas: de la línea 1 a la 4. */
.good-end {
  grid-column: 1 / 4;
}

/* ✅ O, sin contar líneas: empieza en la 1 y abarca 3 pistas. */
.good-span {
  grid-column: 1 / span 3;
}
```
