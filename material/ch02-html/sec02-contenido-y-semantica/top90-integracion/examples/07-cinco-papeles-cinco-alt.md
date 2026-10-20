---
example_description: "El alt depende del papel de la imagen: un logo con texto y el mismo plano como decoración, información, enlace y figura, y lo que anuncia un lector de pantalla en cada caso"
example_tags: "integracion|imagenes|alt|enlaces|figure|nombre-accesible"
example_stage: intermediate
example_importance: critical
console: true
---

# HTML

```html
<!-- Un logo y el mismo plano en cuatro sitios, para comparar sus alt. En una página real no
     repetirías el plano; aquí sirve para ver que el alt depende de lo que la imagen HACE en cada sitio. -->
<header>
  <!-- 1. Una imagen que contiene texto: el alt es ese mismo texto -->
  <img data-case="con texto" src="img/library-logo.svg" alt="Biblioteca Ribera Alta" width="240" height="64">
  <nav aria-label="Principal">
    <ul>
      <!-- 2. Decorativa: el enlace ya dice «Cómo llegar»; un alt lo repetiría. alt="" (vacío, no ausente) -->
      <li><a href="#directions"><img data-case="decorativa" src="img/library-map.svg" alt="" width="48" height="30"> Cómo llegar</a></li>
      <li><a href="#hours">Horario</a></li>
    </ul>
  </nav>
</header>

<main>
  <h1>Visítanos</h1>

  <h2 id="directions">Cómo llegar</h2>
  <p>Estamos a cinco minutos andando de la estación de tren.</p>
  <!-- 3. Informativa: el alt da la información que aporta el plano, no «imagen de un plano» -->
  <img data-case="informativa" src="img/library-map.svg" alt="Plano: al salir de la estación, sube hasta la calle principal, síguela hacia el oeste y entra en la plaza Mayor; la biblioteca está en la plaza." width="480" height="300">

  <!-- 4. Dentro de un enlace: el alt es el nombre del enlace, así que dice a dónde lleva -->
  <p><a href="img/library-map.svg" target="_blank"><img data-case="en un enlace" src="img/library-map.svg" alt="Plano ampliado (SVG, se abre en una pestaña nueva)" width="160" height="100"></a></p>

  <!-- 5. En una figura: el alt describe el contenido; el pie, que leen todos, da contexto y autoría -->
  <figure>
    <img data-case="en una figura" src="img/library-map.svg" alt="Plano del centro: la plaza Mayor en el medio, la estación al sureste y la biblioteca en la plaza." width="480" height="300">
    <figcaption>Figura 1. El centro de Ribera. Dibujo: Servicio de Cartografía municipal.</figcaption>
  </figure>

  <h2 id="hours">Horario</h2>
  <p>De lunes a viernes, de <time datetime="09:00">9:00</time> a <time datetime="20:30">20:30</time>.</p>
</main>
```

# CSS

```css
/* Solo para que se lea bien: el CSS se estudia en el capítulo 3 */
body {
  max-width: 40rem;
  margin: 0 auto;
  padding: 0 1rem;
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: #1f2937;
}

/* flex pone los enlaces del menú en fila (capítulo de CSS) */
nav ul {
  display: flex;
  gap: 1.5rem;
  padding: 0;
  list-style: none;
}

/* El icono se centra con el texto del enlace en lugar de apoyarse en la línea base */
nav img {
  vertical-align: middle;
}

main img {
  display: block;
  max-width: 100%;
  height: auto;
}

figcaption {
  font-size: 0.9rem;
  color: #4b5563;
}

:focus-visible {
  outline: 3px solid #b45309;
  outline-offset: 2px;
}
```

# JavaScript

```javascript
// Adelanto: JavaScript se explica en su capítulo. Aproximamos lo que anuncia un lector de
// pantalla en cada caso. El nombre de un enlace se forma con su texto y los alt de sus imágenes.
const nameOf = (node) => node.nodeType === Node.TEXT_NODE ? node.textContent
  : node.localName === 'img' ? node.alt
  : [...node.childNodes].map(nameOf).join('');

for (const image of document.querySelectorAll('img')) {
  const link = image.closest('a');
  const caption = image.closest('figure')?.querySelector('figcaption');
  let heard = image.alt === '' ? '(se ignora)' : `imagen «${image.alt}»`;
  if (link) heard = `${image.alt === '' ? '(se ignora) · ' : ''}enlace «${nameOf(link).replace(/\s+/g, ' ').trim()}»`;
  if (caption) heard += ` · pie «${caption.textContent}»`;
  console.log(image.dataset.case.padEnd(13), '→', heard);
}
```
