---
example_description: "El texto de una portada con position: absolute no cuenta para el alto: si es largo, se sale por arriba y tapa lo que hay encima; con capas grid en la misma celda, la portada crece"
example_tags: "css|grid|position|absolute|capas|superposicion|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">❌ <code>position: absolute; bottom: 0</code>: la portada mide 100px pase lo que pase, y el texto largo se sale por arriba y tapa el aviso</p>
<p class="intro">Próximas salidas del club de senderismo. Inscríbete en la recepción antes del viernes.</p>
<section class="hero is-absolute" aria-labelledby="hero-a">
  <div class="hero-image"></div>
  <div class="hero-text">
    <h2 id="hero-a">Ruta de las cascadas</h2>
    <p>Domingo 8 de noviembre · salida a las 6:30. Lleva calzado que se pueda mojar, dos litros de agua y algo de abrigo: a primera hora, junto al río, hace frío. El regreso es por el mismo camino.</p>
  </div>
</section>

<p class="caption">✅ Capas grid (<code>grid-area: 1 / 1</code>): la portada crece hasta que cabe el texto</p>
<p class="intro">Próximas salidas del club de senderismo. Inscríbete en la recepción antes del viernes.</p>
<section class="hero is-grid" aria-labelledby="hero-b">
  <div class="hero-image"></div>
  <div class="hero-text">
    <h2 id="hero-b">Ruta de las cascadas</h2>
    <p>Domingo 8 de noviembre · salida a las 6:30. Lleva calzado que se pueda mojar, dos litros de agua y algo de abrigo: a primera hora, junto al río, hace frío. El regreso es por el mismo camino.</p>
  </div>
</section>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 8px 0;
  font-size: 0.75rem;
}

.intro {
  max-width: 240px;
  margin: 0 0 4px;
  font-size: 0.75rem;
}

.hero {
  max-width: 240px;
  margin-bottom: 16px;
  outline: 2px dashed #0f766e;
}

.hero-image {
  background: #7dd3fc url(lake.svg) center / cover;
}

.hero-text {
  padding: 8px 12px;
  background: rgb(15 23 42 / 0.85);
  color: #ffffff;
}

.hero-text h2 {
  margin: 0;
  font-size: 1.1rem;
}

.hero-text p {
  margin: 2px 0 0;
  font-size: 0.8rem;
}

/* 🐛 La forma clásica: la portada relative, la imagen y el texto absolute.
   Un elemento absolute sale del flujo y no aporta nada al alto de su padre, así
   que hay que darle a la portada un alto fijo. Con un texto corto, perfecto. Con
   uno largo, el texto (pegado abajo con bottom: 0) crece hacia arriba, se sale de
   la portada y tapa el aviso de encima. */
.is-absolute {
  position: relative;
  height: 100px;
}

.is-absolute .hero-image {
  position: absolute;
  inset: 0;
}

.is-absolute .hero-text {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
}

/* ✅ Las dos capas en la misma celda grid. La celda mide lo que la capa más alta
   (con un mínimo de 100px), la imagen se estira hasta ella y el texto sigue abajo
   con align-self: end. Nada se sale. */
.is-grid {
  display: grid;
  min-height: 100px;
}

.is-grid > * {
  grid-area: 1 / 1;
}

.is-grid .hero-text {
  align-self: end;
}
```
