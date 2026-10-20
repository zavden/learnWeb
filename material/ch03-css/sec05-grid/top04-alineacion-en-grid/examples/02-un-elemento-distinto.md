---
example_description: "justify-self y align-self alinean un solo elemento dentro de su celda en los dos ejes; a diferencia de flexbox, en grid justify-self sí existe"
example_tags: "css|grid|justify-self|align-self|alineacion"
example_stage: minimal
example_importance: important
---

# HTML

```html
<p class="label">Seis celdas iguales; cada elemento elige su sitio con <code>justify-self</code> (horizontal) y <code>align-self</code> (vertical).</p>

<div class="cells">
  <div class="a">justify: start<br>align: start</div>
  <div class="b">justify: center<br>align: center</div>
  <div class="c">justify: end<br>align: end</div>
  <div class="d">justify: stretch<br>align: center</div>
  <div class="e">justify: center<br>align: stretch</div>
  <div class="f">justify: end<br>align: start</div>
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

.cells {
  display: grid;
  grid-template-columns: repeat(3, 120px);
  grid-template-rows: repeat(2, 70px);
  gap: 10px;
  width: 380px;
  padding: 18px 8px 6px 18px;
  background: url(cells-3x2.svg) no-repeat;
}

.cells > div {
  padding: 2px 4px;
  border: 1px solid #0f766e;
  background: #ccfbf1;
  font-family: ui-monospace, monospace;
  font-size: 0.65rem;
}

/* *-self va en el ELEMENTO y gana al *-items del contenedor (que solo da el valor
   por defecto, auto, de cada *-self). En flexbox no había justify-self porque los
   elementos comparten la línea; en grid cada uno tiene su celda y puede moverse
   dentro de ella en los dos ejes. */
.a { justify-self: start;   align-self: start; }
.b { justify-self: center;  align-self: center; }
.c { justify-self: end;     align-self: end; }
.d { justify-self: stretch; align-self: center; }
.e { justify-self: center;  align-self: stretch; }
.f { justify-self: end;     align-self: start; }
```
