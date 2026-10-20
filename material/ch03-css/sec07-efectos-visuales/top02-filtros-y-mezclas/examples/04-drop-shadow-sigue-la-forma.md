---
example_description: "box-shadow sigue la caja: en una imagen con fondo transparente dibuja un rectángulo, y en un bocadillo deja la flecha sin sombra. filter: drop-shadow() sigue la forma real de lo que está pintado"
example_tags: "css|filtros|drop-shadow|box-shadow|transparencia|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">Un dibujo con el fondo transparente (un SVG, como un PNG con transparencia), con la misma sombra escrita de las dos formas</p>
<div class="row">
  <figure>
    <img class="plant is-box" src="nopal.svg" alt="" width="96" height="112">
    <figcaption>❌ <code>box-shadow</code>: la sombra de la caja</figcaption>
  </figure>
  <figure>
    <img class="plant is-drop" src="nopal.svg" alt="" width="96" height="112">
    <figcaption>✅ <code>filter: drop-shadow()</code>: la sombra del dibujo</figcaption>
  </figure>
</div>

<p class="caption">Un bocadillo con su flecha (un <code>::after</code> que sobresale de la caja)</p>
<div class="row">
  <p class="bubble is-box">❌ La flecha queda sin sombra</p>
  <p class="bubble is-drop">✅ La sombra rodea también la flecha</p>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  background: #f8fafc;
}

.caption {
  margin: 8px 0 8px;
  font-size: 0.72rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  align-items: start;
}

figure {
  width: 180px;
  margin: 0;
}

figcaption {
  margin-top: 8px;
  font-size: 0.7rem;
}

/* ❌ box-shadow se dibuja alrededor de la CAJA del elemento (con su
   border-radius), sin mirar qué hay pintado dentro. En una imagen con fondo
   transparente, la caja es un rectángulo. */
.plant.is-box {
  box-shadow: 8px 8px 6px rgb(15 23 42 / 0.45);
}

/* ✅ drop-shadow() es un filtro: toma los píxeles ya pintados, usa su
   transparencia (canal alfa) como silueta y la copia desplazada y difuminada
   debajo. Misma sintaxis que box-shadow, sin «inset» ni extensión. */
.plant.is-drop {
  filter: drop-shadow(8px 8px 6px rgb(15 23 42 / 0.45));
}

.bubble {
  position: relative;
  width: 170px;
  margin: 0 0 20px;
  padding: 10px 12px;
  border-radius: 10px;
  background: #ffffff;
  font-size: 0.8rem;
}

/* La flecha: un cuadrado girado 45° (transform, última lección del módulo)
   que asoma por debajo de la caja. */
.bubble::after {
  content: "";
  position: absolute;
  left: 24px;
  bottom: -8px;
  width: 16px;
  height: 16px;
  background: #ffffff;
  transform: rotate(45deg);
}

/* ❌ La sombra es de la caja del párrafo: la flecha sobresale y no la tiene. */
.bubble.is-box {
  box-shadow: 0 4px 8px rgb(15 23 42 / 0.35);
}

/* ✅ El filtro ve el resultado completo (caja + flecha) como un solo dibujo. */
.bubble.is-drop {
  filter: drop-shadow(0 4px 8px rgb(15 23 42 / 0.35));
}
```
