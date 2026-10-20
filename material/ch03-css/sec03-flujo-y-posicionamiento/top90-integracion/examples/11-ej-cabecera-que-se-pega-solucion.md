---
example_stage: final-solution
example_description: "Solución: overflow-x: clip en el envoltorio, z-index en la cabecera sticky, sin will-change en el contenido y fichas posicionadas"
example_tags: "css|solucion|sticky|fixed|z-index|overflow|will-change"
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

/* ✅ 1. overflow-x: hidden convertía el envoltorio en un contenedor de scroll (que nunca se
   desplaza) y la cabecera se pegaba dentro de él. clip recorta igual, sin crearlo. */
.layout {
  overflow-x: clip;
}

/* ✅ 2. La cabecera sticky es un contexto de apilamiento: su menú solo puede subir tanto
   como ella. Con z-index: 10 queda por encima del cartel (1) y de las fichas (auto). */
.site-header {
  position: sticky;
  top: 0;
  z-index: 10;
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

/* ✅ 3. Sin will-change: transform, el contenido ya no es el bloque contenedor del botón
   fijo (ni de las insignias), ni un contexto de apilamiento. */
.content {
  width: min(100% - 2rem, 32rem);
  margin: 0 auto 4rem;
}

.hero {
  position: relative;
  z-index: 1;
  margin: 0 0 1rem;
  padding: 1.5rem 1rem;
  background: #fde68a;
  font-weight: bold;
}

/* ✅ 4. Cada ficha es la referencia de su insignia. */
.book {
  position: relative;
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
