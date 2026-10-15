---
example_description: "Un SVG de una sola tinta como máscara de una caja con background-color: currentColor da iconos que siguen el color del texto (en un :hover, en un tema oscuro) sin editar el archivo; mask-size, mask-position y mask-repeat funcionan como en los fondos"
example_tags: "css|mascaras|mask-image|iconos|currentcolor|svg"
example_stage: intermediate
example_importance: useful
---

# HTML

```html
<p class="caption">Tres archivos SVG negros (en «Assets»). Cada icono es un <code>span</code> vacío pintado con el color del texto y recortado con el SVG.</p>
<ul class="actions">
  <li><a class="action" href="/coleccion/favoritos"><span class="icon is-heart" aria-hidden="true"></span>Favoritos</a></li>
  <li><a class="action" href="/coleccion/destacadas"><span class="icon is-star" aria-hidden="true"></span>Destacadas</a></li>
  <li><a class="action" href="/coleccion/siguiente-sala"><span class="icon is-arrow" aria-hidden="true"></span>Siguiente sala</a></li>
</ul>

<p class="caption">Los mismos enlaces en un panel oscuro: solo cambia <code>color</code></p>
<ul class="actions is-dark">
  <li><a class="action" href="/coleccion/favoritos"><span class="icon is-heart" aria-hidden="true"></span>Favoritos</a></li>
  <li><a class="action" href="/coleccion/destacadas"><span class="icon is-star" aria-hidden="true"></span>Destacadas</a></li>
  <li><a class="action" href="/coleccion/siguiente-sala"><span class="icon is-arrow" aria-hidden="true"></span>Siguiente sala</a></li>
</ul>

<p class="caption">La máscara también se repite como un fondo: <code>mask-size: 24px</code> y <code>mask-repeat: repeat</code></p>
<div class="pattern" aria-hidden="true"></div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 10px 0 6px;
  font-size: 0.72rem;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0;
  padding: 8px;
  list-style: none;
}

.is-dark {
  border-radius: 8px;
  background: #0f172a;
}

.action {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  padding: 6px 10px;
  border-radius: 6px;
  color: #1d4ed8;
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
}

.is-dark .action {
  color: #93c5fd;
}

/* El :hover cambia el color del texto… y el del icono, con él. */
.action:hover {
  color: #9a3412;
  text-decoration: underline;
}

.is-dark .action:hover {
  color: #fdba74;
}

/* El icono es una caja pintada del color del texto (currentColor) y
   recortada por la silueta del SVG: donde el SVG tiene tinta (opaco) se ve el
   color; donde no, nada. El color del SVG no importa, solo su alfa. */
.icon {
  width: 1.25em;
  height: 1.25em;
  background-color: currentColor;
  mask-position: center;
  mask-repeat: no-repeat;
  mask-size: contain;
}

/* Cada icono solo cambia la imagen. El atajo «mask» también existe:
   mask: url("icon-heart.svg") center / contain no-repeat; */
.is-heart { mask-image: url("icon-heart.svg"); }
.is-star  { mask-image: url("icon-star.svg"); }
.is-arrow { mask-image: url("icon-arrow.svg"); }

/* Las propiedades mask-* son las mismas que background-*: aquí, la estrella
   repetida en baldosas de 24px sobre un degradado. */
.pattern {
  height: 72px;
  max-width: 440px;
  background-image: linear-gradient(to right, #1d4ed8, #be185d);
  mask-image: url("icon-star.svg");
  mask-size: 24px;
  mask-repeat: repeat;
}
```
