---
example_description: "@debug imprime valores durante la compilación (archivo, línea y valor), como print(): aquí, los pasos intermedios de una función de tipografía fluida"
example_tags: "sass|depuracion|debug|funciones|clamp"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<article>
  <h1>Huerto en casa</h1>
  <h2>Qué sembrar en otoño</h2>
  <p>Los títulos crecen con el ancho de la ventana entre 20rem y 60rem. Abre la vista previa en una pestaña (↗) y cambia el ancho. Los cálculos están en <code>sass-output.txt</code>.</p>
</article>
```

# SCSS

```scss
@use "sass:math";

// Tamaño fluido: $min con una ventana de $from, $max con una de $to, y una
// recta entre medias (la fórmula de clamp() que viste en el módulo responsive).
@function fluid($min, $max, $from: 20rem, $to: 60rem) {
  $slope: math.div($max - $min, $to - $from);    // cuánto crece por cada rem de ventana
  $intercept: $min - $slope * $from;             // dónde corta el eje

  // @debug imprime en sass-output.txt: «styles.scss:12 @debug: …».
  // La línea es la del @debug, así que incluye en el mensaje algo que diga
  // QUÉ llamada lo imprime (aquí, $min y $max).
  @debug "fluid(#{$min}, #{$max}) → pendiente #{$slope}, corte #{$intercept}";

  @return clamp($min, $intercept + $slope * 100vw, $max);
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

h1 {
  font-size: fluid(1.75rem, 3rem);
}

h2 {
  font-size: fluid(1.25rem, 2rem);
}

p {
  max-width: 36rem;
  font-size: fluid(1rem, 1.125rem);
  line-height: 1.5;
}

// @debug no cambia el CSS generado: solo informa. Bórralo cuando termines.
// Python: print(f"fluid({min}, {max}) → …")
```
