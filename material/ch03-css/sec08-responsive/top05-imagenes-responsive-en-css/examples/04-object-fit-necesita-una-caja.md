---
example_description: "object-fit: cover no hace nada si la caja del <img> tiene la proporción de la propia imagen (width: 100% y height: auto): las miniaturas siguen midiendo cada una su alto. Necesita una caja con tamaño propio: un height, o aspect-ratio"
example_tags: "css|responsive|imagenes|object-fit|aspect-ratio|miniaturas|bug"
example_stage: common-error
example_importance: critical
---

# HTML

```html
<p class="label">❌ <code>width: 100%; height: auto; object-fit: cover</code>: tres alturas distintas</p>
<ul class="thumbs is-auto">
  <li><img src="hokusai-gran-ola-480.jpg" alt="La gran ola de Kanagawa" width="480" height="323"></li>
  <li><img src="tierra-apolo-17-480.jpg" alt="La Tierra vista desde el Apolo 17" width="480" height="480"></li>
  <li><img src="pilares-de-la-creacion-480.jpg" alt="Los Pilares de la creación, del telescopio Hubble" width="480" height="501"></li>
</ul>

<p class="label">✅ <code>width: 100%; aspect-ratio: 4 / 3; object-fit: cover</code>: tres cajas iguales, cada foto recortada</p>
<ul class="thumbs is-boxed">
  <li><img src="hokusai-gran-ola-480.jpg" alt="La gran ola de Kanagawa" width="480" height="323"></li>
  <li><img src="tierra-apolo-17-480.jpg" alt="La Tierra vista desde el Apolo 17" width="480" height="480"></li>
  <li><img src="pilares-de-la-creacion-480.jpg" alt="Los Pilares de la creación, del telescopio Hubble" width="480" height="501"></li>
</ul>
<p class="credit">Hokusai, c. 1831; NASA, Apolo 17, 1972; NASA, ESA y Hubble Heritage Team, 2014. Dominio público.</p>
```

# CSS

```css
body { font-family: system-ui, sans-serif; color: #1e293b; background: #ffffff; }
.label, .credit { margin: 8px 0 4px; font-size: 0.72rem; }

.thumbs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: start;            /* sin estirar: cada caja, su alto */
  gap: 8px;
  margin: 0;
  padding: 0;
  list-style: none;
}

/* Las dos filas comparten el reset del ejemplo 1 y object-fit: cover. */
.thumbs img { display: block; width: 100%; height: auto; object-fit: cover; outline: 2px solid #7c3aed; }

/* 🐛 object-fit encaja la IMAGEN dentro de la CAJA del <img>. Con height:
   auto, la caja sale de la proporción de la propia imagen: imagen y caja
   coinciden y no hay nada que recortar. object-fit no hace nada, y cada
   miniatura mide lo que su foto. (La fila de arriba no añade nada más.) */

/* ✅ La caja necesita un tamaño propio en los dos ejes: aquí, el ancho de la
   columna y una proporción. Ahora caja (4:3) e imagen (3:2, 1:1, 24:25) no
   coinciden, y cover recorta lo que sobra. Con un height fijo también vale. */
.is-boxed img { aspect-ratio: 4 / 3; }
```
