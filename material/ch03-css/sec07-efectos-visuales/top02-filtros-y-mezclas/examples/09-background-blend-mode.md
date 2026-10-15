---
example_description: "background-blend-mode mezcla entre sí las capas de fondo de un mismo elemento (imágenes, degradados y color): la foto teñida con un color o con un degradado, sin tocar el contenido ni lo que hay detrás del elemento"
example_tags: "css|mezclas|background-blend-mode|fondos-multicapa|duotono"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p class="caption">Una sola caja por muestra, con la pintura y un color (o un degradado) en su <code>background</code>. Solo cambia <code>background-blend-mode</code>.</p>
<ul class="grid">
  <li><div class="tile is-normal"></div><code>normal</code>: la pintura tapa el color</li>
  <li><div class="tile is-multiply"></div><code>multiply</code> con ámbar: tono cálido</li>
  <li><div class="tile is-luminosity"></div><code>luminosity</code> con azul: monocromo azul</li>
  <li><div class="tile is-gradient"></div><code>multiply</code> con un degradado: la luz cambia de lado a lado</li>
</ul>
<p class="note"><code>background-blend-mode</code> solo mezcla las capas del fondo entre sí: el contenido de la caja y lo que hay detrás de ella no participan (con <code>mix-blend-mode</code>, sí).</p>
<p class="credit">José María Velasco, <cite>Valle de México</cite>, 1877. Dominio público.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption,
.note,
.credit {
  margin: 8px 0 6px;
  font-size: 0.72rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 200px);
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
  font-size: 0.7rem;
}

.tile {
  height: 120px;
  margin-bottom: 3px;
  background-image: url("velasco-valle-de-mexico.jpg");
  background-position: center;
  background-size: cover;
}

/* Cada capa de fondo se mezcla con las que tiene DEBAJO (en la lista, las que
   van después, y al final el color), con el modo que le toca por posición.
   Con un solo valor, todas las capas usan el mismo. */
.is-normal {
  background-color: #f59e0b;              /* tapado por la pintura opaca */
}

.is-multiply {
  background-color: #f59e0b;
  background-blend-mode: multiply;        /* pintura × ámbar */
}

/* luminosity: la luz (claros y oscuros) de la pintura con el tono y la
   saturación del color de abajo. Es la base de los efectos de duotono. */
.is-luminosity {
  background-color: #2563eb;
  background-blend-mode: luminosity;
}

/* Una capa más: la pintura (primera), encima de un degradado (segunda). La
   pintura se multiplica por el degradado: clara a la izquierda, rosada y
   oscura a la derecha. */
.is-gradient {
  background-image:
    url("velasco-valle-de-mexico.jpg"),
    linear-gradient(to right, #fef3c7, #be185d);
  background-size: cover, auto;
  background-blend-mode: multiply;
}
```
