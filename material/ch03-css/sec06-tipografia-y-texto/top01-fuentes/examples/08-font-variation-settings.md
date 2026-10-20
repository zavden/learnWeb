---
example_description: "font-variation-settings gana a font-weight y a font-stretch y se sustituye entera: un strong que no engorda y un título que pierde su ancho estrecho y ya no cabe en una línea; los ejes registrados van con sus propiedades y GRAD, que engorda sin ensanchar, con font-variation-settings"
example_tags: "css|tipografia|fuentes-variables|font-variation-settings|grad|bug"
example_stage: common-error
example_importance: important
---

# HTML

```html
<p class="caption">❌ <code>.note { font-variation-settings: "wght" 350 }</code>: el <code>strong</code> no se ve en negrita</p>
<p class="note is-low-level">Envío gratis en pedidos de más de 500&nbsp;MXN, <strong>solo hasta el domingo</strong>.</p>

<p class="caption">✅ <code>.note { font-weight: 350 }</code>: el <code>strong</code> sube a 700</p>
<p class="note is-high-level">Envío gratis en pedidos de más de 500&nbsp;MXN, <strong>solo hasta el domingo</strong>.</p>

<p class="caption">❌ La tarjeta (320px) pide <code>"wdth" 25</code> y su título, <code>"GRAD" 150</code>: el título vuelve al ancho normal (unos 344px) y se parte en dos líneas</p>
<article class="card is-replaced">
  <h3>Taller de cerámica para principiantes</h3>
  <p>Sábados de 10:00 a 13:00 · barro y horno incluidos</p>
</article>

<p class="caption">✅ El ancho con <code>font-stretch: 25%</code> y solo GRAD en <code>font-variation-settings</code>: el título, estrecho (unos 297px), cabe en una línea</p>
<article class="card is-combined">
  <h3>Taller de cerámica para principiantes</h3>
  <p>Sábados de 10:00 a 13:00 · barro y horno incluidos</p>
</article>

<p class="caption">Para qué sirve GRAD: engorda sin ensanchar. Arriba, peso 400 y 600 (el botón crece); abajo, GRAD 0 y 150 (mide lo mismo)</p>
<p class="buttons"><span class="w400">Comprar ahora</span><span class="w600">Comprar ahora</span></p>
<p class="buttons"><span class="g0">Comprar ahora</span><span class="g150">Comprar ahora</span></p>
```

# CSS

```css
@font-face {
  font-family: "Roboto Flex";
  src: url("fonts/roboto-flex.woff2") format("woff2");
  font-weight: 100 1000;
  font-stretch: 25% 151%;
  font-style: oblique 0deg 10deg;
  font-display: swap;
}

body {
  font-family: "Roboto Flex", system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 10px 0 2px;
  font-size: 0.75rem;
}

.note {
  margin: 0;
  font-size: 1.125rem;
}

/* 🐛 1. font-variation-settings es la herramienta de bajo nivel: se aplica DESPUÉS
   de todo lo demás y gana a font-weight. Además se hereda: el strong recibe
   font-weight: 700 (bolder) y también "wght" 350, que manda. */
.is-low-level {
  font-variation-settings: "wght" 350;
}

/* ✅ Los ejes registrados (wght, wdth, slnt, ital, opsz) tienen propiedad propia. */
.is-high-level {
  font-weight: 350;
}

/* Un ancho fijo para la tarjeta: 320px de contenido. */
.card {
  inline-size: 320px;
  padding: 6px 10px;
  background: #e0e7ff;
}

.card h3 {
  margin: 0;
  font-size: 1.25rem;
}

.card p {
  margin: 2px 0 0;
}

/* 🐛 2. Es UNA propiedad con una lista dentro: si el hijo declara la suya, la del
   padre se pierde entera; no se combinan eje a eje. El título se queda con GRAD
   150 y wdth vuelve a 100: el texto de la tarjeta sigue estrecho, el título no.
   (En Roboto Flex, de wdth 100 a 25 el texto se estrecha en torno a un 15 %:
   el eje es sutil a estos tamaños, por eso la tarjeta tiene un ancho justo.) */
.is-replaced {
  font-variation-settings: "wdth" 25;
}

.is-replaced h3 {
  font-variation-settings: "GRAD" 150;
}

/* ✅ El ancho con su propiedad, que se hereda sin pisar a nadie; el eje propio de
   la fuente (GRAD, en mayúsculas) es lo único que va en font-variation-settings. */
.is-combined {
  font-stretch: 25%;
}

.is-combined h3 {
  font-variation-settings: "GRAD" 150;
}

/* GRAD (grado) cambia el grosor del trazo sin cambiar el ancho de las letras:
   ideal para un estado activo o para el modo oscuro sin que el texto se mueva. */
.buttons {
  display: flex;
  gap: 12px;
  margin: 4px 0;
}

.buttons span {
  padding: 4px 8px;
  outline: 1px dashed #4338ca;
}

.w400 { font-weight: 400; }
.w600 { font-weight: 600; }
.g0   { font-variation-settings: "GRAD" 0; }
.g150 { font-variation-settings: "GRAD" 150; }
```
