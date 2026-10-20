---
example_description: "Sass opera con unidades: suma unidades compatibles, convierte in y px, cancela px entre px (math.div(24px, 16px) = 1.5) y se niega a mezclar rem y px"
example_tags: "sass|sass-math|unidades|debug"
example_stage: minimal
example_importance: important
---

# HTML

```html
<article class="post">
  <h2>Tiempos de riego</h2>
  <p>Este párrafo tiene <code>line-height: 1.5</code>, sin unidad, calculado como 24px ÷ 16px. Los resultados de cada cuenta están en <code>sass-output.txt</code>.</p>
</article>
```

# SCSS

```scss
@use "sass:math";

// @debug imprime un valor en sass-output.txt (lo verás a fondo en la lección 8).
// Úsalo como print() para ver qué calcula Sass:

@debug 16px * 2;                  // 32px: número × número sin unidad
@debug 16px + 4px;                // 20px: misma unidad
@debug 6px + 1in;                 // 102px: px e in son compatibles (1in = 96px)
@debug 1s + 200ms;                // 1.2s: también con tiempos
@debug math.div(24px, 16px);      // 1.5: px ÷ px se cancelan → número SIN unidad
@debug math.div(24px, 16);        // 1.5px
@debug math.unit(1.5rem);         // "rem"
@debug math.compatible(1rem, 4px); // false: rem depende de la página → no se pueden sumar
// @debug 1rem + 4px;             // ❌ Error: «1rem and 4px have incompatible units»
//                                //    (para eso está calc(1rem + 4px))

$font-size: 16px;
$line-height-px: 24px;

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  font-size: $font-size;
}

.post {
  max-width: 28rem;
  // Un line-height sin unidad es lo recomendable (lección de texto en CSS):
  // se hereda como factor y no como px fijos.
  line-height: math.div($line-height-px, $font-size);   // → 1.5

  h2 {
    margin-bottom: math.div($line-height-px, 2);         // → 12px
  }
}
```
