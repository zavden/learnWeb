---
example_description: "Tarjetas inline-block en fila que no se alinean por arriba: se apoyan en la línea base de su última línea, y la que tiene overflow: hidden, en su borde inferior"
example_tags: "css|contexto-inline|inline-block|vertical-align|baseline|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="label">❌ <code>vertical-align: baseline</code> (por defecto): ni las de arriba ni las de abajo coinciden</p>
<div class="shelf">
  <article class="card"><div class="card-photo photo-notebook"></div><h3 class="card-title">Cuaderno A5</h3><p class="card-price">4,50 €</p></article>
  <article class="card"><div class="card-photo photo-pencils"></div><h3 class="card-title">Pack de 12 lápices de grafito HB con goma</h3><p class="card-price">6,90 €</p></article>
  <article class="card is-clipped"><div class="card-photo photo-case"></div><h3 class="card-title">Estuche de lona</h3><p class="card-price">9,95 €</p></article>
</div>

<p class="label">✅ <code>vertical-align: top</code></p>
<div class="shelf is-fixed">
  <article class="card"><div class="card-photo photo-notebook"></div><h3 class="card-title">Cuaderno A5</h3><p class="card-price">4,50 €</p></article>
  <article class="card"><div class="card-photo photo-pencils"></div><h3 class="card-title">Pack de 12 lápices de grafito HB con goma</h3><p class="card-price">6,90 €</p></article>
  <article class="card is-clipped"><div class="card-photo photo-case"></div><h3 class="card-title">Estuche de lona</h3><p class="card-price">9,95 €</p></article>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.label {
  margin: 8px 0 4px;
  font-size: 0.8rem;
}

.shelf {
  padding: 4px;
  background: #f1f5f9;
}

.card {
  display: inline-block;
  width: calc(33.3% - 10px);
  margin-right: 4px;
  border: 1px solid #94a3b8;
  border-radius: 10px;
  background: #ffffff;
}

.card-photo {
  height: 28px;
  border-radius: 9px 9px 0 0;       /* tarjetas 1 y 2: la foto redondea sus propias esquinas */
}

.photo-notebook { background: #fca5a5; }
.photo-pencils { background: #fcd34d; }
.photo-case { background: #86efac; }

.card-title {
  margin: 6px 8px 2px;
  font-size: 0.85rem;
}

.card-price {
  margin: 0 8px 6px;
  font-size: 0.85rem;
}

/* 🐛 Cada tarjeta es una caja EN LÍNEA: se alinea con vertical-align: baseline, y su línea
   base es la de su ÚLTIMA línea de texto (el precio). Las tres líneas de precio quedan a
   la misma altura, así que la tarjeta con el título más largo sobresale por arriba.

   La tercera tarjeta recorta su foto con overflow: hidden (otra forma de redondear las
   esquinas). Un inline-block con overflow distinto de visible usa como línea base su
   BORDE INFERIOR: la tarjeta entera sube hasta apoyar su borde en la línea base. */
.is-clipped {
  overflow: hidden;
}

.is-clipped .card-photo {
  border-radius: 0;                  /* aquí recorta la tarjeta, no la foto */
}

/* ✅ Para cajas puestas en fila, alinéalas por arriba. */
.is-fixed .card {
  vertical-align: top;
}
```
