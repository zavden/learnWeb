---
example_description: "Una insignia «Oferta» sobre la foto de un producto, en la misma celda y alineada a la esquina con justify-self y align-self; si va antes en el HTML, z-index (sin position) la sube"
example_tags: "css|grid|capas|justify-self|align-self|z-index|insignia"
example_stage: minimal
example_importance: important
---

# HTML

```html
<div class="products">
  <article class="product">
    <div class="media">
      <img src="plant-calathea.svg" alt="Calathea en una maceta verde" width="240" height="240">
      <p class="badge">Oferta</p>
    </div>
    <h3>Calathea</h3>
    <p class="note">La insignia va después de la foto: se pinta encima sin hacer nada.</p>
  </article>

  <article class="product">
    <div class="media is-first">
      <p class="badge">Oferta</p>
      <img src="plant-peperomia.svg" alt="Peperomia en una maceta de barro" width="240" height="240">
    </div>
    <h3>Peperomia</h3>
    <p class="note">La insignia va antes: la foto la taparía; <code>z-index: 1</code> la sube.</p>
  </article>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.products {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  max-width: 400px;
}

.product h3 {
  margin: 6px 0 2px;
  font-size: 0.95rem;
}

.note {
  margin: 0;
  font-size: 0.75rem;
}

/* La foto y la insignia comparten celda. La foto la llena; la insignia se coloca
   en la esquina de arriba a la derecha con la alineación de la lección anterior.
   Sin position: absolute, sin top ni right. */
.media {
  display: grid;
  outline: 2px dashed #0f766e;
}

.media > * {
  grid-area: 1 / 1;
}

.media img {
  width: 100%;
  height: auto;
}

.badge {
  justify-self: end;
  align-self: start;
  margin: 8px;
  padding: 2px 8px;
  border-radius: 999px;
  background: #9d174d;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: bold;
}

/* Dos elementos en la misma celda se pintan en el orden del HTML: el último, encima.
   Si la insignia va primero, la foto la tapa. Los elementos grid aceptan z-index
   SIN position (como los de flexbox): z-index: 1 la pone por encima.
   Recuerda: ese z-index crea un contexto de apilamiento en la insignia. */
.is-first .badge {
  z-index: 1;
}
```
