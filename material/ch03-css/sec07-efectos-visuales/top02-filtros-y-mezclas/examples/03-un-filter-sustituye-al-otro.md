---
example_description: "filter es una sola propiedad con una lista: un filter en :hover sustituye la lista entera y la foto en gris recupera el color de golpe. Se repite la lista completa o se cambia una custom property"
example_tags: "css|filtros|filter|hover|cascada|custom-properties|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">Galería en gris; al pasar el ratón, la foto debería <strong>aclararse un poco</strong> sin dejar de ser gris. A la derecha de cada fila, una copia fija del estado <code>:hover</code>.</p>

<p class="label">❌ <code>:hover { filter: brightness(1.3) }</code>: el gris desaparece</p>
<div class="row is-broken">
  <img class="photo" src="hokusai-gran-ola.jpg" alt="" width="200" height="135">
  <img class="photo is-hover" src="hokusai-gran-ola.jpg" alt="" width="200" height="135">
</div>

<p class="label">✅ La lista completa en <code>:hover</code>, o una custom property por función</p>
<div class="row is-fixed">
  <img class="photo" src="hokusai-gran-ola.jpg" alt="" width="200" height="135">
  <img class="photo is-hover" src="hokusai-gran-ola.jpg" alt="" width="200" height="135">
</div>
<p class="credit">Katsushika Hokusai, <cite>La gran ola de Kanagawa</cite>, c. 1831. Dominio público. (El cambio es instantáneo: las transiciones llegan en el módulo de animación.)</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption,
.label,
.credit {
  margin: 8px 0 4px;
  font-size: 0.72rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.photo {
  display: block;
}

/* 🐛 filter es UNA propiedad cuyo valor es una lista. La regla de :hover gana
   en la cascada y su lista sustituye a la anterior entera: grayscale(1) ya no
   está, y la foto sale en color. (Pasa igual con transform, box-shadow,
   background-image y cualquier propiedad con una lista dentro.) */
.is-broken .photo {
  filter: grayscale(1);
}

.is-broken .photo:hover,
.is-broken .photo.is-hover {
  filter: brightness(1.3);
}

/* ✅ Una lista con una custom property por función: cada estado cambia solo
   la variable que le toca, y la lista se queda entera.
   (La otra solución: repetir la lista, filter: grayscale(1) brightness(1.3).) */
.is-fixed .photo {
  filter: grayscale(1) brightness(var(--photo-brightness, 1));
}

.is-fixed .photo:hover,
.is-fixed .photo.is-hover {
  --photo-brightness: 1.3;
}
```
