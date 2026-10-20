---
example_description: "El hueco bajo una imagen es el sitio que la línea reserva para los rabos de las letras: crece con el font-size del contenedor y desaparece con display: block o vertical-align"
example_tags: "css|contexto-inline|baseline|img|vertical-align|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<div class="case">
  <p class="label">❌ <code>img</code> inline (16px)</p>
  <div class="frame"><img src="lake.svg" alt="Lago entre montañas" width="96" height="64"></div>
</div>

<div class="case">
  <p class="label">❌ con <code>font-size: 40px</code></p>
  <div class="frame is-big"><img src="lake.svg" alt="Lago entre montañas" width="96" height="64"></div>
</div>

<div class="case">
  <p class="label">¿Qué es el hueco?</p>
  <div class="frame is-big"><span class="baseline-ruler" aria-hidden="true"></span><img src="lake.svg" alt="Lago entre montañas" width="96" height="64">gjy</div>
</div>

<div class="case">
  <p class="label">✅ <code>display: block</code></p>
  <div class="frame is-big"><img class="is-block" src="lake.svg" alt="Lago entre montañas" width="96" height="64"></div>
</div>

<div class="case">
  <p class="label">✅ <code>vertical-align: bottom</code></p>
  <div class="frame is-big"><img class="is-bottom" src="lake.svg" alt="Lago entre montañas" width="96" height="64"></div>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.case {
  display: inline-block;
  vertical-align: top;
  margin: 0 10px 12px 0;
}

.label {
  margin: 0 0 4px;
  font-size: 0.75rem;
}

/* El amarillo es el fondo del marco: lo que asoma bajo la foto es el hueco. */
.frame {
  width: max-content;
  border: 3px solid #1d4ed8;
  background: #fde68a;
}

/* 🐛 El marco solo contiene una imagen, que es INLINE: el marco crea un contexto inline
   y la imagen va dentro de una caja de línea, apoyada en la LÍNEA BASE con su borde inferior.
   Toda caja de línea empieza con un «puntal» (strut): una letra invisible, de ancho 0, con la
   fuente y el line-height del marco. Aunque no haya texto, el puntal reserva debajo de la
   línea base el sitio de los rabos (descendentes) de la g, la j o la y: ese es el hueco.
   Mide lo que bajan los rabos de esa fuente: con letra de 16px, unos 4px; con 40px, unos 10px. */
.is-big {
  font-size: 40px;
}

/* ✅ Fuera de la línea: una imagen de bloque no tiene línea base que respetar. */
.is-block {
  display: block;
}

/* ✅ O se queda en la línea, pero alineada al fondo de la caja de línea, no a la línea base.
   (middle o top también lo quitan, mientras la imagen sea más alta que el texto.) */
.is-bottom {
  vertical-align: bottom;
}

/* Regla visual de la línea base (la misma del ejemplo 3). */
.baseline-ruler {
  display: inline-block;
  width: 100%;
  margin-right: -100%;
  border-top: 2px dashed #dc2626;
}
```
