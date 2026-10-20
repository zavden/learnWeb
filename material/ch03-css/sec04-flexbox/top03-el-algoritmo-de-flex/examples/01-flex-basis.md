---
example_description: "flex-basis es el tamaño de partida de cada elemento en el eje principal: manda sobre width, acepta porcentajes y, en auto, usa width o el contenido"
example_tags: "css|flexbox|flex-basis|width|algoritmo"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption">Contenedor de 400px. Ninguno crece (<code>flex-grow: 0</code>, el valor inicial): el rayado es espacio libre.</p>
<div class="line">
  <div class="item a">A · 100</div>
  <div class="item b">B · 150</div>
  <div class="item c">C · 100</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">
<ul class="notes">
  <li><strong>A</strong>: <code>width: 100px</code> y <code>flex-basis: auto</code> (inicial) → usa el <code>width</code>: 100.</li>
  <li><strong>B</strong>: <code>width: 100px; flex-basis: 150px</code> → manda <code>flex-basis</code>: 150.</li>
  <li><strong>C</strong>: <code>flex-basis: 25%</code> → el 25 % de 400: 100.</li>
</ul>

<p class="caption"><code>flex-basis: auto</code> sin <code>width</code>: el tamaño de su contenido (<code>max-content</code>)</p>
<div class="line is-content">
  <div class="item a">Ana</div>
  <div class="item b">Guadalupe</div>
  <div class="item c">Luis</div>
</div>
<img class="ruler" src="ruler-400.svg" alt="" width="400" height="20">
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption,
.notes {
  margin: 6px 0 4px;
  font-size: 0.75rem;
}

.notes {
  padding-left: 1.2em;
}

/* El contenedor mide exactamente 400px: el borde discontinuo es un outline, que no
   ocupa sitio. Debajo, una regla de 400px para comprobar cada medida. */
.line {
  display: flex;
  width: 400px;
  outline: 2px dashed #7c3aed;
  background: url(free-space.svg);   /* rayado = espacio libre, como en DevTools */
}

.ruler {
  display: block;
  margin-top: 3px;
}

/* Sin padding ni borde horizontales: así el ancho de cada caja es justo su base. */
.item {
  padding: 4px 0;
  font-size: 0.75rem;
  font-weight: bold;
  text-align: center;
}

.a { background: #c7d2fe; }
.b { background: #fbcfe8; }
.c { background: #a7f3d0; }

/* PASO 1 del algoritmo: el TAMAÑO BASE de cada elemento en el eje principal.
   flex-basis: auto (inicial) → mira width (height en una columna);
                               si también es auto → el contenido (max-content).
   flex-basis: <longitud> o <porcentaje> → manda sobre width.               */
.line .a { width: 100px; }
.line .b { width: 100px; flex-basis: 150px; }
.line .c { flex-basis: 25%; }

/* Segunda fila: sin width ni flex-basis, cada uno mide lo que su texto. */
.is-content .item {
  width: auto;
  flex-basis: auto;
  padding: 4px 8px;
}
```
