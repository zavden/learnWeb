---
example_description: "El salto de línea entre dos inline-block es un espacio: tres tercios no caben"
example_tags: "parser|espacios|inline-block|layout|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<!-- 🐛 Entre dos elementos inline-block (botones, imágenes, campos de formulario o cajas
     con display: inline-block) el salto de línea de tu código es texto: se dibuja como un
     espacio de unos 4 px. Tres cajas de un tercio + dos espacios > 100 %: la tercera baja. -->
<h2>❌ Con saltos de línea entre las etiquetas</h2>
<div class="row">
  <span class="col">1/3</span>
  <span class="col">2/3</span>
  <span class="col">3/3</span>
</div>

<!-- ✅ Sin nada entre las etiquetas no hay espacio que dibujar. (En el capítulo de CSS
     verás la solución moderna: flexbox y grid ignoran estos espacios.) -->
<h2>✅ Sin espacio entre las etiquetas</h2>
<div class="row"><span class="col">1/3</span><span class="col">2/3</span><span class="col">3/3</span></div>
```

# CSS

```css
/* Tres cajas de un tercio de ancho cada una: deberían caber justas (CSS: capítulo 3) */
.row {
  background: #e5e7eb;
}

.col {
  display: inline-block;
  width: 33.33%;
  background: #93c5fd;
  outline: 1px solid #1e3a8a; /* outline no ocupa espacio: no altera las medidas */
  text-align: center;
}
```
