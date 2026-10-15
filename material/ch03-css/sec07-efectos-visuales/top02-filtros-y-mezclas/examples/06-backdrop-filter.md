---
example_description: "backdrop-filter filtra lo que hay DETRÁS del elemento, no el elemento: con un fondo opaco no se ve nada; hace falta un fondo semitransparente, y el desenfoque es lo que hace legible el texto encima"
example_tags: "css|filtros|backdrop-filter|cristal-esmerilado|transparencia|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">Tres paneles sobre la misma foto, todos con <code>backdrop-filter: blur(10px)</code> salvo el del medio</p>
<div class="posters">
  <div class="poster">
    <p class="panel is-opaque"><strong>Pilares de la creación</strong> Nebulosa del Águila</p>
  </div>
  <div class="poster">
    <p class="panel is-see-through"><strong>Pilares de la creación</strong> Nebulosa del Águila</p>
  </div>
  <div class="poster">
    <p class="panel is-frosted"><strong>Pilares de la creación</strong> Nebulosa del Águila</p>
  </div>
</div>
<ol class="notes">
  <li>❌ Fondo opaco: el desenfoque existe, pero el fondo lo tapa.</li>
  <li>⚠️ Fondo al 65 %, sin <code>backdrop-filter</code>: los detalles de la foto se ven nítidos detrás del texto.</li>
  <li>✅ Fondo al 65 % y <code>blur(10px)</code>: cristal esmerilado.</li>
</ol>
<p class="credit">NASA, ESA y Hubble Heritage Team, 2014. Dominio público.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption,
.credit {
  margin: 8px 0 6px;
  font-size: 0.72rem;
}

.posters {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.poster {
  display: flex;
  align-items: end;
  width: 140px;
  height: 190px;
  margin: 0;
  background: url("pilares-de-la-creacion.jpg") center 20% / cover;
}

.panel {
  flex: 1;                  /* llena el ancho del póster */
  margin: 0;
  padding: 8px;
  color: #ffffff;
  font-size: 0.68rem;
}

.panel strong {
  display: block;
  font-size: 0.8rem;
}

.notes {
  margin: 8px 0 0;
  padding-left: 1.4em;
  font-size: 0.72rem;
}

/* 🐛 backdrop-filter filtra el FONDO que el elemento tiene detrás (todo lo
   pintado antes que él), recortado a su caja, y lo pone debajo de su propio
   background. Con un background opaco, el resultado queda tapado. */
.is-opaque {
  background: rgb(15 23 42);
  backdrop-filter: blur(10px);
}

.is-see-through {
  background: rgb(15 23 42 / 0.65);
}

/* ✅ Un fondo semitransparente deja ver el fondo desenfocado. Contraste: el
   65 % de este azul sobre un píxel blanco da rgb(99 104 117), y el texto
   blanco tiene 5.4:1 en el peor caso. El desenfoque, además, borra los
   detalles pequeños (estrellas, filamentos) que molestan al leer. */
.is-frosted {
  background: rgb(15 23 42 / 0.65);
  backdrop-filter: blur(10px);
}
```
