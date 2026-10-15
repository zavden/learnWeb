---
example_description: "Dos @each anidados generan una familia de clases de utilidad (.m-0 … .px-5, .gap-*) a partir de un mapa de espacios y otro de propiedades"
example_tags: "sass|control-de-flujo|each|mapas|utilidades|generar-clases"
example_stage: intermediate
example_importance: critical
---

# HTML

```html
<article class="card p-4 mb-3">
  <h2 class="mt-0 mb-2">Taller de compostaje</h2>
  <p class="mt-0 mb-3">Sábado 24 de octubre, 10:00. Plazas limitadas.</p>
  <div class="flex gap-2">
    <a class="btn py-1 px-3" href="/talleres/compost/inscripcion">Inscribirme</a>
    <a class="btn btn--ghost py-1 px-3" href="/talleres/compost">Más información</a>
  </div>
</article>
<p class="mt-0">Esta tarjeta solo usa clases de utilidad generadas. Mira cuántas hay en <code>compiled.css</code>.</p>
```

# SCSS

```scss
// La escala de espacios del proyecto (las claves serán parte del nombre).
$spaces: (0: 0, 1: 4px, 2: 8px, 3: 16px, 4: 24px, 5: 32px);

// Prefijo de la clase → propiedad o propiedades que fija.
$utilities: (
  m: margin,
  mt: margin-top,
  mb: margin-bottom,
  p: padding,
  px: padding-inline,
  py: padding-block,
  gap: gap,
);

// Dos bucles anidados: para cada utilidad, para cada tamaño → una clase.
// Python: for prefix, prop in utilities.items(): for key, value in spaces.items(): …
@each $prefix, $property in $utilities {
  @each $key, $value in $spaces {
    .#{$prefix}-#{$key} {
      #{$property}: $value;     // interpolación en el NOMBRE de la propiedad
    }
  }
}
// 7 utilidades × 6 tamaños = 42 clases, todas con especificidad (0,1,0).

body {
  font-family: system-ui, sans-serif;
  color: #1e293b;
}

.flex {
  display: flex;
  flex-wrap: wrap;
}

.card {
  max-width: 24rem;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
}

.btn {
  border: 2px solid #15803d;
  border-radius: 6px;
  background: #15803d;
  color: #ffffff;
  text-decoration: none;

  &--ghost {
    background: transparent;
    color: #14532d;
  }
}

// Así se construyen librerías como Bootstrap o Tailwind (en su versión clásica):
// unos mapas de configuración y unos bucles. Cambia $spaces y cambian 42 clases.
```
