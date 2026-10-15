---
example_description: "figure agrupa una imagen (o código, o una tabla) con su pie figcaption; el pie no sustituye al alt"
example_tags: "html|imagenes|figure|figcaption|semantica"
example_stage: minimal
example_importance: important
---

# HTML

```html
<article>
  <h1>Rutas por los Picos de Europa</h1>
  <p>La ruta del Cares recorre un desfiladero excavado por el río durante miles de años.</p>

  <!-- figure: contenido autónomo al que el texto puede referirse («ver figura 1»).
       figcaption: su pie o título, el primer o último hijo de figure. -->
  <figure>
    <img src="mountain-960.svg" alt="Desfiladero con un río al fondo y paredes de roca" width="960" height="640">
    <figcaption>Figura 1. El desfiladero del Cares a primera hora de la mañana. Foto: Marta Ruiz.</figcaption>
  </figure>

  <!-- Una figure no tiene por qué contener una imagen: también vale para código o citas. -->
  <figure>
    <pre><code>&lt;img src="foto.jpg" alt="…" width="960" height="640"&gt;</code></pre>
    <figcaption>Figura 2. Una imagen con sus dimensiones declaradas.</figcaption>
  </figure>

  <!-- Las imágenes vectoriales (SVG) se usan igual que cualquier otra y se ven nítidas a cualquier tamaño. -->
  <figure>
    <img src="logo.svg" alt="Logo de la asociación de montaña" width="128" height="128">
    <figcaption>Figura 3. El mismo SVG de 64×64 dibujado a 128×128, sin perder nitidez.</figcaption>
  </figure>
</article>
```

# CSS

```css
body {
  font-family: system-ui, sans-serif;
  max-width: 60ch;
}

img {
  max-width: 100%;
  height: auto;
}

figcaption {
  font-size: 0.9rem;
  color: #475569;
}
```
