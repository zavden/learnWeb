---
example_description: "Capas sin position: la imagen y el texto de una portada en la misma celda (grid-area: 1 / 1), alineados con align-self; la celda crece con la capa más alta"
example_tags: "css|grid|grid-area|capas|superposicion|hero"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption">Dos portadas con el mismo CSS: imagen y texto en la misma celda. La segunda tiene más texto y la celda crece con él.</p>

<section class="hero" aria-labelledby="hero-a">
  <div class="hero-image"></div>
  <div class="hero-text">
    <h2 id="hero-a">Excursión al lago</h2>
    <p>Sábado 24 de octubre · salida a las 7:00</p>
  </div>
</section>

<section class="hero" aria-labelledby="hero-b">
  <div class="hero-image"></div>
  <div class="hero-text">
    <h2 id="hero-b">Ruta de las cascadas</h2>
    <p>Domingo 8 de noviembre · salida a las 6:30. Lleva calzado que se pueda mojar, dos litros de agua y algo de abrigo: a primera hora, junto al río, hace frío.</p>
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

/* Una rejilla de UNA celda. Sus dos hijos se colocan en la misma: grid-area: 1 / 1
   es «fila 1, columna 1». En vez de ir uno detrás de otro, se apilan. */
.hero {
  display: grid;
  max-width: 400px;
  min-height: 140px;            /* alto mínimo: si el texto pide más, crece */
  margin-bottom: 12px;
  outline: 2px dashed #0f766e;
}

.hero > * {
  grid-area: 1 / 1;
}

/* Capa de abajo: la imagen, como fondo decorativo. Se estira (stretch) hasta llenar
   la celda, mida lo que mida. */
.hero-image {
  background: #7dd3fc url(lake.svg) center / cover;
}

/* Capa de arriba: el texto, pegado al fondo de la celda. El último del HTML se pinta
   encima; no hace falta position ni z-index. */
.hero-text {
  align-self: end;
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
```
