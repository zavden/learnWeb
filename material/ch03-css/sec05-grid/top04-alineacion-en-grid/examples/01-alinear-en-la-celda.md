---
example_description: "justify-items y align-items colocan cada elemento dentro de su celda: por defecto se estiran; con start, center o end miden su contenido y se pegan a un lado de la celda"
example_tags: "css|grid|justify-items|align-items|alineacion|stretch"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="label">Las celdas son siempre las mismas (las dibuja el fondo). Lo que cambia es dónde se coloca cada elemento <strong>dentro</strong> de la suya.</p>

<p class="caption">Por defecto (<code>normal</code>, que aquí es <code>stretch</code>): cada elemento llena su celda</p>
<div class="cells">
  <div>Ana</div><div>Luis</div><div>Sofía</div>
</div>

<p class="caption"><code>justify-items: center</code>: en horizontal, del ancho de su texto y centrados</p>
<div class="cells is-justify-center">
  <div>Ana</div><div>Luis</div><div>Sofía</div>
</div>

<p class="caption"><code>align-items: center</code>: en vertical, del alto de su texto y centrados</p>
<div class="cells is-align-center">
  <div>Ana</div><div>Luis</div><div>Sofía</div>
</div>

<p class="caption"><code>justify-items: end</code> + <code>align-items: start</code>: arriba a la derecha de cada celda</p>
<div class="cells is-corner">
  <div>Ana</div><div>Luis</div><div>Sofía</div>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label,
.caption {
  margin: 8px 0 2px;
  font-size: 0.75rem;
}

/* Tres celdas de 120 × 60 con gap de 10. El fondo dibuja sus bordes. */
.cells {
  display: grid;
  grid-template-columns: repeat(3, 120px);
  grid-template-rows: 60px;
  gap: 10px;
  width: 380px;
  padding: 18px 8px 6px 18px;
  background: url(cells-3x1.svg) no-repeat;
}

.cells > div {
  padding: 4px 8px;
  border: 1px solid #0f766e;
  background: #ccfbf1;
  font-size: 0.8rem;
  font-weight: bold;
}

/* justify-items: dentro de la celda, en el eje de las FILAS (horizontal en español).
   align-items: dentro de la celda, en el eje de las COLUMNAS (vertical).
   En grid los ejes no giran como en flexbox: justify es siempre el sentido del
   texto y align, el de los bloques. */
.is-justify-center {
  justify-items: center;
}

.is-align-center {
  align-items: center;
}

/* stretch (el defecto) solo estira lo que no tiene tamaño: con start, center o end,
   el elemento mide su contenido y se coloca en ese punto de la celda. */
.is-corner {
  justify-items: end;
  align-items: start;
}
```
