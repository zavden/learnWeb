---
example_description: "@use \"sass:math\" carga un módulo integrado: math.div, math.percentage y math.round con espacio de nombres, y una función rem() propia"
example_tags: "sass|modulos|use|sass-math|funciones"
example_stage: minimal
example_importance: critical
---

# HTML

```html
<p class="label">Depósito de agua de lluvia: 3 de 8 bidones llenos</p>
<div class="meter"><div class="meter__fill"></div></div>
<p class="label">Riego semanal completado: 5 de 7 días</p>
<div class="meter"><div class="meter__fill meter__fill--week"></div></div>
```

# SCSS

```scss
// @use carga un MÓDULO. Los módulos integrados empiezan por «sass:».
// Sus funciones se usan con el espacio de nombres delante: math.div(…).
@use "sass:math";

// Convierte píxeles de diseño a rem (1rem = 16px por defecto).
@function rem($px) {
  @return math.div($px, 16px) * 1rem;  // 24px / 16px = 1.5 → 1.5rem
}

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
  font-size: rem(16px);                // → 1rem
}

.label {
  margin: rem(12px) 0 rem(4px);        // → 0.75rem 0 0.25rem
}

.meter {
  max-width: rem(320px);               // → 20rem
  height: rem(12px);
  border-radius: 999px;
  background: #e2e8f0;
}

.meter__fill {
  height: 100%;
  border-radius: inherit;
  background: #0369a1;
  width: math.percentage(math.div(3, 8));                // → 37.5%

  &--week {
    width: math.round(math.percentage(math.div(5, 7)));  // 71.43% → 71%
  }
}

// Otros del módulo: math.floor, math.ceil, math.max, math.min, math.clamp,
// math.pow, math.sqrt, math.abs, math.pi…
```
