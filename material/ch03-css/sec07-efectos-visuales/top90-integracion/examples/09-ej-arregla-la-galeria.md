---
exercise: true
exercise_title: "Arregla la galería"
exercise_instructions: "Al pasar el ratón, la foto en gris debería aclararse sin recuperar el color; la segunda foto es una copia fija de ese estado: arréglala (TODO 1) || El pie de foto tiene backdrop-filter, pero no se ve ningún desenfoque: haz su fondo semitransparente, al menos al 65 % para que el texto blanco se lea (TODO 2) || El sello «Nuevo» tiene un rotate que no gira: haz que gire sin sacarlo de la línea (TODO 3) || La sombra del logotipo es un rectángulo: que siga la forma de la planta (TODO 4) || Comprueba que las cuatro líneas de la lista marcan ✅"
exercise_hints: "filter es una sola propiedad con una lista: la regla del estado sustituye a la de la foto || backdrop-filter filtra lo que se ve A TRAVÉS del elemento; el cuarto valor de rgb() va detrás de una barra || Un span normal no es una caja transformable; hay un display que lo convierte en una caja sin sacarlo de la línea || La sombra de la caja frente a la sombra de lo pintado: una es una propiedad y la otra, una función de filter"
exercise_solution_example: 09-ej-arregla-la-galeria-solucion.md
exercise_locked_files: index.html,script.js
example_stage: exercise
console: true
example_description: "Ejercicio: una galería con cuatro errores de efectos (un :hover que sustituye la lista de filter, un backdrop-filter con fondo opaco, un rotate en un span en línea y una box-shadow en un logotipo transparente) que un pequeño script comprueba en directo"
example_tags: "css|ejercicio|filter|backdrop-filter|transform|drop-shadow"
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

/* TODO 4: la sombra dibuja un rectángulo alrededor del SVG transparente. */
.logo {
  box-shadow: 4px 6px 4px rgb(15 23 42 / 0.4);
}

/* TODO 3: el sello no gira. */
.stamp {
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

/* TODO 1: al pasar el ratón, la foto recupera el color. */
.photo:hover img,
.photo.is-hover img {
  filter: brightness(1.15);
}

/* TODO 2: el desenfoque no se ve. */
.photo figcaption {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  padding: 6px 8px;
  background: rgb(15 23 42);
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
