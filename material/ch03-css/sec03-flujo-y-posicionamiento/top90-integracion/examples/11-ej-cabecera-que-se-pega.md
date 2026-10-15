---
exercise: true
exercise_title: "Arregla la cabecera que no se pega"
exercise_instructions: "Desplaza la vista previa: la cabecera se va con la página. Haz que se quede arriba sin perder el recorte horizontal del envoltorio (TODO 1) || Haz que el menú «Secciones» quede por encima del cartel y que las fichas de libros pasen por DEBAJO de la cabecera al desplazar (TODO 2) || El botón «↑ Subir» debe quedarse en la esquina de la ventana al desplazar (TODO 3) || Lleva cada insignia «Novedad» a la esquina de su ficha (TODO 4)"
exercise_hints: "sticky se pega en su contenedor de scroll más cercano. ¿Hay algún antepasado con overflow? || overflow: clip recorta sin crear un contenedor de scroll || La cabecera sticky ya es un contexto de apilamiento: compite con su z-index, que ahora es auto (capa 0) || will-change: transform convierte la caja en el bloque contenedor de sus descendientes fixed y absolute || Una caja absolute se mide desde el antepasado posicionado más cercano"
exercise_solution_example: 11-ej-cabecera-que-se-pega-solucion.md
exercise_locked_files: index.html
example_stage: exercise
example_description: "Ejercicio: una librería con una cabecera sticky que no se pega, un menú atrapado bajo el cartel, un botón fijo atrapado por will-change y unas insignias sin referencia"
example_tags: "css|ejercicio|sticky|fixed|z-index|overflow|will-change"
---

# HTML

```html
<div class="layout" id="top">
  <header class="site-header">
    <span class="logo">Librería La Buhardilla</span>
    <details class="menu" open>
      <summary>Secciones</summary>
      <ul class="menu-list"><li><a href="#">Novela</a></li><li><a href="#">Ensayo</a></li><li><a href="#">Infantil</a></li></ul>
    </details>
  </header>

  <main class="content">
    <section class="hero">Feria del Libro: un 10 % en todo el catálogo</section>
    <article class="book"><span class="book-badge">Novedad</span><h2>El faro de las ballenas</h2><p>Una farera jubilada vuelve a la isla donde creció. Novela, 312 páginas.</p></article>
    <article class="book"><span class="book-badge">Novedad</span><h2>Cocina de aprovechamiento</h2><p>Ochenta recetas para no tirar nada. Gastronomía, 224 páginas.</p></article>
    <article class="book"><h2>Mapas del cielo austral</h2><p>Un atlas ilustrado de las constelaciones del sur. Divulgación, 180 páginas.</p></article>
    <article class="book"><h2>La huerta en el balcón</h2><p>Cultiva tomates y aromáticas en dos metros cuadrados. Jardinería, 160 páginas.</p></article>
    <a class="to-top" href="#top">↑ Subir</a>
  </main>
</div>
```

# CSS

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1e293b;
  line-height: 1.5;
}

/* TODO 1: el envoltorio recorta lo que se salga por los lados (para evitar el scroll
   horizontal), pero desde que se añadió esta línea la cabecera ya no se pega. */
.layout {
  overflow-x: hidden;
}

/* TODO 2: el menú queda debajo del cartel y, al desplazar, las fichas tapan la cabecera. */
.site-header {
  position: sticky;
  top: 0;
  padding: 0.6rem 1rem;
  background: #1e3a8a;
  color: #ffffff;
}

.logo {
  font-weight: bold;
}

.menu {
  display: inline-block;
  position: relative;
  margin-left: 1rem;
}

.menu summary {
  cursor: pointer;
}

.menu-list {
  position: absolute;
  z-index: 9999;
  top: 100%;
  left: 0;
  margin: 0.25rem 0 0;
  padding: 0.25rem 0;
  list-style: none;
  border: 1px solid #94a3b8;
  border-radius: 6px;
  background: #ffffff;
}

.menu-list a {
  display: block;
  padding: 0.15rem 1rem;
  color: #1d4ed8;
}

.menu summary:focus-visible,
.menu-list a:focus-visible,
.to-top:focus-visible {
  outline: 3px solid #1d4ed8;
  outline-offset: 2px;
}

/* TODO 3: alguien añadió will-change «para que el contenido vaya más fluido»;
   desde entonces el botón «↑ Subir» se desplaza con la página. */
.content {
  width: min(100% - 2rem, 32rem);
  margin: 0 auto 4rem;
  will-change: transform;
}

.hero {
  position: relative;
  z-index: 1;
  margin: 0 0 1rem;
  padding: 1.5rem 1rem;
  background: #fde68a;
  font-weight: bold;
}

/* TODO 4: las insignias deberían ir en la esquina superior derecha de su ficha. */
.book {
  min-height: 9rem;
  margin-bottom: 1rem;
  padding: 0.75rem 1rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
}

.book h2 {
  margin: 0 0 0.25rem;
  font-size: 1.05rem;
}

.book p {
  margin: 0;
}

.book-badge {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0 0.5rem;
  border-radius: 999px;
  background: #166534;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: bold;
}

.to-top {
  position: fixed;
  right: 1rem;
  bottom: 1rem;
  padding: 0.4rem 0.9rem;
  border: 2px solid #1d4ed8;
  border-radius: 999px;
  background: #ffffff;
  color: #1d4ed8;
  font-weight: 600;
  text-decoration: none;
}
```
