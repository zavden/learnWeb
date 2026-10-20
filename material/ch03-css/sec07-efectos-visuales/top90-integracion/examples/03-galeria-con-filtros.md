---
example_description: "Cuatro versiones de La gran ola: original, blanco y negro, «antigua» y un duotono azul y ámbar hecho con la foto en gris y dos capas con mix-blend-mode (multiply para las luces, lighten para las sombras), aisladas con isolation"
example_tags: "css|integracion|filter|mix-blend-mode|isolation|duotono|pseudoelementos"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<ul class="gallery">
  <li>
    <figure class="photo">
      <img src="hokusai-gran-ola.jpg" alt="La gran ola de Kanagawa, de Hokusai" width="200" height="135">
      <figcaption>Original</figcaption>
    </figure>
  </li>
  <li>
    <figure class="photo is-mono">
      <img src="hokusai-gran-ola.jpg" alt="La gran ola de Kanagawa, en blanco y negro" width="200" height="135">
      <figcaption>Blanco y negro</figcaption>
    </figure>
  </li>
  <li>
    <figure class="photo is-vintage">
      <img src="hokusai-gran-ola.jpg" alt="La gran ola de Kanagawa, con tono de foto antigua" width="200" height="135">
      <figcaption>Antigua</figcaption>
    </figure>
  </li>
  <li>
    <figure class="photo is-duotone">
      <img src="hokusai-gran-ola.jpg" alt="La gran ola de Kanagawa, en azul y ámbar" width="200" height="135">
      <figcaption>Duotono</figcaption>
    </figure>
  </li>
</ul>
<p class="credit">Katsushika Hokusai, <cite>La gran ola de Kanagawa</cite>, c. 1831. Dominio público.</p>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
  max-width: 440px;
  margin: 0;
  padding: 0;
  list-style: none;
}

.photo {
  margin: 0;
}

.photo img {
  display: block;
  width: 100%;
  height: auto;
}

.photo figcaption {
  margin-top: 4px;
  font-size: 0.75rem;
  font-weight: 600;
}

/* Las recetas de filtros: cada una, una lista completa. */
.is-mono img    { filter: grayscale(1) contrast(1.2); }
.is-vintage img { filter: sepia(0.8) contrast(1.1) brightness(0.95) saturate(1.2); }

/* Duotono: las sombras de la estampa en azul noche y las luces en ámbar.
   Los ::before y ::after llevan z-index: 1 para pintarse encima de la foto,
   que con su filter también forma una capa (y va después del ::before en el
   HTML); entre ellos dos, manda el orden en que aparecen.
   1. La foto, en gris y con algo más de contraste.
   2. Encima, una capa ámbar con multiply: el blanco × ámbar = ámbar, y el
      negro sigue negro.
   3. Encima, una capa azul con lighten: se queda con el más claro de los dos,
      así que el negro pasa a azul y los claros siguen en ámbar.
   isolation: isolate en la figura limita la mezcla a la foto: sin ella, las
   capas se mezclarían también con el fondo de la página.
   (En una pantalla de gama amplia, los tonos exactos cambian un poco: la
   mezcla se hace en el espacio de color de la pantalla.) */
.is-duotone {
  position: relative;
  isolation: isolate;
}

.is-duotone img {
  filter: grayscale(1) contrast(1.3);
}

.is-duotone::before,
.is-duotone::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1;
  aspect-ratio: 200 / 135;          /* solo sobre la foto, no sobre el pie */
}

.is-duotone::before {
  background: #f59e0b;
  mix-blend-mode: multiply;
}

.is-duotone::after {
  background: #1e3a8a;
  mix-blend-mode: lighten;
}

.credit {
  margin: 8px 0 0;
  font-size: 0.72rem;
}
```
