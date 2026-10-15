---
example_description: "Una foto con height: auto en una fila flex se estira hasta el alto del texto por align-items: stretch y se deforma; align-self: flex-start u object-fit: cover lo evitan"
example_tags: "css|flexbox|align-items|stretch|imagenes|object-fit|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="label">❌ Con el reset habitual <code>img { height: auto }</code>, la foto se estira hasta el alto del texto: el sol ya no es redondo</p>
<article class="route">
  <img src="lake-trail.png" alt="Laguna entre montañas con el sol sobre una cumbre nevada" width="64" height="64">
  <div>
    <h3>Laguna de Santa María del Oro</h3>
    <p>Ruta circular alrededor de un cráter lleno de agua turquesa. Desnivel suave, sombra casi todo el camino, un muelle para nadar y un mirador al final del sendero. Lleva agua: no hay tiendas en el camino.</p>
  </div>
</article>

<p class="label">✅ <code>align-self: flex-start</code> en la foto: conserva su alto</p>
<article class="route is-start">
  <img src="lake-trail.png" alt="Laguna entre montañas con el sol sobre una cumbre nevada" width="64" height="64">
  <div>
    <h3>Laguna de Santa María del Oro</h3>
    <p>Ruta circular alrededor de un cráter lleno de agua turquesa. Desnivel suave, sombra casi todo el camino, un muelle para nadar y un mirador al final del sendero. Lleva agua: no hay tiendas en el camino.</p>
  </div>
</article>

<p class="label">✅ <code>object-fit: cover</code>: la caja sigue estirada, pero la foto se recorta en lugar de deformarse</p>
<article class="route is-cover">
  <img src="lake-trail.png" alt="Laguna entre montañas con el sol sobre una cumbre nevada" width="64" height="64">
  <div>
    <h3>Laguna de Santa María del Oro</h3>
    <p>Ruta circular alrededor de un cráter lleno de agua turquesa. Desnivel suave, sombra casi todo el camino, un muelle para nadar y un mirador al final del sendero. Lleva agua: no hay tiendas en el camino.</p>
  </div>
</article>
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

/* El reset de imágenes de casi todos los proyectos (módulo de responsive): nunca más
   anchas que su contenedor y, si encogen, con el alto proporcional. */
img {
  max-width: 100%;
  height: auto;
}

.route {
  display: flex;
  gap: 12px;
  max-width: 400px;
  padding: 8px;
  outline: 2px dashed #7c3aed;
  font-size: 0.8rem;
}

.route img {
  flex-shrink: 0;        /* el ancho no cambia (ejemplo 6); el problema es el alto */
  border-radius: 6px;
}

.route h3 {
  margin: 0 0 4px;
  font-size: 0.9rem;
}

.route p {
  margin: 0;
}

/* 🐛 align-items vale stretch por defecto: cada elemento cuyo alto sea auto se estira
   hasta el alto de la fila. Los atributos width="64" height="64" equivalen a un
   height: 64px, pero el reset lo cambia por height: auto… y la foto pasa a ser
   estirable. El texto mide más de 64px, así que la foto también: se deforma.
   (Sin el reset, height: 64px no se estiraría; pero el reset existe por buenas
   razones y está en casi todas partes.) */

/* ✅ La foto no se estira: se queda con su alto y se alinea arriba.
   Con varias fotos, align-items: flex-start en el contenedor hace lo mismo para todas. */
.is-start img {
  align-self: flex-start;
}

/* ✅ object-fit: cover (se explica en el módulo de responsive): la caja de la imagen
   sigue estirándose, pero la foto se escala para cubrirla sin deformarse y se recorta
   lo que sobra por los lados. Útil cuando quieres que la foto ocupe todo el alto. */
.is-cover img {
  object-fit: cover;
}
```
