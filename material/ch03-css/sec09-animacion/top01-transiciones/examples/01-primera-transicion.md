---
example_description: "La primera transición: dos botones iguales cambian de color, suben 3px y ganan sombra al pasar el ratón o al llegar con Tab; sin transition el cambio salta, con transition dura 200 ms, también al volver"
example_tags: "css|transiciones|transition|hover|focus-visible|prefers-reduced-motion"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="caption">Dos botones con los mismos estados. Pasa el ratón por encima (o llega con <kbd>Tab</kbd>) y luego sal: los dos se oscurecen, suben 3px y ganan sombra, pero solo el segundo tarda 200 ms en ir y en volver.</p>
<div class="row">
  <figure>
    <button class="buy" type="button">Añadir a la cesta</button>
    <figcaption>❌ Sin <code>transition</code>: el cambio salta</figcaption>
  </figure>
  <figure>
    <button class="buy is-smooth" type="button">Añadir a la cesta</button>
    <figcaption>✅ Con <code>transition</code>: 200 ms</figcaption>
  </figure>
</div>
<p class="caption">Si tu sistema pide reducir el movimiento, el segundo botón solo funde el color y la sombra: la subida ocurre sin animación.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #ffffff;
}

.caption {
  margin: 8px 0;
  font-size: 0.72rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  padding: 12px 0;
}

figure {
  margin: 0;
}

figcaption {
  margin-top: 10px;
  font-size: 0.72rem;
}

.buy {
  padding: 10px 18px;
  border: 0;
  border-radius: 999px;
  background: #15803d;
  color: #ffffff;
  font: inherit;
  font-weight: 700;
  cursor: pointer;
}

/* El estado final: más oscuro, 3px más arriba y con sombra. */
.buy:hover,
.buy:focus-visible {
  background: #14532d;
  translate: 0 -3px;
  box-shadow: 0 6px 14px rgb(20 83 45 / 0.35);
}

.buy:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 3px;
}

/* ✅ transition va en la regla BASE: dice cuánto tarda el navegador en ir de
   un valor al otro, en los dos sentidos. Cuando :hover deja de cumplirse,
   la vuelta también dura 200 ms. El color y la sombra se funden siempre. */
.is-smooth {
  transition: background-color 200ms, box-shadow 200ms;
}

/* El MOVIMIENTO solo se anima si el sistema no pide reducirlo (la media
   feature prefers-reduced-motion del módulo anterior). Es la convención de
   todo este módulo: los fundidos se quedan, el desplazamiento se anima solo
   con no-preference. */
@media (prefers-reduced-motion: no-preference) {
  .is-smooth {
    transition: background-color 200ms, box-shadow 200ms, translate 200ms;
  }
}
```
