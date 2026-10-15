---
example_description: "@while repite mientras se cumpla una condición: una escala tipográfica que multiplica por 1,25 hasta pasar de 40px"
example_tags: "sass|control-de-flujo|while|tipografia|escala"
example_stage: minimal
example_importance: useful
---

# HTML

```html
<p class="fs-0">fs-0 · Riego por goteo</p>
<p class="fs-1">fs-1 · Riego por goteo</p>
<p class="fs-2">fs-2 · Riego por goteo</p>
<p class="fs-3">fs-3 · Riego por goteo</p>
<p class="fs-4">fs-4 · Riego por goteo</p>
<p class="fs-5">fs-5 · ¿existe? Mira compiled.css</p>
```

# SCSS

```scss
@use "sass:math";

$size: 14px;      // tamaño de partida
$ratio: 1.25;     // escala «tercera mayor»
$step: 0;

// @while repite el bloque MIENTRAS la condición sea verdadera.
// No sabemos cuántas vueltas dará: depende de cuándo $size pase de 40px.
@while $size < 40px {
  .fs-#{$step} {
    font-size: math.round($size);
  }

  // Avanzar es responsabilidad tuya: si $size no crece, el bucle no acaba nunca.
  // (Dentro de @while, @if, @each y @for, asignar a una variable que ya existía
  // fuera CAMBIA la de fuera; no crea una local.)
  $size: $size * $ratio;
  $step: $step + 1;
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

p {
  margin: 4px 0;
  line-height: 1.2;
}

// 14 → 17.5 → 21.9 → 27.3 → 34.2 → 42.7: con 42.7 la condición ya es falsa y el
// bucle termina. Se generan .fs-0 … .fs-4 (redondeados: 14, 18, 22, 27, 34px);
// .fs-5 no existe, así que el último párrafo sale con el tamaño normal.
```
