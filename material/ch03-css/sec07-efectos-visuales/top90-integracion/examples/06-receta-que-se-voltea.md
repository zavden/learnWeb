---
example_description: "Una tarjeta de receta en 3D: el frente es un banderín de papel picado (patrón con degradados y borde en zigzag con clip-path) y el reverso, los ingredientes; se voltea con :hover y al llegar con Tab al enlace del reverso (:focus-within), sin nada que aplane el preserve-3d"
example_tags: "css|integracion|preserve-3d|backface-visibility|focus-within|clip-path|patrones"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<p class="caption">Pasa el ratón por la primera tarjeta, o llega a ella con <kbd>Tab</kbd>. La segunda es una copia fija de la tarjeta volteada.</p>
<div class="recipes">
  <article class="flip">
    <div class="card">
      <div class="face is-front">
        <div class="banner" aria-hidden="true"></div>
        <h3>Mole poblano</h3>
        <p>Para 8 personas · 3 horas</p>
      </div>
      <div class="face is-back">
        <h4>Ingredientes</h4>
        <ul>
          <li>4 chiles mulatos</li>
          <li>3 chiles anchos</li>
          <li>60 g de chocolate de mesa</li>
          <li>2 jitomates asados</li>
        </ul>
        <a href="/recetas/mole-poblano">Ver la receta completa</a>
      </div>
    </div>
  </article>
  <article class="flip is-flipped" aria-hidden="true">
    <div class="card">
      <div class="face is-front">
        <div class="banner"></div>
        <h3>Mole poblano</h3>
        <p>Para 8 personas · 3 horas</p>
      </div>
      <div class="face is-back">
        <h4>Ingredientes</h4>
        <ul>
          <li>4 chiles mulatos</li>
          <li>3 chiles anchos</li>
          <li>60 g de chocolate de mesa</li>
          <li>2 jitomates asados</li>
        </ul>
        <p class="fake-link">Ver la receta completa</p>
      </div>
    </div>
  </article>
</div>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.caption {
  margin: 0 0 10px;
  font-size: 0.72rem;
}

.recipes {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

/* El ojo, en el contenedor de cada tarjeta. */
.flip {
  perspective: 700px;
}

/* La tarjeta gira. Nada de overflow, opacity, filter ni clip-path aquí: la
   aplanarían. Las esquinas redondeadas y los recortes van en las caras. */
.card {
  position: relative;
  width: 200px;
  height: 230px;
  transform-style: preserve-3d;
}

.flip:hover .card,
.flip:focus-within .card,
.flip.is-flipped .card {
  rotate: y 180deg;
}

.face {
  position: absolute;
  inset: 0;
  overflow: hidden;                 /* en la cara sí: no tiene hijos en 3D */
  border-radius: 12px;
  backface-visibility: hidden;
  box-shadow: 0 2px 8px rgb(15 23 42 / 0.25);
}

.is-front {
  display: flex;
  flex-direction: column;
  justify-content: end;
  padding: 14px;
  background: #fff7ed;
}

/* Papel picado: rombos pequeños (conic en baldosas) sobre rosa, y el borde
   inferior en zigzag con un polígono de dientes de 10 %. */
.banner {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 110px;
  background-color: #db2777;
  background-image: repeating-conic-gradient(from 45deg, rgb(255 255 255 / 0.35) 0 25%, transparent 0 50%);
  background-size: 14px 14px;
  clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 100%, 90% 85%, 85% 100%, 80% 85%, 75% 100%, 70% 85%, 65% 100%, 60% 85%, 55% 100%, 50% 85%, 45% 100%, 40% 85%, 35% 100%, 30% 85%, 25% 100%, 20% 85%, 15% 100%, 10% 85%, 5% 100%, 0 85%);
}

.is-front h3 {
  margin: 0;
  color: #831843;
  font-family: Georgia, serif;
  font-size: 1.4rem;
}

.is-front p {
  margin: 2px 0 0;
  font-size: 0.8rem;
}

/* El reverso empieza de espaldas. Su enlace recibe el foco aunque esté
   oculto: entonces :focus-within voltea la tarjeta y queda a la vista. */
.is-back {
  padding: 14px;
  background: #1e293b;
  color: #f8fafc;
  font-size: 0.8rem;
  rotate: y 180deg;
}

.is-back h4 {
  margin: 0 0 4px;
  font-size: 0.95rem;
}

.is-back ul {
  margin: 0 0 8px;
  padding-inline-start: 1.1em;
  line-height: 1.5;
}

.is-back a,
.fake-link {
  margin: 0;
  color: #fbcfe8;
  font-weight: 700;
  text-decoration: underline;
}

.is-back a:focus-visible {
  outline: 2px solid #fbcfe8;
  outline-offset: 2px;
}
```
