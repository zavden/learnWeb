---
example_description: "Un artículo de revista: la foto de la Tierra recortada con circle() y el texto rodeándola con shape-outside (mismas medidas con border-box), letra capital con initial-letter y el texto cortado con un fundido de mask-image antes del enlace «Seguir leyendo»"
example_tags: "css|integracion|clip-path|shape-outside|mask-image|initial-letter|editorial"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<article class="story">
  <p class="section">Ciencia · Fotografía</p>
  <h1>La canica azul</h1>
  <div class="body">
    <img class="planet" src="tierra-apolo-17.jpg" alt="La Tierra entera, iluminada, con África, Arabia y la Antártida a la vista" width="170" height="170">
    <p>El 7 de diciembre de 1972, cinco horas después de despegar hacia la Luna, la tripulación del Apolo 17 fotografió la Tierra a unos 29&nbsp;000 kilómetros de distancia. El Sol estaba a sus espaldas, así que el planeta salió entero e iluminado, sin la sombra de la noche.</p>
    <p>En la imagen se reconocen África, la península arábiga, Madagascar y, abajo, el casquete helado de la Antártida, cubierto de nubes en espiral. Es una de las fotografías más reproducidas de la historia, y una de las pocas en las que la Tierra se ve completa y redonda.</p>
    <p>La NASA la catalogó como AS17-148-22727, pero el mundo la conoce por su apodo en inglés, <i lang="en">The Blue Marble</i>. Durante más de cincuenta años ha ilustrado carteles, portadas de libros y campañas en defensa del planeta.</p>
  </div>
  <a class="more" href="/ciencia/la-canica-azul">Seguir leyendo</a>
</article>
<p class="credit">Foto: NASA, Apolo 17, 1972. Dominio público.</p>
```

# CSS

```css
body {
  color: #1e293b;
  font-family: system-ui, sans-serif;
}

.story {
  max-width: 440px;
}

.section {
  margin: 0;
  color: #0e7490;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.story h1 {
  margin: 2px 0 8px;
  font-family: Georgia, serif;
  font-size: 1.8rem;
}

/* El texto, cortado a 250px de alto. La máscara lo desvanece en el último
   tercio: así se entiende que sigue, sin un corte en seco a mitad de línea. */
.body {
  max-height: 250px;
  overflow: hidden;
  mask-image: linear-gradient(black 65%, transparent);
  font-family: Georgia, serif;
  font-size: 0.9rem;
  line-height: 1.55;
}

.body p {
  margin: 0 0 10px;
}

/* La foto es cuadrada con el planeta en el centro. clip-path recorta el
   espacio negro; shape-outside hace que el texto siga la curva. Las dos
   formas, con la misma caja (border-box) para que coincidan; el aire, con
   shape-margin. El 44 % es el radio del planeta en la foto. */
.planet {
  float: right;
  margin-inline-start: 6px;
  clip-path: circle(44%);
  shape-outside: circle(44%) border-box;
  shape-margin: 10px;
}

/* Letra capital de tres líneas (módulo de tipografía). */
.body > p:first-of-type::first-letter {
  initial-letter: 3;
  margin-inline-end: 6px;
  color: #0e7490;
  font-weight: 700;
}

.more {
  display: inline-block;
  margin-top: 4px;
  color: #0e7490;
  font-weight: 700;
}

.more:focus-visible {
  outline: 3px solid #0e7490;
  outline-offset: 2px;
}

.credit {
  margin: 10px 0 0;
  font-size: 0.72rem;
}
```
