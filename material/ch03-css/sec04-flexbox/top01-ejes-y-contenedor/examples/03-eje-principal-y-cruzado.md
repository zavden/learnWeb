---
example_description: "flex-direction elige el eje principal (row, row-reverse, column, column-reverse); el eje cruzado es siempre el perpendicular, y row sigue el sentido del texto"
example_tags: "css|flexbox|flex-direction|ejes"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="label">El <strong>eje principal</strong> es por donde se colocan los elementos (1, 2, 3); el <strong>eje cruzado</strong>, su perpendicular.</p>

<div class="panels">
  <div class="panel">
    <p class="caption"><code>row</code><br>→ principal<br>↓ cruzado</p>
    <div class="axis is-row"><span>1</span><span>2</span><span>3</span></div>
  </div>
  <div class="panel">
    <p class="caption"><code>row-reverse</code><br>← principal<br>↓ cruzado</p>
    <div class="axis is-row-reverse"><span>1</span><span>2</span><span>3</span></div>
  </div>
  <div class="panel">
    <p class="caption"><code>column</code><br>↓ principal<br>→ cruzado</p>
    <div class="axis is-column"><span>1</span><span>2</span><span>3</span></div>
  </div>
  <div class="panel">
    <p class="caption"><code>column-reverse</code><br>↑ principal<br>→ cruzado</p>
    <div class="axis is-column-reverse"><span>1</span><span>2</span><span>3</span></div>
  </div>
</div>

<p class="label"><code>row</code> en un texto que se escribe de derecha a izquierda (<code>dir="rtl"</code>): el eje empieza a la derecha</p>
<div class="axis is-row" dir="rtl"><span>1</span><span>2</span><span>3</span></div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 4px 0;
  font-size: 0.8rem;
}

/* Los cuatro paneles van en fila con flex (lo que estás aprendiendo). */
.panels {
  display: flex;
  gap: 8px;
}

.panel {
  width: 104px;
}

.caption {
  margin: 0 0 4px;
  font-size: 0.75rem;
  text-align: center;
}

.axis {
  display: flex;
  padding: 3px;
  border: 2px dashed #7c3aed;
}

.axis span {
  margin: 2px;
  padding: 0 6px;
  border: 1px solid #4338ca;
  border-radius: 4px;
  background: #e0e7ff;
  font-size: 0.8rem;
  font-weight: bold;
  text-align: center;
}

/* flex-direction elige el EJE PRINCIPAL; el CRUZADO es siempre el perpendicular.
   row (por defecto): en el sentido del texto. En español, de izquierda a derecha;
   con dir="rtl" (árabe, hebreo), de derecha a izquierda.                          */
.is-row {
  flex-direction: row;
}

/* *-reverse invierte el sentido del eje: el 1 sigue siendo el primero del HTML,
   pero se coloca al final. Solo cambia lo que se VE (lección 4: el teclado no). */
.is-row-reverse {
  flex-direction: row-reverse;
}

/* column: el eje principal pasa a ser vertical y el cruzado, horizontal.
   Por eso aquí los elementos se estiran a lo ANCHO: el estiramiento por defecto
   (align-items: stretch) actúa siempre en el eje cruzado. */
.is-column {
  flex-direction: column;
}

.is-column-reverse {
  flex-direction: column-reverse;
}
```
