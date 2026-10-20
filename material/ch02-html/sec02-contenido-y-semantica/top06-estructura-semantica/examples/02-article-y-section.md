---
example_description: "article es contenido autónomo que tendría sentido fuera de la página; section agrupa una parte temática con su propio título"
example_tags: "html|semantica|article|section"
example_stage: intermediate
example_importance: important
---

# HTML

```html
<main>
  <h1>Blog de la huerta</h1>

  <!-- article: se podría publicar tal cual en otra web o en un lector RSS. -->
  <article>
    <h2>Riego por goteo casero</h2>
    <p>Una botella, un clavo caliente y una cuerda bastan para regar durante un fin de semana.</p>

    <!-- section: una parte del artículo, con su propio título. -->
    <section>
      <h3>Materiales</h3>
      <p>Botella de 2 litros, clavo, cuerda de algodón.</p>
    </section>
    <section>
      <h3>Montaje</h3>
      <p>Haz un agujero en el tapón y pasa la cuerda hasta la tierra.</p>
    </section>
  </article>

  <article>
    <h2>Abono con posos de café</h2>
    <p>Los posos aportan nitrógeno, pero conviene compostarlos antes.</p>
  </article>
</main>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  max-width: 600px;
}

article {
  border: 2px solid #15803d;
  padding: 0 12px;
  margin-bottom: 16px;
}

section {
  border-left: 4px solid #86efac;
  padding-left: 10px;
}

/* Prueba: ¿tendría sentido este bloque solo, sin el resto de la página? → article.
   ¿Es una parte de algo, con su propio título? → section.
   ¿Solo lo necesitas para dar estilo? → div. */
```
