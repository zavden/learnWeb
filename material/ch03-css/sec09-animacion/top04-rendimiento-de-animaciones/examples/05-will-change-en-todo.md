---
example_description: "will-change: transform «por si acaso» en todas las tarjetas de un catálogo: cada una pasa a ser una capa en la memoria de la GPU y, como transform, crea un contexto de apilamiento, así que el desplegable abierto de la primera tarjeta queda tapado por la de abajo. Sin will-change, el navegador crea la capa solo mientras anima"
example_tags: "css|rendimiento|will-change|capas|contexto-de-apilamiento|z-index|memoria|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">Dos catálogos iguales; en cada uno, el selector de tamaño de la primera maceta está abierto. Las tarjetas se levantan al pasar el ratón.</p>

<p class="label">❌ <code>will-change: transform</code> en cada tarjeta: el desplegable queda debajo de la tarjeta de abajo</p>
<div class="catalog is-eager">
  <article class="card"><h3>Maceta de barro</h3><details class="size" open><summary>Tamaño: 14 cm</summary><ul><li>12 cm</li><li>14 cm</li><li>18 cm</li></ul></details></article>
  <article class="card"><h3>Maceta colgante</h3><p>$240</p></article>
  <article class="card"><h3>Jardinera de pino</h3><p>$410</p></article>
  <article class="card"><h3>Plato de drenaje</h3><p>$45</p></article>
</div>

<p class="label">✅ Sin <code>will-change</code>: el desplegable queda por encima</p>
<div class="catalog">
  <article class="card"><h3>Maceta de barro</h3><details class="size" open><summary>Tamaño: 14 cm</summary><ul><li>12 cm</li><li>14 cm</li><li>18 cm</li></ul></details></article>
  <article class="card"><h3>Maceta colgante</h3><p>$240</p></article>
  <article class="card"><h3>Jardinera de pino</h3><p>$410</p></article>
  <article class="card"><h3>Plato de drenaje</h3><p>$45</p></article>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption,
.label {
  margin: 8px 0 4px;
  font-size: 0.72rem;
}

.catalog {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  max-width: 360px;
  margin-bottom: 8px;
}

.card {
  position: relative;               /* referencia del desplegable */
  padding: 8px 10px;
  border-radius: 8px;
  background: #f0fdf4;
  box-shadow: 0 1px 3px rgb(15 23 42 / 0.2);
  font-size: 0.8rem;
  transition: box-shadow 200ms;
}

.card h3 {
  margin: 0 0 4px;
  font-size: 0.85rem;
}

.card p {
  margin: 0;
}

.card:hover {
  z-index: 1;                       /* la tarjeta levantada, encima de sus vecinas */
  box-shadow: 0 8px 18px rgb(15 23 42 / 0.2);
}

@media (prefers-reduced-motion: no-preference) {
  .card {
    transition: box-shadow 200ms, translate 200ms;
  }

  .card:hover {
    translate: 0 -4px;
  }
}

.size summary {
  cursor: pointer;
}

/* El desplegable: posicionado, con z-index alto, para salir de la tarjeta. */
.size ul {
  position: absolute;
  top: 100%;
  left: 10px;
  z-index: 10;
  width: 120px;
  margin: 0;
  padding: 4px 0;
  border: 1px solid #64748b;
  border-radius: 6px;
  background: #ffffff;
  list-style: none;
  box-shadow: 0 6px 16px rgb(15 23 42 / 0.25);
}

.size li {
  padding: 4px 10px;
}

/* 🐛 «Para que el hover vaya fluido», alguien puso will-change en todas.
   1. Cada tarjeta se convierte en una CAPA propia en la memoria de la GPU,
      todo el tiempo, se anime o no. En un catálogo de 60 tarjetas de
      300 × 400 px en una pantalla Retina (×2), son unos 115 MB.
   2. will-change: transform hace lo mismo que haría un transform: crea un
      contexto de apilamiento y un bloque contenedor para fixed y absolute.
      El z-index: 10 del desplegable ya solo cuenta DENTRO de su tarjeta, y
      la tarjeta de abajo, que va después en el HTML, se pinta encima.
   3. Y ni siquiera acierta: lo que se anima es translate, no transform.
      will-change debe nombrar la propiedad exacta que vas a animar.
   ✅ Sin will-change, el navegador crea la capa justo cuando empieza la
   transición de translate y la quita al terminar. Para un hover, sobra. */
.is-eager .card {
  will-change: transform;
}
```
