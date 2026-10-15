---
example_stage: final-solution
example_description: "Solución: la lista completa de filter en el estado (gris y más claro), un fondo al 70 % en el pie de foto, display: inline-block en el sello y drop-shadow() en lugar de box-shadow en el logotipo"
example_tags: "css|solucion|filter|backdrop-filter|transform|drop-shadow"
console: true
---

# HTML

```html
<header class="brand">
  <img class="logo" src="nopal.svg" alt="" width="48" height="56">
  <p>Vivero Xochimilco · Galería <span class="stamp">Nuevo</span></p>
</header>

<div class="gallery">
  <figure class="photo">
    <img src="hokusai-gran-ola.jpg" alt="La gran ola de Kanagawa" width="200" height="135">
    <figcaption>La gran ola</figcaption>
  </figure>
  <figure class="photo is-hover">
    <img src="hokusai-gran-ola.jpg" alt="" width="200" height="135">
    <figcaption>Estado :hover</figcaption>
  </figure>
</div>

<ul class="checklist">
  <li>El :hover sigue en gris y más claro: <output id="check-hover">…</output></li>
  <li>El pie de foto, semitransparente: <output id="check-glass">…</output></li>
  <li>El sello se puede girar: <output id="check-stamp">…</output></li>
  <li>La sombra sigue la planta: <output id="check-shadow">…</output></li>
</ul>
```

# CSS

```css
body {
  color: #1e293b;
  font-family: system-ui, sans-serif;
  font-size: 0.9rem;
}

.brand {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 12px;
}

.brand p {
  margin: 0;
  font-weight: 700;
}

/* ✅ 4: drop-shadow() sigue la silueta de lo pintado (el SVG es transparente
   alrededor de la planta); box-shadow sigue la caja. */
.logo {
  filter: drop-shadow(4px 6px 4px rgb(15 23 42 / 0.4));
}

/* ✅ 3: un span en línea no es una caja transformable; inline-block sí, y
   sigue dentro de la línea. */
.stamp {
  display: inline-block;
  padding: 1px 6px;
  border: 2px solid #be123c;
  border-radius: 4px;
  color: #be123c;
  font-size: 0.75rem;
  text-transform: uppercase;
  rotate: -8deg;
}

.gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.photo {
  position: relative;
  margin: 0;
}

.photo img {
  display: block;
  filter: grayscale(1);
}

/* ✅ 1: la lista completa en el estado; si solo pones brightness, sustituye
   a grayscale. (También vale: filter: grayscale(1) brightness(var(--b, 1))
   en la foto y --b: 1.15 en el estado.) */
.photo:hover img,
.photo.is-hover img {
  filter: grayscale(1) brightness(1.15);
}

/* ✅ 2: con un fondo al 70 %, lo de detrás se ve desenfocado. En el peor
   caso (un píxel blanco detrás), el fondo queda en rgb(87 93 106) y el texto
   blanco tiene 6.6:1. */
.photo figcaption {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 6px 8px;
  background: rgb(15 23 42 / 0.7);
  color: #ffffff;
  font-size: 0.8rem;
  backdrop-filter: blur(6px);
}

.checklist {
  padding-inline-start: 1.2em;
  color: #475569;
  font-size: 0.8rem;
}

.checklist output {
  color: #1e293b;
  font-weight: bold;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Este script solo lee los
// estilos calculados y escribe ✅ o ❌ en la lista (y en la consola).
// No hace falta tocarlo: se vuelve a ejecutar con cada cambio.
function check(id, ok, detail) {
  const text = `${ok ? '✅' : '❌'} ${detail}`;
  document.getElementById(id).textContent = text;
  console.log(`${id}: ${text}`);
}

const hoverFilter = getComputedStyle(document.querySelector('.photo.is-hover img')).filter;
check('check-hover', hoverFilter.includes('grayscale') && hoverFilter.includes('brightness'),
  `filter: ${hoverFilter}`);

// El color calculado siempre sale como «rgb(r, g, b)» o «rgba(r, g, b, a)»:
// el alfa, si lo hay, es el cuarto número.
const glassColor = getComputedStyle(document.querySelector('.photo figcaption')).backgroundColor;
const channels = glassColor.slice(glassColor.indexOf('(') + 1, -1).split(',').map(Number);
const alpha = channels.length === 4 ? channels[3] : 1;
check('check-glass', alpha >= 0.65 && alpha < 1, `fondo ${glassColor}`);

const stampDisplay = getComputedStyle(document.querySelector('.stamp')).display;
check('check-stamp', stampDisplay !== 'inline', `display: ${stampDisplay}`);

const logo = getComputedStyle(document.querySelector('.logo'));
check('check-shadow', logo.boxShadow === 'none' && logo.filter.includes('drop-shadow'),
  `box-shadow: ${logo.boxShadow} · filter: ${logo.filter}`);
```
