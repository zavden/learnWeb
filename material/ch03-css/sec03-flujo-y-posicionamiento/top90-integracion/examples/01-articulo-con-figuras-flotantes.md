---
example_description: "Un artículo con letra capitular, figuras flotantes a ambos lados, una cita destacada y secciones que empiezan por debajo de los flotantes, todo contenido por un BFC"
example_tags: "css|float|clear|flow-root|line-height|figure"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<article class="article">
  <h1 class="article-title">Las salinas de Añana</h1>
  <p class="has-drop-cap">En un valle de Álava, el agua que brota de los manantiales es cinco veces más salada que la del mar. Desde hace más de mil años, los salineros la conducen por canales de madera hasta miles de eras de evaporación, donde el sol y el viento hacen el resto.</p>

  <figure class="figure figure--start">
    <img src="salt-terraces.svg" width="320" height="220" alt="Eras de evaporación escalonadas en la ladera, con montones de sal blanca">
    <figcaption>Las eras se escalonan en la ladera para recibir el sol toda la tarde.</figcaption>
  </figure>

  <p>Cada era es una pequeña plataforma de piedra y arcilla. En verano se llena con unos centímetros de agua salada y, en pocos días, aparece en la superficie una costra de cristales. El paisaje que forman, blanco en agosto y gris en invierno, no se parece a ningún otro de la península.</p>

  <blockquote class="pull-quote">
    <p>«La sal no se fabrica: se cosecha, como el trigo.»</p>
  </blockquote>

  <p>Durante siglos, la sal fue la riqueza del valle. Llegó a pagarse con ella parte de los impuestos y viajó en carros hasta Castilla. Con la llegada de la sal industrial, las salinas casi desaparecen; hoy una fundación las ha recuperado y vuelven a producir.</p>

  <h2 class="section-title">Cómo se recoge la sal</h2>

  <figure class="figure figure--end">
    <img src="salt-rake.svg" width="240" height="240" alt="Rastrillo de madera junto a un montón de sal">
    <figcaption>El rastrillo de madera no contamina la sal.</figcaption>
  </figure>

  <p>Los salineros arrastran la sal con un rastrillo de madera hacia el borde de la era, la dejan escurrir y la cargan en cestos. La flor de sal, los cristales finos que flotan en la superficie, se recoge a mano al atardecer, cuando el viento se calma.</p>
</article>

<p class="after">Este párrafo va después del artículo: no se mete al lado de la última figura porque el artículo la contiene.</p>
```

# CSS

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  font-family: Georgia, "Times New Roman", serif;
  color: #1e293b;
  line-height: 1.6;                  /* lección 2: interlineado cómodo para leer */
}

/* Lección 1: flow-root convierte el artículo en un BFC, que CONTIENE sus flotantes.
   Sin él, la última figura se saldría por debajo y el párrafo .after se metería a su lado. */
.article {
  display: flow-root;
  width: min(100% - 1rem, 40rem);
  margin-inline: auto;
}

.article-title {
  margin: 0 0 0.75rem;
  font-family: system-ui, sans-serif;
  font-size: 1.6rem;
  line-height: 1.2;
}

.article p {
  margin: 0 0 1rem;
}

/* Lección 3: letra capitular con float y ::first-letter; el texto la rodea. */
.has-drop-cap::first-letter {
  float: left;
  margin: 0.08em 0.1em 0 0;
  color: #9a3412;
  font-size: 3.6em;
  font-weight: bold;
  line-height: 0.8;
}

/* Lección 3: figuras flotantes. El ancho, con min(), nunca pasa de la mitad del artículo. */
.figure {
  width: min(45%, 15rem);
  margin-block: 0.25rem 1rem;
}

.figure--start {
  float: left;
  margin-inline: 0 1.25rem;
}

.figure--end {
  float: right;
  margin-inline: 1.25rem 0;
}

/* Lección 2: una imagen inline deja el hueco de los descendentes bajo ella;
   como bloque, el pie de foto queda pegado. */
.figure img {
  display: block;
  width: 100%;
  height: auto;
  border-radius: 6px;
}

.figure figcaption {
  margin-top: 0.35rem;
  color: #475569;
  font-family: system-ui, sans-serif;
  font-size: 0.8rem;
  line-height: 1.4;
}

/* Lección 3: una cita destacada que flota a la derecha. */
.pull-quote {
  float: right;
  width: min(40%, 13rem);
  margin: 0.25rem 0 0.75rem 1.25rem;
  padding-block: 0.5rem;
  border-block: 3px solid #9a3412;
  color: #9a3412;
  font-size: 1.15rem;
  font-style: italic;
  line-height: 1.35;
}

.pull-quote p {
  margin: 0;
}

/* Lección 3: cada sección empieza por debajo de los flotantes anteriores (la cita y
   la primera figura). Sin clear, su borde inferior pasaría por debajo de ellos. */
.section-title {
  clear: both;
  margin: 1.5rem 0 0.75rem;
  padding-bottom: 0.25rem;
  border-bottom: 2px solid #e2e8f0;
  font-family: system-ui, sans-serif;
  font-size: 1.2rem;
}

.after {
  width: min(100% - 1rem, 40rem);
  margin: 0.5rem auto;
  padding: 0.5rem 0.75rem;
  background: #fef3c7;
  font-family: system-ui, sans-serif;
  font-size: 0.85rem;
}
```
